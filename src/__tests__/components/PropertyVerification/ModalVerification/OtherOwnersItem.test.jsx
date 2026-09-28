import { screen } from '@testing-library/react';

import { OtherOwnersItem } from '../../../../components/PropertyVerification/ModalVerification/OtherOwnersItem';
import { renderComponent } from '../../../utils/render';

function setup({ value = 'Ana Ruiz', showButtons = { showBtnAdded: false, showBtnDeleted: false } } = {}) {
   const handlers = { onState: jest.fn(), onDelete: jest.fn(), onAdded: jest.fn() };
   const utils = renderComponent(
      <OtherOwnersItem name='otherName2' value={value} showButtons={showButtons} {...handlers} />
   );
   return { ...handlers, ...utils };
}

describe('OtherOwnersItem', () => {
   test('shows the name of the owner in an input identified by name', () => {
      setup();

      const input = screen.getByPlaceholderText('Nombre del propietario');
      expect(input).toHaveValue('Ana Ruiz');
      expect(input).toHaveAttribute('id', 'otherName2');
      expect(input).toHaveAttribute('name', 'otherName2');
   });

   test('shows an empty input when there is no value', () => {
      setup({ value: null });

      expect(screen.getByPlaceholderText('Nombre del propietario')).toHaveValue('');
   });

   test('notifies each change of the input', async () => {
      const { onState, user } = setup({ value: '' });

      await user.type(screen.getByPlaceholderText('Nombre del propietario'), 'Al');

      expect(onState).toHaveBeenCalledTimes(2);
      expect(onState.mock.calls[0][0].target.name).toBe('otherName2');
   });

   test('does not show the buttons by default', () => {
      setup();

      expect(screen.queryByTestId('deleted-otherName2')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
   });

   test('deletes the owner', async () => {
      const { onDelete, user } = setup({ showButtons: { showBtnAdded: false, showBtnDeleted: true } });

      await user.click(screen.getByTestId('deleted-otherName2'));

      expect(onDelete).toHaveBeenCalledTimes(1);
   });

   test('adds another owner when the current one has a name', async () => {
      const { onAdded, user } = setup({ showButtons: { showBtnAdded: true, showBtnDeleted: false } });

      await user.click(screen.getByRole('button'));

      expect(onAdded).toHaveBeenCalledTimes(1);
   });

   test('blocks adding another owner while the name is empty', async () => {
      const { onAdded, user } = setup({ value: '', showButtons: { showBtnAdded: true, showBtnDeleted: false } });

      expect(screen.getByRole('button')).toBeDisabled();
      await user.click(screen.getByRole('button'));

      expect(onAdded).not.toHaveBeenCalled();
   });
});
