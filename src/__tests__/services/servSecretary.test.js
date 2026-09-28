import { getRequestSecretary, postSaveSecretary } from '../../services/servSecretary';

import { genericFetch } from '../../hooks';
import { setOnlyIsToSave } from '../../helpers';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));
jest.mock('../../helpers', () => {
   const originalModule = jest.requireActual('../../helpers');

   return {
      ...originalModule,
      setOnlyIsToSave: jest.fn(),
   };
});

describe('servSecretary', () => {
   describe('getRequestSecretary service', () => {
      let fetchResponse;
      let filter;

      beforeEach(() => {
         fetchResponse = {
            status: 200,
            data: { data: { getGroupWithFilters: [{ requestResponseList: [{}, {}, {}] }] } },
         };
         filter = { status: '1,2,3', page: 0, size: 10 };

         genericFetch.mockImplementation(async () => fetchResponse);
      });

      test('it calls fetch function with the correct query filter', async () => {
         await getRequestSecretary(filter);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.query.includes('getGroupWithFilters(page: 1, size: 10, status: "1,2,3")'));
      });

      test('when response is correct it sets additional properties based on the number of requestResponseList to returned list', async () => {
         const result = await getRequestSecretary(filter);

         expect(result.data[0].isVisible).toBe(true);
         expect(result.data[0].numApplicants).toBe(3);
         expect(result.data[0].isGroup).toBe(true);
      });

      test('when fetch function throws an error it returns an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await getRequestSecretary(filter);
         expect(result).toEqual({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('postSaveSecretary service', () => {
      let data;
      let group;

      beforeEach(() => {
         data = {};
         group = { idGroup: 10, authorizationAmount: '350' };

         genericFetch.mockImplementation(async () => ({}));
         setOnlyIsToSave.mockReturnValue({});
      });

      test('it sets idGroup and authorizationAmount based on group parameter', async () => {
         await postSaveSecretary(data, group);

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.idGroup).toBe(10);
         expect(sentData.authorizationAmount).toBe('350');
      });

      test('it calls setOnlyIsToSave function for every request in data param', async () => {
         data.requests = [{}, {}, {}];

         await postSaveSecretary(data, group);
         expect(setOnlyIsToSave).toHaveBeenCalledTimes(3);
      });

      test('when fetch function throws an error it returns an object with the error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         genericFetch.mockImplementationOnce(async () => {
            throw new Error('Test Error Message');
         });

         const result = await postSaveSecretary(data, group);
         expect(result).toEqual({ status: 500, error: new Error('Test Error Message') });
      });
   });
});
