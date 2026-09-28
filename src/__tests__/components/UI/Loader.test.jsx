import { screen } from '@testing-library/react';

import { Loader, LoaderStatic } from '../../../components/UI/Loader';
import { renderComponent } from '../../utils/render';

describe('Loader', () => {
   test('shows the default message', () => {
      renderComponent(<Loader />);

      expect(screen.getByText('Procesando...')).toBeInTheDocument();
   });

   test('renders a custom message parsed as HTML', () => {
      renderComponent(<Loader msg='Guardando <b>datos</b>' />);

      expect(screen.getByText('datos').tagName).toBe('B');
      expect(screen.getByText(/Guardando/)).toBeInTheDocument();
   });

   test('omits the message when msg is empty', () => {
      renderComponent(<Loader msg='' />);

      expect(screen.queryByText('Procesando...')).not.toBeInTheDocument();
   });

   test('renders children instead of the spinner card', () => {
      renderComponent(
         <Loader>
            <p>Contenido propio</p>
         </Loader>
      );

      expect(screen.getByText('Contenido propio')).toBeInTheDocument();
      expect(screen.queryByText('Procesando...')).not.toBeInTheDocument();
   });

   test('applies custom size classes', () => {
      renderComponent(<Loader sx='h-10 w-10' />);

      expect(screen.getByText('Procesando...').parentElement).toHaveClass('h-10', 'w-10');
   });

   test('blocks page scroll while mounted and restores it on unmount', () => {
      const { unmount } = renderComponent(<Loader />);
      expect(document.documentElement.style.overflow).toBe('hidden');

      unmount();
      expect(document.documentElement.style.overflow).toBe('auto');
   });
});

describe('LoaderStatic', () => {
   test('shows the document loading message', () => {
      renderComponent(<LoaderStatic />);

      expect(screen.getByText(/Estamos cargando el documento/)).toBeInTheDocument();
   });
});
