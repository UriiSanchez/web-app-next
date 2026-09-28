import { getValidateModel, postExecutionModel, getResultModel } from '../../services/servModel';
import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

describe('servModel', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
   });

   describe.each([
      ['getValidateModel', getValidateModel, 'validateModel', 'get'],
      ['postExecutionModel', postExecutionModel, 'executeModel', 'post'],
   ])('%s', (_name, service, endpoint, method) => {
      test('sends the group and user in the url and returns the response', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { valid: true } });

         const result = await service(10, 'analyst');

         expect(genericFetch).toHaveBeenCalledWith({ url: `/financial/model/${endpoint}/10/analyst`, method });
         expect(result).toEqual({ status: 200, data: { valid: true } });
      });

      test('returns the response untouched when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         await expect(service(10, 'analyst')).resolves.toEqual({ status: 404, error: 'Not found' });
      });

      test('returns a 500 object with the message when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         await expect(service(10, 'analyst')).resolves.toEqual({ status: 500, message: 'Network down' });
      });
   });

   describe('getResultModel', () => {
      test('requests the model result by group and initializes the data', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 200,
            data: [
               {
                  dateElaboration: '2024-03-05',
                  applicant: { idClient: 1, typePerson: 'PM', fullName: 'Applicant', paymentCapacity: {} },
                  obligated: [{ idClient: 2, typePerson: 'PM', fullName: 'Obligated', financialReasons: {} }],
               },
            ],
         });

         const result = await getResultModel(10);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/financial/model/retrieveModelResult/10',
            method: 'get',
         });
         expect(result.status).toBe(200);
         expect(result.data).toHaveLength(1);
         expect(result.data[0].dateElaboration).toBe('05-03-2024');
         expect(result.data[0].applicant).toMatchObject({
            participantType: 'Solicitante',
            docs: ['Capacidad de pago'],
            pages: [2],
         });
         expect(result.data[0].obligated[0]).toMatchObject({
            participantType: 'Obligado Solidario',
            docs: ['Razones financieras'],
            pages: [4],
         });
      });

      test('returns an empty list when the response has no data', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: [] });

         await expect(getResultModel(10)).resolves.toEqual({ status: 200, data: [] });
      });

      test('returns the response untouched when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         await expect(getResultModel(10)).resolves.toEqual({ status: 404, error: 'Not found' });
      });

      test('returns a 500 object with the message when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         await expect(getResultModel(10)).resolves.toEqual({ status: 500, message: 'Network down' });
      });
   });
});
