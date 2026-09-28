import Swal from 'sweetalert2';

import { getTrackingGraph, getDetailsTrackingForIdRequest } from '../../services/servTracking';
import { genericFetch } from '../../hooks';
import { constTypePerson } from '../../helpers/config';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const trackingResponse = (list) => ({ status: 200, data: { data: { getTrackingWithFilters: list } } });

describe('servTracking', () => {
   beforeEach(() => {
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   describe('getTrackingGraph', () => {
      test('posts the query with the params as variables', async () => {
         genericFetch.mockResolvedValueOnce(trackingResponse([]));

         await getTrackingGraph({ page: 2, status: 'ALL' });

         expect(genericFetch).toHaveBeenCalledTimes(1);
         const { url, method, data } = genericFetch.mock.calls[0][0];
         expect(url).toBe('/credit/genericQL');
         expect(method).toBe('post');
         expect(JSON.parse(data).variables).toEqual({ page: 2, status: 'ALL' });
         expect(JSON.parse(data).query).toContain('getTrackingWithFilters');
      });

      test('marks a single request as not grouped and uses the kind of procedure of its first request', async () => {
         genericFetch.mockResolvedValueOnce(
            trackingResponse([{ idGroup: 1, requestPerGroup: 1, requestResponseList: [{ kindProcedure: 'Nuevo' }] }])
         );

         const result = await getTrackingGraph({});

         expect(result).toEqual({
            status: 200,
            data: [
               {
                  idGroup: 1,
                  requestPerGroup: 1,
                  requestResponseList: [{ kindProcedure: 'Nuevo' }],
                  isGroup: false,
                  kindGroupProcedure: 'Nuevo',
               },
            ],
         });
      });

      test('marks a group and lists the applicant of each request with its status', async () => {
         genericFetch.mockResolvedValueOnce(
            trackingResponse([
               {
                  idGroup: 2,
                  requestPerGroup: 2,
                  requestResponseList: [
                     {
                        idCatStatus: 3,
                        relatedPersonResponseList: [
                           { idClient: 10, idCatTypePerson: constTypePerson.APPLICANT },
                           { idClient: 11, idCatTypePerson: 99 },
                        ],
                     },
                     {
                        idCatStatus: 4,
                        relatedPersonResponseList: [{ idClient: 20, idCatTypePerson: constTypePerson.APPLICANT }],
                     },
                  ],
               },
            ])
         );

         const result = await getTrackingGraph({});

         expect(result.status).toBe(200);
         expect(result.data[0].isGroup).toBe(true);
         expect(result.data[0].kindGroupProcedure).toBe('Grupal');
         expect(result.data[0].listApplicants).toEqual([
            { idClient: 10, idCatTypePerson: constTypePerson.APPLICANT, idCatStatus: 3 },
            { idClient: 20, idCatTypePerson: constTypePerson.APPLICANT, idCatStatus: 4 },
         ]);
      });

      test('returns an empty list when there are no requests', async () => {
         genericFetch.mockResolvedValueOnce(trackingResponse([]));

         await expect(getTrackingGraph({})).resolves.toEqual({ status: 200, data: [] });
      });

      test('shows the error dialog and returns only the status when the response is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         const result = await getTrackingGraph({});

         expect(result).toEqual({ status: 404 });
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Recurso o información no encontrado') })
         );
      });

      test('returns a 500 object with the error when the parsing fails', async () => {
         genericFetch.mockResolvedValueOnce(trackingResponse(undefined));

         const result = await getTrackingGraph({});

         expect(result.status).toBe(500);
         expect(result.error.message).toBe('Error al realizar el parseo de la información');
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(getTrackingGraph({})).resolves.toEqual({ status: 500, error });
      });
   });

   describe('getDetailsTrackingForIdRequest', () => {
      test('requests the tracking of the request', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { steps: [] } });

         const result = await getDetailsTrackingForIdRequest(55);

         expect(genericFetch).toHaveBeenCalledWith({ url: '/credit/Tracking/55', method: 'GET' });
         expect(result).toEqual({ status: 200, data: { steps: [] } });
      });

      test('returns the response untouched when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         await expect(getDetailsTrackingForIdRequest(55)).resolves.toEqual({ status: 404, error: 'Not found' });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(getDetailsTrackingForIdRequest(55)).resolves.toEqual({ status: 500, error });
      });
   });
});
