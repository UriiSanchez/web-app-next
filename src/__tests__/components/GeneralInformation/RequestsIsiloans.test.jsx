import { screen, within } from '@testing-library/react';

import { RequestsIsiloans } from '../../../components/GeneralInformation/RequestsIsiloans';
import { renderComponent } from '../../utils/render';

const requests = [
   {
      lineNumber: 1001,
      typeActiveProduct: 'Crédito simple',
      startDate: '01-01-2023',
      endDate: '01-01-2025',
      authorizedAmount: 1500000,
      currency: 'USD',
   },
   {
      lineNumber: 1002,
      typeActiveProduct: 'Arrendamiento',
      startDate: null,
      endDate: '',
      authorizedAmount: 'sin monto',
      currency: 'MXN',
   },
];

describe('RequestsIsiloans', () => {
   test('shows the table headers', () => {
      renderComponent(<RequestsIsiloans requests={requests} />);

      expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
         'Número de línea',
         'Tipo de producto activo',
         'Fecha de inicio',
         'Fecha de vencimiento',
         'Monto autorizado',
         'Divisa',
      ]);
   });

   test('shows one row per credit line with formatted amount', () => {
      renderComponent(<RequestsIsiloans requests={requests} />);

      const first = within(screen.getByText('1001').closest('tr'));
      expect(first.getByText('Crédito simple')).toBeInTheDocument();
      expect(first.getByText('01-01-2023')).toBeInTheDocument();
      expect(first.getByText('01-01-2025')).toBeInTheDocument();
      expect(first.getByText('$1,500,000')).toBeInTheDocument();
      expect(first.getByAltText('money')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(3);
   });

   test('falls back to dashes for missing dates and to zero for a non numeric amount', () => {
      renderComponent(<RequestsIsiloans requests={requests} />);

      const second = within(screen.getByText('1002').closest('tr'));
      expect(second.getAllByText('-')).toHaveLength(2);
      expect(second.getByText('0')).toBeInTheDocument();
   });

   test.each([[[]], [undefined]])('shows the empty message when requests is %p', (value) => {
      renderComponent(<RequestsIsiloans requests={value} />);

      expect(screen.getByText('Sin productos activos')).toBeInTheDocument();
      expect(screen.queryByAltText('money')).not.toBeInTheDocument();
   });
});
