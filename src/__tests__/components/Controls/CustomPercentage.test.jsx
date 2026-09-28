import { screen } from '@testing-library/react';

import { CustomPercentage } from '../../../components/Controls/CustomPercentage';
import { renderComponent } from '../../utils/render';

describe('CustomPercentage', () => {
   test('renders an editable input with the percent sign and forwards its props', async () => {
      const onChange = jest.fn();
      const { user } = renderComponent(<CustomPercentage type='text' placeholder='0' onChange={onChange} />);

      await user.type(screen.getByPlaceholderText('0'), '5');

      expect(screen.getByText('%')).toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
   });

   test('applies sxContainer to the wrapper', () => {
      renderComponent(<CustomPercentage sxContainer='mt-2' placeholder='0' />);

      expect(screen.getByPlaceholderText('0').parentElement).toHaveClass('mt-2');
   });

   test('when disabled shows the value as read-only text without an input', () => {
      renderComponent(<CustomPercentage disabled value='12.5' />);

      expect(screen.getByText('12.5')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
   });
});
