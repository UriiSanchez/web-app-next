import { screen } from '@testing-library/react';

import { DeleteButton } from '../../../components/Controls/DeleteButton';
import { renderComponent } from '../../utils/render';

describe('DeleteButton', () => {
   test('calls fn when clicked', async () => {
      const fn = jest.fn();
      const { user } = renderComponent(<DeleteButton fn={fn} />);

      await user.click(screen.getByTitle('Haz click para eliminar'));

      expect(fn).toHaveBeenCalledTimes(1);
   });

   test('uses the default test id unless one is provided', () => {
      const { rerender } = renderComponent(<DeleteButton fn={jest.fn()} />);
      expect(screen.getByTestId('btn-deleted')).toBeInTheDocument();

      rerender(<DeleteButton fn={jest.fn()} testId='btn-remove-row' />);
      expect(screen.getByTestId('btn-remove-row')).toBeInTheDocument();
      expect(screen.queryByTestId('btn-deleted')).not.toBeInTheDocument();
   });

   test('replaces the default position classes with sx', () => {
      renderComponent(<DeleteButton fn={jest.fn()} sx='custom-class' />);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
      expect(screen.getByRole('button')).not.toHaveClass('absolute');
   });
});
