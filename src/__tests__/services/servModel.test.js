import { getValidateModel, postExecutionModel, getResultModel } from '../../services/servModel';

import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servModel', () => {
   describe('getValidateModel service', () => {
      test('it calls fetch function with idGroup and user', async () => {
         genericFetch.mockImplementationOnce(async () => ({}));

         await getValidateModel(1, 'testuser');
         expect(genericFetch.mock.calls[0][0].url).toBe('/financial/model/validateModel/1/testuser');
      });

      test('when fetch function throws an error it returns an object with the error message', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await getValidateModel(1, 'testuser');
         expect(result).toEqual({ status: 500, message: 'Test Error Message' });
      });
   });

   describe('postExecutionModel service', () => {
      test('it calls fetch function with idGroup and user', async () => {
         genericFetch.mockImplementationOnce(async () => ({}));

         await postExecutionModel(3, 'testuser');
         expect(genericFetch.mock.calls[0][0].url).toBe('/financial/model/executeModel/3/testuser');
      });

      test('when fetch function throws an error it returns an object with the error message', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await getValidateModel(3, 'testuser');
         expect(result).toEqual({ status: 500, message: 'Test Error Message' });
      });
   });

   describe('getResultModel service', () => {
      let serviceMock;

      beforeEach(() => {
         serviceMock = {
            status: 200,
            data: [],
         };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it calls the service with the idGroup parameter', async () => {
         await getResultModel(5);

         expect(genericFetch.mock.calls[0][0].url).toBe('/financial/model/retrieveModelResult/5');
      });

      test('when fetch response status is different than 200 it returns the response object without modifications', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500, error: 'Test Error Message' }));

         const result = await getResultModel(5);
         expect(result).toEqual({ status: 500, error: 'Test Error Message' });
      });

      test('for every applicant in response it adds docs and pages arrays', async () => {
         serviceMock.data = [
            {
               applicant: {
                  idClient: '101',
                  typePerson: 'PF',
                  fullName: 'Test Full Name',
                  resumeResponse: '',
                  paymentCapacity: '',
               },
            },
            {
               applicant: {
                  idClient: '102',
                  typePerson: 'PF',
                  fullName: 'Test Full Name 2',
                  creditHistoryReport: '',
                  financialReasons: '',
               },
            },
         ];

         const result = await getResultModel(5);
         expect(result.data[0].applicant.docs).toEqual(['Resumen', 'Capacidad de pago']);
         expect(result.data[0].applicant.pages).toEqual([1, 2]);
         expect(result.data[1].applicant.docs).toEqual(['Buró de crédito', 'Razones financieras']);
         expect(result.data[1].applicant.pages).toEqual([3, 4]);
      });

      test('for every obligated in the response it adds docs and pages arrays', async () => {
         serviceMock.data = [
            {
               applicant: {
                  idClient: '101',
                  typePerson: 'PF',
                  fullName: 'Test Full Name',
                  resumeResponse: '',
                  paymentCapacity: '',
               },
               obligated: [
                  {
                     idClient: '101',
                     typePerson: 'PF',
                     fullName: 'Test Full Name',
                     resumeResponse: '',
                     paymentCapacity: '',
                  },
                  {
                     idClient: '102',
                     typePerson: 'PF',
                     fullName: 'Test Full Name 2',
                     creditHistoryReport: '',
                     financialReasons: '',
                  },
               ],
            },
            {
               applicant: {
                  idClient: '101',
                  typePerson: 'PF',
                  fullName: 'Test Full Name',
                  resumeResponse: '',
                  paymentCapacity: '',
               },
               obligated: [
                  {
                     idClient: '103',
                     typePerson: 'PF',
                     fullName: 'Test Full Name 3',
                     swapRate: '',
                     exchangeRate: '',
                  },
               ],
            },
         ];

         const result = await getResultModel(5);
         expect(result.data[0].obligated[0].docs).toEqual(['Resumen', 'Capacidad de pago']);
         expect(result.data[0].obligated[0].pages).toEqual([1, 2]);
         expect(result.data[0].obligated[1].docs).toEqual(['Buró de crédito', 'Razones financieras']);
         expect(result.data[0].obligated[1].pages).toEqual([3, 4]);
         expect(result.data[1].obligated[0].docs).toEqual(['Razonabilidad de cobertura', 'Tipo de cambio']);
         expect(result.data[1].obligated[0].pages).toEqual([5, 6]);
      });

      test('when fetch function throws an erro it returns an object with the error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await getResultModel(5);
         expect(result).toEqual({ status: 500, message: 'Test Error Message' });
      });
   });
});
