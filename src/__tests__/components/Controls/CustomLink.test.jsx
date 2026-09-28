import { render, screen } from '@testing-library/react';

import { CustomLink } from '../../../components/Controls';

describe('CustomLink Component', () => {
   let props = {
      sx: 'btn-secondary',
      href: '/SEC/Cover/1',
   };

   test('must render as an enabled link', () => {
      render(<CustomLink {...props}>Solicitudes</CustomLink>);

      const link = screen.getByRole('link', {
         name: /Solicitudes/i,
      });

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/SEC/Cover/1');
      expect(link).toHaveClass('btn-secondary');
   });

   test('renders as a disabled button if isDisabled is true', () => {
      render(<CustomLink {...props} isDisabled={true}>Solicitudes</CustomLink>);

      const link = screen.getByRole('button', {
         name: /Solicitudes/i,
      });
      expect(link).toBeInTheDocument();
      expect(link).toBeDisabled();
   });

   test('Switches between a Link and Button according to the `isDisabled` status',() => {
      render(<CustomLink {...props} isDisabled={false}>Action</CustomLink>);

      // Verifica que inicialmente renderiza como un enlace
      const link = screen.getByRole('link', {name: /Action/i});
      expect(link).toBeInTheDocument();

      // Cambia a un botón deshabilitado
      render(<CustomLink {...props} isDisabled={true}>Action</CustomLink>);

      const button = screen.getByRole('button', {name: /Action/i});
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
   });
});
