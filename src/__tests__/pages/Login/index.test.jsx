import { act, waitFor } from '@testing-library/react';

import Login from '../../../pages/Login';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

jest.mock('next-auth/react', () => ({ __esModule: true, useSession: jest.fn(), signIn: jest.fn() }));
jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.useFakeTimers();

const customRenderPage = async () => {
   const { user, queries, waitFor } = await renderPage(Login, {}, { delay: null });

   // Espera la animación del logo.
   act(() => jest.runOnlyPendingTimers());

   return { ...queries, user, waitFor };
};

describe('Login Page', () => {
   let mockPush = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      useRouter.mockReturnValue({ push: mockPush });
   });

   test('should render username and password fields and login button', async () => {
      const { getByLabelText, getByRole } = await customRenderPage();

      expect(getByRole('textbox', { name: /Usuario/i })).toBeInTheDocument();
      expect(getByLabelText('Contraseña')).toBeInTheDocument();
      expect(getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument();
   });

   test('should disabled login button initially', async () => {
      const { getByRole } = await customRenderPage();
      const loginButton = getByRole('button', { name: /Iniciar sesión/i });
      expect(loginButton).toBeDisabled();
   });

   test('it should display an error message for username input errors', async () => {
      const { user, getByRole, getByText } = await customRenderPage();
      const inputUser = getByRole('textbox', { name: /Usuario/i });

      await user.type(inputUser, '123');
      await waitFor(() => expect(getByText('El formato no es correcto')).toBeVisible());
   });

   test('it should display an error message for password input errors', async () => {
      const { user, getByLabelText, getByText } = await customRenderPage();

      const inputPassword = getByLabelText('Contraseña');
      await user.click(inputPassword);
      await user.keyboard('1');
      await user.keyboard('{Backspace}');

      await waitFor(() => expect(getByText('Este campo es requerido')).toBeVisible());
   });

   test('should enable login button when username and password have valid values', async () => {
      const { user, getByRole, getByLabelText, waitFor } = await customRenderPage();

      const userInput = getByRole('textbox', { name: /Usuario/i });
      const passInput = getByLabelText('Contraseña');
      const loginButton = getByRole('button', { name: /Iniciar sesión/i });

      expect(loginButton).toBeDisabled();

      await user.type(userInput, 'user');
      await user.type(passInput, 'password');

      await waitFor(() => expect(loginButton).not.toBeDisabled());
   });

   test('should toggle password visibility when eye icon is clicked', async () => {
      const { user, getByRole, getByLabelText, waitFor } = await customRenderPage();
      const passInput = getByLabelText('Contraseña');
      const toggleButton = getByRole('button', { name: /mostrar contraseña/i });

      expect(passInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passInput).toHaveAttribute('type', 'text');
      expect(getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();

      await user.click(toggleButton);
      expect(passInput).toHaveAttribute('type', 'password');
      expect(getByRole('button', { name: /mostrar contraseña/i })).toBeInTheDocument();
   });

   test('shows an error message when login fails', async () => {
      signIn.mockResolvedValue({ status: 500, error: 'Ocurrió un error', ok: false });

      const { user, getByLabelText, getByText, getByRole, waitFor } = await customRenderPage();
      const userInput = getByRole('textbox', { name: /Usuario/i });
      const passInput = getByLabelText('Contraseña');
      const loginButton = getByRole('button', { name: /Iniciar sesión/i });

      await user.type(userInput, 'wronguser');
      await user.type(passInput, 'wrongpass');
      await waitFor(() => expect(loginButton).not.toBeDisabled());
      expect(loginButton).toHaveTextContent('Iniciar sesión');

      await user.click(loginButton);
      expect(loginButton).toHaveTextContent('Iniciando sesión');
      expect(loginButton).toBeDisabled();

      await waitFor(() => {
         expect(signIn).toHaveBeenCalledTimes(1);
         expect(getByText('Ocurrió un error')).toBeInTheDocument();
         expect(loginButton).toHaveTextContent('Iniciar sesión');
         expect(loginButton).not.toBeDisabled();
      });
   });

   test('redirects to user start page after successful login', async () => {
      signIn.mockResolvedValue({ status: 200, error: null, ok: true, url: '/' });

      const { user, getByRole, getByLabelText, waitFor } = await customRenderPage();
      const userInput = getByRole('textbox', { name: /Usuario/i });
      const passInput = getByLabelText('Contraseña');
      const loginButton = getByRole('button', { name: /Iniciar sesión/i });
      const expectParseInfo = 'Exf8/jk' + btoa(JSON.stringify({ userName: 'user', password: '123' }));

      await user.type(userInput, 'user');
      await user.type(passInput, '123');

      await waitFor(() => expect(loginButton).not.toBeDisabled());
      await user.click(loginButton);

      expect(signIn).toHaveBeenCalledWith('credentials', {
         redirect: false,
         parseInfo: expectParseInfo,
      });

      await act(async () => {
         useSession.mockReturnValueOnce({
            data: {
               user: { settings: { startPage: '/' } },
               status: 'authenticated',
            },
         });
      });
   });
});
