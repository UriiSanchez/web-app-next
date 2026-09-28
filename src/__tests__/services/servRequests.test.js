import {
   getRequestStatus,
   getOneRequest,
   onChangeRequestStatusOrAssignUser,
   postCreateRequest,
   postSavePersons,
   patchUpdateRequest,
} from '../../services/servRequests';

import { genericFetch } from '../../hooks';
import { getError } from '../../helpers';

jest.mock('../../services/servGeneralInfomation', () => ({ __esModule: true, getCreditHistory: jest.fn() }));
jest.mock('../../hooks', () => ({ __esModule: true, genericFetch: jest.fn() }));
jest.mock('../../helpers', () => {
   const originalModule = jest.requireActual('../../helpers');

   return {
      ...originalModule,
      getError: jest.fn(),
   };
});

describe('servRequests', () => {
   describe('getRequestStatus service', () => {
      let serviceMock;

      beforeEach(() => {
         process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = true;
         serviceMock = { status: 200, data: { data: { getGroupWithFilters: [] } } };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      afterAll(() => {
         process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = false;
      });

      test('it sends request with the query using the correct parameters', async () => {
         await getRequestStatus('1,2,3', 1, 'testuser');

         const data = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(data.query.includes('getGroupWithFilters(page: 1, size: 100, status: "1,2,3", testuser)')).toBe(true);
      });

      test('when the response data contains errors it returns an object with status 500', async () => {
         serviceMock.data.errors = ['Test Error Message'];

         const result = await getRequestStatus('1,2,3', 'testuser', 1);
         expect(result.status).toBe(200);
      });

      test('when the response contains an error property it returns the plain response object', async () => {
         serviceMock = { data: undefined, status: 500 };

         const result = await getRequestStatus('1,2,3', 'testuser', 1);
         expect(result).toEqual({ data: undefined, status: 500 });
      });

      test('when fetch function throws an error it returns an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await getRequestStatus('1,2,3', 'testuser', 1);
         expect(result).toEqual({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('getOneRequest service', () => {
      let serviceMock;

      beforeEach(() => {
         serviceMock = { status: 500, data: { data: { getGroup: { requestResponseList: [], idCatStatus: 1 } } } };

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it sends the request with the query using the correct parameters', async () => {
         await getOneRequest(1);

         const data = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(data.query.includes('getGroup(idGroup: 1)')).toBe(true);
      });

      test('when result data contains error it returns an object with status 500', async () => {
         serviceMock.data.errors = ['Test Error Message'];

         const result = await getOneRequest(1);
         expect(result.status).toBe(500);
      });

      test('when result object contains an error field it returns the plain response object', async () => {
         serviceMock = { status: 500, data: undefined };

         const result = await getOneRequest(1);
         expect(result).toEqual({ status: 500, data: undefined });
      });

      test('when fetch function throws an error it returns an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await getOneRequest(1);
         expect(result).toEqual({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('onChangeRequestStatusOrAssignUser service', () => {
      test('it calls the fetch function with the correct data parameter', async () => {
         genericFetch.mockImplementationOnce(async () => ({}));

         await onChangeRequestStatusOrAssignUser({ test: 'value' });

         const data = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(data).toEqual({ test: 'value' });
      });

      test('when fetch function throws an error it returns an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await onChangeRequestStatusOrAssignUser({});
         expect(result).toEqual({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('postCreateRequest service', () => {
      let serviceMock;
      let data;

      beforeEach(() => {
         serviceMock = { status: 200 };
         data = [{ fullName: 'Test Name 1' }, { fullName: 'Test Name 2' }];

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it adds userCreate property to every object in data parameter', async () => {
         await postCreateRequest(data, 'testuser');

         const dataSent = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(dataSent.applicantsRequest).toEqual([
            { fullName: 'Test Name 1', userCreate: 'testuser' },
            { fullName: 'Test Name 2', userCreate: 'testuser' },
         ]);
      });

      test('when data parameter has one object it uses the fullName property as the groupName', async () => {
         data = [{ fullName: 'Test Name 1' }];

         await postCreateRequest(data, 'testuser');
         const dataSent = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(dataSent.groupName).toBe('Test Name 1');
      });

      test('when fetch response status is different than 200 it calls getError function', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500 }));

         await postCreateRequest(data, 'testuser');
         expect(getError).toHaveBeenCalled();
      });

      test('when fetch function throws an error it calls getError function with the error', async () => {
         jest.spyOn(console, 'log').mockImplementationOnce(() => {});
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         await postCreateRequest(data, 'testuser');
         expect(getError).toHaveBeenCalledWith({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('postSavePersons service', () => {
      let serviceMock;
      let applicants;

      beforeEach(() => {
         serviceMock = { status: 204 };
         applicants = [
            { relatedPersonResponseList: [{ idCatTypePerson: 1 }, { idCatTypePerson: 2 }, { idCatTypePerson: 3 }] },
            { relatedPersonResponseList: [{ idCatTypePerson: 1 }, { idCatTypePerson: 2 }] },
         ];

         genericFetch.mockImplementation(async () => serviceMock);
      });

      test('it removes all persons of type applicant from the related person list', async () => {
         await postSavePersons(applicants, 'testuser');

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.relatedPersonList.length).toBe(3);
      });

      test('it adds userModify property to every related person sent', async () => {
         await postSavePersons(applicants, 'testuser');

         const sentData = JSON.parse(genericFetch.mock.calls[0][0].data);
         expect(sentData.relatedPersonList[0].userModify).toBe('testuser');
         expect(sentData.relatedPersonList[1].userModify).toBe('testuser');
         expect(sentData.relatedPersonList[2].userModify).toBe('testuser');
      });

      test('when fetch response status is different than 204 it returns the plain response object', async () => {
         genericFetch.mockImplementationOnce(async () => ({ status: 500, error: 'Test Error Message' }));

         const result = await postSavePersons(applicants, 'testuser');
         expect(result).toEqual({ status: 500, error: 'Test Error Message' });
      });

      test('when fetch function throws an error it returns an object with the error', async () => {
         genericFetch.mockImplementationOnce(async () => {
            throw new TypeError('Test Error Message');
         });

         const result = await postSavePersons(applicants, 'testuser');
         expect(result).toEqual({ status: 500, error: new TypeError('Test Error Message') });
      });
   });

   describe('patchUpdateRequest service', () => {
      beforeEach(() => {
         genericFetch.mockImplementationOnce(async () => ({}));
      });
      test('it calls fetch function with the default value for entityEnum when is not defined', async () => {
         await patchUpdateRequest({});

         const url = genericFetch.mock.calls[0][0].url;
         expect(url).toBe('/credit/Global/updateEntity?entityEnum=GROUP');
      });

      test('it calls fetch function with the entityEnum value when is defined', async () => {
         await patchUpdateRequest({}, 'CUSTOM');

         const url = genericFetch.mock.calls[0][0].url;
         expect(url).toBe('/credit/Global/updateEntity?entityEnum=CUSTOM');
      });
   });
});
