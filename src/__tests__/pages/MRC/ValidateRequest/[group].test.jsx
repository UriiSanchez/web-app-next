import { act, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import ValidateRequest from '../../../../pages/MRC/ValidateRequest/[group]';
import { graphGetGroup, onChangeRequestStatusOrAssignUser } from '../../../../services';
import { useDetectClickOutside, useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';
import mockListLeaders from '../../../../__mocks__/leaders';
import { EnumStatus } from '../../../../helpers/config';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   graphGetGroup: jest.fn(),
   onChangeRequestStatusOrAssignUser: jest.fn(),
}));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useDetectClickOutside: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));

const mockValidateRequest = {
   idGroup: 1,
   sendOtherProfile: false,
   idCatStatus: 1,
   nameEmg: 'Test User EF',
   userCreate: 'TestEF',
   requestResponseList: [
      {
         idRequest: 1,
         relatedPersonResponseList: [{ idClient: '313', idCatTypePerson: 1, fullName: 'test user 1' }],
      },
   ],
};

const mockSecondApplicant = {
   idRequest: 2,
   relatedPersonResponseList: [{ idClient: '314', idCatTypePerson: 1, fullName: 'test user 2' }],
};

const mockObligated = {
   idClient: '1293',
   idCatTypePerson: 2,
   fullName: 'test user 3',
};

describe('ValidateRequest', () => {
   let globalContextMock;
   let oneRequestMock;
   const props = { idGroup: 1 };
   const mockSetIsOpen = jest.fn();
   const pushMock = jest.fn();
   const mockToggleLoading = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         user: mockUsers.MR,
         listLeaders: mockListLeaders,
         actions: { toggleLoading: mockToggleLoading },
      };

      oneRequestMock = {
         status: 200,
         data: mockValidateRequest,
      };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      graphGetGroup.mockResolvedValue(oneRequestMock);
      useDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
   });

   test('it should render initial show idGroup and button "Asignar solicitud" is disabled', async () => {
      const {
         queries: { getByRole, getByText, getByTestId },
      } = await renderPage(ValidateRequest, props);

      const heading = getByRole('heading', { name: /Solicitud/i, level: 2 });

      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Solicitud 0000000001');

      expect(getByText(mockValidateRequest.nameEmg)).toBeInTheDocument();
      expect(getByTestId('custom-select')).toBeInTheDocument();
      expect(getByText('Sin asignar')).toBeInTheDocument();

      const applicantName = getByText('test user 1');
      expect(applicantName).toBeInTheDocument();
      expect(applicantName).toHaveTextContent('test user 1');

      const txtComment = getByRole('textbox');
      expect(txtComment).toBeInTheDocument();

      const btnAssigned = getByRole('button', { name: /Asignar solicitud/i });
      expect(btnAssigned).toBeInTheDocument();
      expect(btnAssigned).toBeDisabled();

      const btnReturn = getByRole('button', { name: /Devolver solicitud/i });
      expect(btnReturn).toBeInTheDocument();
      expect(btnReturn).toBeEnabled();
   });

   test('it should navigate to "documentation" page when "Regresar" button is clicked', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(ValidateRequest, props);

      const backButton = getByRole('button', { name: 'Regresar' });
      await user.click(backButton);
      expect(pushMock).toHaveBeenCalledWith('/MRC/Documentation/' + props.idGroup);
   });

   test('it should enabled button "Asignar solicitud" is completed checklist and selected a leader', async () => {
      oneRequestMock.data.sendOtherProfile = true;
      graphGetGroup.mockResolvedValueOnce(oneRequestMock);

      useDetectClickOutside.mockReturnValue({
         isOpen: true,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
      const {
         queries: { getByRole, getByTestId },
      } = await renderPage(ValidateRequest, props);

      const selectItem = getByTestId('option-' + mockListLeaders[0].userAD);
      fireEvent.click(selectItem);

      const btnAssigned = getByRole('button', { name: /Asignar solicitud/i });
      expect(btnAssigned).toBeInTheDocument();
      expect(btnAssigned).toBeEnabled();
   });

   test('update comment when text is entered into the textarea', async () => {
      const {
         queries: { getByPlaceholderText },
      } = await renderPage(ValidateRequest, props);

      const txtComment = getByPlaceholderText('Ingresa aquí los comentarios');
      const newtext = 'Esta es una Unit Testing sobre Validate Request';

      fireEvent.change(txtComment, { target: { value: newtext } });
      expect(txtComment.value).toBe(newtext);
   });

   test('it should visible obligated solidary item', async () => {
      let newMockValidateRequest = { ...mockValidateRequest };
      newMockValidateRequest.requestResponseList[0].relatedPersonResponseList.push(mockObligated);
      graphGetGroup.mockResolvedValueOnce({ status: 200, data: newMockValidateRequest });

      const {
         queries: { getByText },
      } = await renderPage(ValidateRequest, props);

      const obligatedName = getByText('test user 3');
      expect(obligatedName).toBeInTheDocument();
      expect(obligatedName).toHaveTextContent('test user 3');
   });

   test('it should render two applicants', async () => {
      let newMockValidateRequest = { ...mockValidateRequest };
      newMockValidateRequest.requestResponseList.push(mockSecondApplicant);
      graphGetGroup.mockResolvedValueOnce({ status: 200, data: newMockValidateRequest });

      const {
         queries: { getByText },
      } = await renderPage(ValidateRequest, props);

      const applicantOne = getByText('test user 1');
      expect(applicantOne).toBeInTheDocument();
      expect(applicantOne).toHaveTextContent('test user 1');

      const applicantTwo = getByText('test user 2');
      expect(applicantTwo).toBeInTheDocument();
      expect(applicantTwo).toHaveTextContent('test user 2');
   });

   test('you must successfully assign the request and navigate to requests.', async () => {
      oneRequestMock.data.sendOtherProfile = true;
      graphGetGroup.mockResolvedValueOnce(oneRequestMock);
      onChangeRequestStatusOrAssignUser.mockResolvedValueOnce({ status: 204 });
      useDetectClickOutside.mockReturnValue({ isOpen: true, setIsOpen: mockSetIsOpen });
      const leaderSelect = mockListLeaders[0].userAD;
      const {
         queries: { getByTestId, getByRole },
         waitFor,
      } = await renderPage(ValidateRequest, props);

      // Se selecciona la primera opción como lider asignado
      const selectItem = getByTestId('option-' + leaderSelect);
      fireEvent.click(selectItem);

      const btnAssigned = getByRole('button', { name: /Asignar solicitud/i });
      fireEvent.click(btnAssigned);

      await waitFor(() => {
         expect(mockToggleLoading).toHaveBeenCalledWith('Asignando...');

         expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
            idGroupRequest: mockValidateRequest.idGroup,
            idCatStatus: EnumStatus.EN_ASIGNACION_LIDER,
            idLeader: leaderSelect,
            userCreate: mockUsers.MR.userAD,
            nextProfile: 'LC',
         });

         expect(mockToggleLoading).toHaveBeenCalledWith();
      });
   });

   test('you should successfully return the request and navigate to requests.', async () => {
      onChangeRequestStatusOrAssignUser.mockResolvedValueOnce({ status: 204 });
      const {
         queries: { getByRole },
         waitFor,
      } = await renderPage(ValidateRequest, props);

      const returnButton = getByRole('button', { name: /Devolver solicitud/i });
      await act(async () => {
         fireEvent.click(returnButton);
      });

      await waitFor(() => {
         expect(mockToggleLoading).toHaveBeenCalledWith('Devolviendo...');

         expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
            idGroupRequest: mockValidateRequest.idGroup,
            idCatStatus: EnumStatus.DEVUELTA_EF_POR_MESA,
            userCreate: mockUsers.MR.userAD,
            nextProfile: 'EF',
            requests: [
               { idRequest: 1, comment: '' },
               { idRequest: 2, comment: '' },
            ],
         });

         expect(pushMock).toHaveBeenCalledWith('/MRC/RequestsReview');
         expect(mockToggleLoading).toHaveBeenCalledWith();
      });
   });

   test('should display an error message', async () => {
      graphGetGroup.mockResolvedValueOnce({
         status: 500,
         data: { errors: [{ message: 'Test Error Message' }] },
      });

      const {
         queries: { getByRole, getByText },
      } = await renderPage(ValidateRequest, props);
      const heading = getByRole('heading', { name: /¡Error interno del servidor!/i, level: 2 });
      expect(heading).toBeInTheDocument();
      expect(getByText('[ Test Error Message ]')).toBeInTheDocument();
   });
});
