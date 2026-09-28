import { screen } from '@testing-library/react';

import { FilterTypeProcedure } from '../../../components/Filters/FilterTypeProcedure';
import { renderComponent } from '../../utils/render';

const renderFilter = (data = [], onSet = jest.fn()) => ({
   onSet,
   ...renderComponent(<FilterTypeProcedure data={data} onSet={onSet} />),
});

describe('FilterTypeProcedure', () => {
   test('keeps the options hidden until the button is clicked', async () => {
      const { user } = renderFilter();
      expect(screen.queryByLabelText('Incremento')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Trámite/ }));

      expect(screen.getByLabelText('Nuevo trámite')).toBeInTheDocument();
      expect(screen.getByLabelText('Recalificación')).toBeInTheDocument();
      expect(screen.getByLabelText('Incremento')).toBeInTheDocument();
      expect(screen.getByLabelText('Decremento')).toBeInTheDocument();
   });

   test('marks the options included in data', async () => {
      const { user } = renderFilter(['Incremento']);
      await user.click(screen.getByRole('button', { name: /Trámite/ }));

      expect(screen.getByLabelText('Incremento')).toBeChecked();
      expect(screen.getByLabelText('Decremento')).not.toBeChecked();
   });

   test('adds a checked option to the current selection', async () => {
      const { user, onSet } = renderFilter(['Incremento']);
      await user.click(screen.getByRole('button', { name: /Trámite/ }));

      await user.click(screen.getByLabelText('Nuevo trámite'));

      expect(onSet).toHaveBeenCalledWith('byApplicationTypes', ['Incremento', 'Nuevo Tramite']);
   });

   test('removes an unchecked option from the selection', async () => {
      const { user, onSet } = renderFilter(['Incremento', 'Decremento']);
      await user.click(screen.getByRole('button', { name: /Trámite/ }));

      await user.click(screen.getByLabelText('Incremento'));

      expect(onSet).toHaveBeenCalledWith('byApplicationTypes', ['Decremento']);
   });

   test('closes the list when clicking outside', async () => {
      const { user } = renderFilter();
      await user.click(screen.getByRole('button', { name: /Trámite/ }));
      expect(screen.getByLabelText('Incremento')).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByLabelText('Incremento')).not.toBeInTheDocument();
   });
});
