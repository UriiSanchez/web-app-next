import Swal from 'sweetalert2';

import {
   getEmpoweredInformation,
   getLoadDocuments,
   postSaveAuthorization,
   validateAuthorizationForRequest,
} from '../../services/servEmpowered';
import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

// "%PDF-" en base64.
const PDF_BASE64 = 'JVBERi0=';

describe('servEmpowered', () => {
   beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
      // JSDOM no implementa createObjectURL.
      window.URL.createObjectURL = jest.fn(() => 'blob:mock-pdf');
   });

   describe('getEmpoweredInformation', () => {
      const resolution = (overrides = {}) => ({
         status: 200,
         data: { idGroup: 5, requests: [{ idRequest: 11 }, { idRequest: 12 }], ...overrides },
      });

      test('requests the resolution with the profile FC by default', async () => {
         genericFetch.mockResolvedValueOnce(resolution());

         await getEmpoweredInformation(5, 'analyst');

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/getResolution?idGroup=5&username=analyst&profile=FC',
            method: 'get',
         });
      });

      test('requests the resolution with the given profile', async () => {
         genericFetch.mockResolvedValueOnce(resolution());

         await getEmpoweredInformation(5, 'analyst', 'FM');

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/getResolution?idGroup=5&username=analyst&profile=FM',
            method: 'get',
         });
      });

      test('flags a group with several requests and counts them', async () => {
         genericFetch.mockResolvedValueOnce(resolution());

         const result = await getEmpoweredInformation(5, 'analyst');

         expect(result).toEqual({
            idGroup: 5,
            requests: [{ idRequest: 11 }, { idRequest: 12 }],
            isGroup: true,
            countRequest: 2,
         });
      });

      test('does not flag a group with a single request', async () => {
         genericFetch.mockResolvedValueOnce(resolution({ requests: [{ idRequest: 11 }] }));

         const result = await getEmpoweredInformation(5, 'analyst');

         expect(result).toMatchObject({ isGroup: false, countRequest: 1 });
      });

      test('stores the first request as the active applicant when there is none stored', async () => {
         genericFetch.mockResolvedValueOnce(resolution());

         await getEmpoweredInformation(5, 'analyst');

         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'))).toEqual({ idGroup: 5, idRequest: 11 });
      });

      test('replaces the active applicant when it belongs to another group', async () => {
         localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 1, idRequest: 99 }));
         genericFetch.mockResolvedValueOnce(resolution());

         await getEmpoweredInformation(5, 'analyst');

         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'))).toEqual({ idGroup: 5, idRequest: 11 });
      });

      test('keeps the active applicant when it belongs to the same group', async () => {
         localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 5, idRequest: 12 }));
         genericFetch.mockResolvedValueOnce(resolution());

         await getEmpoweredInformation(5, 'analyst');

         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'))).toEqual({ idGroup: 5, idRequest: 12 });
      });

      test('shows the error dialog, clears the active applicant and returns an empty list when the status is not 200', async () => {
         localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 5, idRequest: 12 }));
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getEmpoweredInformation(5, 'analyst');

         expect(result).toEqual([]);
         expect(localStorage.getItem('ACTIVE_APPLICANT')).toBeNull();
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Recurso o información no encontrado') })
         );
      });

      test('shows the server error dialog and returns an empty list when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         const result = await getEmpoweredInformation(5, 'analyst');

         expect(result).toEqual([]);
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Error interno del servidor') })
         );
      });

      test('returns an empty list when the resolution has no requests', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { idGroup: 5 } });

         await expect(getEmpoweredInformation(5, 'analyst')).resolves.toEqual([]);
      });
   });

   describe('getLoadDocuments', () => {
      const documentResponse = (response) => ({ status: 200, data: { response } });

      test('requests the document with PDF_COVER as the default type and returns a PDF url', async () => {
         genericFetch.mockResolvedValueOnce(documentResponse(PDF_BASE64));

         const result = await getLoadDocuments(7, 99);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Studio/generateStudio?idRequest=7&idClient=99&typeDocument=PDF_COVER',
            method: 'get',
         });
         expect(result).toEqual({ url: 'blob:mock-pdf#toolbar=1&navpanes=0&view=FitH,top', error: '' });
      });

      test('requests the document with the given type', async () => {
         genericFetch.mockResolvedValueOnce(documentResponse(PDF_BASE64));

         await getLoadDocuments(7, 99, 'PDF_STUDY');

         expect(genericFetch).toHaveBeenCalledWith(
            expect.objectContaining({
               url: '/credit/Studio/generateStudio?idRequest=7&idClient=99&typeDocument=PDF_STUDY',
            })
         );
      });

      test('builds the url from the cached document without requesting it', async () => {
         localStorage.setItem('CACHE_DOCUMENTS', JSON.stringify({ 7: { PDF_COVER: PDF_BASE64 } }));

         const result = await getLoadDocuments(7, 99, 'PDF_COVER');

         expect(genericFetch).not.toHaveBeenCalled();
         expect(result).toEqual({ url: 'blob:mock-pdf#toolbar=1&navpanes=0&view=FitH,top' });
      });

      test.each([
         ['the request has no cache entry', { 8: { PDF_COVER: PDF_BASE64 } }],
         ['the request has no cache entry for that type', { 7: { PDF_STUDY: PDF_BASE64 } }],
      ])('requests the document when %s', async (_label, cache) => {
         localStorage.setItem('CACHE_DOCUMENTS', JSON.stringify(cache));
         genericFetch.mockResolvedValueOnce(documentResponse(PDF_BASE64));

         await getLoadDocuments(7, 99, 'PDF_COVER');

         expect(genericFetch).toHaveBeenCalledTimes(1);
      });

      test('returns the message of the service when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({
            status: 400,
            error: { response: { message: 'Documento no disponible' } },
         });

         await expect(getLoadDocuments(7, 99)).resolves.toEqual({ url: '', error: 'Documento no disponible' });
      });

      test('returns the default message when the status is not 200 and there is no message', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400 });

         await expect(getLoadDocuments(7, 99)).resolves.toEqual({
            url: '',
            error: 'Ocurrió un error al cargar el documento.',
         });
      });

      test('returns the default message when the response has no document', async () => {
         genericFetch.mockResolvedValueOnce(documentResponse(undefined));

         await expect(getLoadDocuments(7, 99)).resolves.toEqual({
            url: '',
            error: 'Ocurrió un error al cargar el documento.',
         });
      });

      test('returns the default message when the download rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         await expect(getLoadDocuments(7, 99)).resolves.toEqual({
            url: '',
            error: 'Ocurrió un error al cargar el documento.',
         });
      });

      test('returns the error when the document is not valid base64', async () => {
         genericFetch.mockResolvedValueOnce(documentResponse('%%%'));

         const result = await getLoadDocuments(7, 99);

         expect(result.url).toBe('');
         expect(result.error).toBeInstanceOf(Error);
      });
   });

   describe('postSaveAuthorization', () => {
      test('posts the signature with the decision and returns true', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await postSaveAuthorization(7, 'user.ad', 'YES');

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Authorization/signRequest',
            method: 'post',
            data: JSON.stringify({ idRequest: 7, userAD: 'user.ad', authorizedDecision: 'YES' }),
         });
         expect(result).toBe(true);
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test.each([400, 404, 500])('shows the error dialog and returns false when the status is %s', async (status) => {
         genericFetch.mockResolvedValueOnce({ status, error: 'Failure' });

         const result = await postSaveAuthorization(7, 'user.ad', 'YES');

         expect(result).toBe(false);
         expect(Swal.fire).toHaveBeenCalledTimes(1);
      });

      test('shows the message of the service and returns false on a conflict', async () => {
         genericFetch.mockResolvedValueOnce({ status: 409, error: { response: { message: 'Ya fue firmada' } } });

         const result = await postSaveAuthorization(7, 'user.ad', 'YES');

         expect(result).toBe(false);
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Ya fue firmada'), icon: 'info' })
         );
      });

      test('shows a placeholder when the conflict has an empty message', async () => {
         genericFetch.mockResolvedValueOnce({ status: 409, error: { response: { message: '' } } });

         await postSaveAuthorization(7, 'user.ad', 'YES');

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('- MENSAJE NO DEFINIDO -') })
         );
      });

      test('shows the server error dialog and returns false when the fetch rejects', async () => {
         genericFetch.mockRejectedValueOnce(new Error('Network down'));

         const result = await postSaveAuthorization(7, 'user.ad', 'YES');

         expect(result).toBe(false);
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Error interno del servidor') })
         );
      });
   });

   describe('validateAuthorizationForRequest', () => {
      const decision = (typeFaculty, decisionFaculty, userAD) => ({ typeFaculty, decisionFaculty, userAD });

      test('disables the buttons when both a commercial and a credit faculty already authorized', () => {
         const authorizations = [decision('COMERCIAL', 'YES', 'ana'), decision('CREDITO', 'YES', 'luis')];

         expect(validateAuthorizationForRequest(authorizations, 'other', 'COMERCIAL')).toBe(true);
      });

      test('enables the buttons for the user who already authorized for their faculty type', () => {
         const authorizations = [decision('COMERCIAL', 'YES', 'ana'), decision('CREDITO', 'NO', 'luis')];

         expect(validateAuthorizationForRequest(authorizations, 'ana', 'COMERCIAL')).toBe(false);
      });

      test('disables the buttons for another user of a faculty type that already authorized', () => {
         const authorizations = [decision('COMERCIAL', 'YES', 'ana'), decision('CREDITO', 'NO', 'luis')];

         expect(validateAuthorizationForRequest(authorizations, 'carlos', 'COMERCIAL')).toBe(true);
      });

      test('enables the buttons when the faculty type of the user has not authorized yet', () => {
         const authorizations = [decision('COMERCIAL', 'YES', 'ana')];

         expect(validateAuthorizationForRequest(authorizations, 'luis', 'CREDITO')).toBe(false);
      });

      test('enables the buttons when nobody authorized', () => {
         const authorizations = [decision('COMERCIAL', 'NO', 'ana'), decision('CREDITO', 'NO', 'luis')];

         expect(validateAuthorizationForRequest(authorizations, 'ana', 'COMERCIAL')).toBe(false);
      });

      test('enables the buttons when there are no authorizations', () => {
         expect(validateAuthorizationForRequest([], 'ana', 'COMERCIAL')).toBe(false);
      });
   });
});
