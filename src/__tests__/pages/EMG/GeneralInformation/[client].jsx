import GeneralInformation from '../../../../pages/EMG/GeneralInformation/[client]';

import { useRouter } from 'next/router';
import { getGeneralInfo } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ __esModule: true, getGeneralInfo: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));

const mockClientInfo = {
   appli: {
      idCatTypePerson: 1,
      idClient: '169025',
      fullName: 'TEST NAME',
      isInProgress: false,
      email: 'nocorreo@example.com',
      personType: 'PM',
      civilStatus: '',
      birthdate: '1990-09-14T00:00:00',
      rfc: 'XAXX010101000',
      group: 'TEST GROUP',
      edit: false,
   },
   group: [],
   requests: [],
};

describe('General Information Page', () => {
   let globalContextMock;
   let getInformationMock;
   let pushMock = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         user: mockUsers.EF,
         actions: { toggleLoading: jest.fn() },
      };

      getInformationMock = { status: 200, data: mockClientInfo };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      getGeneralInfo.mockReturnValue(getInformationMock);
   });

   test('it the users data should be displayed when loading the information', async () => {
      const {
         queries: { getByTestId, getByText },
         waitFor,
      } = await renderPage(GeneralInformation, { idClient: 169025 });
      await waitFor(() => {
         expect(getByTestId('client-name')).toHaveTextContent('TEST NAME');
         expect(getByText('TEST GROUP')).toBeInTheDocument();
         expect(getByText('169025')).toBeInTheDocument();
         expect(getByText('XAXX010101000')).toBeInTheDocument();
         expect(getByTestId('client-email')).toHaveTextContent('nocorreo@example.com');
      });
   });

   test('shold disable "Crear solicitud" button when info is empty', async () => {
      getGeneralInfo.mockReturnValueOnce({
         status: 200,
         data: { appli: null, group: null, requests: null },
      });

      const {
         queries: { getByRole },
         waitFor,
      } = await renderPage(GeneralInformation, { idClient: '169025' });

      await waitFor(() => expect(getGeneralInfo).toHaveBeenCalled());
      const createButton = getByRole('button', { name: /Crear solicitud/i });
      expect(createButton).toBeDisabled();
   });

   test('shold navigate to home page when "Regresar" button is clicked', async () => {
      const {
         queries: { getByRole },
         user,
         waitFor,
      } = await renderPage(GeneralInformation, { idClient: '169025' });

      await waitFor(() => expect(getGeneralInfo).toHaveBeenCalled());
      const backButton = getByRole('button', { name: /Regresar/i });
      await user.click(backButton);

      expect(pushMock).toHaveBeenCalledWith('/');
   });
});
