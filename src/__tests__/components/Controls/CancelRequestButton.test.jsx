import { act, screen } from '@testing-library/react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import { CancelRequestButton } from '../../../components/Controls/CancelRequestButton';
import { onChangeRequestStatusOrAssignUser } from '../../../services';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../services', () => ({ onChangeRequestStatusOrAssignUser: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const analystUser = { userAD: 'ana', idProfile: 3, status: [2, 4], path: 'FAC' };

function setup({ user = analystUser, props = {}, userOptions } = {}) {
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const actions = createActions();
   const wrapper = createContextWrapper({ user, actions });
   const utils = renderComponent(<CancelRequestButton idCatStatus={4} idGroup={7} {...props} />, {
      wrapper,
      userOptions,
   });
   return { router, actions, ...utils };
}

const getTriggerButton = () => screen.getByTestId('Boton cancelar solicitud');

describe('CancelRequestButton', () => {
   describe('permissions', () => {
      test.each([
         ['an EMG user whose statuses include the request status', analystUser, 4, false],
         ['an LDC user whose statuses include the request status', { ...analystUser, idProfile: 4 }, 4, false],
         ['a user whose statuses do not include the request status', analystUser, 9, true],
         ['a user with another profile', { ...analystUser, idProfile: 1 }, 4, true],
         ['a missing user', {}, 4, true],
      ])('for %s', (_label, user, idCatStatus, shouldBeDisabled) => {
         setup({ user, props: { idCatStatus } });

         if (shouldBeDisabled) {
            expect(getTriggerButton()).toBeDisabled();
         } else {
            expect(getTriggerButton()).toBeEnabled();
            expect(screen.getByText('Cancelar solicitud')).toBeInTheDocument();
         }
      });

      test('does not show the hover label when cancelling is not allowed', () => {
         setup({ props: { idCatStatus: 9 } });

         expect(screen.queryByText('Cancelar solicitud')).not.toBeInTheDocument();
      });
   });

   describe('confirmation modal', () => {
      test('opens the confirmation and "Regresar" closes it without calling the service', async () => {
         const { user } = setup();
         expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument();

         await user.click(getTriggerButton());
         expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));
         expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument();
         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      });
   });

   describe('cancelling', () => {
      beforeEach(() => {
         jest.useFakeTimers();
      });

      const setupFake = (options) =>
         setup({ ...options, userOptions: { advanceTimers: jest.advanceTimersByTime } });

      test('cancels the request, notifies and redirects to the requests page', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user, router, actions } = setupFake();
         await user.click(getTriggerButton());

         await user.click(screen.getByRole('button', { name: 'Cancelar' }));

         expect(actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Cancelando solicitud...');
         expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
            idGroupRequest: 7,
            idCatStatus: 23,
            nextProfile: 'EF',
            userCreate: 'ana',
         });
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ html: expect.stringContaining('Solicitud cancelada.') }));
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
         expect(router.push).not.toHaveBeenCalled();

         act(() => jest.advanceTimersByTime(3000));

         expect(router.push).toHaveBeenCalledWith('/FAC/RequestsReview');
      });

      test('shows the service message and does not redirect when the status is not 204', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({
            status: 409,
            error: { response: { message: 'La solicitud ya fue procesada' } },
         });
         const { user, router, actions } = setupFake();
         await user.click(getTriggerButton());

         await user.click(screen.getByRole('button', { name: 'Cancelar' }));

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: 'La solicitud ya fue procesada', icon: 'warning' })
         );
         act(() => jest.advanceTimersByTime(3000));
         expect(router.push).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });

      test('logs unexpected failures and always turns the loader off', async () => {
         const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
         const failure = new Error('network down');
         onChangeRequestStatusOrAssignUser.mockRejectedValue(failure);
         const { user, router, actions } = setupFake();
         await user.click(getTriggerButton());

         await user.click(screen.getByRole('button', { name: 'Cancelar' }));

         expect(consoleLog).toHaveBeenCalledWith('Cancelación de solicitud: ', failure);
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
         expect(router.push).not.toHaveBeenCalled();
      });
   });
});
