import { fireEvent, screen } from '@testing-library/react';

import { CardExchangeItem } from '../../../../../components/PCD/Controls/Cards/CardExchangeItem';
import { crossingsListCP } from '../../../../../helpers';
import { renderComponent } from '../../../../utils/render';

const data = [{ cross: 'EURUSD', porcentage: '30' }, {}];

function setup(props = {}) {
   // Se captura el evento al momento de la llamada: React restaura el valor del campo controlado después.
   const fnVirtual = jest.fn((e, idx) => fnVirtual.seen.push({ name: e.target.name, value: e.target.value, idx }));
   fnVirtual.seen = [];
   const utils = renderComponent(<CardExchangeItem data={data} idx={0} fnVirtual={fnVirtual} {...props} />);
   return { fnVirtual, ...utils };
}

describe('CardExchangeItem', () => {
   test('numbers the crossing by its position', () => {
      setup({ idx: 1 });

      expect(screen.getByRole('heading', { name: /Cruce\s*02/ })).toBeInTheDocument();
   });

   test('shows the crossing and its percentage', () => {
      setup();

      expect(screen.getByLabelText('Cruce')).toHaveValue('EURUSD');
      expect(screen.getByPlaceholderText('0')).toHaveValue(30);
   });

   test('suggests every known crossing', () => {
      setup();

      const options = screen.getByTestId('listCross-0').querySelectorAll('option');
      expect(Array.from(options).map((o) => o.value)).toEqual(crossingsListCP);
      expect(screen.getByLabelText('Cruce')).toHaveAttribute('list', 'listCross-0');
   });

   test('notifies the typed crossing with the card index', async () => {
      const { fnVirtual, user } = setup({ idx: 1 });

      await user.type(screen.getByLabelText('Cruce'), 'B');

      expect(fnVirtual.seen[0].name).toBe('cross-1');
      expect(fnVirtual.seen[0].idx).toBe(1);
   });

   test('notifies the typed percentage', () => {
      const { fnVirtual } = setup({ idx: 1 });

      // El campo bloquea el tecleo con `keyCode` (user-event no lo reporta), por lo que se dispara el cambio.
      fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '50' } });

      expect(fnVirtual.seen[0].name).toBe('porcentage-1');
      expect(fnVirtual.seen[0].value).toBe('50');
   });

   test('locks the fields when disabled', () => {
      setup({ isDisabled: true });

      expect(screen.getByLabelText('Cruce')).toBeDisabled();
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument();
   });

   test('marks the empty fields as mandatory once the section was saved', () => {
      setup({ idx: 1, isSave: true });

      expect(screen.getByLabelText('Cruce')).toHaveClass('mandatory');
   });
});
