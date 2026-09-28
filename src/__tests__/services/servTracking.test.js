import { getDetailsTrackingForIdRequest, getTrackingGraph } from '../../services';
import { genericFetch } from '../../hooks';

jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));
jest.mock('../../helpers', () => ({ __esModule: true, getError: jest.fn() }));

describe('servTracking', () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe('getTrackingGraph', () => {
      let params = { status: '2,3,4,5', page: 1, byDateRange: '14-08-2025, 14-08-2025' };
      let serviceMock;
      beforeEach(() => {
         serviceMock = { status: 200, data: { data: { getTrackingWithFilters: [] } } };
         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it calls genericFetch with param `byDateRange` is today', async () => {
         const result = await getTrackingGraph(params);
         expect(genericFetch).toHaveBeenCalledTimes(1);
         expect(result.status).toBe(200);
      });

      test('when result data contains error it returns an object with status 500', async () => {
         serviceMock = { status: 500, data: { errors: ['Test Error Message'] } };

         const result = await getTrackingGraph(params);
         expect(genericFetch).toHaveBeenCalledTimes(1);
         expect(result.status).toBe(500);
      });
   });

   describe('getDetailsTrackingForIdRequest', () => {
      let serviceMock;
      const mockDetailsResponse = {
         status: 200,
         data: {
            idRequest: 1,
            trackingDetailResponse: [
               {
                  idTracking: 1,
                  profile: 'MESA RECEPTORA',
                  idCatStatus: 2,
                  flagDevolution: false,
                  userAD: 'USEREF',
                  fullName: 'TEST USER EF',
                  createDate: '2025-07-11 10:35:29',
                  authorizationFacultyResponse: null,
               },
            ],
         },
      };
      const mockBadRequestResponse = {
         status: 400,
         error: {
            traceId: '59a9ce9a-8910-4000-8000-000000000000',
            response: {
               statusCode: 500,
               timeStamp: '2025-08-14T18:53:39.565+00:00',
               message: "El parámetro 'idRequest' debería ser de tipo 'Integer'",
               description: 'uri=/api/Credit/Tracking/dsadsa',
            },
         },
      };
      const mockNotFoundResponse = {
         status: 404,
         error: {
            traceId: '8d2610ef-0337-41e4-8152-e8e6751b1c09',
            response: {
               statusCode: 404,
               timeStamp: '2025-08-14T18:53:39.565+00:00',
               message: 'request not found',
               description: 'uri=/api/Credit/Tracking/4545',
            },
         },
      };
      const mockErrorResponse = {
         status: 500,
         error: {
            traceId: '8d2610ef-0337-41e4-8152-e8e6751b1c09',
            response: {
               statusCode: 404,
               timeStamp: '2025-08-14T18:53:39.565+00:00',
               message: 'internal error server',
               description: 'uri=/api/Credit/Tracking/1',
            },
         },
      };

      beforeEach(() => {
         serviceMock = mockDetailsResponse;
         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it calls genericFetch with params', async () => {
         const result = await getDetailsTrackingForIdRequest(1);
         expect(genericFetch).toHaveBeenCalledTimes(1);
         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Tracking/1',
            method: 'GET',
         });
         expect(result.status).toBe(200);
         expect(result).toEqual(mockDetailsResponse);
      });

      test('when result data contains error it returns an object with status 500', async () => {
         serviceMock = mockErrorResponse;
         const result = await getDetailsTrackingForIdRequest(1);
         expect(result.status).toBe(500);
         expect(result).toEqual(mockErrorResponse);
      });

      test('error message when no results are found with the idRequest', async () => {
         serviceMock = mockNotFoundResponse;
         const result = await getDetailsTrackingForIdRequest(4545);
         expect(result.status).toBe(404);
         expect(result).toEqual(mockNotFoundResponse);
      });

      test('error occurs when idRequest is not a numeric type.', async () => {
         serviceMock = mockBadRequestResponse;
         const result = await getDetailsTrackingForIdRequest('dsadsa');
         expect(result.status).toBe(400);
         expect(result).toEqual(mockBadRequestResponse);
      });
   });
});
