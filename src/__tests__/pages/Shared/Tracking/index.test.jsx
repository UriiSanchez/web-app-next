import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import TrackingPage from '../../../../pages/Shared/Tracking';
import { getTrackingGraph } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getTrackingGraph: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const STATUS = '2,3,4,5,6,7,8,9,12,22,23,24,26';
const viewer = { userAD: 'mrc.ad', path: 'MRC', idProfile: 2, status: [] };

const buildItem = (idGroup, extra = {}) => ({
   idGroup,
   groupName: `Grupo ${idGroup}`,
   branchOffice: 'CORPORATIVO',
   requestPerGroup: 1,
   arrivedMrDate: '2025-06-03T08:46:12',
   quorumReachedDate: '2025-06-04T08:46:12',
   requestAmount: 2000,
   authorizationAmount: 1500,
   kindGroupProcedure: 'Nuevo',
   substatus: 'En análisis',
   statusName: 'En proceso',
   totalTime: '2 días',
   totalPages: 1,
   ...extra,
});
// Una página completa del servicio: 10 solicitudes por página.
const buildPage = (firstId, count = 10, extra = {}) =>
   Array.from({ length: count }, (_v, i) => buildItem(firstId + i, extra));
const okResponse = (data) => ({ status: 200, data });

const renderTracking = (pagination = { currentPage: 1, totalPages: 1 }) =>
   renderPage(<TrackingPage />, {
      context: { user: viewer, pagination: { ...pagination, sourcePage: 0, sourceTotalPages: 0 } },
   });

describe('Shared Tracking page', () => {
   describe('loading', () => {
      test('requests the first page with the applied filters as soon as the filters are ready', async () => {
         getTrackingGraph.mockResolvedValue(okResponse(buildPage(1, 2)));

         renderTracking();

         await screen.findByText('Grupo 1');
         expect(getTrackingGraph).toHaveBeenCalledTimes(1);
         expect(getTrackingGraph).toHaveBeenCalledWith(
            expect.objectContaining({ status: STATUS, page: 1, byDateRange: expect.stringContaining(', ') })
         );
      });

      test('shows the heading, a disabled download button and the loading table first', async () => {
         getTrackingGraph.mockResolvedValue(okResponse(buildPage(1, 1)));

         renderTracking();

         expect(screen.getByRole('heading', { name: 'Seguimiento' })).toBeInTheDocument();
         expect(screen.getByRole('button', { name: /Descargar/ })).toBeDisabled();
         expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
         await screen.findByText('Grupo 1');
         expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
      });

      test('shows the requests of the page in the table', async () => {
         getTrackingGraph.mockResolvedValue(okResponse(buildPage(1, 3)));

         renderTracking();

         expect(await screen.findByText('Grupo 3')).toBeInTheDocument();
         expect(screen.getAllByText('En proceso')).toHaveLength(3);
         expect(screen.getAllByText('CORPORATIVO')).toHaveLength(3);
      });

      test('shows the empty message when there are no requests', async () => {
         getTrackingGraph.mockResolvedValue(okResponse([]));

         renderTracking();

         expect(await screen.findByText('No se encontraron registros')).toBeInTheDocument();
      });

      test('shows the empty message and keeps the pages when the service answers with another status', async () => {
         getTrackingGraph.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });
         const { context } = renderTracking();

         expect(await screen.findByText('No se encontraron registros')).toBeInTheDocument();
         expect(context.actions.setPagination).toHaveBeenCalledWith({ totalPages: 1 });
      });

      test('reports the total pages of the result', async () => {
         getTrackingGraph.mockResolvedValue(okResponse(buildPage(1, 2, { totalPages: 4 })));
         const { context } = renderTracking();

         await screen.findByText('Grupo 1');

         expect(context.actions.setPagination).toHaveBeenCalledWith({ totalPages: 4 });
         expect(context.actions.setPagination).toHaveBeenCalledWith({ currentPage: 1 });
      });

      test('shows the error when the service throws and stops loading', async () => {
         getTrackingGraph.mockRejectedValue(new Error('boom'));

         renderTracking();

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(await screen.findByText('No se encontraron registros')).toBeInTheDocument();
      });
   });

   describe('pagination', () => {
      test('loads the next page and asks the context to move to it', async () => {
         getTrackingGraph
            .mockResolvedValueOnce(okResponse(buildPage(1, 10, { totalPages: 2 })))
            .mockResolvedValueOnce(okResponse(buildPage(11, 3, { totalPages: 2 })));
         const { user, context } = renderTracking({ currentPage: 1, totalPages: 2 });
         await screen.findByText('Grupo 10');

         await user.click(screen.getByRole('button', { name: 'Siguiente' }));

         await waitFor(() => expect(getTrackingGraph).toHaveBeenCalledTimes(2));
         expect(getTrackingGraph).toHaveBeenLastCalledWith(expect.objectContaining({ status: STATUS, page: 2 }));
         expect(context.actions.setPagination).toHaveBeenCalledWith({ currentPage: 2 });
      });

      test('shows the requests of the current page of the loaded ones', async () => {
         getTrackingGraph
            .mockResolvedValueOnce(okResponse(buildPage(1, 10, { totalPages: 2 })))
            .mockResolvedValueOnce(okResponse(buildPage(11, 3, { totalPages: 2 })));
         const { user, updateContext, context } = renderTracking({ currentPage: 1, totalPages: 2 });
         await screen.findByText('Grupo 10');
         await user.click(screen.getByRole('button', { name: 'Siguiente' }));
         await waitFor(() => expect(getTrackingGraph).toHaveBeenCalledTimes(2));

         updateContext({ pagination: { ...context.pagination, currentPage: 2 } });

         expect(await screen.findByText('Grupo 12')).toBeInTheDocument();
         expect(screen.queryByText('Grupo 1')).not.toBeInTheDocument();
      });

      test('does not request a page that is already loaded', async () => {
         getTrackingGraph
            .mockResolvedValueOnce(okResponse(buildPage(1, 10, { totalPages: 2 })))
            .mockResolvedValueOnce(okResponse(buildPage(11, 3, { totalPages: 2 })));
         const { user, updateContext, context } = renderTracking({ currentPage: 1, totalPages: 2 });
         await screen.findByText('Grupo 10');
         await user.click(screen.getByRole('button', { name: 'Siguiente' }));
         await waitFor(() => expect(getTrackingGraph).toHaveBeenCalledTimes(2));
         updateContext({ pagination: { ...context.pagination, currentPage: 2 } });
         await screen.findByText('Grupo 12');

         await user.click(screen.getByRole('button', { name: 'Primera' }));

         expect(getTrackingGraph).toHaveBeenCalledTimes(2);
         expect(context.actions.setPagination).toHaveBeenCalledWith({ currentPage: 1 });
      });
   });

   describe('filters', () => {
      test('requests the first page again with the typed name after the debounce and replaces the results', async () => {
         getTrackingGraph
            .mockResolvedValueOnce(okResponse(buildPage(1, 2)))
            .mockResolvedValueOnce(okResponse([buildItem(50)]));
         const { user, context } = renderTracking();
         await screen.findByText('Grupo 1');

         await user.type(screen.getByPlaceholderText('Busca por nombre o grupo'), 'ana');

         await waitFor(
            () =>
               expect(getTrackingGraph).toHaveBeenLastCalledWith(
                  expect.objectContaining({ status: STATUS, page: 1, searchByName: 'ana' })
               ),
            { timeout: 4000 }
         );
         expect(await screen.findByText('Grupo 50')).toBeInTheDocument();
         expect(screen.queryByText('Grupo 1')).not.toBeInTheDocument();
         expect(context.actions.setPagination).toHaveBeenCalledWith({ currentPage: 1 });
      });
   });
});
