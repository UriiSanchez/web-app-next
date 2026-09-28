import { screen } from '@testing-library/react';

import { CustomNumericFormat } from '../../../components/Controls/CustomNumericFormat';
import { renderComponent } from '../../utils/render';

describe('CustomNumericFormat', () => {
   test('formats the value with the given thousand separator', () => {
      renderComponent(<CustomNumericFormat value='1234567' thousandSeparator=',' readOnly />);

      expect(screen.getByRole('textbox')).toHaveValue('1,234,567');
   });

   test('onChangeNumeric receives the numeric value without formatting', async () => {
      const onChangeNumeric = jest.fn();
      const { user } = renderComponent(
         <CustomNumericFormat thousandSeparator=',' onChangeNumeric={onChangeNumeric} />
      );
      const input = screen.getByRole('textbox');

      await user.type(input, '1234');

      expect(input).toHaveValue('1,234');
      expect(onChangeNumeric).toHaveBeenLastCalledWith(1234);
   });

   test('onChangeNumeric receives null when the input is cleared', async () => {
      const onChangeNumeric = jest.fn();
      const { user } = renderComponent(<CustomNumericFormat defaultValue='25' onChangeNumeric={onChangeNumeric} />);

      await user.clear(screen.getByRole('textbox'));

      expect(onChangeNumeric).toHaveBeenLastCalledWith(null);
   });

   test('falls back to the regular onChange when onChangeNumeric is not provided', async () => {
      const onChange = jest.fn();
      const { user } = renderComponent(<CustomNumericFormat onChange={onChange} />);

      await user.type(screen.getByRole('textbox'), '7');

      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls[0][0].target.value).toBe('7');
   });
});
