import { updateInfoClient, onBureauConfirmation, execCreditBureuQuery } from '../../services/servBureValidation';

import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));

describe('servBureValidation', () => {
   describe('updateInfoClient service', () => {
      let dataMock;

      beforeEach(() => {
         dataMock = {
            idClient: '1',
            neighborhood: 'Prados',
            address: 'Calle 13',
            city: 'CDMX',
            state: 'México',
            zipCode: '50505',
            exteriorNumber: 10,
            interiorNumber: 12,
            municipality: '',
            creditReference: '',
            accountType: '',
            userModify: 'testuser',
            idRequest: 10,
         };

         genericFetch.mockImplementation(async () => {});
      });

      test('it should call generic fetch with only the allowed properties', async () => {
         dataMock.otherField = 'value';

         await updateInfoClient(dataMock);

         const sendData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sendData.otherField).toBeUndefined();
      });

      test('it should return an object with the error when generic fetch throws an error', async () => {
         const testError = new Error('Test Error 101');
         genericFetch.mockImplementation(async () => {
            throw testError;
         });

         const result = await updateInfoClient(dataMock);

         expect(result).toEqual({ status: 500, error: testError });
      });
   });

   describe('onBureauConfirmation service', () => {
      beforeEach(() => {
         genericFetch.mockImplementation(async () => {});
      });

      test('it should call generic fetch with the data object', async () => {
         await onBureauConfirmation({ data: 'test data' });

         expect(genericFetch.mock.calls[0][0].data).toBe('{"data":"test data"}');
      });

      test('it should return an object with the error when generic fetch throws an error', async () => {
         const testError = new Error('Test Error 101');
         genericFetch.mockImplementation(async () => {
            throw testError;
         });

         const result = await onBureauConfirmation({ data: 'test data' });

         expect(result).toEqual({ status: 500, error: testError });
      });
   });

   describe('execCreditBureuQuery service', () => {
      beforeEach(() => {
         genericFetch.mockImplementation(async () => {});
      });

      test('it should call generic fetch with the data object', async () => {
         await execCreditBureuQuery({ data: 'test data' });

         expect(genericFetch.mock.calls[0][0].data).toBe('{"data":"test data"}');
      });

      test('it should return an object with the error when generic fetch throws an error', async () => {
         const testError = new Error('Test Error 101');
         genericFetch.mockImplementation(async () => {
            throw testError;
         });

         const result = await execCreditBureuQuery({ data: 'test data' });

         expect(result).toEqual({ status: 500, error: testError });
      });
   });
});
