import { genericFetch, useGlobalContext } from '../../hooks';
import {
   downloadCoverStudio,
   getEmpoweredInformation,
   postSaveAuthorization,
   validateAuthorizationForRequest,
} from '../../services';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn(), useGlobalContext: jest.fn() }));

describe('servEmpowered', () => {
   describe('getEmpoweredInformation service', () => {
      let serviceMock;

      beforeEach(() => {
         useGlobalContext.mockReturnValue({
            user: { userAD: 'testUser', idProfile: 6 },
         });
         serviceMock = {
            status: 200,
            data: {
               idGroup: 10,
               idCatStatus: 26,
               groupName: 'TOYOTA',
               branchOffice: 'MONTERREY',
               requests: [
                  {
                     idRequest: 12,
                     idCatStatus: 26,
                     fullName: 'PHITEN MEXICO S.A. DE C.V.',
                     idCatTypePerson: 1,
                     personType: 'PM',
                     idClient: '121400',
                     authorizationsFaculty: [],
                     resolutionByCredit: 'PENDING',
                     resolutionByCommercial: 'PENDING',
                     lastRejection: false,
                  },
                  {
                     idRequest: 13,
                     idCatStatus: 26,
                     fullName: 'RELEVANCIA MOTRIZ S.A. DE C.V.',
                     idCatTypePerson: 1,
                     personType: 'PM',
                     idClient: '3433700',
                     authorizationsFaculty: [],
                     resolutionByCredit: 'PENDING',
                     resolutionByCommercial: 'PENDING',
                     lastRejection: false,
                  },
               ],
            },
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it calls genericFetch with idRequest, userAD and profile values', async () => {
         await getEmpoweredInformation(10, 'testUser', 'FC');

         expect(genericFetch.mock.calls[0][0].url).toBe(
            '/credit/getResolution?idGroup=10&username=testUser&profile=FC'
         );
      });

      test('when fetch service response status is different than 200 it returns an empty object', async () => {
         serviceMock.status = 500;
         serviceMock.data = { errors: ['Test Error Message'] };

         const result = await getEmpoweredInformation(10, 'testUser', 'FC');
         expect(result).toEqual([]);
      });

      test('when fetch service response status 200 it saves id group and first requests in local storage', async () => {
         await getEmpoweredInformation(10, 'testUser', 'FC');

         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT')).idGroup).toBe(10);
         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT')).idRequest).toBe(12);
      });

      test('when the service responds with a status 500, the local storage is removed and returns null', async () => {
         serviceMock.status = 500;
         serviceMock.data = { errors: ['Test Error Message'] };

         await getEmpoweredInformation(10, 'testUser', 'FC');
         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'))).toBe(null);
      });
   });

   describe('postSaveAuthorization service', () => {
      let serviceMock;
      let dataAutorizations;

      beforeEach(() => {
         serviceMock = {
            status: 200,
            data: {
               userAD: 'testUser',
               signatureDate: '2025-03-27T03:22:58.300660411',
               typeFaculty: 'CREDITO',
               decisionFaculty: 'YES',
               fullName: '',
            },
         };
         dataAutorizations = [
            {
               userAD: 'testUser1',
               signatureDate: '2025-03-06T10:29:36',
               typeFaculty: 'CREDITO',
               decisionFaculty: 'YES',
               fullName: 'USUARIO DE PRUEBA1',
            },
            {
               userAD: 'testUser2',
               signatureDate: '2025-03-06T10:29:36',
               typeFaculty: 'COMERCIAL',
               decisionFaculty: 'YES',
               fullName: 'USUARIO DE PRUEBA2',
            },
         ];

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('when fetch response status is different than 200 it returns false', async () => {
         genericFetch.mockImplementationOnce(async () => ({
            status: 500,
            error: { traceId: '', response: { message: 'An error has occurred, please try again later.' } },
         }));

         const result = await postSaveAuthorization(12, 'mreyesg', 'YES');
         expect(result).toEqual(false);
      });

      test('If there are two authorization signatures on the request, it should return true', async () => {
         const result = await postSaveAuthorization(12, 'mreyesg', 'YES');
         expect(result).toEqual(true);
      });

      test('', () => {
         const result = validateAuthorizationForRequest(dataAutorizations, 'testUser', 'COMERCIAL');
         expect(result).toEqual(true);
      });

      test('If there are no authorization signatures of the specified faculty type, it should return false', () => {
         dataAutorizations = [
            {
               userAD: 'testUser1',
               signatureDate: '2025-03-06T10:29:36',
               typeFaculty: 'COMERCIAL',
               decisionFaculty: 'YES',
               fullName: 'USUARIO DE PRUEBA1',
            },
         ];
         const result = validateAuthorizationForRequest(dataAutorizations, 'testUser', 'CREDITO');
         expect(result).toEqual(false);
      });
   });

   describe('downloadCoverStudio service', () => {
      let serviceMock;

      beforeEach(() => {
         serviceMock = {
            url: 'https://docs.google.com/document/d/1Afdb5Svz0y8devIYeASOpGOdPWm8CCK9-ha8xdJXOx8/edit?usp=drive_link',
            error: '',
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('when fetch response status is different than 200 it returns the url empty and error message', async () => {
         genericFetch.mockImplementationOnce(async () => ({
            url: '',
            error: 'For input string: "null"',
         }));

         const result = await downloadCoverStudio(12, '121400', 'PDF_COVER_ONLY');
         expect(result).toEqual({
            url: '',
            error: 'For input string: "null"',
         });
      });

      test('when response status is 200 it returns url document and error message empty ', async () => {
         const result = await downloadCoverStudio(12, '121400', 'PDF_COVER_ONLY');
         expect(result).toEqual({
            url: 'https://docs.google.com/document/d/1Afdb5Svz0y8devIYeASOpGOdPWm8CCK9-ha8xdJXOx8/edit?usp=drive_link',
            error: '',
         });
      });
   });
});
