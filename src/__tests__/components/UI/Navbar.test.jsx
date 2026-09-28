import { screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

import { Navbar } from '../../../components/UI/Navbar';
import { renderComponent } from '../../utils/render';
import { createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));

const settings = {
   startPage: '/FAC/Home',
   menu: [
      { title: 'Solicitudes', redirectTo: '/FAC/RequestPreview' },
      { title: 'Reportes', redirectTo: '/FAC/Reports', isDisable: true },
      { title: 'Inicio', redirectTo: '/' },
   ],
};
const currentUser = { profile: 'Analista', fullName: 'Ana Lopez', firstLetters: 'AL', color: '#ff0000' };

const renderNavbar = (value = { user: currentUser, settings }, asPath = '/') => {
   useRouter.mockReturnValue(createRouter({ asPath }));
   return renderComponent(<Navbar />, { wrapper: createContextWrapper(value) });
};

describe('Navbar', () => {
   test('shows the user profile, initials and full name', () => {
      renderNavbar();

      expect(screen.getByText('Analista')).toBeInTheDocument();
      expect(screen.getByText('AL')).toHaveStyle({ backgroundColor: '#ff0000' });
      expect(screen.getByText('Ana Lopez')).toBeInTheDocument();
   });

   test('falls back to placeholders without user or settings', () => {
      renderNavbar({});

      expect(screen.getByText('--')).toHaveStyle({ backgroundColor: '#475569' });
      expect(screen.getByRole('link', { name: 'Logo EasyCreadit Blanco' })).toHaveAttribute('href', '/');
   });

   test('links the logo to the start page and renders the menu items', () => {
      renderNavbar();

      expect(screen.getByRole('link', { name: 'Logo EasyCreadit Blanco' })).toHaveAttribute('href', '/FAC/Home');
      expect(screen.getByRole('link', { name: 'Solicitudes' })).toHaveAttribute('href', '/FAC/RequestPreview');
   });

   test('marks the menu item matching the current path as active', () => {
      renderNavbar({ user: currentUser, settings }, '/FAC/RequestPreview?id=1');

      expect(screen.getByRole('link', { name: 'Solicitudes' }).parentElement).toHaveClass('border-b-2');
      expect(screen.getByRole('link', { name: 'Reportes' }).parentElement).not.toHaveClass('border-b-2');
   });

   test('only the root item is active on the root path', () => {
      renderNavbar({ user: currentUser, settings }, '/');

      expect(screen.getByRole('link', { name: 'Inicio' }).parentElement).toHaveClass('border-b-2');
      expect(screen.getByRole('link', { name: 'Solicitudes' }).parentElement).not.toHaveClass('border-b-2');
   });

   test('disables the pointer on disabled menu items', () => {
      renderNavbar();

      expect(screen.getByRole('link', { name: 'Reportes' })).toHaveClass('pointer-events-none');
      expect(screen.getByRole('link', { name: 'Solicitudes' })).not.toHaveClass('pointer-events-none');
   });

   test('clears local storage and signs out on logout', async () => {
      localStorage.setItem('key', 'value');
      const { user } = renderNavbar();

      // El nombre accesible del botón es el texto del icono («logout»); el título es la única etiqueta útil.
      await user.click(screen.getByTitle('Cerrar sesión'));

      expect(localStorage.getItem('key')).toBeNull();
      expect(signOut).toHaveBeenCalledTimes(1);
   });
});
