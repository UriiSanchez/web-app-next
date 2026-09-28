import { fireEvent } from '@testing-library/react';

import { ShowAplicantOrGroup } from '../../../../components/Tables/LeaderRequest/ShowAplicantOrGroup';
import { useDetectClickOutside } from '../../../../hooks';
import { ReassignmentRequestDropdown } from '../../../../components/Controls';
import mockListLeaders from '../../../../__mocks__/leaders';

const mockRequests = [
   {
      idRequest: 1,
      relatedPersonResponseList: [
         { idCatTypePerson: 1, fullName: 'COMPANY USER TEST' },
         { idCatTypePerson: 2, fullName: 'OBLIGATED USER TEST' },
      ],
   },
   {
      idRequest: 2,
      relatedPersonResponseList: [{ idCatTypePerson: 1, fullName: 'COMPANY USER TEST TWO' }],
   },
];

jest.mock('../../../../hooks', () => ({ __esModule: true, useDetectClickOutside: jest.fn() }));

describe('ShowApplicantOrGroup Component', () => {
   const mockOnSelectRequest = jest.fn();
   const mockSetIsOpen = jest.fn();
   let props = { isGroup: false, groupName: 'COMPANY GROUP TEST', requests: [], onSelectRequest: mockOnSelectRequest };

   beforeEach(() => {
      jest.clearAllMocks();

      useDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
   });

   it('only displays the group name if isGroup is `false`', async () => {
      const {
         queries: { getByText, queryByRole },
      } = await renderPage(ShowAplicantOrGroup, props);
      expect(getByText('COMPANY GROUP TEST')).toBeInTheDocument();
      expect(queryByRole('combobox')).not.toBeInTheDocument();
   });

   it('opens the menu when clicked when enabled', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ShowAplicantOrGroup, { ...props, isGroup: true, requests: mockRequests });

      const trigger = getByTestId('name-applicant');
      fireEvent.click(trigger);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
   });

   it('displays the menu items when `isOpen=true`', async () => {
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByTestId },
      } = await renderPage(ShowAplicantOrGroup, { ...props, isGroup: true, requests: mockRequests  });

      mockRequests.forEach((item) => {
         expect(getByTestId('option-COMPANY-USER-TEST')).toBeInTheDocument();
         expect(getByTestId('option-COMPANY-USER-TEST')).toHaveTextContent("COMPANY USER TEST");
         expect(getByTestId('option-COMPANY-USER-TEST-TWO')).toBeInTheDocument();
         expect(getByTestId('option-COMPANY-USER-TEST-TWO')).toHaveTextContent("COMPANY USER TEST TWO");
      });
   });

   it('executes onReassignRequest and closes the menu when an item is selected', async () => {
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByTestId },
      } = await renderPage(ShowAplicantOrGroup, { ...props, isGroup: true, requests: mockRequests  });

      const trigger = getByTestId('option-COMPANY-USER-TEST-TWO');
      fireEvent.click(trigger);
      expect(mockOnSelectRequest).toHaveBeenCalledWith(2);
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
   });
});
