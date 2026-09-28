import {
   getCustomerProfile,
   saveCustomerProfile,
   checkCompletePCD,
   handleVerifyCalculators,
} from '../../services/servDerivaties';

import { genericFetch } from '../../hooks';
import { templateDerivatives } from '../../helpers';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servDerivaties', () => {
   describe('getCustomerProfile service', () => {
      let serviceMock;

      beforeEach(() => {
         serviceMock = {
            status: 200,
            data: {
               coverageProfile: JSON.stringify(templateDerivatives.coverageProfile),
               calculatorRate: JSON.stringify(templateDerivatives.calculatorRate),
               calculatorRateExchange: JSON.stringify(templateDerivatives.calculatorRateExchange),
               profileResume: JSON.stringify(templateDerivatives.profileResume),
            },
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it calls genericFetch with idRequest value', async () => {
         await getCustomerProfile(10);

         expect(genericFetch.mock.calls[0][0].url).toBe('/credit/Format/getFormatById?idRequest=10');
      });

      test('when fetch service response status is different than 200 it returns an object with the error message', async () => {
         serviceMock.status = 500;
         serviceMock.data = { errors: ['Test Error Message'] };

         const result = await getCustomerProfile(10);
         expect(result).toEqual({ status: 500, data: { errors: ['Test Error Message'] } });
      });

      test('when one of the page derivatives property is empty it is set to the default value', async () => {
         serviceMock.data.coverageProfile = {};

         const result = await getCustomerProfile(10);
         expect(result.data.coverageProfile).toEqual(templateDerivatives.coverageProfile);
      });

      test('when fetch function throws an error it returns an object with the error message', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await getCustomerProfile(10);
         expect(result).toEqual({ status: 500, error: new Error('Test Error Message') });
      });

      test('when editInfo is true it saves idRequest in local storage', async () => {
         await getCustomerProfile(10, true);

         expect(JSON.parse(localStorage.getItem('PCD_Page')).idRequest).toBe(10);
      });

      test('when removing from local storage throws an error it still returns an object with the fetch data', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         jest.spyOn(localStorage, 'removeItem').mockImplementationOnce(() => {
            throw new Error('Test Error Message');
         });

         const result = await getCustomerProfile(10);
         expect(result).toEqual(serviceMock);
      });
   });

   describe('saveCustomerProfile service', () => {
      let info;

      beforeEach(() => {
         info = {
            isCompleted: true,
            idGroupStatus: 1,
            selectedCalculator: 'rate',
            idRequest: 1,
            veracity: '',
            calculatorRate: {
               rateCalculator: { amountOfCreditUS: '100' },
            },
         };

         genericFetch.mockImplementation(async () => ({}));
      });

      test('when fetch response status is different than 200 it returns an object with an error', async () => {
         genericFetch.mockImplementationOnce(async () => ({
            status: 500,
            error: { traceId: '', response: { message: 'An error has occurred, please try again later.' } },
         }));

         const result = await saveCustomerProfile(info, 2, 'testuser');
         expect(result).toEqual({
            status: 500,
            error: { traceId: '', response: { message: 'An error has occurred, please try again later.' } },
         });
      });

      test('when response status is 200 it returns the response object', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 204, data: { test: 'test' } }));

         const result = await saveCustomerProfile(info, 2, 'testuser');
         expect(result).toEqual({ status: 204, data: { test: 'test' } });
      });
   });

   describe('checkCompletePCD service', () => {
      let info;

      beforeEach(() => {
         info = {
            selectedCalculator: 'rate',
            coverageProfile: {
               calculatorType: { isType: 'rate', data: [{ rateType: 'variableRate', porcentage: '6' }] },
               customerImports: {
                  isType: 'Si',
                  fromWhere: 'EU',
                  whatPercentage: '7',
                  currencyHedgingPolicy: '9',
                  foreignCurrencyInputs: '',
               },
               customerExports: {
                  isType: 'Si',
                  toWhere: 'EU',
                  whatPercentage: '6',
                  currencyHedgingPolicy: '9',
                  foreignCurrencyDomesticSales: '',
               },
               descriptionOfStrategy: 'test',
               customerHasExperience: { isType: 'No', data: [] },
            },
            calculatorRate: { sourcerOfCredit: 'base' },
            profileResume: {
               mainBusinessActivity: 'test',
               whoTargetYouServicesOrProducts: 'test',
               presence: 'test',
               productsAndServicesSold: 'test',
               brands: 'test',
               mainCustomers: 'test',
               mainSuppliers: 'test',
               bussinesCyclicality: 'test',
               strategicAlliancesOrPartners: 'test',
               whoMadeTheVisit: [{ visitorName: 'test', visitorPosition: 'test' }],
               whoVisitedName: 'test',
               whoVisitedPosition: 'test',
               numberOfEmployees: 'test',
               physicalConditionOfTheFacilities: 'test',
               physicalContionOfInventoriesAndObsolescences: 'test',
               news: {
                  positives: [{ description: 'test', url: 'test' }],
                  negatives: [{ description: 'test', url: 'test' }],
                  noNewsWereFound: false,
               },
               industryRisksDetected: 'test',
               competitiveAdvantageOrDifferentiator: 'test',
               additionalCommentsOrProjectsInThePipeline: 'test',
               perceptionOfTheCompanysManagement: 'test',
               whosePerceptionIsCollected: 'test',
               whyYouDOrecommendTheCompany: 'test',
            },
         };
      });

      test('when coverage, calculate and summary are completed it returns true', () => {
         const result = checkCompletePCD(info).allPCD;

         expect(result).toBe(true);
      });

      test('when calculatorType isType is empty it returns false', () => {
         delete info.coverageProfile.calculatorType.isType;

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when calculatorType data is empty it return false', () => {
         info.coverageProfile.calculatorType.data = {};

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when isType is empty for customerImports it should return false', () => {
         delete info.coverageProfile.customerImports.isType;

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when customer has imports but whatPercentage is empty it returns false', () => {
         delete info.coverageProfile.customerImports.whatPercentage;

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when customer has imports but fromWhere is empty it returns false', () => {
         delete info.coverageProfile.customerImports.fromWhere;

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when customer does not have imports and foreignCurrencyInputs is empty it returns false', () => {
         info.coverageProfile.customerImports.isType = 'No';
         delete info.coverageProfile.customerImports.foreignCurrencyInputs;

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when customer has exports but toWhere is empty it returns false', () => {
         delete info.coverageProfile.customerExports.toWhere;

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when customer does not have exports and foreignCurrencyDomesticSales it returns false', () => {
         info.coverageProfile.customerExports.isType = 'No';
         delete info.coverageProfile.customerExports.foreignCurrencyDomesticSales;

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when coverageProfile has an empty property it returns false', () => {
         info.coverageProfile.descriptionOfStrategy = '';

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when in profileResume card type questions have empty data property returns false', () => {
         info.profileResume = { whoMadeTheVisit: [] };

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });

      test('when there are positive news but it has an empty string', () => {
         info.profileResume.news = {
            positives: [{ description: 'test', url: '' }],
            negatives: [{ description: 'test', url: 'test' }],
            noNewsWereFound: false,
         };

         const result = checkCompletePCD(info).allPCD;
         expect(result).toBe(false);
      });
   });

   describe('handleVerifyCalculators service', () => {
      let data;

      beforeEach(() => {
         data = {
            requestAmount: '100',
            selectedCalculator: 'rate',
            coverageProfile: {
               calculatorType: { isType: 'rate' },
               customerImports: {
                  isType: 'No',
                  foreignCurrencyInputs: '100',
                  whatPercentage: '14.2',
                  currencyHedgingPolicy: '9',
               },
               customerExports: {
                  isType: 'No',
                  foreignCurrencyDomesticSales: '50',
                  whatPercentage: '8.2',
                  currencyHedgingPolicy: '4',
               },
            },
            calculatorRate: { rateCalculator: {} },
            calculatorRateExchange: {},
         };
      });

      test('when calculator type is rate it should define line amount and exchange rate', () => {
         handleVerifyCalculators(data);

         expect(data.calculatorRate.rateCalculator.requestedLineAmount).toBe(100);
         expect(data.calculatorRateExchange).toBe(templateDerivatives.calculatorRateExchange);
      });

      test('when calculator rate is undefined it logs the error', () => {
         const mockFn = jest.fn();
         jest.spyOn(console, 'error').mockImplementationOnce(mockFn);
         delete data.calculatorRate;

         handleVerifyCalculators(data);
         expect(mockFn).toHaveBeenCalledTimes(1);
      });

      describe('when calculator is typechange', () => {
         beforeEach(() => {
            data.coverageProfile.calculatorType.isType = 'typechange';
            data.selectedCalculator = 'typechange';
         });

         test('and there are both imports and exports and import percentage is greater than export percentage it sets percentage currency from imports', () => {
            data.coverageProfile.customerImports.isType = 'Si';
            data.coverageProfile.customerExports.isType = 'Si';

            handleVerifyCalculators(data);

            expect(data.calculatorRateExchange.customerPosition).toBe('Compra moneda extranjera');
            expect(data.calculatorRateExchange.percentageInForeignCurrency).toBe('14.2');
            expect(data.calculatorRateExchange.coveragePolicy).toBe('9');
         });

         test('and there are both imports and exports and export percentage is greater than export percentage it sets percentage currency from imports', () => {
            data.coverageProfile.customerImports.isType = 'Si';
            data.coverageProfile.customerExports.isType = 'Si';
            data.coverageProfile.customerExports.whatPercentage = '20';

            handleVerifyCalculators(data);

            expect(data.calculatorRateExchange.customerPosition).toBe('Venta moneda extranjera');
            expect(data.calculatorRateExchange.percentageInForeignCurrency).toBe('20');
            expect(data.calculatorRateExchange.coveragePolicy).toBe('4');
         });

         test('and there are no imports or exports and import foreign currency is greater than export foreign currency', () => {
            handleVerifyCalculators(data);

            expect(data.calculatorRateExchange.customerPosition).toBe('Compra moneda extranjera');
            expect(data.calculatorRateExchange.percentageInForeignCurrency).toBe('100');
            expect(data.calculatorRateExchange.coveragePolicy).toBe('9');
         });

         test('and there are no imports or exports and export foreign currency is greater than export foreign currency', () => {
            data.coverageProfile.customerExports.foreignCurrencyDomesticSales = '150';

            handleVerifyCalculators(data);

            expect(data.calculatorRateExchange.customerPosition).toBe('Venta moneda extranjera');
            expect(data.calculatorRateExchange.percentageInForeignCurrency).toBe('150');
            expect(data.calculatorRateExchange.coveragePolicy).toBe('4');
         });

         test('and there imports but no exports it sets percentage currency from imports', () => {
            data.coverageProfile.customerImports.isType = 'Si';

            handleVerifyCalculators(data);

            expect(data.calculatorRateExchange.customerPosition).toBe('Compra moneda extranjera');
            expect(data.calculatorRateExchange.percentageInForeignCurrency).toBe('14.2');
            expect(data.calculatorRateExchange.coveragePolicy).toBe('9');
         });

         test('and there exports but no imports it sets percentage currency from exports', () => {
            data.coverageProfile.customerExports.isType = 'Si';

            handleVerifyCalculators(data);

            expect(data.calculatorRateExchange.customerPosition).toBe('Venta moneda extranjera');
            expect(data.calculatorRateExchange.percentageInForeignCurrency).toBe('8.2');
            expect(data.calculatorRateExchange.coveragePolicy).toBe('4');
         });
      });
   });
});
