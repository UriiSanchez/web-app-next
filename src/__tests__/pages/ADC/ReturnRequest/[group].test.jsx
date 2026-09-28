import { useRouter } from 'next/router';
import { fireEvent } from '@testing-library/react';

import ReturnRequest from '../../../../pages/ADC/ReturnRequest/[group]';
import { getOneRequest } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ __esModule: true, getOneRequest: jest.fn() }));
jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));

const mockValidateRequest = {
   idGroup: 1,
   sendOtherProfile: false,
   requestResponseList: [
      {
         idRequest: 1,
         relatedPersonResponseList: [{ idClient: '313', idCatTypePerson: 1, fullName: 'test user 1' }],
      },
   ],
   idCatStatus: 1,
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

// TODO Faltan pruebas para el botón devolver
describe('ReturnRequest for Analyst', () => {
   const props = { idGroup: 1 };
   let globalContextMock;
   let oneRequestMock;
   let pushMock = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         user: mockUsers.ADC,
         actions: { toggleLoading: jest.fn() },
      };

      oneRequestMock = { status: 200, data: mockValidateRequest };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      getOneRequest.mockResolvedValue(oneRequestMock);
   });

   test('it should render initial show idGroup and button "Asignar solicitud" is disabled', async () => {
      const {
         queries: { getByRole, getByText },
      } = await renderPage(ReturnRequest, props);

      const heading = getByRole('heading', { name: /Solicitud/i, level: 2 });

      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Solicitud 0000000001');

      const applicantName = getByText('test user 1');
      expect(applicantName).toBeInTheDocument();
      expect(applicantName).toHaveTextContent('test user 1');

      const txtComment = getByRole('textbox');
      expect(txtComment).toBeInTheDocument();

      const btnReturn = getByRole('button', { name: /Devolver solicitud/i });
      expect(btnReturn).toBeInTheDocument();
      expect(btnReturn).toBeEnabled();
   });

   test('it should navigate to "documentation" page when "Regresar" button is clicked', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(ReturnRequest, props);

      const backButton = getByRole('button', { name: 'Regresar' });
      await user.click(backButton);
      expect(pushMock).toHaveBeenCalledWith('/ADC/Documentation/' + props.idGroup);
   });

   test('update comment when text is entered into the textarea', async () => {
      const {
         queries: { getByPlaceholderText },
      } = await renderPage(ReturnRequest, props);

      const txtComment = getByPlaceholderText('Ingresa aquí los comentarios');
      const newtext = 'Esta es una Unit Testing sobre Validate Request';

      fireEvent.change(txtComment, { target: { value: newtext } });
      expect(txtComment.value).toBe(newtext);
   });

   test('it should visible obligated solidary item', async () => {
      let newMockValidateRequest = { ...mockValidateRequest };
      newMockValidateRequest.requestResponseList[0].relatedPersonResponseList.push(mockObligated);
      getOneRequest.mockResolvedValueOnce({ status: 200, data: newMockValidateRequest });

      const {
         queries: { getByText },
      } = await renderPage(ReturnRequest, props);

      const obligatedName = getByText('test user 3');
      expect(obligatedName).toBeInTheDocument();
      expect(obligatedName).toHaveTextContent('test user 3');
   });

   test('it should render two applicants', async () => {
      let newMockValidateRequest = { ...mockValidateRequest };
      newMockValidateRequest.requestResponseList.push(mockSecondApplicant);
      getOneRequest.mockResolvedValueOnce({ status: 200, data: newMockValidateRequest });

      const {
         queries: { getByText },
      } = await renderPage(ReturnRequest, props);

      const applicantOne = getByText('test user 1');
      expect(applicantOne).toBeInTheDocument();
      expect(applicantOne).toHaveTextContent('test user 1');

      const applicantTwo = getByText('test user 2');
      expect(applicantTwo).toBeInTheDocument();
      expect(applicantTwo).toHaveTextContent('test user 2');
   });
});
