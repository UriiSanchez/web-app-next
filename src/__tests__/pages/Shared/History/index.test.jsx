import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import HistoryPage from '../../../../pages/Shared/History';
import { getQueryGraph } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getQueryGraph: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const buildUser = (idProfile, extra = {}) => ({
   userAD: 'user.ad',
   idZone: 'Z1',
   path: 'HIS',
   idProfile,
   status: [],
   ...extra,
});
const buildItem = (idGroup, applicants = 1, extra = {}) => ({
   idGroup,
   groupName: `Grupo ${idGroup}`,
   arrivedSecDate: '2025-06-03T08:46:12',
   arrivedFcDate: '2025-06-03T08:46:12',
   idCatStatus: 12,
   requestAmount: 2000,
   numApplicants: applicants,
   kindGroupProcedure: 'Nuevo',
   instanceEmpowered: 'Comité',
   branchOffice: 'CORPORATIVO',
   isGroup: applicants > 1,
   totalPages: 3,
   requestResponseList: Array.from({ length: applicants }, (_v, i) => ({
      idRequest: idGroup * 10 + i,
      relatedPersonResponseList: [{ idCatTypePerson: 1, idClient: `${idGroup}${i}`, fullName: `Solicitante ${idGroup}-${i}` }],
   })),
   ...extra,
});
const okResponse = (...items) => ({ status: 200, data: items });
const renderHistory = (idProfile = 2, userExtra = {}) =>
   renderPage(<HistoryPage />, { context: { user: buildUser(idProfile, userExtra) } });
const searchInput = () => screen.getByPlaceholderText('Busca nombre de solicitante');
const searchButton = () => screen.getByRole('button', { name: 'Buscar' });

describe('Shared History page', () => {
   describe('query by profile', () => {
      test('requests the finished and cancelled statuses for profiles without a special filter', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));

         renderHistory(2);

         await screen.findByText('Grupo 1');
         expect(getQueryGraph).toHaveBeenCalledTimes(1);
         expect(getQueryGraph).toHaveBeenCalledWith({ status: '12, 23, 24', page: 0 });
      });

      test.each([
         ['analysts filter by their own analyst id', 1, 'idAnalyst'],
         ['specialists filter by the user that created the request', 3, 'userCreate'],
      ])('%s', async (_label, idProfile, key) => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));

         renderHistory(idProfile);

         await screen.findByText('Grupo 1');
         expect(getQueryGraph).toHaveBeenCalledWith({ status: '12, 23, 24', [key]: 'user.ad', page: 0 });
      });

      test('faculties request the finished requests of their zone that have comments', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));

         renderHistory(6);

         await screen.findByText('Grupo 1');
         expect(getQueryGraph).toHaveBeenCalledWith({
            status: '12',
            byZone: 'Z1',
            hasChats: true,
            searchGroupsRecLC: true,
            page: 0,
         });
      });

      test('secretaries request the finished requests', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));

         renderHistory(5);

         await screen.findByText('Grupo 1');
         expect(getQueryGraph).toHaveBeenCalledWith({ status: '12', searchGroupsRecLC: true, page: 0 });
      });

      test('does not request anything without a user profile', () => {
         renderPage(<HistoryPage />, { context: { user: undefined } });

         expect(getQueryGraph).not.toHaveBeenCalled();
      });
   });

   describe('table', () => {
      test('shows the heading and the loading table first', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));

         renderHistory();

         expect(screen.getByRole('heading', { name: 'Historial de solicitudes' })).toBeInTheDocument();
         expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
         await screen.findByText('Grupo 1');
         expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
      });

      test('shows the number of applicants of each group in the default table', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1, 1), buildItem(2, 3)));

         renderHistory();

         expect(await screen.findByText('1 Solicitante')).toBeInTheDocument();
         expect(screen.getByText('3 Solicitantes')).toBeInTheDocument();
         screen.getAllByRole('link', { name: 'Visualizar' }).forEach((link, index) =>
            expect(link).toHaveAttribute('href', `/Shared/History/${index + 1}`)
         );
      });

      test('shows the empty message when there are no requests', async () => {
         getQueryGraph.mockResolvedValue(okResponse());

         renderHistory();

         expect(await screen.findByText('No hay solicitudes por revisar')).toBeInTheDocument();
      });

      test('reports the total pages of the result, defaulting to 1', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1, 1, { totalPages: 4 })));
         const { context } = renderHistory();
         await screen.findByText('Grupo 1');
         expect(context.actions.setPagination).toHaveBeenCalledWith({ sourceTotalPages: 4 });
      });

      test('shows the secretary table with a details button that opens the group responsible people', async () => {
         getQueryGraph.mockResolvedValue(
            okResponse(buildItem(1, 1, { nameAnalyst: 'Ana Analista', nameEmg: 'Ema Especialista' }))
         );
         const { user } = renderHistory(5);

         await screen.findByText('Grupo 1');
         await user.click(screen.getByTestId('btn-details-1'));

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
               html: expect.stringContaining('Ana Analista'),
               showCloseButton: true,
            })
         );
         expect(Swal.fire.mock.calls[0][0].html).toContain('Ema Especialista');
      });

      test('shows the faculty table with a link to the comments only for requests that have them', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1, 1, { hasChats: true }), buildItem(2)));

         renderHistory(6);

         await screen.findByText('Grupo 1');
         expect(document.querySelector('a[href="/FAC/RequestsReview/1"]')).toBeInTheDocument();
         expect(document.querySelector('a[href="/FAC/RequestsReview/2"]')).not.toBeInTheDocument();
      });

      test('shows the error and keeps the loading table when the service answers with another status', async () => {
         getQueryGraph.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderHistory();

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
      });
   });

   describe('pagination', () => {
      test('appends the next source page to the current requests', async () => {
         getQueryGraph.mockResolvedValueOnce(okResponse(buildItem(1))).mockResolvedValueOnce(okResponse(buildItem(2)));
         const { updateContext, context } = renderHistory();
         await screen.findByText('Grupo 1');

         updateContext({ pagination: { ...context.pagination, sourcePage: 1 } });

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
         expect(screen.getByText('Grupo 1')).toBeInTheDocument();
         expect(getQueryGraph).toHaveBeenLastCalledWith({ status: '12, 23, 24', page: 1 });
      });
   });

   describe('search by applicant name', () => {
      test('disables the search button until a name is typed', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));
         const { user } = renderHistory();
         await screen.findByText('Grupo 1');
         expect(searchButton()).toBeDisabled();

         await user.type(searchInput(), 'ana');

         expect(searchButton()).toBeEnabled();
      });

      test('replaces the requests with the result of the search and goes back to the first table page', async () => {
         getQueryGraph.mockResolvedValueOnce(okResponse(buildItem(1))).mockResolvedValueOnce(okResponse(buildItem(2)));
         const { user, context } = renderHistory();
         await screen.findByText('Grupo 1');

         await user.type(searchInput(), 'ana');
         await user.click(searchButton());

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
         expect(screen.queryByText('Grupo 1')).not.toBeInTheDocument();
         expect(getQueryGraph).toHaveBeenLastCalledWith({ status: '12, 23, 24', page: 0, name: 'ana' });
         expect(context.actions.setPagination).toHaveBeenCalledWith({ currentPage: 1 });
      });

      test('searches when the form is submitted with Enter', async () => {
         getQueryGraph.mockResolvedValueOnce(okResponse(buildItem(1))).mockResolvedValueOnce(okResponse(buildItem(2)));
         const { user } = renderHistory();
         await screen.findByText('Grupo 1');

         await user.type(searchInput(), 'ana{Enter}');

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
      });

      test('reloads the original list when the search text is cleared after searching', async () => {
         getQueryGraph
            .mockResolvedValueOnce(okResponse(buildItem(1)))
            .mockResolvedValueOnce(okResponse(buildItem(2)))
            .mockResolvedValueOnce(okResponse(buildItem(1)));
         const { user } = renderHistory();
         await screen.findByText('Grupo 1');
         await user.type(searchInput(), 'ana');
         await user.click(searchButton());
         await screen.findByText('Grupo 2');

         await user.clear(searchInput());

         expect(await screen.findByText('Grupo 1')).toBeInTheDocument();
         expect(screen.queryByText('Grupo 2')).not.toBeInTheDocument();
         expect(getQueryGraph).toHaveBeenLastCalledWith({ status: '12, 23, 24', page: 0 });
      });

      test('does not append more source pages while a search result is shown', async () => {
         getQueryGraph.mockResolvedValueOnce(okResponse(buildItem(1))).mockResolvedValueOnce(okResponse(buildItem(2)));
         const { user, updateContext, context } = renderHistory();
         await screen.findByText('Grupo 1');
         await user.type(searchInput(), 'ana');
         await user.click(searchButton());
         await screen.findByText('Grupo 2');

         updateContext({ pagination: { ...context.pagination, sourcePage: 1 } });

         expect(getQueryGraph).toHaveBeenCalledTimes(2);
      });
   });
});
