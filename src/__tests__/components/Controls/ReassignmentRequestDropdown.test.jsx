import { fireEvent } from '@testing-library/react';

import { ReassignmentRequestDropdown } from '../../../components/Controls';
import { useDetectClickOutside } from '../../../hooks';
import mockListLeaders from '../../../__mocks__/leaders';
import mockUsers from '../../../__mocks__/users';

jest.mock('../../../hooks', () => ({ __esModule: true, useDetectClickOutside: jest.fn() }));

describe('Reassignment Request Dropdown', () => {
   const mockOnReassignRequest = jest.fn();
   const props = {
      listItems: mockListLeaders,
      assignedItem: mockUsers.LDC,
      isEnabled: true,
      attribute: 'idLeader',
      onReassignRequest: mockOnReassignRequest,
   };
   const mockSetIsOpen = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      useDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
   });

   it('render correctly component base', async () => {
      const {
         queries: { getByTestId, getByText },
      } = await renderPage(ReassignmentRequestDropdown, props);
      expect(getByTestId('dropdown-reassignment')).toBeInTheDocument();
      expect(getByText('USER TEST LDC'));
   });

   it("Displays ‘Unassigned’ when there is no assignedItem or no active leader exists.", async () => {
      const {
         queries: { getByText },
      } = await renderPage(ReassignmentRequestDropdown, { ...props, assignedItem: null });

      expect(getByText('Sin asignar')).toBeInTheDocument();
   });

   it('opens the menu when clicked when enabled', async () => {
      const {
         queries: { getByText },
      } = await renderPage(ReassignmentRequestDropdown, props);

      const trigger = getByText('USER TEST LDC');
      fireEvent.click(trigger);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
   });

   it('does not open the menu if isEnabled is false and has the gray class', async () => {
      const {
         queries: { getByText },
      } = await renderPage(ReassignmentRequestDropdown, { ...props, isEnabled: false });

      const trigger = getByText('USER TEST LDC');
      fireEvent.click(trigger);
      expect(mockSetIsOpen).not.toHaveBeenCalledWith(true);

      const parentDiv = trigger.parentElement;
      expect(parentDiv).toHaveClass('bg-[#E0E0E0]');
   });

   it('displays the menu items when `isOpen=true`', async () => {
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByTestId },
      } = await renderPage(ReassignmentRequestDropdown, props);

      mockListLeaders.forEach((item) => {
         expect(getByTestId('menu-option-' + item.userAD)).toBeInTheDocument();
         expect(getByTestId('menu-option-' + item.userAD)).toHaveTextContent(item.fullName);
      });
   });

   it('executes onReassignRequest and closes the menu when an item is selected', async () => {
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByText },
      } = await renderPage(ReassignmentRequestDropdown, props);

      const trigger = getByText('TEST USER LEADER ONE');
      fireEvent.click(trigger);
      expect(mockOnReassignRequest).toHaveBeenCalledWith('testLC1', 'idLeader');
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
   });

   it('Close the menu by clicking on "Sin asignar"', async () => {
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getAllByText },
      } = await renderPage(ReassignmentRequestDropdown, { ...props, assignedItem: null });

      const sinAsignar = getAllByText('Sin asignar')[1];
      fireEvent.click(sinAsignar);
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
   });

   it('apply blue border if the item is assigned', async () => {
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByTestId },
      } = await renderPage(ReassignmentRequestDropdown, props);

      const selectedItem = getByTestId('menu-option-' + props.assignedItem.userAD);
      expect(selectedItem).toHaveClass('border-[1.5px] border-blue-800');
   });
});
