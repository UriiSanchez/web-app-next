import { act, screen } from '@testing-library/react';

import { AuthLayout } from '../../../components/Layout/AuthLayout';
import { renderComponent } from '../../utils/render';

// next/head no escribe en el DOM de JSDOM; se reenvían sus hijos para poder consultarlos.
jest.mock('next/head', () => ({
   __esModule: true,
   default: ({ children }) => require('react').createElement(require('react').Fragment, null, children),
}));

const renderLayout = (props = {}) =>
   renderComponent(
      <AuthLayout {...props}>
         <p>Formulario de acceso</p>
      </AuthLayout>
   );

const finishInitialLoad = () => act(() => jest.advanceTimersByTime(2000));

beforeEach(() => {
   jest.useFakeTimers();
});

describe('AuthLayout', () => {
   test('shows the loading screen and hides the children at first', () => {
      renderLayout();

      expect(screen.getByAltText('Loading EasyCreadit')).toBeInTheDocument();
      expect(screen.queryByText('Formulario de acceso')).not.toBeInTheDocument();
   });

   test('keeps the loading screen until 2 seconds have passed', () => {
      renderLayout();

      act(() => jest.advanceTimersByTime(1999));

      expect(screen.getByAltText('Loading EasyCreadit')).toBeInTheDocument();
      expect(screen.queryByRole('main')).not.toBeInTheDocument();
   });

   test('replaces the loading screen with the children after 2 seconds', () => {
      renderLayout();

      finishInitialLoad();

      expect(screen.getByRole('main')).toContainElement(screen.getByText('Formulario de acceso'));
      expect(screen.queryByAltText('Loading EasyCreadit')).not.toBeInTheDocument();
   });

   test('uses "EasyCredit" as the default title and the given title otherwise', () => {
      const { unmount } = renderLayout();
      expect(screen.getByText('EasyCredit')).toBeInTheDocument();
      unmount();

      renderLayout({ title: 'Iniciar sesión' });
      expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
   });

   test('sets the page description meta tag', () => {
      renderLayout();

      expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
         'content',
         'Otorga créditos + rápido + sencillo + easy'
      );
   });
});
