import { fireEvent, within } from '@testing-library/react';

import { CustomSelect } from '../../../components/Controls';
import { useDetectClickOutside } from '../../../hooks';
import mockListLeaders from '../../../__mocks__/leaders';

jest.mock('../../../hooks', () => ({ __esModule: true, useDetectClickOutside: jest.fn() }));

describe('CustomSelect Componente', () => {
   const mockOnSelectChange = jest.fn();
   const props = { list: mockListLeaders, onSelectChange: mockOnSelectChange };
   const mockSetIsOpen = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      useDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
   });

   test('should display the full name of the current leader and not display the dropdown initially', async () => {
      const currentLeader = mockListLeaders[0];
      const {
         queries: { getByText },
      } = await renderPage(CustomSelect, { ...props, idLeader: currentLeader.userAD });

      expect(getByText(currentLeader.fullName)).toBeInTheDocument();
   });

   test('should display “Sin asignar” if idLeader does not match the list', async () => {
      const {
         queries: { getByText },
      } = await renderPage(CustomSelect, props);
      expect(getByText('Sin asignar')).toBeInTheDocument();
   });

   test('you must call setIsOpen(true) when clicking the button, opening the drop-down menu.', async () => {
      useDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByTestId },
      } = await renderPage(CustomSelect, props);

      const selectDiv = getByTestId('custom-select').firstChild;
      fireEvent.click(selectDiv);
   });

   test('should render the list of items when isOpen is true', async () => {
      const currentLeader = mockListLeaders[0];
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByText, getByTestId },
      } = await renderPage(CustomSelect, { ...props, idLeader: currentLeader.userAD });
      const container = getByTestId('custom-select');
      const dropdownList = container.children[1];

      // Usamos 'within' para limitar la búsqueda al contenedor de la lista
      const dropWithin = within(dropdownList);

      expect(dropWithin.getByText(mockListLeaders[0].fullName)).toBeInTheDocument();
      expect(dropWithin.getByText(mockListLeaders[1].fullName)).toBeInTheDocument();
      expect(dropWithin.getByText(mockListLeaders[2].fullName)).toBeInTheDocument();

      // Se valida que el ícono "check" se encuentre visible en el elemento seleccionado
      const selectedOption = dropWithin.getByText(currentLeader.fullName);
      const checkIcon = selectedOption.closest('div').querySelector('.material-symbols-outlined');

      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveTextContent('check');
   });

   test('you must call onSelectChange and close the drop-down menu when selecting a new item.', async () => {
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByTestId },
      } = await renderPage(CustomSelect, props);

      const selectItem = getByTestId('option-' + mockListLeaders[2].userAD);
      fireEvent.click(selectItem);

      // Verificamos que onSelectChange haya sido llamado con el userAD del elemento
      expect(mockOnSelectChange).toHaveBeenCalledWith(mockListLeaders[2].userAD);
      // Verificamos que setIsOpen haya sido llamado para cerrar el desplegable
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
   });
});
