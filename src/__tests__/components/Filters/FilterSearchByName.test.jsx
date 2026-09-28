import { screen } from '@testing-library/react';

import { FilterSearchByName } from '../../../components/Filters/FilterSearchByName';
import { renderComponent } from '../../utils/render';

describe('FilterSearchByName', () => {
   test('shows the current value and placeholder', () => {
      renderComponent(<FilterSearchByName id='searchByName' value='Ana' onSetValue={jest.fn()} />);

      expect(screen.getByPlaceholderText('Busca por nombre o grupo')).toHaveValue('Ana');
   });

   test('reports the input name and typed value on each change', async () => {
      const onSetValue = jest.fn();
      const { user } = renderComponent(<FilterSearchByName id='searchByName' value='' onSetValue={onSetValue} />);

      await user.type(screen.getByRole('searchbox'), 'Lu');

      expect(onSetValue).toHaveBeenNthCalledWith(1, 'searchByName', 'L');
      expect(onSetValue).toHaveBeenNthCalledWith(2, 'searchByName', 'u');
   });

   test('limits the text to 70 characters', () => {
      renderComponent(<FilterSearchByName id='q' value='' onSetValue={jest.fn()} />);

      expect(screen.getByRole('searchbox')).toHaveAttribute('maxLength', '70');
   });

   test('uses full width by default and accepts custom form classes', () => {
      const { container, rerender } = renderComponent(<FilterSearchByName id='q' value='' onSetValue={jest.fn()} />);
      expect(container.querySelector('form')).toHaveClass('w-full');

      rerender(<FilterSearchByName id='q' value='' onSetValue={jest.fn()} sxForm='w-2/6' />);
      expect(container.querySelector('form')).toHaveClass('w-2/6');
      expect(container.querySelector('form')).not.toHaveClass('w-full');
   });
});
