import { screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { HeaderTitle } from '../../../components/Controls/HeaderTitle';
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

const wrapper = createContextWrapper({
   listAnalyst,
   user: { userAD: 'leader1', idProfile: 3, status: [3], path: 'FAC' },
   actions: createActions(),
});
const request = { idCatStatus: 3, idGroup: 1, idLeader: 'leader1', idAnalyst: '' };

const renderHeader = (props) => renderComponent(<HeaderTitle title='Solicitud 1' {...props} />, { wrapper });

beforeEach(() => {
   useRouter.mockReturnValue(createRouter());
});

describe('HeaderTitle', () => {
   test('renders the title as a heading with a tooltip', () => {
      renderHeader();

      expect(screen.getByRole('heading', { name: 'Solicitud 1' })).toHaveAttribute('title', 'Solicitud 1');
   });

   test('renders only visible buttons and runs their action on click', async () => {
      const save = jest.fn();
      const hidden = jest.fn();
      const { user } = renderHeader({
         buttons: [
            { id: 'save', label: 'Guardar', isVisible: true, toAction: save },
            { id: 'hidden', label: 'Oculto', isVisible: false, toAction: hidden },
         ],
      });

      expect(screen.queryByRole('button', { name: 'Oculto' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(save).toHaveBeenCalledTimes(1);
      expect(hidden).not.toHaveBeenCalled();
   });

   test('disables a button with isDisable and links it to a form', async () => {
      const toAction = jest.fn();
      const { user } = renderHeader({
         buttons: [
            { id: 'a', label: 'Enviar', isVisible: true, isDisable: true, toAction, form: 'main-form' },
            { id: 'b', label: 'Otro', isVisible: true, toAction },
         ],
      });
      const disabled = screen.getByRole('button', { name: 'Enviar' });

      await user.click(disabled);

      expect(disabled).toBeDisabled();
      expect(disabled).toHaveAttribute('form', 'main-form');
      expect(screen.getByRole('button', { name: 'Otro' })).toBeEnabled();
      expect(toAction).not.toHaveBeenCalled();
   });

   test('shows the analyst ball and cancel button only when requested and a request exists', () => {
      const { rerender } = renderHeader({ request, showBall: true, showCancel: true });
      expect(screen.getByTestId('analyst-select-ball')).toBeInTheDocument();
      expect(screen.getByTestId('Boton cancelar solicitud')).toBeEnabled();

      rerender(<HeaderTitle title='Solicitud 1' request={request} />);
      expect(screen.queryByTestId('analyst-select-ball')).not.toBeInTheDocument();
      expect(screen.queryByTestId('Boton cancelar solicitud')).not.toBeInTheDocument();

      rerender(<HeaderTitle title='Solicitud 1' showBall showCancel />);
      expect(screen.queryByTestId('analyst-select-ball')).not.toBeInTheDocument();
      expect(screen.queryByTestId('Boton cancelar solicitud')).not.toBeInTheDocument();
   });
});
