import { getRequestSecretary, postSaveSecretary, postStampedCover } from '../../services/servSecretary';
import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const secretaryResponse = (list) => ({ status: 200, data: { data: { getGroupWithFilters: list } } });

describe('servSecretary', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
   });

   describe('getRequestSecretary', () => {
      test('posts the query built from the filter', async () => {
         genericFetch.mockResolvedValueOnce(secretaryResponse([]));

         await getRequestSecretary({ status: 'PENDING', page: 3, size: 20 });

         const { url, method, data } = genericFetch.mock.calls[0][0];
         expect(url).toBe('/credit/genericQL');
         expect(method).toBe('post');
         expect(JSON.parse(data).variables).toEqual({});
         expect(JSON.parse(data).query).toContain('getGroupWithFilters(page: 3, size: 20, status: "PENDING")');
      });

      test('uses page 0 and size 100 when the filter does not define them', async () => {
         genericFetch.mockResolvedValueOnce(secretaryResponse([]));

         await getRequestSecretary({ status: 'PENDING' });

         const { data } = genericFetch.mock.calls[0][0];
         expect(JSON.parse(data).query).toContain('getGroupWithFilters(page: 0, size: 100, status: "PENDING")');
      });

      test('marks each group as visible, counts its applicants and flags the groups with several requests', async () => {
         genericFetch.mockResolvedValueOnce(
            secretaryResponse([
               { idGroup: 1, requestResponseList: [{ idRequest: 1 }] },
               { idGroup: 2, requestResponseList: [{ idRequest: 2 }, { idRequest: 3 }] },
            ])
         );

         const result = await getRequestSecretary({ status: 'PENDING' });

         expect(result).toEqual({
            status: 200,
            data: [
               {
                  idGroup: 1,
                  isVisible: true,
                  numApplicants: 1,
                  isGroup: false,
                  requestResponseList: [{ idRequest: 1 }],
               },
               {
                  idGroup: 2,
                  isVisible: true,
                  numApplicants: 2,
                  isGroup: true,
                  requestResponseList: [{ idRequest: 2 }, { idRequest: 3 }],
               },
            ],
         });
      });

      test('returns the status and the error as data when the response is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         await expect(getRequestSecretary({ status: 'PENDING' })).resolves.toEqual({
            status: 404,
            data: 'Not found',
         });
      });

      test('returns the response untouched when it is 200 but carries an error', async () => {
         const response = { status: 200, error: 'Partial failure' };
         genericFetch.mockResolvedValueOnce(response);

         await expect(getRequestSecretary({ status: 'PENDING' })).resolves.toBe(response);
      });

      test('returns undefined data when the payload has no data node', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: {} });

         await expect(getRequestSecretary({ status: 'PENDING' })).resolves.toEqual({ status: 200, data: undefined });
      });

      test('returns a 500 object with the error when the groups are missing from the payload', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { data: {} } });

         const result = await getRequestSecretary({ status: 'PENDING' });

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(getRequestSecretary({ status: 'PENDING' })).resolves.toEqual({ status: 500, error });
      });
   });

   describe('postSaveSecretary', () => {
      const group = { idGroup: 7, authorizationAmount: 1000 };
      const buildData = () => ({
         comments: 'kept',
         requests: [
            {
               idRequest: 1,
               authorizationAmount: 500,
               authorizationDate: '2024-01-01',
               authorizationNotional: 10,
               finalizeDate: '2024-02-01',
               idCatStatus: 1,
               ignored: 'not saved',
            },
         ],
      });

      test('patches the secretary data with the group values, status 12 and only the whitelisted request fields', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         const result = await postSaveSecretary(buildData(), group);

         expect(genericFetch).toHaveBeenCalledTimes(1);
         const { url, method, data } = genericFetch.mock.calls[0][0];
         expect(url).toBe('/credit/Global/updateSecretaryData');
         expect(method).toBe('patch');
         expect(JSON.parse(data)).toEqual({
            comments: 'kept',
            idGroup: 7,
            authorizationAmount: 1000,
            idCatStatus: 12,
            requests: [
               {
                  idRequest: 1,
                  authorizationAmount: 500,
                  authorizationDate: '2024-01-01',
                  authorizationNotional: 10,
                  finalizeDate: '2024-02-01',
                  idCatStatus: 1,
               },
            ],
         });
         expect(result).toEqual({ status: 200 });
      });

      test('sends undefined group values and no requests when they are not provided', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await postSaveSecretary({ comments: 'only' }, undefined);

         const { data } = genericFetch.mock.calls[0][0];
         expect(JSON.parse(data)).toEqual({ comments: 'only', idCatStatus: 12 });
      });

      test('returns the response untouched when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 409, error: 'Conflict' });

         await expect(postSaveSecretary(buildData(), group)).resolves.toEqual({ status: 409, error: 'Conflict' });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(postSaveSecretary(buildData(), group)).resolves.toEqual({ status: 500, error });
      });
   });

   describe('postStampedCover', () => {
      test('posts the request id and the AD user', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         const result = await postStampedCover(33, 'user.ad');

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/sealRequest',
            method: 'POST',
            data: JSON.stringify({ idRequest: 33, userAD: 'user.ad' }),
         });
         expect(result).toEqual({ status: 200 });
      });

      test('returns the response untouched when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         await expect(postStampedCover(33, 'user.ad')).resolves.toEqual({ status: 400, error: 'Bad request' });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(postStampedCover(33, 'user.ad')).resolves.toEqual({ status: 500, error });
      });
   });
});
