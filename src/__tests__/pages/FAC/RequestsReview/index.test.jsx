import { screen } from '@testing-library/react';
import Swal from 'sweetalert2';

import RequestReview from '../../../../pages/FAC/RequestsReview';
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

const faculty = { userAD: 'fac.ad', path: 'FAC', idZone: 'Z1', fullName: 'Fabio Facultado', idProfile: 6 };
const baseParams = { status: '6,26', byZone: 'Z1', searchGroupsRecLC: true };

const buildItem = (idGroup, extra = {}) => ({
   idGroup,
   groupName: `Grupo ${idGroup}`,
   arrivedFcDate: '2025-06-03T08:46:12',
   idCatStatus: 26,
   approvedAmount: 2000,
   numApplicants: 2,
   kindGroupProcedure: 'Nuevo',
   instanceEmpowered: 'Comité',
   status: 'En revisión facultado',
   isGroup: true,
   totalPages: 3,
   requestResponseList: [],
   ...extra,
});
const okResponse = (...items) => ({ status: 200, data: items });
const renderReview = (context = {}) => renderPage(<RequestReview />, { context: { user: faculty, ...context } });
const searchInput = () => screen.getByPlaceholderText('Busca nombre de solicitante');
const searchButton = () => screen.getByRole('button', { name: 'Buscar' });

describe('FAC RequestsReview page', () => {
   describe('loading requests', () => {
      test('requests the pending statuses of the zone of the active faculty', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));

         renderReview();

         await screen.findByText('Grupo 1');
         expect(getQueryGraph).toHaveBeenCalledTimes(1);
         expect(getQueryGraph).toHaveBeenCalledWith({ ...baseParams, page: 0 });
      });

      test('does not request anything without an active user and keeps the loading table', () => {
         renderReview({ user: { ...faculty, userAD: undefined } });

         expect(getQueryGraph).not.toHaveBeenCalled();
         expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
      });

      test('shows the loading table first and then the requests', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1), buildItem(2)));

         renderReview();

         expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
         expect(await screen.findByText('Grupo 1')).toBeInTheDocument();
         expect(screen.getByText('Grupo 2')).toBeInTheDocument();
         expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
         expect(screen.getByRole('heading', { name: 'Por revisar' })).toBeInTheDocument();
      });

      test('shows the empty message when there are no requests', async () => {
         getQueryGraph.mockResolvedValue(okResponse());

         renderReview();

         expect(await screen.findByText('No se encontraron registros')).toBeInTheDocument();
      });

      test('reports the total pages of the result, defaulting to 1', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1, { totalPages: undefined })));
         const { context } = renderReview();

         await screen.findByText('Grupo 1');

         expect(context.actions.setPagination).toHaveBeenCalledWith({ sourceTotalPages: 1 });
      });

      // Comportamiento actual: en error execClientMethod devuelve [] sin apagar el indicador de carga,
      // de modo que la tabla se queda en «Cargando datos...». Se documenta como hallazgo.
      test('keeps the loading table after showing the error when the service fails (current behavior)', async () => {
         getQueryGraph.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderReview();

         await screen.findByText('Cargando datos...');
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
         expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
         expect(screen.queryByText('No se encontraron registros')).not.toBeInTheDocument();
      });

      test('appends the next source page to the current requests', async () => {
         getQueryGraph.mockResolvedValueOnce(okResponse(buildItem(1))).mockResolvedValueOnce(okResponse(buildItem(2)));
         const { updateContext, context } = renderReview();
         await screen.findByText('Grupo 1');

         updateContext({ pagination: { ...context.pagination, sourcePage: 1 } });

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
         expect(screen.getByText('Grupo 1')).toBeInTheDocument();
         expect(getQueryGraph).toHaveBeenLastCalledWith({ ...baseParams, page: 1 });
      });
   });

   describe('search by applicant name', () => {
      test('disables the search button until a name is typed', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));
         const { user } = renderReview();
         await screen.findByText('Grupo 1');
         expect(searchButton()).toBeDisabled();

         await user.type(searchInput(), 'ana');

         expect(searchButton()).toBeEnabled();
      });

      test('replaces the requests with the result of the search and goes back to the first table page', async () => {
         getQueryGraph
            .mockResolvedValueOnce(okResponse(buildItem(1)))
            .mockResolvedValueOnce(okResponse(buildItem(2)));
         const { user, context } = renderReview();
         await screen.findByText('Grupo 1');

         await user.type(searchInput(), 'ana');
         await user.click(searchButton());

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
         expect(screen.queryByText('Grupo 1')).not.toBeInTheDocument();
         expect(getQueryGraph).toHaveBeenLastCalledWith({ ...baseParams, status: '6, 26', page: 0, name: 'ana' });
         expect(context.actions.setPagination).toHaveBeenCalledWith({ currentPage: 1 });
      });

      test('searches when the form is submitted with Enter', async () => {
         getQueryGraph.mockResolvedValueOnce(okResponse(buildItem(1))).mockResolvedValueOnce(okResponse(buildItem(2)));
         const { user } = renderReview();
         await screen.findByText('Grupo 1');

         await user.type(searchInput(), 'ana{Enter}');

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
         expect(getQueryGraph).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'ana' }));
      });

      test('reloads the original list when the search text is cleared after searching', async () => {
         getQueryGraph
            .mockResolvedValueOnce(okResponse(buildItem(1)))
            .mockResolvedValueOnce(okResponse(buildItem(2)))
            .mockResolvedValueOnce(okResponse(buildItem(1)));
         const { user } = renderReview();
         await screen.findByText('Grupo 1');
         await user.type(searchInput(), 'ana');
         await user.click(searchButton());
         await screen.findByText('Grupo 2');

         await user.clear(searchInput());

         expect(await screen.findByText('Grupo 1')).toBeInTheDocument();
         expect(screen.queryByText('Grupo 2')).not.toBeInTheDocument();
         expect(getQueryGraph).toHaveBeenCalledTimes(3);
         expect(getQueryGraph).toHaveBeenLastCalledWith({ ...baseParams, page: 0 });
      });

      test('does not append more source pages while a search result is shown', async () => {
         getQueryGraph.mockResolvedValueOnce(okResponse(buildItem(1))).mockResolvedValueOnce(okResponse(buildItem(2)));
         const { user, updateContext, context } = renderReview();
         await screen.findByText('Grupo 1');
         await user.type(searchInput(), 'ana');
         await user.click(searchButton());
         await screen.findByText('Grupo 2');

         updateContext({ pagination: { ...context.pagination, sourcePage: 1 } });

         expect(getQueryGraph).toHaveBeenCalledTimes(2);
      });
   });

   describe('opening a request', () => {
      test('opens the details of a request that is pending faculty review', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1, { idCatStatus: 26 })));
         const { user, router } = renderReview();

         await user.click(await screen.findByText('Grupo 1'));

         expect(router.push).toHaveBeenCalledWith('/FAC/RequestsReview/1');
      });

      test('does not navigate for a request in another status', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1, { idCatStatus: 6 })));
         const { user, router } = renderReview();

         await user.click(await screen.findByText('Grupo 1'));

         expect(router.push).not.toHaveBeenCalled();
      });
   });
});
