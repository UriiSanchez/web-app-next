import { act, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';

import LoginPage from '../../../pages/Login';
import { decryptOnlyFront } from '../../../helpers';
import { renderComponent } from '../../utils/render';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signIn: jest.fn() }));

const unauthenticated = { data: null, status: 'unauthenticated' };

// AuthLayout muestra una pantalla de carga durante 2 segundos antes del formulario.
const setup = ({ session = unauthenticated, showForm = true } = {}) => {
   jest.useFakeTimers();
   useSession.mockReturnValue(session);
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const utils = renderComponent(<LoginPage />, { userOptions: { delay: null } });
   if (showForm) {
      act(() => {
         jest.advanceTimersByTime(2000);
      });
   }
   return { router, ...utils };
};
const userInput = () => screen.getByPlaceholderText('Usuario BANCO BASE');
const passwordInput = () => screen.getByPlaceholderText('tu contraseña estará oculta');
const submitButton = () => screen.getByRole('button', { name: /Iniciar sesión|Iniciando sesión/ });
const fillValid = async (user) => {
   await user.type(userInput(), 'ana');
   await user.type(passwordInput(), 'secreta');
};

describe('Login page', () => {
   describe('layout', () => {
      test('shows the loading screen first and the form after two seconds', () => {
         setup({ showForm: false });
         expect(screen.getByAltText('Loading EasyCreadit')).toBeInTheDocument();
         expect(screen.queryByRole('heading', { name: 'Inicia sesión' })).not.toBeInTheDocument();

         act(() => {
            jest.advanceTimersByTime(2000);
         });

         expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: '¡Bienvenido a tu nueva plataforma!' })).toBeInTheDocument();
         expect(screen.getByText(/Copyright @BancoBase\d{4}/)).toBeInTheDocument();
      });

      test('disables the submit button until the form is valid', async () => {
         const { user } = setup();
         expect(submitButton()).toBeDisabled();

         await user.type(userInput(), 'ana');
         expect(submitButton()).toBeDisabled();

         await user.type(passwordInput(), 'secreta');
         await waitFor(() => expect(submitButton()).toBeEnabled());
      });
   });

   describe('validation', () => {
      test('rejects a user name with digits or symbols', async () => {
         const { user } = setup();

         await user.type(userInput(), 'ana1');

         expect(await screen.findByText('El formato no es correcto')).toBeInTheDocument();
         expect(submitButton()).toBeDisabled();
      });

      test('accepts letters and apostrophes in the user name', async () => {
         const { user } = setup();

         await user.type(userInput(), "o'neil");

         await waitFor(() => expect(screen.queryByText('El formato no es correcto')).not.toBeInTheDocument());
      });

      test('requires the user name and the password once they were touched', async () => {
         const { user } = setup();

         await user.type(userInput(), 'a');
         await user.clear(userInput());
         await user.type(passwordInput(), 'p');
         await user.clear(passwordInput());

         expect(await screen.findAllByText('Este campo es requerido')).toHaveLength(2);
      });
   });

   describe('password visibility', () => {
      test('toggles between hidden and visible', async () => {
         const { user } = setup();
         expect(passwordInput()).toHaveAttribute('type', 'password');

         await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
         expect(passwordInput()).toHaveAttribute('type', 'text');

         await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
         expect(passwordInput()).toHaveAttribute('type', 'password');
      });
   });

   describe('signing in', () => {
      test('sends the encoded credentials without redirecting', async () => {
         signIn.mockResolvedValue({ status: 200, error: null });
         const { user } = setup();
         await fillValid(user);
         await waitFor(() => expect(submitButton()).toBeEnabled());

         await user.click(submitButton());

         await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
         const [provider, options] = signIn.mock.calls[0];
         expect(provider).toBe('credentials');
         expect(options.redirect).toBe(false);
         expect(JSON.parse(decryptOnlyFront(options.parseInfo))).toEqual({ userName: 'ana', password: 'secreta' });
      });

      test('shows the error of the service when the credentials are rejected', async () => {
         signIn.mockResolvedValue({ status: 401, error: 'Usuario o contraseña incorrectos' });
         const { user } = setup();
         await fillValid(user);
         await waitFor(() => expect(submitButton()).toBeEnabled());

         await user.click(submitButton());

         expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument();
      });

      test('clears the previous error when the form is submitted again', async () => {
         signIn
            .mockResolvedValueOnce({ status: 401, error: 'Usuario o contraseña incorrectos' })
            .mockResolvedValueOnce({ status: 200, error: null });
         const { user } = setup();
         await fillValid(user);
         await waitFor(() => expect(submitButton()).toBeEnabled());
         await user.click(submitButton());
         await screen.findByText('Usuario o contraseña incorrectos');

         await user.click(submitButton());

         await waitFor(() => expect(screen.queryByText('Usuario o contraseña incorrectos')).not.toBeInTheDocument());
         expect(signIn).toHaveBeenCalledTimes(2);
      });

      test('shows a progress label and disables the button while signing in', async () => {
         let resolveSignIn;
         signIn.mockReturnValue(new Promise((resolve) => (resolveSignIn = resolve)));
         const { user } = setup();
         await fillValid(user);
         await waitFor(() => expect(submitButton()).toBeEnabled());

         await user.click(submitButton());

         expect(await screen.findByRole('button', { name: /Iniciando sesión/ })).toBeDisabled();
         await act(async () => resolveSignIn({ status: 200, error: null }));
         expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
      });
   });

   describe('session', () => {
      test('redirects an authenticated user to the start page of the profile', () => {
         const { router } = setup({
            session: {
               data: { user: { settings: { startPage: '/FAC/RequestsReview' } } },
               status: 'authenticated',
            },
         });

         expect(router.push).toHaveBeenCalledWith('/FAC/RequestsReview');
      });

      test('does not redirect while there is no session', () => {
         const { router } = setup();

         expect(router.push).not.toHaveBeenCalled();
      });
   });
});
