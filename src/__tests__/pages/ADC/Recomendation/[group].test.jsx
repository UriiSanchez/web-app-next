import { useRouter } from 'next/router';
import { fireEvent } from '@testing-library/react';

import AnalystRecomendation from '../../../../pages/ADC/Recomendation/[group]';
import { getOneRequest, onChangeRequestStatusOrAssignUser } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getOneRequest: jest.fn(),
   onChangeRequestStatusOrAssignUser: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');

   return { ...originalModule, useGlobalContext: jest.fn() };
});

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

describe('AnalystRecomendation page', () => {
   const props = { idGroup: '1' };
   let pushMock;
   let globalContextMock;
   let getOneRequestMock;

   beforeEach(() => {
      jest.clearAllMocks();
      pushMock = jest.fn();

      globalContextMock = {
         user: mockUsers.ADC,
         actions: { toggleLoading: jest.fn() },
      };

      getOneRequestMock = { status: 200, data: mockValidateRequest };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      getOneRequest.mockResolvedValue(getOneRequestMock);
      onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
   });

   test('it should display an error message when the service that loads data respond with an error', async () => {
      getOneRequestMock = { status: 500, error: { response: { message: 'Test Error Message' }, traceId: '123' } };
      getOneRequest.mockResolvedValueOnce(getOneRequestMock);
      const {
         queries: { getByText },
         waitFor,
      } = await renderPage(AnalystRecomendation, props);

      await waitFor(() => expect(getByText('¡Error interno del servidor!')).toBeVisible());
      expect(getByText('[ Test Error Message ]')).toBeVisible();
   });

   test('it should render initial show idGroup and button "Finalizar" is disabled', async () => {
      const {
         queries: { getByRole, getByText },
      } = await renderPage(AnalystRecomendation, props);

      const heading = getByRole('heading', { name: /Solicitud/i, level: 3 });

      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Solicitud 0000000001');

      const applicantName = getByText('test user 1');
      expect(applicantName).toBeInTheDocument();
      expect(applicantName).toHaveTextContent('test user 1');

      const txtComment = getByRole('textbox');
      expect(txtComment).toBeInTheDocument();

      const btnFinish = getByRole('button', { name: /Finalizar/i });
      expect(btnFinish).toBeInTheDocument();
      expect(btnFinish).toBeDisabled();
   });

   test('it should navigate to "ApplicationEvaluation" page when "Regresar" button is clicked', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(AnalystRecomendation, props);

      await user.click(getByRole('button', { name: 'Regresar' }));

      expect(pushMock).toHaveBeenCalledWith('/ADC/ApplicationEvaluation/1');
   });

   test('update comment when text is entered into the textarea', async () => {
      const {
         queries: { getByPlaceholderText },
      } = await renderPage(AnalystRecomendation, props);

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
      } = await renderPage(AnalystRecomendation, props);

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
      } = await renderPage(AnalystRecomendation, props);

      const applicantOne = getByText('test user 1');
      expect(applicantOne).toBeInTheDocument();
      expect(applicantOne).toHaveTextContent('test user 1');

      const applicantTwo = getByText('test user 2');
      expect(applicantTwo).toBeInTheDocument();
      expect(applicantTwo).toHaveTextContent('test user 2');
   });
});
