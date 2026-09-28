import Swal from 'sweetalert2';

import {
   getCustomerProfile,
   saveCustomerProfile,
   parseDerivaties,
   checkCompletePCD,
   checkDataVerification,
   handleVerifyCalculators,
   validationIfCompleted,
   validationIfSaved,
} from '../../services/servDerivaties';
import { genericFetch } from '../../hooks';
import { templateDerivatives } from '../../helpers';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const PAGES = ['coverageProfile', 'calculatorRate', 'calculatorRateExchange', 'profileResume'];

// El servicio asigna por referencia las plantillas a los datos y luego las modifica:
// se restauran en sitio después de cada caso para que ningún caso vea el cambio de otro.
const pristineTemplates = structuredClone(templateDerivatives);

const dialogWith = (text) => expect.objectContaining({ html: expect.stringContaining(text) });

const fillStrings = (value) => {
   if (value === '') return 'x';
   if (Array.isArray(value)) return value.map(fillStrings);
   if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fillStrings(item)]));
   }
   return value;
};

const credit = {
   amountCover: 1,
   balanceInNationalCurrency: 2,
   creditor: 'Bank',
   expirationMonth: 'May',
   expirationYear: 2030,
   grantMonth: 'Jan',
   lineAmount: 3,
   natureOfCredit: 'Nature',
   termToCover: 12,
   typeOfCredit: 'Simple',
   yearOfGrant: 2020,
};

// Perfil de derivados con todos los campos requeridos llenos, con la calculadora de tasa seleccionada.
const filledProfile = (overrides = {}) => {
   const info = fillStrings(structuredClone(pristineTemplates));
   info.coverageProfile.calculatorType = { isType: 'rate', data: [{ rateType: 'TIIE', porcentage: '5' }] };
   info.coverageProfile.customerHasExperience = { isType: 'No', data: [] };
   info.calculatorRate.creditors = [credit];
   info.profileResume.whoMadeTheVisit = [{ visitorName: 'Ana', visitorPosition: 'Director' }];
   info.profileResume.news = {
      positives: [{ description: 'Growth', url: 'http://a' }],
      negatives: [{ description: 'Risk', url: 'http://b' }],
      noNewsWereFound: false,
   };
   info.selectedCalculator = 'rate';
   return { ...info, ...overrides };
};

// Respuesta del back: cada página viene serializada como JSON o vacía.
const backendData = (pages = {}) => {
   const data = { idRequest: 7, needsHistory: false };
   PAGES.forEach((page) => {
      data[page] = page in pages ? pages[page] : '';
   });
   return data;
};

describe('servDerivaties', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   afterEach(() => {
      Object.keys(pristineTemplates).forEach((key) => {
         const current = templateDerivatives[key];
         if (current && typeof current === 'object') {
            Object.keys(current).forEach((prop) => delete current[prop]);
            Object.assign(current, structuredClone(pristineTemplates[key]));
         }
      });
   });

   describe('parseDerivaties', () => {
      test('uses the template for the empty pages and parses the ones that come as JSON', () => {
         const stored = { creditors: [], balanceMxn: '99' };
         const data = backendData({ calculatorRate: JSON.stringify(stored) });

         const result = parseDerivaties(data, 7, false);

         expect(result.calculatorRate).toEqual(stored);
         expect(result.coverageProfile).toEqual(pristineTemplates.coverageProfile);
         expect(result.calculatorRateExchange).toEqual(pristineTemplates.calculatorRateExchange);
         expect(result.profileResume).toEqual(pristineTemplates.profileResume);
      });

      test('clears the cached profile and does not add the local variables when it is not editing', () => {
         localStorage.setItem('PCD_Page', 'stale');

         const result = parseDerivaties(backendData(), 7, false);

         expect(localStorage.getItem('PCD_Page')).toBeNull();
         expect(result).not.toHaveProperty('selectedCalculator');
         expect(result).not.toHaveProperty('isCompleted');
      });

      test('adds the request, the selected calculator and the completion flag and caches the profile when editing', () => {
         const profile = filledProfile();
         const data = backendData({
            coverageProfile: JSON.stringify(profile.coverageProfile),
            calculatorRate: JSON.stringify(profile.calculatorRate),
            profileResume: JSON.stringify(profile.profileResume),
         });

         const result = parseDerivaties(data, 55, true);

         expect(result).toMatchObject({ idRequest: 55, selectedCalculator: 'rate', isCompleted: true });
         expect(JSON.parse(localStorage.getItem('PCD_Page'))).toEqual(result);
      });

      test('flags the profile as incomplete and leaves the calculator unselected when editing an empty one', () => {
         const result = parseDerivaties(backendData(), 55, true);

         expect(result).toMatchObject({ selectedCalculator: '', isCompleted: false });
      });

      test('returns the data as it was when a page is not valid JSON', () => {
         const data = backendData({ coverageProfile: '{not json' });

         const result = parseDerivaties(data, 7, true);

         expect(result).toBe(data);
         expect(result.coverageProfile).toBe('{not json');
         expect(result).not.toHaveProperty('isCompleted');
      });

      test('returns undefined when there is no data', () => {
         expect(parseDerivaties(undefined, 7, false)).toBeUndefined();
      });
   });

   describe('getCustomerProfile', () => {
      test('requests the format of the request', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: backendData() });

         await getCustomerProfile(7);

         expect(genericFetch).toHaveBeenCalledWith({ url: '/credit/Format/getFormatById?idRequest=7', method: 'get' });
      });

      test('returns the parsed pages without the local variables by default', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: backendData({ profileResume: '{"news":1}' }) });

         const result = await getCustomerProfile(7);

         expect(result.status).toBe(200);
         expect(result.data.profileResume).toEqual({ news: 1 });
         expect(result.data.coverageProfile).toEqual(pristineTemplates.coverageProfile);
         expect(result.data).not.toHaveProperty('isCompleted');
      });

      test('adds the local variables and caches the profile when asked to edit', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: backendData() });

         const result = await getCustomerProfile(7, true);

         expect(result.data).toMatchObject({ idRequest: 7, selectedCalculator: '', isCompleted: false });
         expect(JSON.parse(localStorage.getItem('PCD_Page')).idRequest).toBe(7);
      });

      test('returns undefined data when the response has no data', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await expect(getCustomerProfile(7)).resolves.toEqual({ status: 200, data: undefined });
      });

      test('shows the error dialog and returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getCustomerProfile(7);

         expect(result).toEqual({ status: 404, error: 'Not found' });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Recurso o información no encontrado'));
      });

      test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(getCustomerProfile(7)).resolves.toEqual({ status: 500, error });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Error interno del servidor'));
      });
   });

   describe('saveCustomerProfile', () => {
      const info = (overrides = {}) => ({
         idRequest: 7,
         needsHistory: true,
         veracity: true,
         isCompleted: true,
         selectedCalculator: 'rate',
         coverageProfile: { descriptionOfStrategy: 'A' },
         calculatorRate: { balanceMxn: '1' },
         calculatorRateExchange: { mpa: '2' },
         profileResume: { news: 'N' },
         ...overrides,
      });
      const sentData = () => genericFetch.mock.calls[0][0].data;

      test('patches the format and returns the response', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await saveCustomerProfile(info(), 0, 'analyst');

         expect(genericFetch.mock.calls[0][0]).toMatchObject({ url: '/credit/Format/updateFormat', method: 'patch' });
         expect(result).toEqual({ status: 204 });
      });

      test('sends only the history flag in the first step', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await saveCustomerProfile(info(), 0, 'analyst');

         expect(sentData()).toEqual({
            idRequest: 7,
            needsHistory: true,
            idStatus: 15,
            modifyUser: 'analyst',
            veracity: true,
         });
      });

      test.each([
         ['rate', 'calculatorRate', '{"balanceMxn":"1"}'],
         ['typechange', 'calculatorRateExchange', '{"mpa":"2"}'],
      ])(
         'sends the coverage profile and the %s calculator in the coverage step',
         async (selectedCalculator, key, json) => {
            genericFetch.mockResolvedValueOnce({ status: 204 });

            await saveCustomerProfile(info({ selectedCalculator }), 1, 'analyst');

            expect(sentData()).toMatchObject({
               coverageProfile: '{"descriptionOfStrategy":"A"}',
               [key]: json,
            });
         }
      );

      test('sends only the coverage profile in the coverage step when no calculator is selected', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await saveCustomerProfile(info({ selectedCalculator: '' }), 1, 'analyst');

         const data = sentData();
         expect(data.coverageProfile).toBe('{"descriptionOfStrategy":"A"}');
         expect(data).not.toHaveProperty('calculatorRate');
         expect(data).not.toHaveProperty('calculatorRateExchange');
      });

      test.each([
         ['rate', 'calculatorRate', '{"balanceMxn":"1"}'],
         ['typechange', 'calculatorRateExchange', '{"mpa":"2"}'],
      ])('sends only the %s calculator in the calculators step', async (selectedCalculator, key, json) => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await saveCustomerProfile(info({ selectedCalculator }), 2, 'analyst');

         const data = sentData();
         expect(data[key]).toBe(json);
         expect(data).not.toHaveProperty('coverageProfile');
      });

      test('sends only the profile resume in the summary step', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await saveCustomerProfile(info(), 3, 'analyst');

         expect(sentData()).toEqual({
            idRequest: 7,
            profileResume: '{"news":"N"}',
            idStatus: 15,
            modifyUser: 'analyst',
            veracity: true,
         });
      });

      test.each([
         ['completed', true, 15],
         ['not completed', false, 14],
      ])('sends the %s status', async (_label, isCompleted, idStatus) => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await saveCustomerProfile(info({ isCompleted }), 3, 'analyst');

         expect(sentData().idStatus).toBe(idStatus);
      });

      test('returns a 500 object with the error and does not call the service when the step does not exist', async () => {
         const result = await saveCustomerProfile(info(), 9, 'analyst');

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
         expect(genericFetch).not.toHaveBeenCalled();
      });
   });

   describe('checkCompletePCD', () => {
      test('reports every part and the whole profile as complete when they are filled', () => {
         expect(checkCompletePCD(filledProfile())).toEqual({
            coverageProfile: true,
            calculator: true,
            profileSummary: true,
            allPCD: true,
         });
      });

      test('reports the calculator as incomplete when none is selected', () => {
         const result = checkCompletePCD(filledProfile({ selectedCalculator: '' }));

         expect(result).toMatchObject({
            coverageProfile: true,
            calculator: false,
            profileSummary: true,
            allPCD: false,
         });
      });

      test('validates the exchange calculator when the selected one is not the rate calculator', () => {
         const complete = checkCompletePCD(filledProfile({ selectedCalculator: 'typechange' }));
         const incomplete = checkCompletePCD(
            filledProfile({
               selectedCalculator: 'typechange',
               calculatorRateExchange: { ...filledProfile().calculatorRateExchange, spread: '' },
            })
         );

         expect(complete.calculator).toBe(true);
         expect(incomplete.calculator).toBe(false);
         expect(incomplete.allPCD).toBe(false);
      });

      test('validates the rate calculator when the selected one is the rate calculator', () => {
         const info = filledProfile({ calculatorRate: { ...filledProfile().calculatorRate, balanceMxn: '' } });

         const result = checkCompletePCD(info);

         expect(result.calculator).toBe(false);
         expect(result.allPCD).toBe(false);
      });

      test('reports the coverage profile as incomplete when a field is empty', () => {
         const info = filledProfile();
         info.coverageProfile.descriptionOfStrategy = '';

         const result = checkCompletePCD(info);

         expect(result).toMatchObject({ coverageProfile: false, calculator: true, allPCD: false });
      });

      test('reports the summary as incomplete when a field is empty', () => {
         const info = filledProfile();
         info.profileResume.mainBusinessActivity = '';

         const result = checkCompletePCD(info);

         expect(result).toMatchObject({ profileSummary: false, coverageProfile: true, allPCD: false });
      });
   });

   describe('checkDataVerification', () => {
      test('returns false without comparing when the profile is not completed', () => {
         const compare = jest.fn(() => true);

         expect(checkDataVerification({ isCompleted: false }, compare)).toBe(false);
         expect(compare).not.toHaveBeenCalled();
      });

      test('compares the profile with the cached one ignoring the completion flag and the veracity', () => {
         localStorage.setItem(
            'PCD_Page',
            JSON.stringify({ isCompleted: true, veracity: false, coverageProfile: { a: 1 }, idRequest: 7 })
         );
         const compare = jest.fn(() => true);

         const result = checkDataVerification(
            { isCompleted: true, veracity: true, coverageProfile: { a: 2 }, idRequest: 7 },
            compare
         );

         expect(result).toBe(true);
         expect(compare).toHaveBeenCalledWith(
            { coverageProfile: { a: 2 }, idRequest: 7 },
            { coverageProfile: { a: 1 }, idRequest: 7 }
         );
      });

      test('returns what the comparison returns', () => {
         localStorage.setItem('PCD_Page', JSON.stringify({ idRequest: 7 }));

         expect(checkDataVerification({ isCompleted: true, idRequest: 7 }, () => false)).toBe(false);
      });
   });

   describe('handleVerifyCalculators', () => {
      const exchangeData = (coverage, overrides = {}) => ({
         selectedCalculator: 'typechange',
         requestAmount: '5000',
         coverageProfile: { calculatorType: { isType: 'typechange' }, ...coverage },
         calculatorRate: { rateCalculator: {} },
         calculatorRateExchange: { salesForLastFiscalYear: '1000000' },
         ...overrides,
      });

      test('sets the requested line amount and resets the exchange calculator for the rate calculator', () => {
         const data = exchangeData({ calculatorType: { isType: 'rate' } }, { selectedCalculator: 'rate' });

         const result = handleVerifyCalculators(data, 20);

         expect(result).toBeUndefined();
         expect(data.calculatorRate.rateCalculator.requestedLineAmount).toBe(5000);
         expect(data.calculatorRateExchange).toEqual(pristineTemplates.calculatorRateExchange);
      });

      test('does nothing for another calculator type when the selected one is not the exchange calculator', () => {
         const data = exchangeData({}, { selectedCalculator: '' });

         handleVerifyCalculators(data, 20);

         expect(data.calculatorRateExchange).toEqual({ salesForLastFiscalYear: '1000000' });
         expect(data.calculatorRate).toEqual({ rateCalculator: {} });
      });

      describe.each([
         [
            'imports and exports and the imports are larger',
            {
               customerImports: { isType: 'Si', whatPercentage: '60', currencyHedgingPolicy: '50' },
               customerExports: { isType: 'Si', whatPercentage: '40', currencyHedgingPolicy: '30' },
            },
            { customerPosition: 'Compra moneda extranjera', percentageInForeignCurrency: '60', coveragePolicy: '50' },
         ],
         [
            'imports and exports and the exports are larger',
            {
               customerImports: { isType: 'Si', whatPercentage: '40', currencyHedgingPolicy: '50' },
               customerExports: { isType: 'Si', whatPercentage: '60', currencyHedgingPolicy: '30' },
            },
            { customerPosition: 'Venta moneda extranjera', percentageInForeignCurrency: '60', coveragePolicy: '30' },
         ],
         [
            'imports and exports of the same size',
            {
               customerImports: { isType: 'Si', whatPercentage: '50', currencyHedgingPolicy: '50' },
               customerExports: { isType: 'Si', whatPercentage: '50', currencyHedgingPolicy: '30' },
            },
            { customerPosition: 'Venta moneda extranjera', percentageInForeignCurrency: '50', coveragePolicy: '30' },
         ],
         [
            'only imports',
            {
               customerImports: { isType: 'Si', whatPercentage: '70', currencyHedgingPolicy: '50' },
               customerExports: { isType: 'No', whatPercentage: '', currencyHedgingPolicy: '30' },
            },
            { customerPosition: 'Compra moneda extranjera', percentageInForeignCurrency: '70', coveragePolicy: '50' },
         ],
         [
            'only exports',
            {
               customerImports: { isType: 'No', whatPercentage: '', currencyHedgingPolicy: '50' },
               customerExports: { isType: 'Si', whatPercentage: '80', currencyHedgingPolicy: '30' },
            },
            { customerPosition: 'Venta moneda extranjera', percentageInForeignCurrency: '80', coveragePolicy: '30' },
         ],
         [
            'neither and the foreign currency inputs are larger',
            {
               customerImports: { isType: 'No', foreignCurrencyInputs: '30', currencyHedgingPolicy: '50' },
               customerExports: { isType: 'No', foreignCurrencyDomesticSales: '10', currencyHedgingPolicy: '30' },
            },
            { customerPosition: 'Compra moneda extranjera', percentageInForeignCurrency: '30', coveragePolicy: '50' },
         ],
         [
            'neither and the foreign currency domestic sales are larger',
            {
               customerImports: { isType: 'No', foreignCurrencyInputs: '10', currencyHedgingPolicy: '50' },
               customerExports: { isType: 'No', foreignCurrencyDomesticSales: '30', currencyHedgingPolicy: '30' },
            },
            { customerPosition: 'Venta moneda extranjera', percentageInForeignCurrency: '30', coveragePolicy: '30' },
         ],
      ])('for the exchange calculator with %s', (_label, coverage, expected) => {
         test('sets the customer position, the percentage and the policy', () => {
            const data = exchangeData(coverage);

            handleVerifyCalculators(data, 20);

            expect(data.calculatorRateExchange).toMatchObject(expected);
         });
      });

      test('calculates the foreign currency flow and the estimated position with the dollar value', () => {
         const data = exchangeData({
            customerImports: { isType: 'Si', whatPercentage: '10', currencyHedgingPolicy: '50' },
            customerExports: { isType: 'No', currencyHedgingPolicy: '30' },
         });

         handleVerifyCalculators(data, 20);

         expect(data.calculatorRateExchange.foreignCurrencyFlow).toBe(5000);
         expect(data.calculatorRateExchange.estimatedCumulativePosition).toBe(2500);
      });

      test('resets the rate calculator for the exchange calculator', () => {
         const data = exchangeData({
            customerImports: { isType: 'Si', whatPercentage: '10', currencyHedgingPolicy: '50' },
            customerExports: { isType: 'No', currencyHedgingPolicy: '30' },
         });

         handleVerifyCalculators(data);

         expect(data.calculatorRate).toEqual(pristineTemplates.calculatorRate);
      });

      test('logs the error and leaves the data untouched when the coverage profile is missing', () => {
         const data = { selectedCalculator: 'typechange', calculatorRate: 'kept' };

         expect(handleVerifyCalculators(data, 20)).toBeUndefined();
         expect(console.error).toHaveBeenCalled();
         expect(data.calculatorRate).toBe('kept');
      });

      test('logs the error when neither imports nor exports are defined', () => {
         const data = exchangeData({ customerImports: undefined, customerExports: undefined });

         handleVerifyCalculators(data, 20);

         expect(console.error).toHaveBeenCalled();
      });
   });

   describe('validationIfCompleted', () => {
      const validCredit = credit;

      test.each([
         ['no data', undefined],
         ['an empty object', {}],
      ])('returns true for %s', (_label, data) => {
         expect(validationIfCompleted(data)).toBe(true);
      });

      test('returns false for an inherited key', () => {
         expect(validationIfCompleted(Object.create({ inherited: 'value' }))).toBe(false);
      });

      test.each([
         ['a filled string', 'text', true],
         ['zero', 0, true],
         ['a positive number', 5, true],
         ['an empty string', '', false],
         ['null', null, false],
         ['undefined', undefined, false],
         ['false', false, false],
      ])('validates a field without a rule with %s', (_label, value, expected) => {
         expect(validationIfCompleted({ anyField: value })).toBe(expected);
      });

      test.each([
         ['descriptionOfStrategy', 'text', true],
         ['descriptionOfStrategy', '', false],
         ['rateCalculator', { a: 'x', b: 1 }, true],
         ['rateCalculator', { a: 'x', b: '' }, false],
         ['annualConsistencyValidation', { value: 1 }, true],
         ['annualConsistencyValidation', {}, false],
      ])('applies the rule of %s', (key, value, expected) => {
         expect(validationIfCompleted({ [key]: value })).toBe(expected);
      });

      test.each([
         [
            'a rate with its rate type and percentage',
            { isType: 'rate', data: [{ rateType: 'TIIE', porcentage: '5' }] },
            true,
         ],
         ['a rate without rate type', { isType: 'rate', data: [{ porcentage: '5' }] }, false],
         [
            'a cross with its cross and percentage',
            { isType: 'typechange', data: [{ cross: 'USDMXN', porcentage: '5' }] },
            true,
         ],
         ['a cross without percentage', { isType: 'typechange', data: [{ cross: 'USDMXN' }] }, false],
         ['no type', { isType: '', data: [{ rateType: 'TIIE', porcentage: '5' }] }, false],
         ['no data', { isType: 'rate', data: [] }, false],
      ])('validates the calculator type with %s', (_label, value, expected) => {
         expect(validationIfCompleted({ calculatorType: value })).toBe(expected);
      });

      describe.each([
         ['customerImports', 'fromWhere', 'foreignCurrencyInputs'],
         ['customerExports', 'toWhere', 'foreignCurrencyDomesticSales'],
      ])('%s', (key, whereKey, noneKey) => {
         test.each([
            [
               'yes with percentage and place',
               { isType: 'Si', currencyHedgingPolicy: '50', whatPercentage: '10', [whereKey]: 'MX' },
               true,
            ],
            [
               'yes without percentage',
               { isType: 'Si', currencyHedgingPolicy: '50', whatPercentage: '', [whereKey]: 'MX' },
               false,
            ],
            [
               'yes without place',
               { isType: 'Si', currencyHedgingPolicy: '50', whatPercentage: '10', [whereKey]: '' },
               false,
            ],
            [
               'no with the foreign currency value',
               { isType: 'No', currencyHedgingPolicy: '50', [noneKey]: '10' },
               true,
            ],
            [
               'no without the foreign currency value',
               { isType: 'No', currencyHedgingPolicy: '50', [noneKey]: '' },
               false,
            ],
            ['no type', { isType: '', currencyHedgingPolicy: '50' }, false],
            [
               'no hedging policy',
               { isType: 'Si', currencyHedgingPolicy: '', whatPercentage: '10', [whereKey]: 'MX' },
               false,
            ],
         ])('validates it with %s', (_label, value, expected) => {
            expect(validationIfCompleted({ [key]: value })).toBe(expected);
         });
      });

      test.each([
         ['no type', { isType: '', data: [] }, false],
         ['no experience', { isType: 'No', data: [] }, true],
         ['experience without data', { isType: 'Si', data: [] }, false],
         [
            'experience with counterpart and condition',
            { isType: 'Si', data: [{ counterpart: 'A', condition: 'B' }] },
            true,
         ],
         ['experience with an incomplete row', { isType: 'Si', data: [{ counterpart: 'A', condition: '' }] }, false],
      ])('validates the customer experience with %s', (_label, value, expected) => {
         expect(validationIfCompleted({ customerHasExperience: value })).toBe(expected);
      });

      test.each([
         ['no credits', [], false],
         ['a complete credit', [validCredit], true],
         ['an incomplete credit', [validCredit, { ...validCredit, creditor: '' }], false],
         ['a credit with a zero value', [{ ...validCredit, lineAmount: 0 }], false],
         ['a credit with a null value', [{ ...validCredit, lineAmount: null }], false],
      ])('validates the creditors with %s', (_label, value, expected) => {
         expect(validationIfCompleted({ creditors: value })).toBe(expected);
      });

      test.each([
         ['no visitors', [], false],
         ['a complete visitor', [{ visitorName: 'Ana', visitorPosition: 'Director' }], true],
         ['a visitor without position', [{ visitorName: 'Ana', visitorPosition: '' }], false],
      ])('validates who made the visit with %s', (_label, value, expected) => {
         expect(validationIfCompleted({ whoMadeTheVisit: value })).toBe(expected);
      });

      test.each([
         ['no news found', { noNewsWereFound: true, positives: [], negatives: [] }, true],
         [
            'positives and negatives',
            { positives: [{ description: 'a', url: 'u' }], negatives: [{ description: 'b', url: 'v' }] },
            true,
         ],
         ['only positives', { positives: [{ description: 'a', url: 'u' }], negatives: [] }, false],
         ['only negatives', { positives: [], negatives: [{ description: 'b', url: 'v' }] }, false],
         [
            'a positive without url',
            { positives: [{ description: 'a', url: '' }], negatives: [{ description: 'b', url: 'v' }] },
            false,
         ],
         [
            'a negative without description',
            { positives: [{ description: 'a', url: 'u' }], negatives: [{ description: '', url: 'v' }] },
            false,
         ],
      ])('validates the news with %s', (_label, value, expected) => {
         expect(validationIfCompleted({ news: value })).toBe(expected);
      });
   });

   describe('validationIfSaved', () => {
      test.each([
         ['no data', undefined],
         ['an empty object', {}],
      ])('returns false for %s', (_label, data) => {
         expect(validationIfSaved(data)).toBe(false);
      });

      test('ignores the fields that are saved automatically', () => {
         const data = {
            sourcerOfCredit: 'base',
            coverageIndex: 5,
            customerPosition: 'Compra',
            percentageInForeignCurrency: '10',
            coveragePolicy: '50',
            annualConsistencyValidation: { value: 1 },
            mpa: 100,
         };

         expect(validationIfSaved(data)).toBe(false);
      });

      test.each([
         ['a filled string', 'text', true],
         ['a positive number', 5, true],
         ['a filled array', [1], true],
         ['a filled object', { a: 1 }, true],
         ['a blank string', '   ', false],
         ['an empty string', '', false],
         ['zero', 0, false],
         ['null', null, false],
         ['undefined', undefined, false],
         ['an empty array', [], false],
         ['an empty object', {}, false],
      ])('validates a field without a rule with %s', (_label, value, expected) => {
         expect(validationIfSaved({ anyField: value })).toBe(expected);
      });

      test('returns true as soon as one field is saved', () => {
         expect(validationIfSaved({ empty: '', filled: 'x' })).toBe(true);
      });

      test('ignores inherited keys', () => {
         expect(validationIfSaved(Object.create({ inherited: 'value' }))).toBe(false);
      });

      test.each([
         ['descriptionOfStrategy', 'text', true],
         ['descriptionOfStrategy', '', false],
         ['rateCalculator', { requestedLineAmount: '5', pointsToCover: '' }, false],
         ['rateCalculator', { requestedLineAmount: '5', pointsToCover: '1' }, true],
         ['calculatorType', { isType: 'rate' }, true],
         ['calculatorType', { isType: '' }, false],
         ['customerImports', { isType: 'Si' }, true],
         ['customerImports', { isType: '' }, false],
         ['customerExports', { isType: 'No' }, true],
         ['customerExports', { isType: '' }, false],
         ['customerHasExperience', { isType: 'No' }, true],
         ['customerHasExperience', { isType: '' }, false],
         ['creditors', [], false],
         ['creditors', [{ creditor: '' }], false],
         ['creditors', [{ creditor: 'Bank' }], true],
         ['whoMadeTheVisit', [], false],
         ['whoMadeTheVisit', [{ visitorName: '' }], false],
         ['whoMadeTheVisit', [{ visitorName: 'Ana' }], true],
      ])('applies the rule of %s', (key, value, expected) => {
         expect(validationIfSaved({ [key]: value })).toBe(expected);
      });

      test.each([
         ['no news found', { noNewsWereFound: true }, true],
         ['a filled positive', { positives: [{ description: 'a' }], negatives: [] }, true],
         ['a filled negative', { positives: [], negatives: [{ description: 'b' }] }, true],
         [
            'an empty positive followed by a filled negative',
            { positives: [{ description: '' }], negatives: [{ description: 'b' }] },
            true,
         ],
         [
            'empty positives and negatives',
            { positives: [{ description: '' }], negatives: [{ description: '' }] },
            false,
         ],
         ['no positives or negatives', { positives: [], negatives: [] }, false],
         ['nothing', undefined, false],
      ])('validates the news with %s', (_label, value, expected) => {
         expect(validationIfSaved({ news: value })).toBe(expected);
      });

      test('keeps looking at the other fields when a rule field is not saved', () => {
         expect(validationIfSaved({ descriptionOfStrategy: '', other: 'x' })).toBe(true);
      });
   });
});
