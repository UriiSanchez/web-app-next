import { screen } from '@testing-library/react';

import { DropdownList } from '../../../components/Controls/DropdownList';
import { renderComponent } from '../../utils/render';

const data = [
   { type: 'a', title: 'Opción A', ph: 'a' },
   { type: 'b', title: 'Opción B', ph: 'b' },
];

const renderDropdown = (props = {}) =>
   renderComponent(
      <DropdownList toAction={jest.fn()} data={data} {...props}>
         <span>Abrir</span>
      </DropdownList>
   );

describe('DropdownList', () => {
   test('renders the trigger content and one button per option', () => {
      renderDropdown();

      expect(screen.getByRole('button', { name: 'Abrir' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Opción A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Opción B' })).toBeInTheDocument();
   });

   test('toggles the open state when the trigger is clicked', async () => {
      const { user, container } = renderDropdown();
      // JSDOM no aplica CSS: el estado abierto solo es visible mediante la clase "open".
      const root = container.firstChild;
      expect(root).not.toHaveClass('open');

      await user.click(screen.getByRole('button', { name: 'Abrir' }));
      expect(root).toHaveClass('open');

      await user.click(screen.getByRole('button', { name: 'Abrir' }));
      expect(root).not.toHaveClass('open');
   });

   test('choosing an option calls toAction with it and closes the menu', async () => {
      const toAction = jest.fn();
      const { user, container } = renderDropdown({ toAction });
      await user.click(screen.getByRole('button', { name: 'Abrir' }));

      await user.click(screen.getByRole('button', { name: 'Opción B' }));

      expect(toAction).toHaveBeenCalledWith(data[1]);
      expect(container.firstChild).not.toHaveClass('open');
   });

   test('does not propagate clicks to ancestors', async () => {
      const onParentClick = jest.fn();
      const { user } = renderComponent(
         <div onClick={onParentClick}>
            <DropdownList toAction={jest.fn()} data={data}>
               <span>Abrir</span>
            </DropdownList>
         </div>
      );

      await user.click(screen.getByRole('button', { name: 'Abrir' }));
      await user.click(screen.getByRole('button', { name: 'Opción A' }));

      expect(onParentClick).not.toHaveBeenCalled();
   });

   test('closes when clicking outside', async () => {
      const { user, container } = renderDropdown();
      await user.click(screen.getByRole('button', { name: 'Abrir' }));
      expect(container.firstChild).toHaveClass('open');

      await user.click(document.body);

      expect(container.firstChild).not.toHaveClass('open');
   });

   test('shifts the menu back into view when it overflows on the left', async () => {
      const { user, container } = renderDropdown();
      // JSDOM devuelve siempre ceros; se simula el desbordamiento.
      jest.spyOn(container.querySelector('#menu'), 'getBoundingClientRect').mockReturnValue({ left: -20 });

      await user.click(screen.getByRole('button', { name: 'Abrir' }));

      expect(container.querySelector('#menu')).toHaveClass('translate-x-0');
   });

   test('renders no options when data is empty', () => {
      renderDropdown({ data: [] });

      expect(screen.getAllByRole('button')).toHaveLength(1);
   });
});
