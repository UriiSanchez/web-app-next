import { screen } from '@testing-library/react';
import Swal from 'sweetalert2';

import { MainLayout } from '../../../components/Layout/MainLayout';
import { renderPage } from '../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
// next/head no escribe en el DOM de JSDOM; se reenvían sus hijos para poder consultarlos.
jest.mock('next/head', () => ({
   __esModule: true,
   default: ({ children }) => require('react').createElement(require('react').Fragment, null, children),
}));
jest.mock('../../../services', () => ({ dowloadDocumentFetch: jest.fn(), downloadCoverStudio: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const session = { user: { fullName: 'Ana Lopez' } };
const stepperOptions = [
   { step: 1, title: 'Datos' },
   { step: 2, title: 'Modelo' },
];
const stepperConfig = {
   bgColorContainer: 'bg-container',
   bgOption: 'bg-idle',
   bgOptionActive: 'bg-active',
   color: 'text-line',
   txtColorActive: 'text-active',
   txtOption: 'text-idle',
};

const renderLayout = (props = {}, options = {}) =>
   renderPage(
      <MainLayout {...props}>
         <p>Contenido de la página</p>
      </MainLayout>,
      options
   );

describe('MainLayout', () => {
   describe('page structure', () => {
      test('renders the children inside main together with the navbar', () => {
         renderLayout();

         expect(screen.getByRole('main')).toContainElement(screen.getByText('Contenido de la página'));
         expect(screen.getByRole('link', { name: 'Logo EasyCreadit Blanco' })).toBeInTheDocument();
      });

      test('uses "Home" as the default title and the given title otherwise', () => {
         const { unmount } = renderLayout();
         expect(screen.getByText('EasyCredit - Home')).toBeInTheDocument();
         unmount();

         renderLayout({ title: 'Detalles solicitud' });
         expect(screen.getByText('EasyCredit - Detalles solicitud')).toBeInTheDocument();
         expect(screen.queryByText('EasyCredit - Home')).not.toBeInTheDocument();
      });

      test('sets the page description meta tag', () => {
         renderLayout();

         expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
            'content',
            'Otorga créditos + rápido + sencillo + easy'
         );
      });

      test('applies the default main classes and lets the sx prop override them', () => {
         const { unmount } = renderLayout();
         expect(screen.getByRole('main')).toHaveClass('h-auto', 'min-h-max');
         unmount();

         renderLayout({ sx: 'h-screen' });
         expect(screen.getByRole('main')).toHaveClass('h-screen');
         expect(screen.getByRole('main')).not.toHaveClass('min-h-max');
      });
   });

   describe('loader', () => {
      test('shows the loader with the context message', () => {
         renderLayout({}, { context: { loader: { isShow: true, msg: 'Guardando cambios...' } } });

         expect(screen.getByText('Guardando cambios...')).toBeInTheDocument();
      });

      test('does not show the loader when it is hidden', () => {
         renderLayout({}, { context: { loader: { isShow: false, msg: 'Guardando cambios...' } } });

         expect(screen.queryByText('Guardando cambios...')).not.toBeInTheDocument();
      });
   });

   describe('PDF modal and footer', () => {
      test('shows the PDF modal and hides the footer while a PDF is open', () => {
         renderLayout({}, { context: { showPDF: { isShow: true, src: 'blob:ready', title: 'Acta constitutiva' } } });

         expect(screen.getByTitle('Visor de PDF')).toHaveAttribute('src', 'blob:ready');
         expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
      });

      test('shows the footer and no PDF modal when no PDF is open', () => {
         renderLayout();

         expect(screen.getByRole('contentinfo')).toBeInTheDocument();
         expect(screen.queryByTitle('Visor de PDF')).not.toBeInTheDocument();
      });
   });

   describe('stepper', () => {
      test('renders the stepper in a sticky footer when it is visible', () => {
         renderLayout(
            {},
            { context: { stepper: { isShow: true, step: 1, options: stepperOptions, config: stepperConfig } } }
         );

         expect(screen.getByText('Datos')).toBeInTheDocument();
         expect(screen.getByText('Modelo')).toBeInTheDocument();
         expect(screen.getByRole('contentinfo')).toHaveClass('sticky', 'bottom-0', 'z-50');
      });

      test('renders an empty footer without stepper when it is hidden', () => {
         renderLayout(
            {},
            { context: { stepper: { isShow: false, step: 1, options: stepperOptions, config: stepperConfig } } }
         );

         expect(screen.queryByText('Datos')).not.toBeInTheDocument();
         expect(screen.getByRole('contentinfo')).toHaveClass('z-0');
         expect(screen.getByRole('contentinfo')).not.toHaveClass('sticky');
      });
   });

   describe('welcome message', () => {
      test('greets the user once and remembers it in localStorage', () => {
         renderLayout({}, { session });

         expect(Swal.fire).toHaveBeenCalledTimes(1);
         expect(Swal.fire.mock.calls[0][0].title).toMatch(/^¡(Buenos días|Buenas tardes|Buenas noches), Ana Lopez!$/);
         expect(localStorage.getItem('showWelcome')).toBe('true');
      });

      test('does not greet again when the welcome flag is already stored', () => {
         localStorage.setItem('showWelcome', true);
         renderLayout({}, { session });

         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('does not greet without a session', () => {
         renderLayout();

         expect(Swal.fire).not.toHaveBeenCalled();
         expect(localStorage.getItem('showWelcome')).toBeNull();
      });
   });
});
