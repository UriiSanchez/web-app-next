import { screen, within } from '@testing-library/react';

import { CardCreditorItem } from '../../../../../components/PCD/Controls/Cards/CardCreditorItem';
import { renderComponent } from '../../../../utils/render';

const twoDigitYear = (offset = 0) => String(new Date().getFullYear() + offset).slice(-2);
const currentMonth = new Date().getMonth() + 1;

const creditor = {
   creditor: 'Banco Uno',
   natureOfCredit: 'revolvente',
   typeOfCredit: 'RENOVADOS',
   grantMonth: 'Enero',
   yearOfGrant: twoDigitYear(-2),
   expirationMonth: 'Marzo',
   expirationYear: twoDigitYear(1),
   lineAmount: '5000000',
   currency: 'MXN',
   balanceInNationalCurrency: '4000000',
   amountCover: '1000000',
   termToCover: '24',
};

function setup({ item = creditor, ...props } = {}) {
   // Se captura el evento al momento de la llamada: React restaura el valor del campo controlado después.
   const fnVirtual = jest.fn((e, idx) => fnVirtual.seen.push({ name: e.target.name, value: e.target.value, idx }));
   fnVirtual.seen = [];
   const utils = renderComponent(
      <CardCreditorItem data={[item]} idx={0} fnVirtual={fnVirtual} extra='base' {...props} />
   );
   return { fnVirtual, ...utils };
}

const options = (select) => Array.from(select.options).map((o) => o.value);
const warnings = () => document.querySelectorAll('span[hidden]');

describe('CardCreditorItem', () => {
   test('numbers the creditor by its position', () => {
      setup({ idx: 0 });

      expect(screen.getByText('Acreedor 1')).toBeInTheDocument();
   });

   test('shows the data of the creditor', () => {
      setup();

      expect(screen.getByLabelText('Acreedor')).toHaveValue('Banco Uno');
      expect(screen.getByLabelText('Naturaleza del crédito')).toHaveValue('revolvente');
      expect(screen.getByLabelText('Tipo de crédito')).toHaveValue('RENOVADOS');
      expect(screen.getByLabelText('Monto autorizado')).toHaveValue('$5,000,000');
      expect(screen.getByLabelText('Saldo en moneda nacional')).toHaveValue('$4,000,000');
      expect(screen.getByLabelText('Monto a cubrir')).toHaveValue('$1,000,000');
      expect(screen.getByLabelText('Plazo a cubrir (meses)')).toHaveValue('24');
      expect(screen.getByLabelText('Moneda')).toHaveValue('MXN');
   });

   test('always locks the currency', () => {
      setup();

      expect(screen.getByLabelText('Moneda')).toBeDisabled();
   });

   test('shows an empty card when the creditor has no data yet', () => {
      setup({ item: {} });

      expect(screen.getByLabelText('Acreedor')).toHaveValue('');
      expect(screen.getByLabelText('Naturaleza del crédito')).toHaveDisplayValue('Seleccionar');
      expect(options(screen.getByLabelText('Tipo de crédito'))).toEqual(['']);
   });

   describe('credit types', () => {
      test('offers the types of a revolving credit', () => {
         setup();

         const values = options(screen.getByLabelText('Tipo de crédito'));
         expect(values).toContain('RENOVADOS');
         expect(values).toContain('LÍNEA DE CRÉDITO');
         expect(values).not.toContain('QUIROG');
      });

      test('offers the types of an amortizable credit', () => {
         setup({ item: { ...creditor, natureOfCredit: 'amortizable', typeOfCredit: '' } });

         const values = options(screen.getByLabelText('Tipo de crédito'));
         expect(values).toContain('QUIROG');
         expect(values).not.toContain('RENOVADOS');
      });
   });

   describe('dates', () => {
      test('offers every month when the year is not the current one', () => {
         setup();

         expect(options(screen.getByLabelText('Fecha de contratación', { selector: 'select' }))).toHaveLength(13);
         expect(options(screen.getByLabelText('Fecha de vencimiento', { selector: 'select' }))).toHaveLength(13);
      });

      test('offers only the months that already happened for a grant in the current year', () => {
         setup({ item: { ...creditor, yearOfGrant: twoDigitYear(), grantMonth: '' } });

         const months = options(screen.getByTestId('grantMonth-0'));
         expect(months).toHaveLength(currentMonth + 1);
         expect(months.at(-1)).not.toBe('');
      });

      test('offers only the months to come for an expiration in the current year', () => {
         setup({ item: { ...creditor, expirationYear: twoDigitYear(), expirationMonth: '' } });

         expect(options(screen.getByTestId('expirationMonth-0'))).toHaveLength(12 - currentMonth + 1);
      });

      test('offers ten years for the grant in the past and ten for the expiration in the future', () => {
         setup();

         const grantYears = options(document.getElementById('yearOfGrant-0'));
         const expirationYears = options(document.getElementById('expirationYear-0'));
         expect(grantYears).toHaveLength(11);
         expect(grantYears[1]).toBe(twoDigitYear());
         expect(grantYears.at(-1)).toBe(twoDigitYear(-9));
         expect(expirationYears).toHaveLength(11);
         expect(expirationYears[1]).toBe(twoDigitYear());
         expect(expirationYears.at(-1)).toBe(twoDigitYear(9));
      });
   });

   describe('amount warnings', () => {
      test('hides the warnings when the amounts are enough', () => {
         setup();

         expect(warnings()).toHaveLength(2);
      });

      test('warns for a revolving credit of Banco Base when the balance is lower than the amount to cover', () => {
         setup({ item: { ...creditor, balanceInNationalCurrency: '500000' } });

         expect(screen.getByText(/El saldo en moneda nacional debe ser mayor o igual/)).toBeVisible();
         expect(screen.getByLabelText('Saldo en moneda nacional').parentElement).toHaveClass('wrong');
         expect(screen.getByLabelText('Monto autorizado').parentElement).not.toHaveClass('wrong');
      });

      test('warns for an amortizable credit of Banco Base when the authorized amount is lower', () => {
         setup({ item: { ...creditor, natureOfCredit: 'amortizable', typeOfCredit: '', lineAmount: '10' } });

         expect(screen.getByText(/El monto autorizado debe ser mayor o igual/)).toBeVisible();
         expect(screen.getByLabelText('Monto autorizado').parentElement).toHaveClass('wrong');
      });

      test('applies the opposite rule for the credits of other banks', () => {
         setup({ extra: 'other', item: { ...creditor, lineAmount: '10' } });

         expect(screen.getByText(/El monto autorizado debe ser mayor o igual/)).toBeVisible();
      });

      test('does not warn while an amount is missing', () => {
         setup({ item: { ...creditor, amountCover: '' } });

         expect(warnings()).toHaveLength(2);
      });

      test('does not warn when the nature of the credit is not selected', () => {
         setup({ item: { ...creditor, natureOfCredit: '', typeOfCredit: '', lineAmount: '10' } });

         expect(warnings()).toHaveLength(2);
      });
   });

   describe('editing', () => {
      test('notifies the text typed with the card index', async () => {
         const { fnVirtual, user } = setup({ item: {} });

         await user.type(screen.getByLabelText('Acreedor'), 'B');

         expect(fnVirtual.seen[0]).toEqual({ name: 'creditor-0', value: 'B', idx: 0 });
      });

      test('notifies the selected nature of the credit', async () => {
         const { fnVirtual, user } = setup({ item: {} });

         await user.selectOptions(screen.getByLabelText('Naturaleza del crédito'), 'amortizable');

         expect(fnVirtual.seen[0]).toEqual({ name: 'natureOfCredit-0', value: 'amortizable', idx: 0 });
      });

      test('notifies the selected months and years', async () => {
         const { fnVirtual, user } = setup({ item: {} });

         await user.selectOptions(screen.getByTestId('grantMonth-0'), 'Febrero');
         await user.selectOptions(screen.getByTestId('expirationMonth-0'), 'Abril');

         expect(fnVirtual.seen.map((s) => s.name)).toEqual(['grantMonth-0', 'expirationMonth-0']);
         expect(fnVirtual.seen.map((s) => s.value)).toEqual(['Febrero', 'Abril']);
      });

      test('notifies the amounts with the money format typed', async () => {
         const { fnVirtual, user } = setup({
            item: { lineAmount: '15', balanceInNationalCurrency: '25', amountCover: '35' },
         });

         await user.type(screen.getByLabelText('Monto autorizado'), '0');
         await user.type(screen.getByLabelText('Saldo en moneda nacional'), '0');
         await user.type(screen.getByLabelText('Monto a cubrir'), '0');

         expect(fnVirtual.seen).toEqual([
            { name: 'lineAmount-0', value: '$150', idx: 0 },
            { name: 'balanceInNationalCurrency-0', value: '$250', idx: 0 },
            { name: 'amountCover-0', value: '$350', idx: 0 },
         ]);
      });

      test('notifies the term to cover', async () => {
         const { fnVirtual, user } = setup({ item: {} });

         await user.type(screen.getByLabelText('Plazo a cubrir (meses)'), '12');

         expect(fnVirtual.seen.at(-1)).toEqual({ name: 'termToCover-0', value: '12', idx: 0 });
      });
   });

   describe('states', () => {
      test('locks every field when disabled', () => {
         setup({ isDisabled: true });

         const card = screen.getByText('Acreedor 1').nextElementSibling;
         within(card)
            .getAllByRole('textbox')
            .concat(within(card).getAllByRole('combobox'))
            .forEach((field) => expect(field).toBeDisabled());
         expect(screen.getByLabelText('Acreedor')).toHaveClass('disabled');
      });

      test('marks the empty fields as mandatory once the section was saved', () => {
         setup({ item: {}, isSave: true });

         expect(screen.getByLabelText('Acreedor')).toHaveClass('mandatory');
         expect(screen.getByLabelText('Naturaleza del crédito')).toHaveClass('mandatory');
         expect(screen.getByLabelText('Monto a cubrir').parentElement).toHaveClass('mandatory');
      });
   });
});
