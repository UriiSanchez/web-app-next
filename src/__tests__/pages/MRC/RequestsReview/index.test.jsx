import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import RequestReview from '../../../../pages/MRC/RequestsReview';
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

const STATUS = '2,3,4,5,6,7,8,9,22,26';

const buildItem = (idGroup, extra = {}) => ({
   idGroup,
   groupName: `Grupo ${idGroup}`,
   arrivedMrDate: '2025-06-03T08:40:32',
   idCatStatus: 2,
   requestAmount: 3000,
   nameEmg: `Especialista ${idGroup}`,
   branchOffice: 'CORPORATIVO',
   isGroup: true,
   totalPages: 3,
   requestResponseList: [],
   ...extra,
});
const okResponse = (...items) => ({ status: 200, data: items });

describe('MRC RequestsReview page', () => {
   describe('loading requests', () => {
      test('requests the first page of the receiving desk statuses', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));

         renderPage(<RequestReview />);

         await screen.findByText('Grupo 1');
         expect(getQueryGraph).toHaveBeenCalledTimes(1);
         expect(getQueryGraph).toHaveBeenCalledWith({ status: STATUS, page: 0 });
      });

      test('shows the heading and the requests in the table', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1), buildItem(2)));

         renderPage(<RequestReview />);

         expect(screen.getByRole('heading', { name: 'Solicitudes por revisar' })).toBeInTheDocument();
         expect(await screen.findByText('Grupo 1')).toBeInTheDocument();
         expect(screen.getByText('Grupo 2')).toBeInTheDocument();
         expect(screen.getByText('Especialista 2')).toBeInTheDocument();
      });

      test('does not show the empty message while the request is loading', () => {
         getQueryGraph.mockReturnValue(new Promise(() => {}));

         renderPage(<RequestReview />);

         expect(screen.queryByText('No hay solicitudes por revisar')).not.toBeInTheDocument();
         expect(screen.queryByText('Grupo 1')).not.toBeInTheDocument();
      });

      test('shows the empty message when there are no requests', async () => {
         getQueryGraph.mockResolvedValue(okResponse());

         renderPage(<RequestReview />);

         expect(await screen.findByText('No hay solicitudes por revisar')).toBeInTheDocument();
      });

      test('reports the total pages of the first result', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1, { totalPages: 4 })));
         const { context } = renderPage(<RequestReview />);

         await screen.findByText('Grupo 1');

         expect(context.actions.setPagination).toHaveBeenCalledWith({ sourceTotalPages: 4 });
      });

      test('shows the error and the empty message when the service answers with another status', async () => {
         getQueryGraph.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderPage(<RequestReview />);

         expect(await screen.findByText('No hay solicitudes por revisar')).toBeInTheDocument();
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
      });
   });

   describe('pagination', () => {
      test('requests the current source page', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(9)));

         renderPage(<RequestReview />, {
            context: { pagination: { currentPage: 1, totalPages: 1, sourcePage: 2, sourceTotalPages: 4 } },
         });

         await screen.findByText('Grupo 9');
         expect(getQueryGraph).toHaveBeenCalledWith({ status: STATUS, page: 2 });
      });

      test('appends the next source page to the current requests', async () => {
         getQueryGraph
            .mockResolvedValueOnce(okResponse(buildItem(1)))
            .mockResolvedValueOnce(okResponse(buildItem(2)));
         const { updateContext, context } = renderPage(<RequestReview />);
         await screen.findByText('Grupo 1');

         updateContext({ pagination: { ...context.pagination, sourcePage: 1 } });

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
         expect(screen.getByText('Grupo 1')).toBeInTheDocument();
         expect(getQueryGraph).toHaveBeenLastCalledWith({ status: STATUS, page: 1 });
      });

      test('resets the source pagination when leaving the page', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));
         const { unmount, context } = renderPage(<RequestReview />);
         await screen.findByText('Grupo 1');

         unmount();

         expect(context.actions.setPagination).toHaveBeenLastCalledWith({ sourcePage: 0, sourceTotalPages: 0 });
      });
   });

   describe('opening a request', () => {
      test('clears the stored group and goes to the checklist of the receiving desk', async () => {
         localStorage.setItem('idGroup', '7');
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1)));
         const { user, router } = renderPage(<RequestReview />);

         await user.click(await screen.findByText('Grupo 1'));

         expect(localStorage.getItem('idGroup')).toBeNull();
         expect(router.push).toHaveBeenCalledWith('/MRC/Documentation/1');
      });

      test('opens the request that was clicked', async () => {
         getQueryGraph.mockResolvedValue(okResponse(buildItem(1), buildItem(2)));
         const { user, router } = renderPage(<RequestReview />);

         await user.click(await screen.findByText('Grupo 2'));

         await waitFor(() => expect(router.push).toHaveBeenCalledTimes(1));
         expect(router.push).toHaveBeenCalledWith('/MRC/Documentation/2');
      });
   });
});
