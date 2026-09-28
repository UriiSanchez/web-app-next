import Swal from 'sweetalert2';

import {
   getPropertyFormat,
   savePropertyFormat,
   saveVerification,
   savePropertyAfterVerification,
} from '../../services/servPropertyVerification';
import { genericFetch } from '../../hooks';
import { constTypePerson, constProfiles } from '../../helpers/config';
import { initSummaryIndiviual, statusProperty } from '../../helpers';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const dialogWith = (text) => expect.objectContaining({ html: expect.stringContaining(text) });
const sentBody = () => JSON.parse(genericFetch.mock.calls[0][0].data);

const check = (overrides = {}) => ({
   ownerType: 'APPLICANT',
   ownershipStatus: 'libre',
   ownershipValue: 300,
   countable: true,
   ...overrides,
});

const property = (overrides = {}) => ({ idRelOwnership: 1, customerValue: 500, ...overrides });

const apiData = (overrides = {}) => ({
   propertiesFormat: { verificationDate: '2024-03-05T10:00:00', uniqueFolio: '' },
   resumeGeneral: { resume: null, creditRisk: 1000 },
   applicant: { idClient: 1, properties: [], resumeInd: { resume: null } },
   obligedList: [],
   ...overrides,
});

describe('servPropertyVerification', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   describe('getPropertyFormat', () => {
      test('requests the property format of the request', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: apiData() });

         await getPropertyFormat(7);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Relationship/Ownership/getAllRelOwn?idRequest=7',
            method: 'get',
         });
      });

      test('formats the verification date and caches the parsed information', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: apiData() });

         const result = await getPropertyFormat(7);

         expect(result.status).toBe(200);
         expect(result.data.propertiesFormat.modifyDate).toBe('05-03-2024');
         expect(JSON.parse(localStorage.getItem('Property_Page'))).toEqual(result.data);
      });

      test('uses today as the modify date when there is no verification date', async () => {
         jest.useFakeTimers().setSystemTime(new Date(2024, 5, 15, 12));
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({ propertiesFormat: { uniqueFolio: '' } }),
         });

         const { data } = await getPropertyFormat(7);

         expect(data.propertiesFormat.modifyDate).toBe('15-06-2024');
      });

      test('parses the stored summaries of the applicant and the obligated', async () => {
         const applicantResume = { ...initSummaryIndiviual, custom: 'applicant' };
         const obligedResume = { ...initSummaryIndiviual, custom: 'obliged' };
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({
               applicant: { idClient: 1, properties: [], resumeInd: { resume: JSON.stringify(applicantResume) } },
               obligedList: [{ idClient: 2, properties: [], resumeInd: { resume: JSON.stringify(obligedResume) } }],
            }),
         });

         const { data } = await getPropertyFormat(7);

         expect(data.applicant.resumeInd.resume).toEqual(applicantResume);
         expect(data.obligedList[0].resumeInd.resume).toEqual(obligedResume);
      });

      test('starts from empty summaries when they come empty', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({ obligedList: [{ idClient: 2, properties: [], resumeInd: { resume: '' } }] }),
         });

         const { data } = await getPropertyFormat(7);

         expect(data.applicant.resumeInd.resume).toEqual(initSummaryIndiviual);
         expect(data.obligedList[0].resumeInd.resume).toEqual(initSummaryIndiviual);
      });

      test('parses the stored general summary and keeps the rest of the general data', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({ resumeGeneral: { resume: JSON.stringify({ stored: true }), creditRisk: 500 } }),
         });

         const { data } = await getPropertyFormat(7);

         expect(data.resumeGeneral.creditRisk).toBe(500);
         expect(data.resumeGeneral.resume.inmueblesApplicant).toBeDefined();
      });

      test('shows the server error dialog and returns a 500 object when a stored summary is not valid JSON', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({ resumeGeneral: { resume: '{not json', creditRisk: 500 } }),
         });

         const result = await getPropertyFormat(7);

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(SyntaxError);
      });

      test('sorts the obligated by client id', async () => {
         const oblige = (idClient) => ({ idClient, properties: [], resumeInd: { resume: null } });
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({ obligedList: [oblige(30), oblige(10), oblige(20)] }),
         });

         const { data } = await getPropertyFormat(7);

         expect(data.obligedList.map((o) => o.idClient)).toEqual([10, 20, 30]);
      });

      test('reports that there is no property and titles the format as society only', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: apiData() });

         const { data } = await getPropertyFormat(7);

         expect(data).toMatchObject({ hasProperty: false, hasPropertyOS: false });
         expect(data.propertiesFormat.freezeTitle).toBe('Cumple sociedad');
      });

      test('reports the properties of the applicant and titles the format as security and society', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({ applicant: { idClient: 1, properties: [property()], resumeInd: { resume: null } } }),
         });

         const { data } = await getPropertyFormat(7);

         expect(data).toMatchObject({ hasProperty: true, hasPropertyOS: false });
         expect(data.propertiesFormat.freezeTitle).toBe('Cumple seguridad y sociedad');
      });

      test('reports the properties of an obligated and titles the format as security and society', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({
               obligedList: [
                  { idClient: 2, properties: [], resumeInd: { resume: null } },
                  { idClient: 3, properties: [property()], resumeInd: { resume: null } },
               ],
            }),
         });

         const { data } = await getPropertyFormat(7);

         expect(data).toMatchObject({ hasProperty: false, hasPropertyOS: true });
         expect(data.propertiesFormat.freezeTitle).toBe('Cumple seguridad y sociedad');
      });

      test('calculates the general summary and the coverage ratio from the properties', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: apiData({
               applicant: {
                  idClient: 1,
                  properties: [
                     property({ idCheckOwnership: check() }),
                     property({ idRelOwnership: 2, customerValue: 200 }),
                  ],
                  resumeInd: { resume: null },
               },
            }),
         });

         const { data } = await getPropertyFormat(7);
         const { resume } = data.resumeGeneral;

         expect(resume.inmueblesApplicant.pending).toEqual({ numero: 2, valor: 700 });
         expect(resume.inmueblesApplicant.verify).toEqual({ numero: 1, valor: 300 });
         expect(resume.libres).toEqual({ numero: 1, valor: 300 });
         expect(data.resumeGeneral.coverageRatio).toBe(0.3);
      });

      test('shows the error dialog and returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getPropertyFormat(7);

         expect(result).toEqual({ status: 404, error: 'Not found' });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Recurso o información no encontrado'));
         expect(localStorage.getItem('Property_Page')).toBeNull();
      });

      test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         const result = await getPropertyFormat(7);

         expect(result).toEqual({ status: 500, error });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Error interno del servidor'));
      });

      test('shows the server error dialog and returns a 500 object when the format cannot be parsed', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { propertiesFormat: {} } });

         const result = await getPropertyFormat(7);

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
      });
   });

   describe('savePropertyFormat', () => {
      const format = (overrides = {}) => ({
         propertiesFormat: { uniqueFolio: 'FOLIO-1' },
         resumeGeneral: { resume: { general: true }, creditRisk: 1000 },
         applicant: { idClient: 1, properties: [property()], resumeInd: { resume: { applicant: true }, total: 1 } },
         obligedList: [
            { idClient: 2, properties: [property({ idRelOwnership: 2 })], resumeInd: { resume: { obliged: true } } },
            { idClient: 3, properties: [], resumeInd: { resume: { empty: true } } },
         ],
         ...overrides,
      });

      test('patches the format with the summaries serialized and only the obligated that have properties', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await savePropertyFormat(format(), constProfiles.MRC);

         expect(genericFetch.mock.calls[0][0]).toMatchObject({
            url: '/credit/Relationship/Ownership/savePartial',
            method: 'patch',
         });
         const body = sentBody();
         expect(body.applicant.resumeInd).toEqual({ resume: JSON.stringify({ applicant: true }), total: 1 });
         expect(body.obligedList).toHaveLength(1);
         expect(body.obligedList[0]).toMatchObject({
            idClient: 2,
            resumeInd: { resume: JSON.stringify({ obliged: true }) },
         });
         expect(body.resumeGeneral).toEqual({ resume: JSON.stringify({ general: true }), creditRisk: 1000 });
         expect(result).toEqual({ status: 204 });
      });

      test('leaves out the applicant and the obligated when none has properties', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await savePropertyFormat(
            format({
               applicant: { idClient: 1, properties: [], resumeInd: {} },
               obligedList: [{ idClient: 3, properties: [], resumeInd: {} }],
            }),
            constProfiles.MRC
         );

         const body = sentBody();
         expect(body).not.toHaveProperty('applicant');
         expect(body).not.toHaveProperty('obligedList');
      });

      test.each([
         ['freezing', { folio: 'FOLIO-1', isFreeze: true }, statusProperty.FREEZE],
         ['freezing without folio', { folio: '', isFreeze: true }, statusProperty.FREEZE],
         ['finishing with a folio', { folio: 'FOLIO-1', isFreeze: false }, statusProperty.FINALIZADO],
         ['saving without a folio', { folio: '', isFreeze: false }, statusProperty.INCOMPLETO],
      ])('sets the format status when %s', async (_label, { folio, isFreeze }, idCatStatus) => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await savePropertyFormat(format({ propertiesFormat: { uniqueFolio: folio } }), constProfiles.MRC, isFreeze);

         expect(sentBody().propertiesFormat.idCatStatus).toBe(idCatStatus);
      });

      describe.each([
         ['ADC', constProfiles.ADC],
         ['LDC', constProfiles.LDC],
      ])('for the %s profile', (_name, idProfile) => {
         test('disables the verification unless every verified property was validated', async () => {
            genericFetch.mockResolvedValueOnce({ status: 204 });
            const properties = [
               property({ idCheckOwnership: check(), validation: true }),
               property({ idRelOwnership: 2 }),
            ];

            await savePropertyFormat(
               format({ applicant: { idClient: 1, properties, resumeInd: { resume: {} } } }),
               idProfile
            );

            expect(sentBody().propertiesFormat.disableVerification).toBe(true);
         });

         test('keeps the verification enabled when a verified property was not validated', async () => {
            genericFetch.mockResolvedValueOnce({ status: 204 });
            const properties = [
               property({ idCheckOwnership: check(), validation: true }),
               property({ idRelOwnership: 2, idCheckOwnership: check(), validation: false }),
            ];

            await savePropertyFormat(
               format({ applicant: { idClient: 1, properties, resumeInd: { resume: {} } } }),
               idProfile
            );

            expect(sentBody().propertiesFormat.disableVerification).toBe(false);
         });

         test('does not set the flag when no property was verified', async () => {
            genericFetch.mockResolvedValueOnce({ status: 204 });

            await savePropertyFormat(format(), idProfile);

            expect(sentBody().propertiesFormat).not.toHaveProperty('disableVerification');
         });

         test('does not set the flag when there are no properties', async () => {
            genericFetch.mockResolvedValueOnce({ status: 204 });

            await savePropertyFormat(
               format({ applicant: { idClient: 1, properties: [], resumeInd: {} }, obligedList: [] }),
               idProfile
            );

            expect(sentBody().propertiesFormat).not.toHaveProperty('disableVerification');
         });
      });

      test.each([
         ['another profile', constProfiles.MRC],
         ['no profile', undefined],
      ])('does not set the verification flag for %s', async (_label, idProfile) => {
         genericFetch.mockResolvedValueOnce({ status: 204 });
         const properties = [property({ idCheckOwnership: check(), validation: true })];

         await savePropertyFormat(
            format({ applicant: { idClient: 1, properties, resumeInd: { resume: {} } } }),
            idProfile
         );

         expect(sentBody().propertiesFormat).not.toHaveProperty('disableVerification');
      });

      test('returns the response untouched when the status is not successful', async () => {
         genericFetch.mockResolvedValueOnce({ status: 409, error: 'Conflict' });

         await expect(savePropertyFormat(format(), constProfiles.MRC)).resolves.toEqual({
            status: 409,
            error: 'Conflict',
         });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(savePropertyFormat(format(), constProfiles.MRC)).resolves.toEqual({ status: 500, error });
      });

      test('returns a 500 object with the error when the data cannot be processed', async () => {
         const result = await savePropertyFormat(format({ obligedList: undefined }), constProfiles.MRC);

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
         expect(genericFetch).not.toHaveBeenCalled();
      });
   });

   describe('saveVerification', () => {
      test('posts the verification and returns the response', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { saved: true } });

         const result = await saveVerification({ idRelOwnership: 1, ownershipStatus: 'libre' });

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Relationship/Ownership/saveVerification',
            method: 'post',
            data: JSON.stringify({ idRelOwnership: 1, ownershipStatus: 'libre' }),
         });
         expect(result).toEqual({ status: 200, data: { saved: true } });
      });

      test('shows the error dialog and returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         const result = await saveVerification({});

         expect(result).toEqual({ status: 400, error: 'Bad request' });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('La solicitud no pudo procesarse'));
      });

      test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(saveVerification({})).resolves.toEqual({ status: 500, error });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Error interno del servidor'));
      });
   });

   describe('savePropertyAfterVerification', () => {
      const propertyInfo = (overrides = {}) => ({
         propertiesFormat: { uniqueFolio: 'FOLIO-1' },
         resumeGeneral: { resume: {}, creditRisk: 1000 },
         applicant: { idClient: 1, properties: [property()], resumeInd: { resume: {} } },
         obligedList: [],
         ...overrides,
      });

      test('stores the verification in the applicant property, recalculates the summaries and saves', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });
         const verification = { ...check(), catTypePerson: constTypePerson.APPLICANT, idx: 0 };

         const result = await savePropertyAfterVerification(verification, propertyInfo());

         const body = sentBody();
         expect(body.applicant.properties[0].idCheckOwnership).toEqual(verification);
         const individual = JSON.parse(body.applicant.resumeInd.resume);
         expect(individual.libres).toEqual({ numero: 1, valor: 300 });
         expect(individual.inmuebles).toEqual({ numero: 1, valor: 300 });
         const general = JSON.parse(body.resumeGeneral.resume);
         expect(general.libres).toEqual({ numero: 1, valor: 300 });
         expect(result).toEqual({ status: 204 });
      });

      test('does not change the received property info', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });
         const info = propertyInfo();

         await savePropertyAfterVerification({ ...check(), catTypePerson: constTypePerson.APPLICANT, idx: 0 }, info);

         expect(info.applicant.properties[0]).not.toHaveProperty('idCheckOwnership');
      });

      describe('for an obligated', () => {
         const withObligated = () =>
            propertyInfo({
               applicant: { idClient: 1, properties: [], resumeInd: { resume: {} } },
               obligedList: [
                  {
                     idClient: 2,
                     properties: [property({ idRelOwnership: 10 }), property({ idRelOwnership: 11 })],
                     resumeInd: { resume: {} },
                  },
                  { idClient: 3, properties: [property({ idRelOwnership: 12 })], resumeInd: { resume: { keep: 1 } } },
               ],
            });
         const verification = {
            ...check({ ownerType: 'CO_OBLIGED', ownershipStatus: 'gravado', ownershipValue: 150 }),
            catTypePerson: constTypePerson.SOLIDARY_OBLIGED,
            idClient: 2,
            idRelOwnership: 10,
         };

         test('stores the verification only in the matching property of the matching client', async () => {
            genericFetch.mockResolvedValueOnce({ status: 204 });

            await savePropertyAfterVerification(verification, withObligated());

            const [verified, other] = sentBody().obligedList;
            expect(verified.properties[0].idCheckOwnership).toEqual(verification);
            expect(verified.properties[1]).not.toHaveProperty('idCheckOwnership');
            expect(other.properties[0]).not.toHaveProperty('idCheckOwnership');
         });

         test('recalculates only the summary of the matching client and the general one', async () => {
            genericFetch.mockResolvedValueOnce({ status: 204 });

            await savePropertyAfterVerification(verification, withObligated());

            const [verified, other] = sentBody().obligedList;
            const individual = JSON.parse(verified.resumeInd.resume);
            expect(individual.gravados).toEqual({ numero: 1, valor: 150 });
            expect(JSON.parse(other.resumeInd.resume)).toEqual({ keep: 1 });
            const general = JSON.parse(sentBody().resumeGeneral.resume);
            expect(general.gravados).toEqual({ numero: 1, valor: 150 });
            expect(general.copropiedadWithOS).toEqual({ numero: 1, valor: 150 });
         });

         test('keeps every obligated when no client matches', async () => {
            genericFetch.mockResolvedValueOnce({ status: 204 });

            await savePropertyAfterVerification({ ...verification, idClient: 99 }, withObligated());

            expect(sentBody().obligedList).toHaveLength(2);
            expect(sentBody().obligedList[0].properties[0]).not.toHaveProperty('idCheckOwnership');
         });
      });

      test('returns the response of the save even when it fails', async () => {
         genericFetch.mockResolvedValueOnce({ status: 409, error: 'Conflict' });

         await expect(
            savePropertyAfterVerification(
               { ...check(), catTypePerson: constTypePerson.APPLICANT, idx: 0 },
               propertyInfo()
            )
         ).resolves.toEqual({ status: 409, error: 'Conflict' });
      });

      test('returns a 500 object with the error when the property info cannot be processed', async () => {
         const result = await savePropertyAfterVerification(
            { ...check(), catTypePerson: constTypePerson.APPLICANT, idx: 0 },
            { obligedList: [] }
         );

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
         expect(genericFetch).not.toHaveBeenCalled();
      });
   });
});
