import { screen } from '@testing-library/react';

import { ReassignmentRequestDropdown } from '../../../components/Controls/ReassignmentRequestDropdown';
import { renderComponent } from '../../utils/render';

const listItems = [
   { userAD: 'ana', fullName: 'Ana Lopez', color: 'red' },
   { userAD: 'luis', fullName: 'Luis Perez' },
];

const renderDropdown = (props = {}) =>
   renderComponent(
      <ReassignmentRequestDropdown listItems={listItems} onReassignRequest={jest.fn()} attribute='idAnalyst' {...props} />
   );

describe('ReassignmentRequestDropdown', () => {
   test('shows the assigned name or "Sin asignar"', () => {
      const { rerender } = renderDropdown({ assignedItem: listItems[0] });
      expect(screen.getByText('Ana Lopez')).toBeInTheDocument();

      rerender(<ReassignmentRequestDropdown listItems={listItems} onReassignRequest={jest.fn()} />);
      expect(screen.getByText('Sin asignar')).toBeInTheDocument();
   });

   test('opens the list and reports the chosen userAD with the attribute', async () => {
      const onReassignRequest = jest.fn();
      const { user } = renderDropdown({ assignedItem: listItems[0], onReassignRequest });

      await user.click(screen.getByText('Ana Lopez'));
      await user.click(screen.getByTestId('menu-option-luis'));

      expect(onReassignRequest).toHaveBeenCalledWith('luis', 'idAnalyst');
      expect(screen.queryByTestId('menu-option-luis')).not.toBeInTheDocument();
   });

   test('does not open when it is disabled', async () => {
      const { user } = renderDropdown({ assignedItem: listItems[0], isEnabled: false });

      await user.click(screen.getByText('Ana Lopez'));

      expect(screen.queryByTestId('menu-option-luis')).not.toBeInTheDocument();
   });

   test('offers a "Sin asignar" entry that only closes the list when nobody is assigned', async () => {
      const onReassignRequest = jest.fn();
      const { user } = renderDropdown({ onReassignRequest });
      await user.click(screen.getByTestId('dropdown-reassignment').firstChild);
      expect(screen.getAllByText('Sin asignar')).toHaveLength(2);

      await user.click(screen.getAllByText('Sin asignar')[1]);

      expect(onReassignRequest).not.toHaveBeenCalled();
      expect(screen.queryByTestId('menu-option-ana')).not.toBeInTheDocument();
   });

   test('does not offer "Sin asignar" when somebody is assigned', async () => {
      const { user } = renderDropdown({ assignedItem: listItems[1] });

      await user.click(screen.getByText('Luis Perez'));

      expect(screen.queryByText('Sin asignar')).not.toBeInTheDocument();
   });

   test('closes when clicking outside', async () => {
      const { user } = renderDropdown({ assignedItem: listItems[0] });
      await user.click(screen.getByText('Ana Lopez'));
      expect(screen.getByTestId('menu-option-luis')).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByTestId('menu-option-luis')).not.toBeInTheDocument();
   });

   test('does not propagate clicks to ancestors', async () => {
      const onParentClick = jest.fn();
      const { user } = renderComponent(
         <div onClick={onParentClick}>
            <ReassignmentRequestDropdown
               listItems={listItems}
               assignedItem={listItems[0]}
               onReassignRequest={jest.fn()}
            />
         </div>
      );

      await user.click(screen.getByText('Ana Lopez'));
      await user.click(screen.getByTestId('menu-option-luis'));

      expect(onParentClick).not.toHaveBeenCalled();
   });
});
