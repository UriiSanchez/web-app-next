import { fireEvent, screen } from '@testing-library/react';

import { CardRateItem } from '../../../../../components/PCD/Controls/Cards/CardRateItem';
import { renderComponent } from '../../../../utils/render';

const data = [{ rateType: 'fixedRate', porcentage: '40' }, {}];

function setup(props = {}) {
   // Se captura el evento al momento de la llamada: React restaura el valor del campo controlado después.
   const fnVirtual = jest.fn((e, idx) => fnVirtual.seen.push({ name: e.target.name, value: e.target.value, idx }));
   fnVirtual.seen = [];
   const utils = renderComponent(<CardRateItem data={data} idx={0} fnVirtual={fnVirtual} {...props} />);
   return { fnVirtual, ...utils };
}

const percentage = () => screen.getByPlaceholderText('0');

describe('CardRateItem', () => {
   test('numbers the rate by its position', () => {
      setup({ idx: 1 });

      expect(screen.getByRole('heading', { name: /Tasa\s*02/ })).toBeInTheDocument();
   });

   test('offers the sources of information', () => {
      setup();

      expect(Array.from(screen.getByLabelText('Fuente de información').options).map((o) => o.textContent)).toEqual([
         '-Seleccionar-',
         'Tasa variable',
         'Tasa fija',
      ]);
   });

   test('shows the selected source and its percentage', () => {
      setup();

      expect(screen.getByLabelText('Fuente de información')).toHaveDisplayValue('Tasa fija');
      expect(percentage()).toHaveValue(40);
      expect(screen.getByText('%')).toBeInTheDocument();
   });

   test('shows empty fields when the rate has no data yet', () => {
      setup({ idx: 1 });

      expect(screen.getByLabelText('Fuente de información')).toHaveValue('');
      expect(percentage()).toHaveValue(null);
   });

   test('notifies the selected source with the card index', async () => {
      const { fnVirtual, user } = setup({ idx: 1 });

      await user.selectOptions(screen.getByLabelText('Fuente de información'), 'variableRate');

      expect(fnVirtual.seen[0].name).toBe('rateType-1');
      expect(fnVirtual.seen[0].value).toBe('variableRate');
      expect(fnVirtual.seen[0].idx).toBe(1);
   });

   test('notifies the typed percentage', () => {
      const { fnVirtual } = setup({ idx: 1 });

      // El campo bloquea el tecleo con `keyCode` (user-event no lo reporta), por lo que se dispara el cambio.
      fireEvent.change(percentage(), { target: { value: '25' } });

      expect(fnVirtual.seen[0].name).toBe('porcentage-1');
      expect(fnVirtual.seen[0].value).toBe('25');
      expect(fnVirtual.seen[0].idx).toBe(1);
   });

   test('locks the fields and shows the percentage as text when disabled', () => {
      setup({ isDisabled: true });

      expect(screen.getByLabelText('Fuente de información')).toBeDisabled();
      expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
   });

   test('marks the empty fields as mandatory once the section was saved', () => {
      setup({ idx: 1, isSave: true });

      expect(screen.getByLabelText('Fuente de información')).toHaveClass('mandatory');
      expect(percentage().parentElement).toHaveClass('mandatory');
   });
});
