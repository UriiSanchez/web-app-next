import { screen, within } from '@testing-library/react';

import { Breadcrumbs } from '../../../components/Controls/Breadcrumbs';
import { renderComponent } from '../../utils/render';

const routes = [
   { label: 'Solicitudes', href: '/FAC/RequestsReview' },
   { label: 'Cliente', href: { pathname: '/FAC/Client', query: { idGroup: 5 } } },
   { label: 'Editar solicitud', href: '', lastItem: true },
];

describe('Breadcrumbs', () => {
   test('renders links for intermediate routes and plain text for the last item', () => {
      renderComponent(<Breadcrumbs routes={routes} />);

      expect(screen.getByRole('link', { name: 'Solicitudes' })).toHaveAttribute('href', '/FAC/RequestsReview');
      expect(screen.getByRole('link', { name: 'Cliente' })).toHaveAttribute('href', '/FAC/Client?idGroup=5');
      expect(screen.getByText('Editar solicitud')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Editar solicitud' })).not.toBeInTheDocument();
   });

   test('shows the separator icon on every item except the last one', () => {
      renderComponent(<Breadcrumbs routes={routes} icon='arrow_forward' />);
      const items = within(screen.getByRole('navigation', { name: 'breadcrumb' })).getAllByRole('listitem');

      expect(within(items[0]).getByText('arrow_forward')).toBeInTheDocument();
      expect(within(items[1]).getByText('arrow_forward')).toBeInTheDocument();
      expect(within(items[2]).queryByText('arrow_forward')).not.toBeInTheDocument();
   });

   test('uses chevron_right as the default separator and applies sx to the navigation', () => {
      renderComponent(<Breadcrumbs routes={routes} sx='mt-4' />);

      expect(screen.getAllByText('chevron_right')).toHaveLength(2);
      expect(screen.getByRole('navigation')).toHaveClass('mt-4');
   });
});
