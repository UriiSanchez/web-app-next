import { useState } from 'react';
import { screen } from '@testing-library/react';

import { NumericInput } from '../../../components/Controls/NumericInput';
import { renderComponent } from '../../utils/render';

// NumericInput es controlado: el arnés conserva el valor que reporta onChange.
function Harness({ onChange, value: initial = '', ...props }) {
   const [value, setValue] = useState(initial);
   return (
      <NumericInput
         valueId='amount'
         {...props}
         value={value}
         onChange={(n) => {
            setValue(n === null ? '' : String(n));
            onChange?.(n);
         }}
      />
   );
}

describe('NumericInput', () => {
   test('truncates decimals when unfocused and shows them while focused', async () => {
      const { user } = renderComponent(<NumericInput valueId='amount' value='1234.567' onChange={jest.fn()} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('1,234');

      await user.click(input);
      expect(input).toHaveValue('1,234.567');

      await user.tab();
      expect(input).toHaveValue('1,234');
   });

   test('always shows decimals with viewDecimals', () => {
      renderComponent(<NumericInput valueId='amount' value='1234.567' viewDecimals onChange={jest.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('1,234.567');
   });

   test('renders empty with the placeholder when there is no value', () => {
      renderComponent(<NumericInput valueId='amount' onChange={jest.fn()} />);

      expect(screen.getByPlaceholderText('0')).toHaveValue('');
   });

   test('reports the typed number through onChange', async () => {
      const onChange = jest.fn();
      const { user } = renderComponent(<Harness onChange={onChange} />);

      await user.type(screen.getByRole('textbox'), '1250');

      expect(screen.getByRole('textbox')).toHaveValue('1,250');
      expect(onChange).toHaveBeenLastCalledWith(1250);
   });

   test('ignores the minus sign unless allowNegative', async () => {
      const onChange = jest.fn();
      const { user, unmount } = renderComponent(<Harness onChange={onChange} />);
      await user.type(screen.getByRole('textbox'), '-5');
      expect(onChange).toHaveBeenLastCalledWith(5);
      unmount();

      onChange.mockClear();
      const second = renderComponent(<Harness onChange={onChange} allowNegative />);
      await second.user.type(screen.getByRole('textbox'), '-5');
      expect(onChange).toHaveBeenLastCalledWith(-5);
   });

   test('is not editable when disabled', () => {
      renderComponent(<NumericInput valueId='amount' value='10' disabled onChange={jest.fn()} />);

      expect(screen.getByRole('textbox')).toBeDisabled();
   });

   test('shows the read-only percentage with two decimals', () => {
      renderComponent(
         <NumericInput valueId='amount' value='10' withPercentage percentage={12.5} percentageId='pct' onChange={jest.fn()} />
      );
      const percentage = document.getElementById('pct');

      expect(percentage).toHaveValue('12.50');
      expect(percentage).toBeDisabled();
      expect(screen.getByText('%')).toBeInTheDocument();
   });

   test('defaults the percentage to 0.00 and hides it unless withPercentage', () => {
      const { rerender } = renderComponent(
         <NumericInput valueId='amount' withPercentage percentageId='pct' onChange={jest.fn()} />
      );
      expect(document.getElementById('pct')).toHaveValue('0.00');

      rerender(<NumericInput valueId='amount' percentageId='pct' onChange={jest.fn()} />);
      expect(document.getElementById('pct')).toBeNull();
   });
});
