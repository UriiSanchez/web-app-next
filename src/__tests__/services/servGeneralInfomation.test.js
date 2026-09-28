import Swal from 'sweetalert2';

import { getGeneralInfo, getCreditHistory } from '../../services/servGeneralInfomation';
import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const economicGroupResponse = {
   status: 200,
   data: {
      clientByIdResponse: { idClient: 1, rfc: 'RFC1', name: 'Applicant', personType: 'PM', requests: [] },
      clientByIdResponses: [{ idClient: 2, rfc: 'RFC2', name: 'Related', personType: 'PM', requests: [] }],
   },
};

describe('servGeneralInfomation', () => {
   beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   afterEach(() => {
      process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'false';
   });

   describe('getCreditHistory', () => {
      test('requests the credit history of the client', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: ['credit'] });

         const result = await getCreditHistory(101);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/getHistoryCreditClient/101?typeCreditEnum=ALL',
            method: 'get',
         });
         expect(result).toEqual({ status: 200, data: ['credit'] });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(getCreditHistory(101)).resolves.toEqual({ status: 500, error });
      });
   });

   describe('getGeneralInfo', () => {
      test('returns the applicant and the group without requests when Isiloans is disabled', async () => {
         genericFetch.mockResolvedValueOnce(economicGroupResponse);

         const result = await getGeneralInfo(1);

         expect(genericFetch).toHaveBeenCalledTimes(1);
         expect(result.status).toBe(200);
         expect(result.data.appli).toMatchObject({ idClient: 1, fullName: 'Applicant' });
         expect(result.data.group).toHaveLength(1);
         expect(result.data.requests).toEqual([]);
      });

      test('adds the credit history as requests when Isiloans is enabled', async () => {
         process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'true';
         genericFetch
            .mockResolvedValueOnce(economicGroupResponse)
            .mockResolvedValueOnce({ status: 200, data: ['credit'] });

         const result = await getGeneralInfo(1);

         expect(genericFetch).toHaveBeenCalledTimes(2);
         expect(result.data.requests).toEqual(['credit']);
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('shows a snackbar and keeps requests empty when the credit history fails', async () => {
         process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'true';
         genericFetch
            .mockResolvedValueOnce(economicGroupResponse)
            .mockResolvedValueOnce({ status: 400, error: { response: { message: 'History unavailable' } } });

         const result = await getGeneralInfo(1);

         expect(result.status).toBe(200);
         expect(result.data.requests).toEqual([]);
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('History unavailable') })
         );
      });

      test('shows a generic message in the snackbar when the failure has no message', async () => {
         process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'true';
         genericFetch.mockResolvedValueOnce(economicGroupResponse).mockResolvedValueOnce({ status: 400 });

         await getGeneralInfo(1);

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Error desconocido') })
         );
      });

      test('shows the error dialog and returns the response when the economic group fails', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getGeneralInfo(1);

         expect(result).toEqual({ status: 404, error: 'Not found' });
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Recurso o información no encontrado') })
         );
      });

      test('shows the error dialog and returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         const result = await getGeneralInfo(1);

         expect(result).toEqual({ status: 500, error });
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Error interno del servidor') })
         );
      });

      // getError no tiene mensaje para el status 403 y lanza un TypeError; el catch externo lo convierte en 500.
      test('returns a 500 object with empty values when the error handler throws for an unmapped status', async () => {
         genericFetch.mockResolvedValueOnce({ status: 403, error: 'Forbidden' });

         const result = await getGeneralInfo(1);

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
         expect(result.data).toEqual({ request: [], appli: {}, group: [] });
      });
   });
});
