import { fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import { ReassignmentAnalystBall } from '../../../components/Controls';
import { onChangeRequestStatusOrAssignUser } from '../../../services';
import { useDetectClickOutside, useGlobalContext } from '../../../hooks';
import { EnumStatus } from '../../../helpers/config';
import mockUsers from '../../../__mocks__/users';
import mockListAnalyst from '../../../__mocks__/analyst';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../services', () => ({ __esModule: true, onChangeRequestStatusOrAssignUser: jest.fn() }));
jest.mock('../../../hooks', () => ({
   __esModule: true,
   useDetectClickOutside: jest.fn(),
   useGlobalContext: jest.fn(),
}));

describe('ReassignmentAnalystBall Component', () => {
   const reloadMock = jest.fn();
   const mockSetIsOpen = jest.fn();
   const mockActions = { toggleLoading: jest.fn() };
   const mockRequest = { idGroup: 1, idLeader: 'UserLC3', idAnalyst: '', idCatStatus: EnumStatus.EN_ANALISTA };
   let globalContextMock;

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         listAnalyst: mockListAnalyst,
         user: mockUsers.LDC,
         actions: mockActions,
      };

      useRouter.mockReturnValue({ reload: reloadMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      useDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
   });

   it('correctly renders the base component and if it does not have an assigned analyst, it should display “SA.”', async () => {
      const {
         queries: { getByTestId, getByText },
      } = await renderPage(ReassignmentAnalystBall, { request: mockRequest });

      expect(getByTestId('analyst-select-ball')).toBeInTheDocument();
      expect(getByText('SA')).toBeInTheDocument();
   });

   it('does not allow reassignment if the assigned leader is not the same as in session', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ReassignmentAnalystBall, { request: mockRequest });

      const container = getByTestId('analyst-select-ball');

      fireEvent.click(container);
      expect(mockSetIsOpen).not.toHaveBeenCalled();
   });

   it('allows you to open the menu if the assigned leader is the same as the leader in session', async () => {
      const {
         queries: { getByTestId, getByText },
         waitFor,
      } = await renderPage(ReassignmentAnalystBall, { request: { ...mockRequest, idLeader: 'UserLDC' } });

      const container = getByText('SA');

      fireEvent.click(container);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
   });

   it('should allow assigning or reassigning a different analyst', async () => {
      jest.useFakeTimers(); // Controla los temporizadores
      onChangeRequestStatusOrAssignUser.mockResolvedValueOnce({ status: 204 });
      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });

      const {
         queries: { getByText },
         waitFor,
      } = await renderPage(ReassignmentAnalystBall, { request: { ...mockRequest, idLeader: 'UserLDC' } });

      const analystTwo = getByText(mockListAnalyst[1].fullName);

      fireEvent.click(analystTwo);
      // Verifico llamadas iniciales
      await waitFor(() => {
         expect(mockActions.toggleLoading).toHaveBeenCalledWith('Asignando a analista de contraparte...');
         expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalled();
         expect(getByText('¡Se asignó la solicitud con éxito!')).toBeInTheDocument();
      });

      // aún NO debería llamarse
      expect(reloadMock).not.toHaveBeenCalled();
      //Se avanza manualmente el tiempo del setTimeout
      jest.runAllTimers();

      await waitFor(() =>{
         expect(reloadMock).toHaveBeenCalled();
      });

      expect(mockActions.toggleLoading).toHaveBeenCalledTimes(2)
   });
});
