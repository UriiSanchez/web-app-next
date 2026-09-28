import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import { ReassignmentAnalystBall } from '../../../components/Controls/ReassignmentAnalystBall';
import { onChangeRequestStatusOrAssignUser } from '../../../services';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';
import listAnalyst from '../../../__mocks__/analyst';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../services', () => ({ onChangeRequestStatusOrAssignUser: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const leader = { userAD: 'leader1' };
const baseRequest = { idGroup: 9, idLeader: 'leader1', idCatStatus: 3, idAnalyst: '' };

function setup({ user = leader, request = baseRequest } = {}) {
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const actions = createActions();
   const wrapper = createContextWrapper({ listAnalyst, user, actions });
   const utils = renderComponent(<ReassignmentAnalystBall request={request} />, {
      wrapper,
      userOptions: { advanceTimers: jest.advanceTimersByTime },
   });
   return { router, actions, ...utils };
}

beforeEach(() => {
   jest.useFakeTimers();
});

describe('ReassignmentAnalystBall', () => {
   describe('avatar', () => {
      test('shows the initials of the assigned analyst', () => {
         setup({ request: { ...baseRequest, idAnalyst: 'user2' } });

         expect(screen.getByText('UT')).toBeInTheDocument();
      });

      test('shows "SA" when nobody is assigned', () => {
         setup();

         expect(screen.getByText('SA')).toBeInTheDocument();
      });
   });

   describe('permissions', () => {
      test('does not open the list for a user who is not the leader', async () => {
         const { user } = setup({ user: { userAD: 'other' } });

         await user.click(screen.getByText('SA'));

         expect(screen.queryByText('Test User Analyst One')).not.toBeInTheDocument();
      });

      test('does not open the list when the request status does not allow reassignment', async () => {
         const { user } = setup({ request: { ...baseRequest, idCatStatus: 10 } });

         await user.click(screen.getByText('SA'));

         expect(screen.queryByText('Test User Analyst One')).not.toBeInTheDocument();
      });
   });

   describe('list', () => {
      test('lists every analyst plus "Sin asignar" when nobody is assigned', async () => {
         const { user } = setup();

         await user.click(screen.getByText('SA'));

         expect(screen.getByText('Sin asignar')).toBeInTheDocument();
         listAnalyst.forEach(({ fullName }) => expect(screen.getByText(fullName)).toBeInTheDocument());
      });

      test('"Sin asignar" only closes the list', async () => {
         const { user } = setup();
         await user.click(screen.getByText('SA'));

         await user.click(screen.getByText('Sin asignar'));

         expect(screen.queryByText('Test User Analyst One')).not.toBeInTheDocument();
         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      });

      test('closes when clicking outside', async () => {
         const { user } = setup();
         await user.click(screen.getByText('SA'));

         await user.click(document.body);

         expect(screen.queryByText('Test User Analyst One')).not.toBeInTheDocument();
      });
   });

   describe('assigning', () => {
      test('assigns the first analyst, notifies and reloads the page', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         localStorage.setItem('listAnalyst', 'cache');
         const { user, router, actions } = setup();
         await user.click(screen.getByText('SA'));

         await user.click(screen.getByText('Test User Analyst Two'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
         expect(actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Asignando a analista de contraparte...');
         expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
            {
               idGroupRequest: 9,
               nextProfile: 'AC',
               userCreate: 'leader1',
               idAnalyst: 'user2',
               idCatStatus: 4,
            },
            false
         );
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('¡Se asignó la solicitud con éxito!') })
         );
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
         expect(router.reload).not.toHaveBeenCalled();

         act(() => jest.advanceTimersByTime(1200));

         expect(router.reload).toHaveBeenCalledTimes(1);
         expect(localStorage.getItem('listAnalyst')).toBeNull();
      });

      test('reassigns to another analyst using the reassignment payload', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user } = setup({ request: { ...baseRequest, idAnalyst: 'user1' } });
         await user.click(screen.getByText('UO'));

         await user.click(screen.getByText('Test User Analyst Three'));

         await waitFor(() => expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalled());
         expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
            { idGroupRequest: 9, nextProfile: 'AC', userAD: 'user3' },
            true
         );
      });

      test('choosing the analyst already assigned does not call the service', async () => {
         const { user, actions } = setup({ request: { ...baseRequest, idAnalyst: 'user1' } });
         await user.click(screen.getByText('UO'));

         await user.click(screen.getByText('Test User Analyst One'));

         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
         expect(screen.queryByText('Test User Analyst Two')).not.toBeInTheDocument();
      });

      test('shows an error alert and does not reload when the service answers with a failure', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 400 });
         const { user, router, actions } = setup();
         await user.click(screen.getByText('SA'));

         await user.click(screen.getByText('Test User Analyst Two'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
               html: expect.stringContaining('¡La solicitud no pudo procesarse correctamente!'),
               icon: 'warning',
            })
         );
         act(() => jest.advanceTimersByTime(1200));
         expect(router.reload).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });

      test('shows an error alert when the service rejects', async () => {
         onChangeRequestStatusOrAssignUser.mockRejectedValue({ status: 500 });
         const { user, actions } = setup();
         await user.click(screen.getByText('SA'));

         await user.click(screen.getByText('Test User Analyst Two'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('¡Error interno del servidor!'), icon: 'error' })
         );
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });
   });
});
