import { screen } from '@testing-library/react';

import { QuickActionBar } from '../../../components/Requests/QuickActionBar';
import { getChatsForRequest } from '../../../services';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

jest.mock('../../../services', () => ({ getChatsForRequest: jest.fn(), postChatAndResponse: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const FAC = 6;
const EMG = 3;

const requestActive = {
   idRequest: 230,
   idCatStatus: 26,
   fullName: 'CM HOTEL S.A. DE C.V.',
   authorizationsFaculty: [
      {
         userAD: 'c1',
         fullName: 'Comercial Uno',
         signatureDate: '2025-02-06T10:00:00',
         typeFaculty: 'COMERCIAL',
         decisionFaculty: 'YES',
      },
   ],
};

function setup({ idProfile = FAC, dimensions = { height: 700 } } = {}) {
   getChatsForRequest.mockResolvedValue([]);
   const wrapper = createContextWrapper({
      user: { userAD: 'yo', idProfile },
      isReloading: false,
      actions: createActions({ toggleReloading: jest.fn() }),
   });
   return renderComponent(<QuickActionBar requestActive={requestActive} dimensions={dimensions} />, { wrapper });
}

const infoButton = () => screen.getByRole('button', { name: 'info' });
const chatButton = () => screen.getByRole('button', { name: 'Chat' });

describe('QuickActionBar', () => {
   test('shows only the information button for profiles other than faculty', () => {
      setup({ idProfile: EMG });

      expect(infoButton()).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Chat' })).not.toBeInTheDocument();
   });

   test('shows the information and chat buttons for faculty users', () => {
      setup();

      expect(infoButton()).toBeInTheDocument();
      expect(chatButton()).toBeInTheDocument();
   });

   test('keeps the panel empty until an icon is selected', () => {
      setup();

      expect(screen.queryByText('CM HOTEL S.A. DE C.V.')).not.toBeInTheDocument();
      expect(screen.queryByText('Chat (Cambios y comentarios)')).not.toBeInTheDocument();
   });

   test('opens the request information with the faculty decisions', async () => {
      const { user } = setup();

      await user.click(infoButton());

      expect(screen.getByRole('heading', { name: 'CM HOTEL S.A. DE C.V.' })).toBeInTheDocument();
      expect(screen.getByText('Comercial Uno')).toBeInTheDocument();
      expect(screen.getByTestId('decisionFaculty-YES')).toBeInTheDocument();
   });

   test('opens the chat of the active request', async () => {
      const { user } = setup();

      await user.click(chatButton());

      expect(await screen.findByPlaceholderText('Escribe aquí tus comentarios')).toBeInTheDocument();
      expect(getChatsForRequest).toHaveBeenCalledWith(230);
   });

   test('closes the panel when the selected icon is clicked again', async () => {
      const { user } = setup();
      await user.click(infoButton());
      expect(screen.getByRole('heading', { name: 'CM HOTEL S.A. DE C.V.' })).toBeInTheDocument();

      await user.click(infoButton());

      expect(screen.queryByRole('heading', { name: 'CM HOTEL S.A. DE C.V.' })).not.toBeInTheDocument();
   });

   test('switches the panel from information to chat', async () => {
      const { user } = setup();
      await user.click(infoButton());

      await user.click(chatButton());

      expect(screen.queryByRole('heading', { name: 'CM HOTEL S.A. DE C.V.' })).not.toBeInTheDocument();
      expect(await screen.findByPlaceholderText('Escribe aquí tus comentarios')).toBeInTheDocument();
   });

   test('marks the selected icon', async () => {
      const { user } = setup();
      // JSDOM no aplica estilos; la selección solo se expresa mediante una clase de fondo.
      expect(infoButton()).not.toHaveClass('bg-[#D9D9D9]');

      await user.click(infoButton());

      expect(infoButton()).toHaveClass('bg-[#D9D9D9]');
      expect(chatButton()).not.toHaveClass('bg-[#D9D9D9]');
   });
});
