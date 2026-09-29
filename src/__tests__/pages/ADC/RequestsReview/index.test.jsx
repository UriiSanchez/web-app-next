import { screen } from '@testing-library/react';
import Swal from 'sweetalert2';

import RequestReview from '../../../../pages/ADC/RequestsReview';
import { getRequestStatus } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getRequestStatus: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const STATUS = '4,5,6,8,9,22,26';
const analyst = { userAD: 'ana.ad', path: 'ADC', fullName: 'Ana Analista', idProfile: 1 };

const buildItem = (idGroup, extra = {}) => ({
   idGroup,
   groupName: `Grupo ${idGroup}`,
   arrivedAcDate: '2025-06-03T08:46:12',
   idCatStatus: 4,
   requestAmount: 3000,
   notional: '120',
   nameEmg: `Especialista ${idGroup}`,
   branchOffice: 'CORPORATIVO',
   isGroup: true,
   totalPages: 2,
   requestResponseList: [],
   ...extra,
});
const okResponse = (...items) => ({ status: 200, data: items });
const renderReview = (context = {}) => renderPage(<RequestReview />, { context: { user: analyst, ...context } });

describe('ADC RequestsReview page', () => {
   describe('loading requests', () => {
      test('requests the analyst statuses filtered by the active analyst', async () => {
         getRequestStatus.mockResolvedValue(okResponse(buildItem(1)));

         renderReview();

         await screen.findByText('Grupo 1');
         expect(getRequestStatus).toHaveBeenCalledTimes(1);
         expect(getRequestStatus).toHaveBeenCalledWith(STATUS, 0, ' idAnalyst: "ana.ad"');
      });

      test('does not request anything without an active analyst user', () => {
         renderReview({ user: { ...analyst, userAD: undefined } });

         expect(getRequestStatus).not.toHaveBeenCalled();
         expect(screen.queryByText('No hay solicitudes por revisar')).not.toBeInTheDocument();
      });

      test('shows the heading and the requests in the table', async () => {
         getRequestStatus.mockResolvedValue(okResponse(buildItem(1), buildItem(2)));

         renderReview();

         expect(screen.getByRole('heading', { name: 'Solicitudes por revisar' })).toBeInTheDocument();
         expect(await screen.findByText('Grupo 1')).toBeInTheDocument();
         expect(screen.getByText('Grupo 2')).toBeInTheDocument();
         expect(screen.getByText('Especialista 1')).toBeInTheDocument();
      });

      test('shows the empty message when there are no requests', async () => {
         getRequestStatus.mockResolvedValue(okResponse());

         renderReview();

         expect(await screen.findByText('No se encontraron registros')).toBeInTheDocument();
      });

      test('reports the total pages of the first result', async () => {
         getRequestStatus.mockResolvedValue(okResponse(buildItem(1, { totalPages: 5 })));
         const { context } = renderReview();

         await screen.findByText('Grupo 1');

         expect(context.actions.setPagination).toHaveBeenCalledWith({ sourceTotalPages: 5 });
      });

      test('shows the error and the empty message when the service answers with another status', async () => {
         getRequestStatus.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderReview();

         expect(await screen.findByText('No se encontraron registros')).toBeInTheDocument();
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
      });
   });

   describe('pagination', () => {
      test('requests the current source page', async () => {
         getRequestStatus.mockResolvedValue(okResponse(buildItem(9)));

         renderReview({ pagination: { currentPage: 1, totalPages: 1, sourcePage: 3, sourceTotalPages: 5 } });

         await screen.findByText('Grupo 9');
         expect(getRequestStatus).toHaveBeenCalledWith(STATUS, 3, ' idAnalyst: "ana.ad"');
      });

      test('appends the next source page to the current requests', async () => {
         getRequestStatus
            .mockResolvedValueOnce(okResponse(buildItem(1)))
            .mockResolvedValueOnce(okResponse(buildItem(2)));
         const { updateContext, context } = renderReview();
         await screen.findByText('Grupo 1');

         updateContext({ pagination: { ...context.pagination, sourcePage: 1 } });

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
         expect(screen.getByText('Grupo 1')).toBeInTheDocument();
      });
   });

   describe('opening a request', () => {
      test('clears the stored group and goes to the checklist of the analyst', async () => {
         localStorage.setItem('idGroup', '7');
         getRequestStatus.mockResolvedValue(okResponse(buildItem(1)));
         const { user, router } = renderReview();

         await user.click(await screen.findByText('Grupo 1'));

         expect(localStorage.getItem('idGroup')).toBeNull();
         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/1');
      });
   });
});
