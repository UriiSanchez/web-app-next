import { screen } from '@testing-library/react';

import { ObligatedItem } from '../../../components/History/ObligatedItem';
import { renderComponent } from '../../utils/render';

const os1 = { idClient: 501, fullName: 'Carlos Vega' };
const os2 = { idClient: 502, fullName: 'Diana Solís' };

describe('ObligatedItem', () => {
   test('shows dashes when there are no solidary obligors', () => {
      renderComponent(<ObligatedItem />);

      expect(screen.getByText('Obligado Solidario')).toBeInTheDocument();
      expect(screen.getByText('No. de Obligado Solidario')).toBeInTheDocument();
      expect(screen.getAllByText('-')).toHaveLength(2);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
   });

   test('shows the name and client number of a single obligor without a select', () => {
      renderComponent(<ObligatedItem data={[os1]} />);

      expect(screen.getByText('Carlos Vega')).toBeInTheDocument();
      expect(screen.getByText('501')).toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
   });

   test('offers a select with the first obligor selected when there are several', () => {
      renderComponent(<ObligatedItem data={[os1, os2]} />);

      expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Carlos Vega', 'Diana Solís']);
      expect(screen.getByRole('combobox')).toHaveValue('501');
      expect(screen.getByText('501')).toBeInTheDocument();
   });

   test('updates the client number when another obligor is selected', async () => {
      const { user } = renderComponent(<ObligatedItem data={[os1, os2]} />);

      await user.selectOptions(screen.getByRole('combobox'), 'Diana Solís');

      expect(screen.getByRole('combobox')).toHaveValue('502');
      expect(screen.getByText('502')).toBeInTheDocument();
      expect(screen.queryByText('501')).not.toBeInTheDocument();
   });

   test('selects the first obligor again when the data changes', async () => {
      const { user, rerender } = renderComponent(<ObligatedItem data={[os1, os2]} />);
      await user.selectOptions(screen.getByRole('combobox'), 'Diana Solís');

      rerender(<ObligatedItem data={[os2, os1]} />);

      expect(screen.getByRole('combobox')).toHaveValue('502');
   });
});
