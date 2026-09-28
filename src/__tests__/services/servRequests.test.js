import Swal from 'sweetalert2';

import {
   getRequestStatus,
   getQueryGraph,
   getOneRequest,
   graphGetGroup,
   onChangeRequestStatusOrAssignUser,
   postCreateRequest,
   postSavePersons,
   patchUpdateRequest,
   updateFinancialFlag,
} from '../../services/servRequests';
import { genericFetch } from '../../hooks';
import { constTypePerson, catStatus } from '../../helpers/config';

jest.mock('../../hooks', () => ({ genericFetch: jest.fn() }));

const APPLICANT = constTypePerson.APPLICANT;
const OBLIGED = constTypePerson.SOLIDARY_OBLIGED;

const group = (overrides = {}) => ({
   idGroup: 1,
   idCatStatus: 2,
   requestResponseList: [{ idRequest: 1, kindProcedure: 'Nuevo', relatedPersonResponseList: [] }],
   ...overrides,
});

const groupsResponse = (list) => ({ status: 200, data: { data: { getGroupWithFilters: list } } });
const oneGroupResponse = (item) => ({ status: 200, data: { data: { getGroup: item } } });

const dialogWith = (text) => expect.objectContaining({ html: expect.stringContaining(text) });
const sentBody = () => JSON.parse(genericFetch.mock.calls[0][0].data);

describe('servRequests', () => {
   beforeEach(() => {
      jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({}));
   });

   // Comparten el mismo contrato de errores y de transformación del listado de grupos.
   describe.each([
      ['getRequestStatus', (params) => getRequestStatus('PENDING', 2, 'user'), 'getGroupWithFilters(page: 2'],
      ['getQueryGraph', (params) => getQueryGraph({ status: 'PENDING', ...params }), 'GetGroupWithFilters'],
   ])('%s', (_name, call, queryFragment) => {
      test('posts the GraphQL query to the generic endpoint', async () => {
         genericFetch.mockResolvedValueOnce(groupsResponse([]));

         await call();

         const { url, method } = genericFetch.mock.calls[0][0];
         expect(url).toBe('/credit/genericQL');
         expect(method).toBe('post');
         expect(sentBody().query).toContain(queryFragment);
      });

      test('flags a single request group and shows the status text of its status id', async () => {
         genericFetch.mockResolvedValueOnce(groupsResponse([group()]));

         const result = await call();

         expect(result.status).toBe(200);
         expect(result.data).toEqual([
            {
               idGroup: 1,
               idCatStatus: 2,
               requestResponseList: [{ idRequest: 1, kindProcedure: 'Nuevo', relatedPersonResponseList: [] }],
               isGroup: false,
               isVisible: true,
               numApplicants: 1,
               status: catStatus[2],
               instanceEmpowered: 'FM',
               kindGroupProcedure: 'Nuevo',
            },
         ]);
      });

      test('flags a group with several requests as "Grupal"', async () => {
         const requests = [
            { idRequest: 1, kindProcedure: 'Nuevo', relatedPersonResponseList: [] },
            { idRequest: 2, kindProcedure: 'Incremento', relatedPersonResponseList: [] },
         ];
         genericFetch.mockResolvedValueOnce(groupsResponse([group({ requestResponseList: requests })]));

         const { data } = await call();

         expect(data[0]).toMatchObject({ isGroup: true, numApplicants: 2, kindGroupProcedure: 'Grupal' });
      });

      test('uses a dash as the status text while the request is with the financing specialist', async () => {
         genericFetch.mockResolvedValueOnce(groupsResponse([group({ idCatStatus: 1 })]));

         const { data } = await call();

         expect(data[0].status).toBe('-');
      });

      test('returns an empty list when there are no groups', async () => {
         genericFetch.mockResolvedValueOnce(groupsResponse([]));

         await expect(call()).resolves.toEqual({ status: 200, data: [] });
      });

      test('returns the status and the error as data when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         await expect(call()).resolves.toEqual({ status: 404, data: 'Not found' });
      });

      test('returns the response untouched when it is 200 but carries an error', async () => {
         const response = { status: 200, error: 'Partial failure' };
         genericFetch.mockResolvedValueOnce(response);

         await expect(call()).resolves.toBe(response);
      });

      test('returns a 500 object with the error when a group cannot be parsed', async () => {
         genericFetch.mockResolvedValueOnce(groupsResponse([{ idGroup: 1 }]));

         const result = await call();

         expect(result.status).toBe(500);
         expect(result.error.message).toBe('Error al realizar el parseo de la información');
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(call()).resolves.toEqual({ status: 500, error });
      });
   });

   describe('getRequestStatus', () => {
      test('puts the page, the status and the user filter in the query', async () => {
         genericFetch.mockResolvedValueOnce(groupsResponse([]));

         await getRequestStatus('CLOSED', 3, 'idAnalyst: "ana"');

         expect(sentBody().query).toContain(
            'getGroupWithFilters(page: 3, size: 100, status: "CLOSED", idAnalyst: "ana")'
         );
         expect(sentBody().variables).toEqual({});
      });
   });

   describe('getQueryGraph', () => {
      test('sends the params as variables', async () => {
         genericFetch.mockResolvedValueOnce(groupsResponse([]));

         await getQueryGraph({ status: 'CLOSED', page: 1 });

         expect(sentBody().variables).toEqual({ status: 'CLOSED', page: 1 });
      });
   });

   describe('getOneRequest', () => {
      const withPeople = () =>
         group({
            requestResponseList: [
               {
                  idRequest: 1,
                  kindProcedure: 'Nuevo',
                  relatedPersonResponseList: [
                     { idCatTypePerson: APPLICANT, fullName: 'Ana Maria Lopez' },
                     { idCatTypePerson: OBLIGED, fullName: 'Luis Perez' },
                  ],
               },
            ],
         });

      test('posts the query of the group and returns the single parsed group', async () => {
         genericFetch.mockResolvedValueOnce(oneGroupResponse(group()));

         const result = await getOneRequest(1);

         expect(sentBody().query).toContain('getGroup(idGroup: 1)');
         expect(result.status).toBe(200);
         expect(Array.isArray(result.data)).toBe(false);
         expect(result.data).toMatchObject({ idGroup: 1, isGroup: false, status: catStatus[2] });
      });

      test('does not decorate the people by default', async () => {
         genericFetch.mockResolvedValueOnce(oneGroupResponse(withPeople()));

         const { data } = await getOneRequest(1);

         const [applicant] = data.requestResponseList[0].relatedPersonResponseList;
         expect(applicant).not.toHaveProperty('color');
         expect(applicant).not.toHaveProperty('firstTwoLetters');
      });

      test('adds a color and the initials only to the applicants when asked to', async () => {
         genericFetch.mockResolvedValueOnce(oneGroupResponse(withPeople()));

         const { data } = await getOneRequest(1, true);

         const [applicant, obliged] = data.requestResponseList[0].relatedPersonResponseList;
         expect(applicant.color).toMatch(/^hsl\(/);
         expect(applicant.firstTwoLetters).toBe('AM');
         expect(obliged).not.toHaveProperty('color');
         expect(obliged).not.toHaveProperty('firstTwoLetters');
      });

      test('returns the status and the error as data when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         await expect(getOneRequest(1)).resolves.toEqual({ status: 404, data: 'Not found' });
      });

      test('returns the response untouched when it is 200 but carries an error', async () => {
         const response = { status: 200, error: 'Partial failure' };
         genericFetch.mockResolvedValueOnce(response);

         await expect(getOneRequest(1)).resolves.toBe(response);
      });

      test('returns a 500 object with the error when the group cannot be parsed', async () => {
         genericFetch.mockResolvedValueOnce(oneGroupResponse({ idGroup: 1 }));

         const result = await getOneRequest(1);

         expect(result.status).toBe(500);
         expect(result.error.message).toBe('Error al realizar el parseo de la información');
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(getOneRequest(1)).resolves.toEqual({ status: 500, error });
      });
   });

   describe('graphGetGroup', () => {
      test('posts the query of the given page with the group id as variable', async () => {
         genericFetch.mockResolvedValueOnce(oneGroupResponse(group()));

         const result = await graphGetGroup('SOLIDARY_PAGE', 9);

         expect(sentBody().query).toContain('query GetGroup($idGroup: Int)');
         expect(sentBody().variables).toEqual({ idGroup: 9 });
         expect(result).toMatchObject({ status: 200, data: { idGroup: 1, isGroup: false } });
      });

      test('returns the status and the error as data when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 404, error: 'Not found' });

         await expect(graphGetGroup('SOLIDARY_PAGE', 9)).resolves.toEqual({ status: 404, data: 'Not found' });
      });

      test('returns the response untouched when it is 200 but carries an error', async () => {
         const response = { status: 200, error: 'Partial failure' };
         genericFetch.mockResolvedValueOnce(response);

         await expect(graphGetGroup('SOLIDARY_PAGE', 9)).resolves.toBe(response);
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(graphGetGroup('SOLIDARY_PAGE', 9)).resolves.toEqual({ status: 500, error });
      });
   });

   describe('onChangeRequestStatusOrAssignUser', () => {
      const body = { idGroupRequest: 4, nextProfile: 'LDC', userAD: 'ana.ad', idCatStatus: 5 };

      test('sends the group to the next status with the whole body', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await onChangeRequestStatusOrAssignUser(body);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Global/sendGroup',
            method: 'patch',
            data: JSON.stringify(body),
         });
         expect(result).toEqual({ status: 204 });
      });

      test('reassigns the group to the user when it is a reassignment', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await onChangeRequestStatusOrAssignUser(body, true);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/reassignUser?idGroup=4&profilesEnum=LDC',
            method: 'PATCH',
            data: JSON.stringify({ userAD: 'ana.ad' }),
         });
         expect(result).toEqual({ status: 204 });
      });

      test.each([
         ['sending the group', false],
         ['reassigning the group', true],
      ])('returns a 500 object with the error when the fetch rejects while %s', async (_label, reassignment) => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(onChangeRequestStatusOrAssignUser(body, reassignment)).resolves.toEqual({ status: 500, error });
      });
   });

   describe('postCreateRequest', () => {
      const applicants = [
         { fullName: 'Ana', idClient: 1 },
         { fullName: 'Luis', idClient: 2 },
      ];

      test('names the group after the applicant when there is only one and adds the creator to it', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200, data: { idGroup: 1 } });

         const result = await postCreateRequest([applicants[0]], 'analyst');

         expect(genericFetch.mock.calls[0][0]).toMatchObject({ url: '/credit/generateRequest', method: 'post' });
         expect(sentBody()).toEqual({
            groupName: 'Ana',
            applicantsRequest: [{ fullName: 'Ana', idClient: 1, userCreate: 'analyst' }],
         });
         expect(result).toEqual({ status: 200, data: { idGroup: 1 } });
      });

      test('uses the given group name when there are several applicants', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await postCreateRequest(applicants, 'analyst', 'Group A');

         expect(sentBody().groupName).toBe('Group A');
         expect(sentBody().applicantsRequest.map((a) => a.userCreate)).toEqual(['analyst', 'analyst']);
      });

      test('uses a dash as the group name when there are several applicants and no name is given', async () => {
         genericFetch.mockResolvedValueOnce({ status: 200 });

         await postCreateRequest(applicants, 'analyst');

         expect(sentBody().groupName).toBe('-');
      });

      test('shows the error dialog and returns the response when the status is not 200', async () => {
         genericFetch.mockResolvedValueOnce({ status: 409, error: 'Conflict' });

         const result = await postCreateRequest(applicants, 'analyst');

         expect(result).toEqual({ status: 409, error: 'Conflict' });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('La operación no pudo completarse'));
      });

      test('shows the server error dialog and returns a 500 object when the fetch rejects', async () => {
         jest.spyOn(console, 'log').mockImplementation(() => {});
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         const result = await postCreateRequest(applicants, 'analyst');

         expect(result).toEqual({ status: 500, error });
         expect(Swal.fire).toHaveBeenCalledWith(dialogWith('Error interno del servidor'));
      });

      test('shows the server error dialog and returns a 500 object when there are no applicants', async () => {
         jest.spyOn(console, 'log').mockImplementation(() => {});

         const result = await postCreateRequest([], 'analyst');

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
         expect(genericFetch).not.toHaveBeenCalled();
      });
   });

   describe('postSavePersons', () => {
      const applicantWith = (idRequest, people) => ({ idRequest, relatedPersonResponseList: people });
      const applicantPerson = { idCatTypePerson: APPLICANT, idClient: 1 };
      const obligedPerson = (idClient, extra = {}) => ({ idCatTypePerson: OBLIGED, idClient, ...extra });

      test('saves the persons that are not applicants, from every applicant, with the user', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await postSavePersons(
            [
               applicantWith(1, [applicantPerson, obligedPerson(10)]),
               applicantWith(2, [obligedPerson(20), obligedPerson(21)]),
            ],
            'analyst'
         );

         expect(genericFetch.mock.calls[0][0]).toMatchObject({ url: '/credit/Related/savePerson', method: 'post' });
         expect(sentBody()).toEqual({
            relatedPersonList: [
               { ...obligedPerson(10), userModify: 'analyst' },
               { ...obligedPerson(20), userModify: 'analyst' },
               { ...obligedPerson(21), userModify: 'analyst' },
            ],
         });
      });

      test('returns the applicants with their obligators, leaving out the deleted ones', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });
         const kept = obligedPerson(10);
         const deleted = obligedPerson(11, { delete: true });
         const notDeleted = obligedPerson(12, { delete: false });

         const result = await postSavePersons(
            [{ ...applicantWith(1, [applicantPerson, kept, deleted, notDeleted]), fullName: 'Ana' }],
            'analyst'
         );

         expect(result).toEqual({
            status: 200,
            info: [{ idRequest: 1, fullName: 'Ana', obligators: [applicantPerson, kept] }],
         });
      });

      test('does not call the service when there are only applicants', async () => {
         const result = await postSavePersons([applicantWith(1, [applicantPerson])], 'analyst');

         expect(genericFetch).not.toHaveBeenCalled();
         expect(result).toEqual({ status: 200, info: [{ idRequest: 1, obligators: [applicantPerson] }] });
      });

      test('returns the response untouched when the status is not 204', async () => {
         genericFetch.mockResolvedValueOnce({ status: 400, error: 'Bad request' });

         await expect(postSavePersons([applicantWith(1, [obligedPerson(10)])], 'analyst')).resolves.toEqual({
            status: 400,
            error: 'Bad request',
         });
      });

      test('returns a 500 object with the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(postSavePersons([applicantWith(1, [obligedPerson(10)])], 'analyst')).resolves.toEqual({
            status: 500,
            error,
         });
      });

      test('returns a 500 object with the error when the applicants are not a list', async () => {
         const result = await postSavePersons(undefined, 'analyst');

         expect(result.status).toBe(500);
         expect(result.error).toBeInstanceOf(TypeError);
      });
   });

   describe('patchUpdateRequest', () => {
      test('updates the GROUP entity by default', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await patchUpdateRequest({ groupRequest: { idGroup: 1 } });

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Global/updateEntity?entityEnum=GROUP',
            method: 'patch',
            data: JSON.stringify({ groupRequest: { idGroup: 1 } }),
         });
         expect(result).toEqual({ status: 204 });
      });

      test('updates the given entity', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         await patchUpdateRequest({ request: [] }, 'REQUEST');

         expect(genericFetch).toHaveBeenCalledWith(
            expect.objectContaining({ url: '/credit/Global/updateEntity?entityEnum=REQUEST' })
         );
      });

      test('returns a 500 object with the info when the fetch rejects', async () => {
         const info = new Error('Network down');
         genericFetch.mockRejectedValueOnce(info);

         await expect(patchUpdateRequest({})).resolves.toEqual({ status: 500, info });
      });
   });

   describe('updateFinancialFlag', () => {
      test('patches the financial flag of the group', async () => {
         genericFetch.mockResolvedValueOnce({ status: 204 });

         const result = await updateFinancialFlag(8);

         expect(genericFetch).toHaveBeenCalledWith({
            url: '/credit/Related/updateFlagFinancialInfo?idGroup=8',
            method: 'patch',
         });
         expect(result).toEqual({ status: 204 });
      });

      test('returns a 500 object with a message and the error when the fetch rejects', async () => {
         const error = new Error('Network down');
         genericFetch.mockRejectedValueOnce(error);

         await expect(updateFinancialFlag(8)).resolves.toEqual({
            status: 500,
            message: 'Ocurrió un error al actualizar la información',
            error,
         });
      });
   });
});
