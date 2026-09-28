import Swal from 'sweetalert2';

import { getInfoSolidary, patchRequestAndApplicants, validateAmount } from '../../services/servSolidary';
import { genericFetch } from '../../hooks';
import { constTypePerson, constPageProcessType } from '../../helpers/config';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const person = (idClient, idCatTypePerson = constTypePerson.APPLICANT) => ({ idClient, idCatTypePerson });

const buildGroup = (overrides = {}) => ({
   idGroup: 5,
   idCatStatus: 3,
   idCatTypeProcedure: constPageProcessType.GET_CHECKLIST,
   requestResponseList: [
      { idRequest: 1, requestAmount: 1000, kindProcedure: 'Nuevo', relatedPersonResponseList: [person(10)] },
      { idRequest: 2, requestAmount: 500, kindProcedure: 'Incremento', relatedPersonResponseList: [person(20)] },
   ],
   ...overrides,
});

const credit = (overrides = {}) => ({
   idClient: 10,
   typeActiveProduct: 'LCD',
   authorizedAmount: '800',
   inEffect: true,
   ...overrides,
});

// Enruta la petición del grupo (genericQL) y la del historial de créditos (Isiloans).
const mockBackend = ({ group = buildGroup(), groupResponse, history }) => {
   genericFetch.mockImplementation(async ({ url }) => {
      if (url === '/credit/genericQL') {
         return groupResponse ?? { status: 200, data: { data: { getGroup: group } } };
      }
      return history;
   });
};

describe('servSolidary', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   afterEach(() => {
      process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'false';
      genericFetch.mockReset();
   });

   describe('getInfoSolidary', () => {
      test('requests the group by id through the GraphQL endpoint', async () => {
         mockBackend({});

         await getInfoSolidary(5);

         expect(genericFetch).toHaveBeenCalledTimes(1);
         const { url, method, data } = genericFetch.mock.calls[0][0];
         expect(url).toBe('/credit/genericQL');
         expect(method).toBe('post');
         expect(JSON.parse(data).variables).toEqual({ idGroup: 5 });
      });

      test('returns the applicants validated, the total and the group data when Isiloans is disabled', async () => {
         mockBackend({});

         const result = await getInfoSolidary(5);

         expect(result.status).toBe(200);
         expect(result.data).toMatchObject({
            idGroup: 5,
            idCatStatus: 3,
            total: 1500,
            credits: { applicantNotParticipateInRequest: [], creditTotalAmount: 0 },
         });
         expect(result.data.applicants.map((a) => a.validate)).toEqual([
            { valid: true, procedure: 'Nuevo' },
            { valid: true, procedure: 'Incremento' },
         ]);
      });

      test('caches the parsed information in localStorage', async () => {
         mockBackend({});

         const result = await getInfoSolidary(5);

         expect(JSON.parse(localStorage.getItem('Solidary_Page'))).toEqual(result.data);
      });

      test('shows the error dialog and returns the response when the group cannot be loaded', async () => {
         mockBackend({ groupResponse: { status: 404, error: 'Not found' } });

         const result = await getInfoSolidary(5);

         expect(result).toEqual({ status: 404, data: 'Not found' });
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Recurso o información no encontrado') })
         );
      });

      describe('with Isiloans enabled', () => {
         beforeEach(() => {
            process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'true';
         });

         test('requests the credit history of the first client of the group', async () => {
            mockBackend({ history: { status: 200, data: { applicant: [], economicGroup: [] } } });

            await getInfoSolidary(5);

            expect(genericFetch).toHaveBeenLastCalledWith({
               url: '/credit/getHistoryCreditClient/10?typeCreditEnum=ALL',
               method: 'get',
            });
         });

         test('marks the applicant with an active LCD credit and keeps its old amount', async () => {
            mockBackend({
               history: { status: 200, data: { applicant: [credit()], economicGroup: [] } },
            });

            const { data } = await getInfoSolidary(5);

            expect(data.applicants[0]).toMatchObject({ activeCredit: true, oldAmount: '800', requestAmount: 1000 });
            expect(data.applicants[1].activeCredit).toBeUndefined();
         });

         test('replaces the request amount with the authorized amount when the obligated are being saved', async () => {
            mockBackend({
               group: buildGroup({ idCatTypeProcedure: constPageProcessType.SAVE_OBLIGED }),
               history: { status: 200, data: { applicant: [credit()], economicGroup: [] } },
            });

            const { data } = await getInfoSolidary(5);

            expect(data.applicants[0].requestAmount).toBe('800');
            expect(data.total).toBe(1300);
         });

         test('adds the amount of the credits in effect from clients outside the request', async () => {
            mockBackend({
               history: {
                  status: 200,
                  data: {
                     applicant: [credit({ idClient: 77, authorizedAmount: '300' })],
                     economicGroup: [
                        credit({ idClient: 88, authorizedAmount: '200' }),
                        credit({ idClient: 99, authorizedAmount: '999', inEffect: false }),
                        credit({ idClient: 66, authorizedAmount: 'abc' }),
                     ],
                  },
               },
            });

            const { data } = await getInfoSolidary(5);

            expect(data.credits.creditTotalAmount).toBe(500);
            expect(data.credits.applicantNotParticipateInRequest.map((c) => c.idClient)).toEqual([77, 88, 66]);
         });

         test('ignores credits that are not LCD', async () => {
            mockBackend({
               history: {
                  status: 200,
                  data: {
                     applicant: [credit({ typeActiveProduct: 'OTHER' })],
                     economicGroup: [credit({ idClient: 77, typeActiveProduct: 'OTHER' })],
                  },
               },
            });

            const { data } = await getInfoSolidary(5);

            expect(data.applicants[0].activeCredit).toBeUndefined();
            expect(data.credits).toEqual({ applicantNotParticipateInRequest: [], creditTotalAmount: 0 });
         });

         test('does not match a credit whose client participates in the request as something other than applicant', async () => {
            mockBackend({
               group: buildGroup({
                  requestResponseList: [
                     {
                        idRequest: 1,
                        requestAmount: 1000,
                        kindProcedure: 'Nuevo',
                        relatedPersonResponseList: [person(10, constTypePerson.SOLIDARY_OBLIGED)],
                     },
                  ],
               }),
               history: { status: 200, data: { applicant: [credit()], economicGroup: [] } },
            });

            const { data } = await getInfoSolidary(5);

            expect(data.applicants[0].activeCredit).toBeUndefined();
            expect(data.credits.creditTotalAmount).toBe(800);
         });

         test('continues without credits when the history answers with a status other than 200 or 500', async () => {
            mockBackend({ history: { status: 404, error: 'Not found' } });

            const result = await getInfoSolidary(5);

            expect(result.status).toBe(200);
            expect(result.data.credits).toEqual({ applicantNotParticipateInRequest: [], creditTotalAmount: 0 });
            expect(Swal.fire).not.toHaveBeenCalled();
         });

         test.each([
            ['the message of the service', { response: { message: 'Isiloans caído' } }, 'Isiloans caído'],
            ['a default title', undefined, 'Intermitencia en el servicio'],
         ])(
            'warns the user with %s and returns nothing when the history fails with 500',
            async (_label, error, title) => {
               mockBackend({ history: { status: 500, error } });

               const result = await getInfoSolidary(5);

               expect(result).toBeUndefined();
               expect(localStorage.getItem('Solidary_Page')).toBeNull();
               expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title, icon: 'warning' }));
            }
         );
      });

      test('returns a 500 object with the error when the group data cannot be parsed', async () => {
         process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'true';
         mockBackend({
            group: buildGroup({ requestResponseList: [{ idRequest: 1, requestAmount: 1 }] }),
            history: { status: 200, data: { applicant: [credit({ idClient: 10 })], economicGroup: [] } },
         });

         const result = await getInfoSolidary(5);

         expect(result.status).toBe(500);
         expect(result.error.message).toBe('Error al realizar el parseo de la información');
      });
   });

   describe('patchRequestAndApplicants', () => {
      const applicants = [
         { idRequest: 1, requestAmount: 1000, kindProcedure: 'Nuevo', ignored: 'x' },
         { idRequest: 2, requestAmount: 500, kindProcedure: 'Incremento' },
      ];
      const group = { idGroup: 5, idCatStatus: 3, idCatTypeProcedure: constPageProcessType.SAVE_OBLIGED };

      test('updates the group first and then every request with the checklist procedure', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 }).mockResolvedValueOnce({ status: 204 });

         const result = await patchRequestAndApplicants(applicants, group, 'analyst');

         expect(genericFetch).toHaveBeenCalledTimes(2);
         expect(genericFetch).toHaveBeenNthCalledWith(1, {
            url: '/credit/Global/updateEntity?entityEnum=GROUP',
            method: 'patch',
            data: JSON.stringify({
               groupRequest: {
                  ...group,
                  idCatTypeProcedure: constPageProcessType.GET_CHECKLIST,
                  userModify: 'analyst',
               },
            }),
         });
         expect(genericFetch).toHaveBeenNthCalledWith(2, {
            url: '/credit/Global/updateEntity?entityEnum=REQUEST',
            method: 'patch',
            data: JSON.stringify({
               request: [
                  {
                     idRequest: 1,
                     requestAmount: 1000,
                     kindProcedure: 'Nuevo',
                     userModify: 'analyst',
                     idCatTypeProcedure: constPageProcessType.GET_CHECKLIST,
                     idCatStatus: 3,
                  },
                  {
                     idRequest: 2,
                     requestAmount: 500,
                     kindProcedure: 'Incremento',
                     userModify: 'analyst',
                     idCatTypeProcedure: constPageProcessType.GET_CHECKLIST,
                     idCatStatus: 3,
                  },
               ],
            }),
         });
         expect(result).toEqual({ status: 204 });
      });

      test('stops and returns the response when the group update is not 204', async () => {
         genericFetch.mockResolvedValueOnce({ status: 409, error: 'Conflict' });

         const result = await patchRequestAndApplicants(applicants, group, 'analyst');

         expect(result).toEqual({ status: 409, error: 'Conflict' });
         expect(genericFetch).toHaveBeenCalledTimes(1);
      });

      test('stops and returns a 500 object with the info when the group update rejects', async () => {
         const info = new Error('Network down');
         genericFetch.mockRejectedValueOnce(info);

         const result = await patchRequestAndApplicants(applicants, group, 'analyst');

         expect(result).toEqual({ status: 500, info });
         expect(genericFetch).toHaveBeenCalledTimes(1);
      });

      test('returns the response of the requests update even when it fails', async () => {
         genericFetch
            .mockResolvedValueOnce({ status: 204 })
            .mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         await expect(patchRequestAndApplicants(applicants, group, 'analyst')).resolves.toEqual({
            status: 400,
            error: 'Bad request',
         });
      });

      test('returns a 500 object with the error when the applicants are not a list', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await patchRequestAndApplicants(undefined, group, 'analyst');

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
      });
   });

   describe('validateAmount', () => {
      const item = { requestAmount: 700, oldAmount: 500 };

      test.each([
         ['requestAmount above the limit', ['requestAmount', 1500, 'Incremento', 1000, item], false, ''],
         [
            'requestAmount equal to the limit is not above it, but is not below it either',
            ['requestAmount', 1000, '', 1000, item],
            false,
            '',
         ],
         ['requestAmount below the limit with no procedure', ['requestAmount', 900, '', 1000, item], true, ''],
         [
            'requestAmount above the old amount as an increase',
            ['requestAmount', 900, 'Incremento', 1000, item],
            true,
            'Incremento',
         ],
         [
            'requestAmount not above the old amount as an increase',
            ['requestAmount', 500, 'Incremento', 1000, item],
            false,
            'Incremento',
         ],
         [
            'requestAmount below the old amount as a decrease',
            ['requestAmount', 300, 'Decremento', 1000, item],
            true,
            'Decremento',
         ],
         [
            'requestAmount not below the old amount as a decrease',
            ['requestAmount', 500, 'Decremento', 1000, item],
            false,
            'Decremento',
         ],
         [
            'the procedure changed to increase using the amount of the item',
            ['kindProcedure', 'Incremento', undefined, 1000, item],
            true,
            'Incremento',
         ],
         [
            'the procedure changed to decrease using the amount of the item',
            ['kindProcedure', 'Decremento', undefined, 1000, item],
            false,
            'Decremento',
         ],
         [
            'the procedure changed to another value with the item amount below the limit',
            ['kindProcedure', 'Nuevo', undefined, 1000, item],
            true,
            '',
         ],
         [
            'the item amount above the limit when the procedure changes',
            ['kindProcedure', 'Incremento', undefined, 600, item],
            false,
            '',
         ],
      ])('with %s', (_label, args, valid, procedure) => {
         expect(validateAmount(...args)).toEqual({ valid, procedure });
      });

      test('treats a missing item as an amount that is not above the limit', () => {
         expect(validateAmount('kindProcedure', 'Incremento', undefined, 1000, undefined)).toEqual({
            valid: false,
            procedure: 'Incremento',
         });
      });
   });
});
