import { fireEvent } from '@testing-library/react';
import { TrackingSelect } from '../../../../components/Tables/Tracking/TrackingSelect';

const mockUseDetectClickOutside = jest.fn();
jest.mock('../../../../hooks', () => ({
   useDetectClickOutside: (initialState) => mockUseDetectClickOutside(initialState),
}));

const mockApplicants = [
   { idRequest: 1, idClient: 2134, fullName: 'Solicitante 1', idCatStatus: 10 },
   { idRequest: 2, idClient: 4312, fullName: 'Solicitante 2', idCatStatus: 11 },
   { idRequest: 3, idClient: 3123, fullName: 'Solicitante 3', idCatStatus: 6 },
   { idRequest: 4, idClient: 1342, fullName: 'Solicitante 4', idCatStatus: 10 },
];

describe('TrackingSelect component', () => {
   let props = { idRequestActive: 1, listApplicants: mockApplicants };
   const mockOnSelectChange = jest.fn();
   const mockSetIsOpen = jest.fn();

   beforeEach(() => {
      mockUseDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   test('should render the name of the active applicant and the closed dropdown', async () => {
      const {
         queries: { getByText },
      } = await renderPage(TrackingSelect, { ...props, onSelectChange: mockOnSelectChange });
      expect(getByText('Solicitante 1')).toBeInTheDocument();
      expect(getByText('keyboard_arrow_down')).toBeInTheDocument();
   });

   test('it should open the dropdown menu and display all applicants when clicking on the main button.', async () => {
      mockUseDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByText, getAllByText },
      } = await renderPage(TrackingSelect, { ...props, onSelectChange: mockOnSelectChange });
      const clientOne = getAllByText('Solicitante 1');
      expect(clientOne).toHaveLength(2);

      expect(getByText('Solicitante 2')).toBeInTheDocument();
      expect(getByText('Solicitante 3')).toBeInTheDocument();
      expect(getByText('Solicitante 4')).toBeInTheDocument();
      expect(getByText('keyboard_arrow_up')).toBeInTheDocument();
   });

   test('it must call onSelectChange with the correct idRequest and close the dropdown when selecting an applicant.', async () => {
      mockUseDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByText },
      } = await renderPage(TrackingSelect, { ...props, onSelectChange: mockOnSelectChange });

      fireEvent.click(getByText('Solicitante 2'));
      // Verifica que la función onSelectChange fue llamada una vez
      expect(mockOnSelectChange).toHaveBeenCalledTimes(1);
      // Verifica que la función onSelectChange fue llamada con el idRequest del Solicitante 2
      expect(mockOnSelectChange).toHaveBeenCalledWith(2);
      // Verifica que se llamó a setIsOpen(false) para cerrar el dropdown
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
   });

   test('it should render the correct icons when the status is 10 or 11.', async () => {
      mockUseDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getAllByText },
      } = await renderPage(TrackingSelect, { ...props, onSelectChange: mockOnSelectChange });

      const checkIcons = getAllByText('check_circle');
      expect(checkIcons).toHaveLength(2);
      expect(checkIcons[0]).toHaveClass('text-emerald-500');

      const cancelIcons = getAllByText('cancel');
      expect(cancelIcons).toHaveLength(1);
      expect(cancelIcons[0]).toHaveClass('text-red-500');
   });
});
