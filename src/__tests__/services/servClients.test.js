import Swal from 'sweetalert2';

import {
   getRequestsByParam,
   getClientsById,
   getClientsByName,
   getInfoClient,
   getAllEconomicGroup,
} from '../../services/servClients';
import { genericFetch } from '../../hooks';
import { constTypePerson, EnumStatus } from '../../helpers/config';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const IN_PROCESS = 4;
const FINISHED = EnumStatus.SOLICITUD_AUTORIZADA;

const request = (overrides = {}) => ({
   idRequest: 1,
   status: 'En análisis',
   idStatus: IN_PROCESS,
   group: 'Group A',
   createUser: 'analyst',
   idCatTypeProcedure: 3,
   ...overrides,
});

const nameResponse = (responses) => ({
   status: 200,
   data: { data: { getClientByNamePaged: { responses } } },
});

const dialogWith = (text) => expect.objectContaining({ html: expect.stringContaining(text) });

describe('servClients', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   describe('getRequestsByParam', () => {
      describe('when searching forNumber', () => {
         const client = (overrides = {}) => ({
            status: 200,
            data: { idClient: 5, personType: 'PM', name: 'Client SA', requests: [request()], ...overrides },
         });

         test('requests the client by the given params', async () => {
            genericFetch.mockResolvedValueOnce(client());

            await getRequestsByParam('forNumber', 'idClient=5');

            expect(genericFetch).toHaveBeenCalledWith({ url: '/credit/getClientById?idClient=5', method: 'get' });
         });

         test('shows the error dialog and returns the response when the status is not 200', async () => {
            genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

            const result = await getRequestsByParam('forNumber', 'idClient=5');

            expect(result).toEqual({ status: 404, error: 'Not found' });
            expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Recurso o información no encontrado'));
         });

         test('returns PF as the requests when the client is a natural person', async () => {
            genericFetch.mockResolvedValueOnce(client({ personType: 'PF' }));

            await expect(getRequestsByParam('forNumber', 'idClient=5')).resolves.toEqual({
               status: 200,
               requests: 'PF',
            });
         });

         test.each([
            ['an empty list', []],
            ['no requests', undefined],
         ])('returns the client as "Sin Solicitud" when it has %s', async (_label, requests) => {
            genericFetch.mockResolvedValueOnce(client({ requests }));

            const result = await getRequestsByParam('forNumber', 'idClient=5');

            expect(result).toEqual({
               status: 200,
               requests: [
                  {
                     idClient: 5,
                     personType: 'PM',
                     name: 'Client SA',
                     fullName: 'Client SA',
                     requests,
                     statusRequest: 'Sin Solicitud',
                     isVisible: true,
                  },
               ],
            });
         });

         test('returns one row per request with the client info and no extra row when one is in process', async () => {
            genericFetch.mockResolvedValueOnce(
               client({
                  businessName: 'Client Business',
                  requests: [
                     request({ idRequest: 1, idStatus: IN_PROCESS, status: 'En análisis' }),
                     request({ idRequest: 2, idStatus: FINISHED, status: 'Autorizada', group: 'Group B' }),
                  ],
               })
            );

            const { status, requests } = await getRequestsByParam('forNumber', 'idClient=5');

            expect(status).toBe(200);
            expect(requests).toHaveLength(2);
            expect(requests[0]).toEqual({
               idClient: 5,
               personType: 'PM',
               name: 'Client SA',
               fullName: 'Client Business',
               businessName: 'Client Business',
               catStatus: 'En análisis',
               createUser: 'analyst',
               idCatStatus: IN_PROCESS,
               idGroup: 'Group A',
               idRequest: 1,
               isVisible: true,
               idCatTypeProcedure: 3,
               statusRequest: 'En análisis',
            });
            expect(requests[1]).toMatchObject({ idRequest: 2, idGroup: 'Group B', statusRequest: 'Autorizada' });
         });

         test('adds a "Sin Solicitud" row when all the requests are finished', async () => {
            genericFetch.mockResolvedValueOnce(
               client({ requests: [request({ idStatus: FINISHED }), request({ idRequest: 2, idStatus: 24 })] })
            );

            const { requests } = await getRequestsByParam('forNumber', 'idClient=5');

            expect(requests).toHaveLength(3);
            expect(requests[2]).toEqual({
               idClient: 5,
               personType: 'PM',
               name: 'Client SA',
               fullName: 'Client SA',
               statusRequest: 'Sin Solicitud',
               isVisible: true,
            });
         });

         test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
            const error = new Error('Network down');
            genericFetch.mockRejectedValueOnce(error);

            const result = await getRequestsByParam('forNumber', 'idClient=5');

            expect(result).toEqual({ status: 500, requests: null, error });
            expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Error interno del servidor'));
         });
      });

      describe.each([
         [
            'forGroup',
            { url: '/credit/getClientByEconomicGroup?groupName=Group%20A', method: 'get' },
            (people) => ({ status: 200, data: people }),
         ],
         ['forName', undefined, nameResponse],
      ])('when searching %s', (type, expectedFetch, respondWith) => {
         const param = 'Group%20A';

         test('requests the clients through the matching endpoint', async () => {
            genericFetch.mockResolvedValueOnce(respondWith([]));

            await getRequestsByParam(type, param);

            const call = genericFetch.mock.calls[0][0];
            if (expectedFetch) {
               expect(call).toEqual(expectedFetch);
            } else {
               expect(call.url).toBe('/credit/genericQL');
               expect(call.method).toBe('post');
               expect(JSON.parse(call.data).query).toContain(`getClientByNamePaged(name: "${param}"`);
            }
         });

         test('shows the error dialog and returns the response when the status is not 200', async () => {
            genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

            const result = await getRequestsByParam(type, param);

            expect(result.status).toBe(404);
            expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Recurso o información no encontrado'));
         });

         test('leaves out the natural persons', async () => {
            genericFetch.mockResolvedValueOnce(
               respondWith([
                  { idClient: '1', personType: 'PF', name: 'Natural' },
                  { idClient: '2', personType: 'PM', name: 'Legal' },
               ])
            );

            const { requests } = await getRequestsByParam(type, param);

            expect(requests.map((r) => r.name)).toEqual(['Legal']);
         });

         test.each([
            ['the business name when it has one', { businessName: 'Business SA', name: 'Name' }, 'Business SA'],
            ['the name when it has no business name', { name: 'Name' }, 'Name'],
         ])('lists a client without requests as "Sin Solicitud" using %s', async (_label, names, fullName) => {
            genericFetch.mockResolvedValueOnce(respondWith([{ idClient: '7', personType: 'PM', ...names }]));

            const { status, requests } = await getRequestsByParam(type, param);

            expect(status).toBe(200);
            expect(requests).toEqual([
               {
                  idClient: 7,
                  personType: 'PM',
                  ...names,
                  fullName,
                  statusRequest: 'Sin Solicitud',
                  isVisible: true,
               },
            ]);
         });

         test('lists one row per request and no extra row when one is in process', async () => {
            genericFetch.mockResolvedValueOnce(
               respondWith([
                  {
                     idClient: '7',
                     personType: 'PM',
                     name: 'Legal',
                     requests: [request({ idRequest: 1 }), request({ idRequest: 2, idStatus: FINISHED })],
                  },
               ])
            );

            const { requests } = await getRequestsByParam(type, param);

            expect(requests).toHaveLength(2);
            expect(requests[0]).toEqual({
               idClient: '7',
               personType: 'PM',
               name: 'Legal',
               fullName: 'Legal',
               isVisible: true,
               catStatus: 'En análisis',
               createUser: 'analyst',
               idCatStatus: IN_PROCESS,
               idGroup: 'Group A',
               idRequest: 1,
               idCatTypeProcedure: 3,
               statusRequest: 'En análisis',
            });
         });

         test('adds a "Sin Solicitud" row with a numeric client id when all the requests are finished', async () => {
            genericFetch.mockResolvedValueOnce(
               respondWith([
                  {
                     idClient: '7',
                     personType: 'PM',
                     name: 'Legal',
                     requests: [request({ idStatus: FINISHED })],
                  },
               ])
            );

            const { requests } = await getRequestsByParam(type, param);

            expect(requests).toHaveLength(2);
            expect(requests[1]).toEqual({
               idClient: 7,
               personType: 'PM',
               name: 'Legal',
               fullName: 'Legal',
               statusRequest: 'Sin Solicitud',
               isVisible: true,
            });
         });

         test('treats a client with null requests as one without requests', async () => {
            genericFetch.mockResolvedValueOnce(
               respondWith([{ idClient: '7', personType: 'PM', name: 'Legal', requests: null }])
            );

            const { requests } = await getRequestsByParam(type, param);

            expect(requests).toHaveLength(1);
            expect(requests[0].statusRequest).toBe('Sin Solicitud');
         });

         test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
            const error = new Error('Network down');
            genericFetch.mockRejectedValueOnce(error);

            const result = await getRequestsByParam(type, param);

            expect(result).toEqual({ status: 500, requests: null, error });
            expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Error interno del servidor'));
         });
      });

      test('uses the name search for any type other than forNumber and forGroup', async () => {
         genericFetch.mockResolvedValueOnce(nameResponse([]));

         await getRequestsByParam('anything', 'Name');

         expect(genericFetch.mock.calls[0][0].url).toBe('/credit/genericQL');
      });

      test('returns a 500 object when the name search response has no clients', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: {} });

         const result = await getRequestsByParam('forName', 'Name');

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
      });
   });

   describe('getClientsById', () => {
      test('requests the client and adds its full name', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { idClient: 5, name: 'Name' } });

         const result = await getClientsById('idClient=5');

         expect(genericFetch).toHaveBeenCalledWith({ url: '/credit/getClientById?idClient=5', method: 'get' });
         expect(result).toEqual({ status: 200, data: { idClient: 5, name: 'Name', fullName: 'Name' } });
      });

      test('prefers the business name for the full name', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { name: 'Name', businessName: 'Business SA' } });

         const { data } = await getClientsById('idClient=5');

         expect(data.fullName).toBe('Business SA');
      });

      test('returns the status and the rest of the response without data when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, data: { ignored: true }, error: 'Not found' });

         await expect(getClientsById('idClient=5')).resolves.toEqual({ status: 404, error: 'Not found' });
      });

      test('rejects when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         await expect(getClientsById('idClient=5')).rejects.toThrow('Network down');
      });
   });

   describe('getClientsByName', () => {
      const sentQuery = () => JSON.parse(genericFetch.mock.calls[0][0].data).query;

      test('posts the query by name and returns the responses', async () => {
         genericFetch.mockResolvedValueOnce(nameResponse([{ idClient: 1 }]));

         const result = await getClientsByName('Ana');

         expect(genericFetch.mock.calls[0][0]).toMatchObject({ url: '/credit/genericQL', method: 'post' });
         expect(JSON.parse(genericFetch.mock.calls[0][0].data).variables).toEqual({});
         expect(sentQuery()).toContain('getClientByNamePaged(name: "Ana", page: 0, size: 70)');
         expect(result).toEqual({ status: 200, data: [{ idClient: 1 }] });
      });

      test('includes the requests and the economic group fields by default', async () => {
         genericFetch.mockResolvedValueOnce(nameResponse([]));

         await getClientsByName('Ana');

         expect(sentQuery()).toContain('economicGroupPeople');
      });

      test('leaves out the requests and the economic group fields for another query type', async () => {
         genericFetch.mockResolvedValueOnce(nameResponse([]));

         await getClientsByName('Ana', 'BASIC');

         expect(sentQuery()).not.toContain('economicGroupPeople');
      });

      test('returns the status and the error as data when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         await expect(getClientsByName('Ana')).resolves.toEqual({ status: 400, data: 'Bad request' });
      });

      test('returns undefined data when the response has no data node', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await expect(getClientsByName('Ana')).resolves.toEqual({ status: 200, data: undefined });
      });
   });

   describe('getInfoClient', () => {
      test('requests the info of the client with the user and the request', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { name: 'Name' } });

         await getInfoClient(5, 'analyst', 9);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Related/getInfo?idClient=5&user=analyst&idRequest=9',
            method: 'get',
         });
      });

      test.each([
         ['the trade name when it has one', { tradeName: 'Trade', name: 'Name' }, 'Trade'],
         ['the name when it has no trade name', { name: 'Name' }, 'Name'],
      ])('adds a full name using %s', async (_label, data, fullName) => {
         genericFetch.mockResolvedValueOnce({ status: 200, data });

         const result = await getInfoClient(5, 'analyst', 9);

         expect(result).toEqual({ status: 200, data: { ...data, fullName } });
      });

      test('shows the error dialog and returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getInfoClient(5, 'analyst', 9);

         expect(result).toEqual({ status: 404, error: 'Not found' });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Recurso o información no encontrado'));
      });

      test('returns a 500 object with the info when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(getInfoClient(5, 'analyst', 9)).resolves.toEqual({ status: 500, info: error });
      });
   });

   describe('getAllEconomicGroup', () => {
      const economicGroup = (applicantOverrides = {}, related = []) => ({
         status: 200,
         data: {
            clientByIdResponse: {
               idClient: 1,
               rfc: 'RFC1',
               email: 'a@x.com',
               group: 'G1',
               civilStatus: 'Single',
               personType: 'PM',
               birthdate: '2000-01-01',
               name: 'Applicant',
               requests: [],
               ...applicantOverrides,
            },
            clientByIdResponses: related,
         },
      });

      test('requests the economic group of the client', async () => {
         genericFetch.mockResolvedValueOnce(economicGroup());

         await getAllEconomicGroup(1);

         expect(genericFetch).toHaveBeenCalledWith({ url: '/credit/getAllEconomicGroup/1', method: 'get' });
      });

      test('returns the applicant and the related clients with the applicant type', async () => {
         genericFetch.mockResolvedValueOnce(
            economicGroup({}, [
               {
                  idClient: 2,
                  rfc: 'RFC2',
                  email: 'b@x.com',
                  group: 'G1',
                  civilStatus: 'Married',
                  personType: 'PM',
                  birthdate: '1990-01-01',
                  name: 'Related',
                  businessName: 'Related SA',
                  requests: [],
               },
            ])
         );

         const result = await getAllEconomicGroup(1);

         expect(result.status).toBe(200);
         expect(result.applicant).toEqual({
            idCatTypePerson: constTypePerson.APPLICANT,
            idClient: 1,
            fullName: 'Applicant',
            isInProgress: false,
            email: 'a@x.com',
            personType: 'PM',
            civilStatus: 'Single',
            birthdate: '2000-01-01',
            rfc: 'RFC1',
            group: 'G1',
            edit: false,
         });
         expect(result.newEconomicGroup).toEqual([
            {
               idClient: 2,
               idCatTypePerson: constTypePerson.APPLICANT,
               fullName: 'Related SA',
               isInProgress: false,
               email: 'b@x.com',
               personType: 'PM',
               civilStatus: 'Married',
               birthdate: '1990-01-01',
               rfc: 'RFC2',
               group: 'G1',
               edit: false,
            },
         ]);
      });

      test('prefers the business name for the applicant full name', async () => {
         genericFetch.mockResolvedValueOnce(economicGroup({ businessName: 'Applicant SA' }));

         const { applicant } = await getAllEconomicGroup(1);

         expect(applicant.fullName).toBe('Applicant SA');
      });

      test.each([
         ['has requests and its status is not final', [request()], IN_PROCESS, true],
         ['has requests and its status is final', [request()], FINISHED, false],
         ['has no requests', [], IN_PROCESS, false],
      ])('flags the applicant in progress as expected when it %s', async (_label, requests, idStatus, inProgress) => {
         genericFetch.mockResolvedValueOnce(economicGroup({ requests, idStatus }));

         const { applicant } = await getAllEconomicGroup(1);

         expect(applicant.isInProgress).toBe(inProgress);
      });

      test.each([
         [EnumStatus.SOLICITUD_AUTORIZADA],
         [EnumStatus.SOLICITUD_RECHAZADA],
         [EnumStatus.SOLICITUD_FINALIZADA],
         [EnumStatus.SOLICITUD_CANCELADA],
         [EnumStatus.SOLICITUD_CANCELADA_POR_EMBARGO],
      ])('does not flag a related client whose status is final (%s)', async (idStatus) => {
         genericFetch.mockResolvedValueOnce(
            economicGroup({}, [{ idClient: 2, name: 'Related', requests: [request()], idStatus }])
         );

         const { newEconomicGroup } = await getAllEconomicGroup(1);

         expect(newEconomicGroup[0].isInProgress).toBe(false);
      });

      test('flags a related client with requests and a status that is not final', async () => {
         genericFetch.mockResolvedValueOnce(
            economicGroup({}, [{ idClient: 2, name: 'Related', requests: [request()], idStatus: IN_PROCESS }])
         );

         const { newEconomicGroup } = await getAllEconomicGroup(1);

         expect(newEconomicGroup[0].isInProgress).toBe(true);
      });

      test('returns the status and the rest of the response without data when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, data: { ignored: true }, error: 'Not found' });

         await expect(getAllEconomicGroup(1)).resolves.toEqual({ status: 404, error: 'Not found' });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(getAllEconomicGroup(1)).resolves.toEqual({ status: 500, error });
      });

      test('returns a 500 object with the error when the response has no client data', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: {} });

         const result = await getAllEconomicGroup(1);

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
      });
   });
});
