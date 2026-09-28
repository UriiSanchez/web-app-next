import { updateInfoClient, onBureauConfirmation, execCreditBureuQuery } from '../../services/servBureValidation';
import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

describe('servBureValidation', () => {
   describe('updateInfoClient', () => {
      const data = {
         idClient: 5,
         idRequest: 9,
         address: 'Main St',
         personal: { city: 'CDMX', phone: '555', nickname: 'ignored' },
         ignored: 'not saved',
      };

      test('patches only the whitelisted fields, including nested ones', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         const result = await updateInfoClient(data);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Related/updateInfo',
            method: 'patch',
            data: JSON.stringify({ idClient: 5, idRequest: 9, address: 'Main St', city: 'CDMX' }),
         });
         expect(result).toEqual({ status: 200 });
      });

      test('returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         await expect(updateInfoClient(data)).resolves.toEqual({ status: 400, error: 'Bad request' });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(updateInfoClient(data)).resolves.toEqual({ status: 500, error });
      });
   });

   describe.each([
      ['onBureauConfirmation', onBureauConfirmation, '/credit/Related/updateInfo', 'patch'],
      ['execCreditBureuQuery', execCreditBureuQuery, '/financial/bureau', 'post'],
   ])('%s', (_name, service, url, method) => {
      const data = { idClient: 5, extra: 'kept' };

      test('sends the whole payload as JSON and returns the response', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { ok: true } });

         const result = await service(data);

         expect(genericFetch).toHaveBeenCalledWith({ url, method, data: JSON.stringify(data) });
         expect(result).toEqual({ status: 200, data: { ok: true } });
      });

      test('returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 409, error: 'Conflict' });

         await expect(service(data)).resolves.toEqual({ status: 409, error: 'Conflict' });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(service(data)).resolves.toEqual({ status: 500, error });
      });
   });
});
