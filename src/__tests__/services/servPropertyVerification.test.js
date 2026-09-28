import {
   getPropertyFormat,
   savePropertyFormat,
   saveVerification,
   savePropertyAfterVerification,
} from '../../services/servPropertyVerification';

import { genericFetch } from '../../hooks';
import { calcGlobalSummary, calcIndividualSummary } from '../../helpers/calculates';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));
jest.mock('../../helpers/calculates', () => ({
   __esModule: true,
   calcGlobalSummary: jest.fn(),
   calcIndividualSummary: jest.fn(),
}));

describe('servPropertyVerification', () => {
   describe('getPropertyFormat service', () => {
      let serviceMock;

      beforeEach(() => {
         serviceMock = {
            status: 200,
            data: {
               propertiesFormat: { verificationDate: '2023-12-28T15:41:12' },
               resumeGeneral: {
                  resume:
                     '{"inmueblesApplicant": {"verify": {"valor": 0,"numero": 0},"pending": {"valor": 0,"numero": 0}}}',
               },
               applicant: { resumeInd: { resume: '{"libres":{"valor":0, "numero": 0}}' } },
               obligedList: [
                  { idClient: '100', resumeInd: { resume: '{"libres":{"valor":1, "numero": 1}}' } },
                  { idClient: '101', resumeInd: { resume: '{"libres":{"valor":2, "numero": 2}}' } },
               ],
            },
         };

         genericFetch.mockImplementation(async () => serviceMock);
         calcGlobalSummary.mockImplementation((a) => a);
      });

      test('when fetch response status is different than 200 it returns the plain response', async () => {
         serviceMock = { status: 500, error: 'Test Error Message' };

         const result = await getPropertyFormat(1);
         expect(result).toEqual(serviceMock);
      });

      test('it formats propertiesFormat verification date when it is defined', async () => {
         const result = await getPropertyFormat(1);
         expect(result.data.propertiesFormat.modifyDate).toBe('28-12-2023');
      });

      test('when verification date is not defined it is set as the current date', async () => {
         serviceMock.data.propertiesFormat.verificationDate = null;

         const result = await getPropertyFormat(1);
         expect(result.data.propertiesFormat.modifyDate).toBeDefined();
      });

      test('when individual resume is not defined it is set to the default value', async () => {
         serviceMock.data.applicant.resumeInd.resume = null;

         const result = await getPropertyFormat(1);
         expect(result.data.applicant.resumeInd.resume).toEqual({
            libres: {
               valor: 0,
               numero: 0,
            },
            gravados: {
               valor: 0,
               numero: 0,
            },
            inmuebles: {
               valor: 0,
               numero: 0,
            },
            embargados: {
               valor: 0,
               numero: 0,
            },
            pendientes: {
               valor: 0,
               numero: 0,
            },
            escrituracion: {
               valor: 0,
               numero: 0,
            },
         });
      });

      test('when individual resume is defined it is parsed from a string to an object', async () => {
         const result = await getPropertyFormat(1);
         expect(result.data.applicant.resumeInd.resume).toEqual({ libres: { valor: 0, numero: 0 } });
      });

      test('when general summary is not defined it is set to the default value', async () => {
         serviceMock.data.resumeGeneral.resume = null;

         const result = await getPropertyFormat(1);
         expect(result.data.resumeGeneral.resume).toEqual({
            inmueblesApplicant: {
               verify: {
                  valor: 0,
                  numero: 0,
               },
               pending: {
                  valor: 0,
                  numero: 0,
               },
            },
            inmueblesObligated: {
               verify: {
                  valor: 0,
                  numero: 0,
               },
               pending: {
                  valor: 0,
                  numero: 0,
               },
            },
            copropiedadWithOS: {
               valor: 0,
               numero: 0,
            },
            copropiedadOthers: {
               valor: 0,
               numero: 0,
            },
            embargados: {
               valor: 0,
               numero: 0,
            },
            escrituracion: {
               valor: 0,
               numero: 0,
            },
            gravados: {
               valor: 0,
               numero: 0,
            },
            libres: {
               valor: 0,
               numero: 0,
            },
            pendientes: {
               verify: {
                  valor: 0,
                  numero: 0,
               },
               pending: {
                  valor: 0,
                  numero: 0,
               },
            },
         });
      });

      test('when general summary is defined it is parsed from a string to an object', async () => {
         const result = await getPropertyFormat(1);
         expect(result.data.resumeGeneral.resume).toEqual({
            inmueblesApplicant: {
               verify: {
                  valor: 0,
                  numero: 0,
               },
               pending: {
                  valor: 0,
                  numero: 0,
               },
            },
         });
      });

      test('when resume of obliged is empty it is retrieved from the local storage', async () => {
         serviceMock.data.obligedList[0].resumeInd.resume = null;
         serviceMock.data.obligedList[1].resumeInd.resume = null;

         const result = await getPropertyFormat(1);
         expect(result.data.obligedList[0].resumeInd.resume).toEqual({
            libres: {
               valor: 0,
               numero: 0,
            },
            gravados: {
               valor: 0,
               numero: 0,
            },
            inmuebles: {
               valor: 0,
               numero: 0,
            },
            embargados: {
               valor: 0,
               numero: 0,
            },
            pendientes: {
               valor: 0,
               numero: 0,
            },
            escrituracion: {
               valor: 0,
               numero: 0,
            },
         });
         expect(result.data.obligedList[1].resumeInd.resume).toEqual({
            libres: {
               valor: 0,
               numero: 0,
            },
            gravados: {
               valor: 0,
               numero: 0,
            },
            inmuebles: {
               valor: 0,
               numero: 0,
            },
            embargados: {
               valor: 0,
               numero: 0,
            },
            pendientes: {
               valor: 0,
               numero: 0,
            },
            escrituracion: {
               valor: 0,
               numero: 0,
            },
         });
      });

      test('when resume of obliged is not empty it is parsed from string to an object', async () => {
         const result = await getPropertyFormat(1);
         expect(result.data.obligedList[0].resumeInd.resume).toEqual({ libres: { valor: 1, numero: 1 } });
         expect(result.data.obligedList[1].resumeInd.resume).toEqual({ libres: { valor: 2, numero: 2 } });
      });

      test('when fetch function throws an error it returns an object with the error message', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await getPropertyFormat(1);
         expect(result).toEqual({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('savePropertyFormat service', () => {
      let data;

      beforeEach(() => {
         data = {
            applicant: {
               properties: [{}],
               resumeInd: {
                  resume: {
                     libres: {
                        valor: 0,
                        numero: 0,
                     },
                  },
               },
            },
            obligedList: [],
            propertiesFormat: {},
         };

         genericFetch.mockImplementation(async () => ({}));
      });

      test('it transform applicant resume object to string before sending the request', async () => {
         await savePropertyFormat(data, 3);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.applicant.resumeInd.resume).toBe(
            JSON.stringify({
               libres: {
                  valor: 0,
                  numero: 0,
               },
            })
         );
      });

      test('when applicant properties is empty it deletes applicant object before sending the request', async () => {
         data.applicant.properties = [];

         await savePropertyFormat(data, 3);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.applicant).toBeUndefined();
      });

      test('it transform obliged list resume object to string before sending the request', async () => {
         data.obligedList = [
            {
               properties: [{}],
               resumeInd: {
                  resume: {
                     libres: {
                        valor: 0,
                        numero: 0,
                     },
                  },
               },
            },
            {
               properties: [{}],
               resumeInd: {
                  resume: {
                     libres: {
                        valor: 1,
                        numero: 1,
                     },
                  },
               },
            },
         ];

         await savePropertyFormat(data, 3);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.obligedList[0].resumeInd.resume).toBe(
            JSON.stringify({
               libres: {
                  valor: 0,
                  numero: 0,
               },
            })
         );
         expect(sentData.obligedList[1].resumeInd.resume).toBe(
            JSON.stringify({
               libres: {
                  valor: 1,
                  numero: 1,
               },
            })
         );
      });

      test('when isFreeze parameter is true it sets idCatStatus of propertiesFormat to freeze state', async () => {
         await savePropertyFormat(data, 3, true);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.propertiesFormat.idCatStatus).toBe(25);
      });

      test('when isFreeze is false and unique folio of propertiesFormat is defined it sets idCatStatus as finalized status', async () => {
         data.propertiesFormat.uniqueFolio = '123';
         await savePropertyFormat(data, 3);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.propertiesFormat.idCatStatus).toBe(18);
      });

      test('when isFreeze is false and unique folio of propertiesFormat is not defined it sets idCatStatus as incomplete status', async () => {
         await savePropertyFormat(data, 3);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.propertiesFormat.idCatStatus).toBe(17);
      });

      test('when profile is 1 it validates if properties have been verified and sets disable verification to true', async () => {
         data.applicant.properties = [{ idCheckOwnership: 1, validation: true }];
         await savePropertyFormat(data, 1);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.propertiesFormat.disableVerification).toBe(true);
      });

      test('when profile is 1 and there are no properties with idCheckOwnership it sets disable verification to false', async () => {
         data.applicant.properties = [{ idCheckOwnership: null, validation: true }];
         await savePropertyFormat(data, 1);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.propertiesFormat.disableVerification).toBeUndefined();
      });

      test('when fetch function throws an error it returns an object with the error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await savePropertyFormat(data, 3);
         expect(result).toEqual({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('saveVerification service', () => {
      test('when fetch response status is different than 200 it returns an object with an error', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500, error: 'Test Error Message' }));

         const result = await saveVerification({});
         expect(result).toEqual({ status: 500, error: 'Test Error Message' });
      });

      test('when response status is 200 it returns the response object', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 200, data: { test: 'test' } }));

         const result = await saveVerification({});
         expect(result).toEqual({ status: 200, data: { test: 'test' } });
      });

      test('when fetch function throws an error it returns an object with the error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await saveVerification({});
         expect(result).toEqual({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('savePropertyAfterVerification service', () => {
      let data;
      let propertyInfo;

      beforeEach(() => {
         data = { catTypePerson: 1, idx: 0, idClient: '11' };
         propertyInfo = {
            applicant: { properties: [{}], resumeInd: { idResume: 1 } },
            obligedList: [
               { idClient: '10', properties: [{}], resumeInd: { idResume: 2 } },
               { idClient: '11', properties: [{}], resumeInd: { idResume: 3 } },
            ],
            propertiesFormat: {},
         };

         genericFetch.mockImplementation(async () => ({ status: 200, data: {} }));
         calcGlobalSummary.mockImplementation((a) => a);
         calcIndividualSummary.mockImplementation((a) => a);
      });

      test('when data person type is applicant it calculates individual summary with applicant data', async () => {
         await savePropertyAfterVerification(data, propertyInfo);

         const resumeInd = calcIndividualSummary.mock.calls[0][1];
         expect(resumeInd.idResume).toBe(1);
      });

      test('when data person type is not applicant it calculates individual summary with obliged data', async () => {
         data.catTypePerson = 2;

         await savePropertyAfterVerification(data, propertyInfo);

         const resumeInd = calcIndividualSummary.mock.calls[0][1];
         expect(resumeInd.idResume).toBe(3);
      });

      test('when calcIndividualSummary throws an error it returns an object with an error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         calcIndividualSummary.mockImplementationOnce(() => {
            throw new Error('Test Error Message');
         });

         const result = await savePropertyAfterVerification(data, propertyInfo);
         expect(result).toEqual({ status: 500, error: new Error('Test Error Message') });
      });
   });
});
