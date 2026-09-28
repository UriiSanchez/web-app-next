import { fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import { RequestsContainer } from '../../../../components';
import { useDetectClickOutside, useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';
import mockListAnalyst from '../../../../__mocks__/analyst';
import mockListLeaders from '../../../../__mocks__/leaders';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../hooks', () => ({
   useGlobalContext: jest.fn(),
   useDetectClickOutside: jest.fn(),
}));

const mockRequest = [
   {
      idGroup: 1,
      isGroup: false,
      idCatStatus: 3,
      groupName: 'TEST COMPANY',
      isVisible: true,
      idLeader: mockUsers.LDC.userAD,
      requestResponseList: [
         {
            idRequest: 2,
            idCatStatus: 3,
         },
      ],
   },
];

describe('RequestsContainer component', () => {
   const mockOnExpand = jest.fn();
   const pushMock = jest.fn();
   const mockSetIsOpen = jest.fn();
   let globalContextMock;

   beforeEach(() => {
      jest.clearAllMocks();

      globalContextMock = {
         user: mockUsers.LDC,
         listAnalyst: mockListAnalyst,
         listLeaders: mockListLeaders,
         expandedRows: [],
         actions: { setExpandedRows: mockOnExpand },
      };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      useDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
   });

   it('show the skeleton when isLoading is true', async () => {
      const {
         queries: { getAllByRole },
      } = await renderPage(RequestsContainer, { requests: [], isLoading: true });
      const skeletons = getAllByRole('generic');

      expect(skeletons.length).toBeGreaterThanOrEqual(5);
   });

   it('show message when is not requests', async () => {
      const {
         queries: { getByText },
      } = await renderPage(RequestsContainer, { requests: [], isLoading: false });
      expect(getByText('No hay solicitudes por revisar')).toBeInTheDocument();
   });

   it('it launch setExpandedRows when click in expand', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsContainer, { requests: mockRequest, isLoading: false });
      const button = getByRole('button', { name: /expand_less/i });
      fireEvent.click(button);
      expect(mockOnExpand).toHaveBeenCalledWith(1);
   });

   it('it redirect to checklist if the assigned leader is the same as the user logged in', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(RequestsContainer, { requests: mockRequest, isLoading: false });
      const button = getByTestId('card-group-' + mockRequest[0].idGroup);
      fireEvent.click(button);
      expect(pushMock).toHaveBeenCalledWith('/LDC/Documentation/' + mockRequest[0].idGroup);
   });

   it('does not redirect to checklist if the assigned leader is the same as the user logged in', async () => {
      const propsCustom = [{ ...mockRequest[0], idLeader: 'UserLC4' }];
      const {
         queries: { getByTestId },
      } = await renderPage(RequestsContainer, { requests: propsCustom, isLoading: false });
      const button = getByTestId('card-group-' + mockRequest[0].idGroup);
      fireEvent.click(button);
      expect(pushMock).not.toHaveBeenCalled();
   });
});
