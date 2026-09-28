import { getGeneralInfo } from '../../services/servGeneralInfomation';

import { getAllEconomicGroup } from '../../services/servClients';
import { genericFetch } from '../../hooks';
import { sweetSnackbar } from '../../helpers';

jest.mock('../../services/servClients', () => ({ __esModule: true, getAllEconomicGroup: jest.fn() }));
jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));
jest.mock('../../helpers', () => {
   const originalModule = jest.requireActual('../../helpers');

   return { ...originalModule, sweetSnackbar: jest.fn() };
});

describe('servGeneralInformation', () => {
   describe('getGeneralInfo service', () => {
      beforeEach(() => {
         process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = true;
         getAllEconomicGroup.mockImplementation(async () => ({
            status: 200,
            applicant: 'test applicant',
            newEconomicGroup: 'test group',
         }));
         genericFetch.mockImplementation(async () => ({ status: 200, data: ['test credit'] }));
      });

      afterAll(() => {
         process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = false;
      });

      test('when getAllEconomicGroup returns an status different than 200 it returns an object with an error', async () => {
         getAllEconomicGroup.mockImplementationOnce(async () => ({ status: 500, error: 'Test Error Message' }));

         const result = await getGeneralInfo('101');
         expect(result).toEqual({ status: 500, error: 'Test Error Message' });
      });

      test('when get credit history status is 200 it sets request field in the result to be the credit history', async () => {
         const result = await getGeneralInfo('101');

         expect(result).toEqual({
            status: 200,
            data: { appli: 'test applicant', group: 'test group', requests: ['test credit'] },
         });
      });

      test('when getAllEconomicGroup throws an error it returns an object with empty values', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         getAllEconomicGroup.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await getGeneralInfo('101');

         expect(result).toEqual({
            status: 500,
            data: { appli: {}, group: [], request: [] },
            error: new Error('Test Error Message'),
         });
      });
   });
});
