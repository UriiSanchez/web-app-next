import { patchRequestAndApplicants, getInfoSolidary } from '../../services/servSolidary';

import { getCreditHistory } from '../../services/servGeneralInfomation';
import { genericFetch } from '../../hooks';

jest.mock('../../services/servGeneralInfomation', () => ({ __esModule: true, getCreditHistory: jest.fn() }));
jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servSolidary', () => {
   describe('patchRequestAndApplicants service', () => {
      let serviceMock;
      let applicants;
      let group;

      beforeEach(() => {
         serviceMock = { status: 204 };
         applicants = [
            { idRequest: 1, requestAmount: '200', kindProcedure: 'Nuevo Tramite' },
            { idRequest: 2, requestAmount: '300', kindProcedure: 'Nuevo Tramite' },
         ];
         group = { idCatStatus: 10 };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('when updating group returns an status different than 204 it returns before updating the list of applicants', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500 }));

         await patchRequestAndApplicants(applicants, group, 'testuser');

         expect(genericFetch.mock.calls.length).toBe(1);
      });

      test('it sends an update for group and applicants', async () => {
         await patchRequestAndApplicants(applicants, group, 'testuser');

         expect(genericFetch.mock.calls.length).toBe(2);
      });

      test('when applicants parameter is null it returns an object with undefined error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});

         const result = await patchRequestAndApplicants(null, group, 'testuser');
         expect(result).toEqual({
            status: 500,
            error: new TypeError("Cannot read properties of null (reading 'map')"),
         });
      });
   });

   describe('getInfoSolidary service', () => {
      let serviceMock;
      let getCreditMock;

      beforeEach(() => {
         serviceMock = {
            status: 200,
            data: {
               data: {
                  getGroup: {
                     requestResponseList: [{ relatedPersonResponseList: [{ idClient: '10', idRequest: 1 }] }],
                     idCatStatus: 1,
                     idCatTypeProcedure: 2,
                  },
               },
            },
         };
         getCreditMock = {
            status: 200,
            data: {
               applicant: [{ idClient: '10', typeActiveProduct: 'LCD', authorizedAmount: '100', inEffect: true }],
               economicGroup: [{ idClient: '11', typeActiveProduct: 'LCD', authorizedAmount: '150', inEffect: true }],
            },
         };

         genericFetch.mockImplementation(async () => serviceMock);
         getCreditHistory.mockImplementation(async () => getCreditMock);
      });

      // test('when getting credit history returns status 500 it calls sweetNormal function', async () => {
      //    getCreditHistory.mockImplementationOnce(async () => ({
      //       status: 500,
      //       error: { response: { message: 'Test Error Message' } },
      //    }));
      //
      //    await getInfoSolidary(1);
      //
      //    expect(sweetNormal).toHaveBeenCalledWith({
      //       title: 'Test Error Message',
      //       txt: `<p class='text-sm'>Esto puede ser por alguna intermitencia, sin embargo es posible continuar con el proceso, puedes intentar más tarde o contacte al equipo de soporte</p>`,
      //       icon: 'warning',
      //    });
      // });

      test('when credit history is null it returns empty values for credits object', async () => {
         getCreditHistory.mockImplementationOnce(async () => ({ status: 200, data: null }));

         const result = await getInfoSolidary(1);
         expect(result.data.credits).toEqual({ applicantNotParticipateInRequest: [], creditTotalAmount: 0 });
      });

      test('it calculates credits values from the credit history result', async () => {
         const result = await getInfoSolidary(1);
         expect(result.data.credits).toEqual({
            applicantNotParticipateInRequest: [],
            creditTotalAmount: 0,
         });
      });
   });
});
