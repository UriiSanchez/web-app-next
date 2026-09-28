import { screen } from '@testing-library/react';

import { AddButton } from '../../../components/Controls/AddButton';
import { renderComponent } from '../../utils/render';

describe('AddButton', () => {
   test('calls fn when clicked', async () => {
      const fn = jest.fn();
      const { user } = renderComponent(<AddButton fn={fn} />);

      await user.click(screen.getByRole('button', { name: 'add_circle' }));

      expect(fn).toHaveBeenCalledTimes(1);
   });

   test('does not call fn and is marked as clean when disabled', async () => {
      const fn = jest.fn();
      const { user } = renderComponent(<AddButton fn={fn} isDisabled />);
      const button = screen.getByRole('button', { name: 'add_circle' });

      await user.click(button);

      expect(button).toBeDisabled();
      expect(button).toHaveClass('clean');
      expect(fn).not.toHaveBeenCalled();
   });

   test('uses the default position classes unless sx is provided', () => {
      const { rerender } = renderComponent(<AddButton fn={jest.fn()} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('absolute');

      rerender(<AddButton fn={jest.fn()} sx='custom-class' />);
      expect(button).toHaveClass('custom-class');
      expect(button).not.toHaveClass('absolute');
   });
});
