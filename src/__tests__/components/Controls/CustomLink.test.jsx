import { screen } from '@testing-library/react';

import { CustomLink } from '../../../components/Controls/CustomLink';
import { renderComponent } from '../../utils/render';

describe('CustomLink', () => {
   test('renders a link with a string href and the given classes', () => {
      renderComponent(
         <CustomLink href='/FAC/RequestPreview' sx='btn-primary'>
            Solicitudes
         </CustomLink>
      );

      const link = screen.getByRole('link', { name: 'Solicitudes' });
      expect(link).toHaveAttribute('href', '/FAC/RequestPreview');
      expect(link).toHaveClass('btn-primary');
   });

   test('supports an object href with query', () => {
      renderComponent(
         <CustomLink href={{ pathname: '/FAC/RequestPreview', query: { idGroup: 1 } }}>Detalle</CustomLink>
      );

      expect(screen.getByRole('link', { name: 'Detalle' })).toHaveAttribute('href', '/FAC/RequestPreview?idGroup=1');
   });

   test('renders a disabled button instead of a link when isDisabled', () => {
      renderComponent(
         <CustomLink href='/FAC' sx='btn-primary' isDisabled>
            Solicitudes
         </CustomLink>
      );

      expect(screen.getByRole('button', { name: 'Solicitudes' })).toBeDisabled();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
   });
});
