import { screen } from '@testing-library/react';

import { CardVisitorsItem } from '../../../../../components/PCD/Controls/Cards/CardVisitorsItem';
import { renderComponent } from '../../../../utils/render';

const data = [{ visitorName: 'Ana Ruiz', visitorPosition: 'Directora' }, { visitorName: 'Luis Paz' }];

function setup(props = {}) {
   const fnVirtual = jest.fn();
   const utils = renderComponent(<CardVisitorsItem data={data} idx={0} fnVirtual={fnVirtual} {...props} />);
   return { fnVirtual, ...utils };
}

describe('CardVisitorsItem', () => {
   test('numbers the card by its position', () => {
      setup({ idx: 1 });

      expect(screen.getByRole('heading', { name: /Visitante\s*02/ })).toBeInTheDocument();
   });

   test('shows the name and the position of the visitor', () => {
      setup();

      expect(screen.getByLabelText('Nombre')).toHaveValue('Ana Ruiz');
      expect(screen.getByLabelText('Puesto')).toHaveValue('Directora');
   });

   test('shows empty inputs when the visitor has no data yet', () => {
      setup({ data: [], idx: 0 });

      expect(screen.getByLabelText('Nombre')).toHaveValue('');
      expect(screen.getByLabelText('Puesto')).toHaveValue('');
   });

   test('notifies each typed character with the card index', async () => {
      const { fnVirtual, user } = setup({ data: [] });

      await user.type(screen.getByLabelText('Nombre'), 'Al');

      expect(fnVirtual).toHaveBeenCalledTimes(2);
      expect(fnVirtual.mock.calls[0][0].target.name).toBe('visitorName-0');
      expect(fnVirtual.mock.calls[0][1]).toBe(0);
   });

   test('disables the inputs when the card is locked', () => {
      setup({ isDisabled: true });

      expect(screen.getByLabelText('Nombre')).toBeDisabled();
      expect(screen.getByLabelText('Puesto')).toBeDisabled();
      expect(screen.getByLabelText('Nombre')).toHaveClass('disabled');
   });

   test('marks the empty inputs as mandatory once the section was saved', () => {
      setup({ idx: 1, isSave: true });

      expect(screen.getByLabelText('Nombre')).not.toHaveClass('mandatory');
      expect(screen.getByLabelText('Puesto')).toHaveClass('mandatory');
   });
});
