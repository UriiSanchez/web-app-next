import { screen } from '@testing-library/react';
import Swal from 'sweetalert2';

import RequestReview from '../../../../pages/EMG/RequestsReview';
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

const STATUS = '1,2,3,4,5,6,7,8,9,22,26';
const specialist = { userAD: 'emg.ad', path: 'EMG', fullName: 'Ema Especialista', idProfile: 3 };

const buildItem = (idGroup, extra = {}) => ({
   idGroup,
   groupName: `Grupo ${idGroup}`,
   arrivedAcDate: '2025-06-03T08:46:12',
   idCatStatus: 3,
   idCatTypeProcedure: 3,
   requestAmount: 3000,
   notional: '120',
   idAnalyst: `analista${idGroup}`,
   isGroup: true,
   totalPages: 2,
   requestResponseList: [],
   ...extra,
});
const okResponse = (...items) => ({ status: 200, data: items });
const renderReview = (context = {}) => renderPage(<RequestReview />, { context: { user: specialist, ...context } });

describe('EMG RequestsReview page', () => {
   describe('loading requests', () => {
      test('requests the statuses created by the active specialist', async () => {
         getRequestStatus.mockResolvedValue(okResponse(buildItem(1)));

         renderReview();

         await screen.findByText('Grupo 1');
         expect(getRequestStatus).toHaveBeenCalledTimes(1);
         expect(getRequestStatus).toHaveBeenCalledWith(STATUS, 0, ' userCreate: "emg.ad"');
      });

      test('does not request anything without an active user', () => {
         renderReview({ user: { ...specialist, userAD: undefined } });

         expect(getRequestStatus).not.toHaveBeenCalled();
      });

      test('shows the heading and the requests in the table', async () => {
         getRequestStatus.mockResolvedValue(okResponse(buildItem(1), buildItem(2)));

         renderReview();

         expect(screen.getByRole('heading', { name: 'Solicitudes asignadas' })).toBeInTheDocument();
         expect(await screen.findByText('Grupo 1')).toBeInTheDocument();
         expect(screen.getByText('Grupo 2')).toBeInTheDocument();
         expect(screen.getByText('analista2')).toBeInTheDocument();
      });

      test('shows the empty message when there are no requests', async () => {
         getRequestStatus.mockResolvedValue(okResponse());

         renderReview();

         expect(await screen.findByText('No hay solicitudes ingresadas')).toBeInTheDocument();
      });

      test('reports the total pages of the first result', async () => {
         getRequestStatus.mockResolvedValue(okResponse(buildItem(1, { totalPages: 6 })));
         const { context } = renderReview();

         await screen.findByText('Grupo 1');

         expect(context.actions.setPagination).toHaveBeenCalledWith({ sourceTotalPages: 6 });
      });

      test('shows the error and the empty message when the service answers with another status', async () => {
         getRequestStatus.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderReview();

         expect(await screen.findByText('No hay solicitudes ingresadas')).toBeInTheDocument();
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
      });

      test('requests the current source page and appends the next one', async () => {
         getRequestStatus
            .mockResolvedValueOnce(okResponse(buildItem(1)))
            .mockResolvedValueOnce(okResponse(buildItem(2)));
         const { updateContext, context } = renderReview();
         await screen.findByText('Grupo 1');

         updateContext({ pagination: { ...context.pagination, sourcePage: 1 } });

         expect(await screen.findByText('Grupo 2')).toBeInTheDocument();
         expect(screen.getByText('Grupo 1')).toBeInTheDocument();
         expect(getRequestStatus).toHaveBeenLastCalledWith(STATUS, 1, ' userCreate: "emg.ad"');
      });
   });

   describe('opening a request', () => {
      test('goes to the checklist when the request is at the checklist step', async () => {
         localStorage.setItem('idGroup', '7');
         getRequestStatus.mockResolvedValue(okResponse(buildItem(1, { idCatTypeProcedure: 3 })));
         const { user, router } = renderReview();

         await user.click(await screen.findByText('Grupo 1'));

         expect(localStorage.getItem('idGroup')).toBeNull();
         expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/1');
      });

      test('goes to the solidary obligors page for any other procedure step', async () => {
         getRequestStatus.mockResolvedValue(okResponse(buildItem(2, { idCatTypeProcedure: 2 })));
         const { user, router } = renderReview();

         await user.click(await screen.findByText('Grupo 2'));

         expect(router.push).toHaveBeenCalledWith('/EMG/Solidary/2');
      });

      test('does not navigate when the request is finished but still clears the stored group', async () => {
         localStorage.setItem('idGroup', '7');
         getRequestStatus.mockResolvedValue(okResponse(buildItem(3, { idCatStatus: 12 })));
         const { user, router } = renderReview();

         await user.click(await screen.findByText('Grupo 3'));

         expect(localStorage.getItem('idGroup')).toBeNull();
         expect(router.push).not.toHaveBeenCalled();
      });
   });
});
