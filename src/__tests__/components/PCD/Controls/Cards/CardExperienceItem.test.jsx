import { screen } from '@testing-library/react';

import { CardExperienceItem } from '../../../../../components/PCD/Controls/Cards/CardExperienceItem';
import { renderComponent } from '../../../../utils/render';

const data = [{ counterpart: 'monex', condition: 'lane' }, {}];

function setup(props = {}) {
   // Se captura el evento al momento de la llamada: React restaura el valor del campo controlado después.
   const fnVirtual = jest.fn((e, idx) => fnVirtual.seen.push({ name: e.target.name, value: e.target.value, idx }));
   fnVirtual.seen = [];
   const utils = renderComponent(<CardExperienceItem data={data} idx={0} fnVirtual={fnVirtual} {...props} />);
   return { fnVirtual, ...utils };
}

describe('CardExperienceItem', () => {
   test('numbers the financial institution by its position', () => {
      setup({ idx: 2 });

      expect(screen.getByRole('heading', { name: /Institución Financiera\s*03/ })).toBeInTheDocument();
   });

   test('offers the counterparts and the conditions', () => {
      setup();

      expect(Array.from(screen.getByLabelText('Contraparte').options).map((o) => o.textContent)).toEqual([
         'Selecciona',
         'Monex',
         'Intercam',
         'CI Banco',
         'Invex',
         'BBVA',
         'Banco BASE',
         'Otros',
      ]);
      expect(Array.from(screen.getByLabelText('Condición').options).map((o) => o.textContent)).toEqual([
         'Selecciona',
         'Línea',
         'Colaterales',
      ]);
   });

   test('shows the selected counterpart and condition', () => {
      setup();

      expect(screen.getByLabelText('Contraparte')).toHaveDisplayValue('Monex');
      expect(screen.getByLabelText('Condición')).toHaveDisplayValue('Línea');
   });

   test('shows the placeholder options when nothing is selected', () => {
      setup({ idx: 1 });

      expect(screen.getByLabelText('Contraparte')).toHaveDisplayValue('Selecciona');
      expect(screen.getByLabelText('Condición')).toHaveDisplayValue('Selecciona');
   });

   test('notifies the selected option with the card index', async () => {
      const { fnVirtual, user } = setup({ idx: 1 });

      await user.selectOptions(screen.getByLabelText('Contraparte'), 'bbva');

      expect(fnVirtual).toHaveBeenCalledTimes(1);
      expect(fnVirtual.seen[0].name).toBe('counterpart-1');
      expect(fnVirtual.seen[0].value).toBe('bbva');
      expect(fnVirtual.seen[0].idx).toBe(1);
   });

   test('disables the selects when the card is locked', () => {
      setup({ isDisabled: true });

      expect(screen.getByLabelText('Contraparte')).toBeDisabled();
      expect(screen.getByLabelText('Condición')).toBeDisabled();
   });

   test('marks the empty selects as mandatory once the section was saved', () => {
      setup({ idx: 1, isSave: true });

      expect(screen.getByLabelText('Contraparte')).toHaveClass('mandatory');
      expect(screen.getByLabelText('Condición')).toHaveClass('mandatory');
   });
});
