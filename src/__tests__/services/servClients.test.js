import { getRequestsByParam, getInfoClient, getAllEconomicGroup } from '../../services/servClients';

import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servClients', () => {
   describe('getRequestsByParam service', () => {
      describe('when is forGroup', () => {
         let getClientByGroupMock;

         beforeEach(() => {
            getClientByGroupMock = {
               status: 200,
               data: [
                  {
                     personType: 'PF',
                     requests: [
                        {
                           status: null,
                           idCatTypeProcedure: 3,
                           idRequest: 1,
                           group: 'test group 1',
                           createUser: 'testuser',
                           idStatus: 1,
                        },
                     ],
                     name: 'Test Name 1',
                  },
                  {
                     personType: 'PFAE',
                     requests: [
                        {
                           status: null,
                           idCatTypeProcedure: 3,
                           idRequest: 2,
                           group: 'test group 2',
                           createUser: 'testuser',
                           idStatus: 1,
                        },
                        {
                           status: 'Finalizado',
                           idCatTypeProcedure: 3,
                           idRequest: 3,
                           group: 'test group 2',
                           createUser: 'testuser',
                           idStatus: 1,
                        },
                     ],
                     name: 'Test Name 2',
                  },
                  {
                     personType: 'PM',
                     requests: [
                        {
                           status: null,
                           idCatTypeProcedure: 3,
                           idRequest: 4,
                           group: 'test group 3',
                           createUser: 'testuser',
                           idStatus: 1,
                        },
                     ],
                     businessName: 'Test Business Name 1',
                  },
               ],
            };

            genericFetch.mockImplementation(async () => getClientByGroupMock);
         });

         test('it should filter out person type PF from the result', async () => {
            const { requests } = await getRequestsByParam('forGroup', 'Test Group');

            expect(requests.length).toBe(3);
         });

         test('it should set the status request to "Sin Solicitud" when requests from response is empty', async () => {
            getClientByGroupMock.data[0].requests = [];
            getClientByGroupMock.data[1].requests = [];
            getClientByGroupMock.data[2].requests = [];

            const { requests } = await getRequestsByParam('forGroup', 'Test Group');

            expect(requests[0].statusRequest).toBe('Sin Solicitud');
            expect(requests[1].statusRequest).toBe('Sin Solicitud');
         });

         test('it should return all the requests from the fetch response when is not empty', async () => {
            const { requests } = await getRequestsByParam('forGroup', 'Test Group');

            expect(requests.length).toBe(3);
            expect(requests[0].statusRequest).toBe(null);
            expect(requests[1].statusRequest).toBe('Finalizado');
            expect(requests[2].statusRequest).toBe(null);
         });
      });

      describe('when is forNumber', () => {
         let serviceMock;

         beforeEach(() => {
            serviceMock = {
               status: 200,
               data: {
                  personType: 'PM',
                  requests: [
                     {
                        status: 'En Proceso',
                        idRequest: 1,
                        group: 'test group 1',
                        createUser: 'testuser',
                        idCatTypeProcedure: 3,
                        idStatus: 2,
                     },
                     {
                        status: 'Finalizado',
                        idRequest: 2,
                        group: 'test group 2',
                        createUser: 'testuser',
                        idCatTypeProcedure: 3,
                        idStatus: 10,
                     },
                  ],
               },
            };

            genericFetch.mockImplementation(async () => serviceMock);
         });

         test('it should return an error if fetch response status is different than 200', async () => {
            genericFetch.mockImplementation(async () => ({ status: 500, error: { message: 'Test Error Message' } }));

            const result = await getRequestsByParam('forNumber', 'test=param');

            expect(result).toEqual({ status: 500, error: { message: 'Test Error Message' } });
         });

         test('it should a string as a result when the person is of type PF', async () => {
            serviceMock.data.personType = 'PF';

            const result = await getRequestsByParam('forNumber', 'test=param');

            expect(result).toEqual({ status: 200, requests: 'PF' });
         });

         test('it returns an object with one request of status "Sin Solicitud" when the requests from the fetch are empty', async () => {
            serviceMock.data.requests = [];

            const result = await getRequestsByParam('forNumber', 'test=param');

            expect(result).toEqual({
               status: 200,
               requests: [{ personType: 'PM', statusRequest: 'Sin Solicitud', isVisible: true, requests: [] }],
            });
         });

         test('it adds an additional request with the status "Sin Solicitud" when all request are in finished status', async () => {
            serviceMock.data.requests[0].idStatus = 10;
            serviceMock.data.requests[0].status = 'Finalizado';

            const result = await getRequestsByParam('forNumber', 'test=param');

            expect(result).toEqual({
               status: 200,
               requests: [
                  {
                     personType: 'PM',
                     catStatus: 'Finalizado',
                     createUser: 'testuser',
                     idCatStatus: 10,
                     idGroup: 'test group 1',
                     idRequest: 1,
                     isVisible: true,
                     idCatTypeProcedure: 3,
                     statusRequest: 'Finalizado',
                  },
                  {
                     personType: 'PM',
                     catStatus: 'Finalizado',
                     createUser: 'testuser',
                     idCatStatus: 10,
                     idGroup: 'test group 2',
                     idRequest: 2,
                     isVisible: true,
                     idCatTypeProcedure: 3,
                     statusRequest: 'Finalizado',
                  },
                  {
                     personType: 'PM',
                     statusRequest: 'Sin Solicitud',
                     isVisible: true,
                  },
               ],
            });
         });

         test('it returns a list of requests with the correct properties', async () => {
            const result = await getRequestsByParam('forNumber', 'test=param');

            expect(result).toEqual({
               status: 200,
               requests: [
                  {
                     personType: 'PM',
                     catStatus: 'En Proceso',
                     createUser: 'testuser',
                     idCatStatus: 2,
                     idGroup: 'test group 1',
                     idRequest: 1,
                     isVisible: true,
                     idCatTypeProcedure: 3,
                     statusRequest: 'En Proceso',
                  },
                  {
                     personType: 'PM',
                     catStatus: 'Finalizado',
                     createUser: 'testuser',
                     idCatStatus: 10,
                     idGroup: 'test group 2',
                     idRequest: 2,
                     isVisible: true,
                     idCatTypeProcedure: 3,
                     statusRequest: 'Finalizado',
                  },
               ],
            });
         });
      });

      describe('when is other option', () => {
         let serviceMock;

         beforeEach(() => {
            serviceMock = {
               status: 200,
               data: {
                  data: {
                     getClientByNamePaged: {
                        responses: [
                           {
                              personType: 'PM',
                              requests: [
                                 {
                                    status: null,
                                    idCatTypeProcedure: 3,
                                    idRequest: 1,
                                    group: 'test group 1',
                                    createUser: 'testuser',
                                    idStatus: 1,
                                 },
                              ],
                              name: 'Test Name 1',
                           },
                        ],
                     },
                  },
               },
            };

            genericFetch.mockImplementation(async () => serviceMock);
         });

         test('it should call get clients by name', async () => {
            await getRequestsByParam('forName', '');

            expect(genericFetch.mock.calls[0][0].data.includes('getClientByNamePaged')).toBe(true);
         });

         test('it should return an object with the error when fetch response status is different than 200', async () => {
            genericFetch.mockImplementationOnce(async () => ({
               status: 404,
               data: undefined,
            }));

            const result = await getRequestsByParam('forName', '');
            expect(result).toEqual({ status: 404, data: undefined });
         });

         test('it should add a request with the status "Sin Solicitud" to the requests list returned', async () => {
            serviceMock.data.data.getClientByNamePaged.responses[0].requests[0].idStatus = 10;

            const result = await getRequestsByParam('forName', '');

            expect(result).toEqual({
               status: 200,
               requests: [
                  {
                     personType: 'PM',
                     name: 'Test Name 1',
                     catStatus: null,
                     createUser: 'testuser',
                     fullName: 'Test Name 1',
                     idCatStatus: 10,
                     idCatTypeProcedure: 3,
                     idGroup: 'test group 1',
                     idRequest: 1,
                     isVisible: true,
                     name: 'Test Name 1',
                     statusRequest: null,
                  },
                  {
                     fullName: 'Test Name 1',
                     idClient: NaN,
                     isVisible: true,
                     name: 'Test Name 1',
                     personType: 'PM',
                     statusRequest: 'Sin Solicitud',
                  },
               ],
            });
         });

         test('it should return an object with null requests when fetch throws an error', async () => {
            jest.spyOn(console, 'log').mockImplementationOnce(() => {});
            genericFetch.mockImplementationOnce(async () => {
               throw new Error('Test Error Message');
            });

            const result = await getRequestsByParam('forName', '');

            expect(result).toEqual({ status: 500, requests: null, error: new Error('Test Error Message') });
         });
      });
   });

   describe('getInfoClient service', () => {
      let serviceMock;

      beforeEach(() => {
         serviceMock = {
            status: 200,
            data: {},
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it should return an object with an error when the fetch request throws an error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await getInfoClient('10', 'testuser', 1);

         expect(result).toEqual({ status: 500, info: new Error('Test Error Message') });
      });

      test('it should return an error when fetch response status is different than 200', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500, error: 'Test Error Message' }));

         const result = await getInfoClient('10', 'testuser', 1);

         expect(result).toEqual({ status: 500, error: 'Test Error Message' });
      });

      test('it should set fullName field the same as tradeName if is defined', async () => {
         serviceMock.data.tradeName = 'test trade name';

         const result = await getInfoClient('10', 'testuser', 1);

         expect(result).toEqual({ status: 200, data: { tradeName: 'test trade name', fullName: 'test trade name' } });
      });

      test('it should set fullName field the same as name field when tradeName is not defined', async () => {
         serviceMock.data.name = 'test name';

         const result = await getInfoClient('10', 'testuser', 1);

         expect(result).toEqual({ status: 200, data: { name: 'test name', fullName: 'test name' } });
      });
   });

   describe('getAllEconomicGroup services', () => {
      let serviceMock;

      beforeEach(() => {
         serviceMock = {
            status: 200,
            data: {
               clientByIdResponse: {
                  idClient: '100',
                  rfc: 'ABCDE12345',
                  email: 'test@email.com',
                  group: 'test group',
                  civilStatus: 'single',
                  personType: 'PFAE',
                  birthdate: '',
                  businessName: 'business name',
               },
               clientByIdResponses: [
                  {
                     idClient: '200',
                     rfc: 'FGHIJ12345',
                     email: 'test2@email.com',
                     group: 'test group 2',
                     civilStatus: '',
                     personType: 'PM',
                     birthdate: '',
                  },
               ],
            },
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it returns an object with an error when fetch response status is different than 200', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500, error: 'Test Error Message' }));

         const result = await getAllEconomicGroup('100');

         expect(result).toEqual({ status: 500, error: 'Test Error Message' });
      });

      test('when requests are not empty it sets isInProgress for applicant field to true based on idStatus', async () => {
         serviceMock.data.clientByIdResponse.requests = [{}];
         serviceMock.data.clientByIdResponse.idStatus = 2;

         const result = await getAllEconomicGroup('100');

         expect(result.applicant.isInProgress).toBe(true);
      });

      test('when fetch request throws an error it should return an object with that error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await getAllEconomicGroup('100');

         expect(result).toEqual({ status: 500, error: new Error('Test Error Message') });
      });
   });
});
