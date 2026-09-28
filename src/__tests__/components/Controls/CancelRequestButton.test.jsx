
import { CancelRequestButton } from '../../../components/Controls';
import { onChangeRequestStatusOrAssignUser } from '../../../services';
import { useGlobalContext } from '../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../services', () => ({ __esModule: true, onChangeRequestStatusOrAssignUser: jest.fn() }));
jest.mock('../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
}));

const mockUserEF = {
   path: 'EMG',
   status: [1, 7, 8, 9],
   idProfile: 3,
   userAD: 'UserEF',
};

const mockUserLC = {
   path: 'LDC',
   status: [3, 5],
   idProfile: 4,
   userAD: 'UserLC',
};

const mockUserMR = {
   path: 'MRC',
   status: [2],
   idProfile: 2,
   userAD: 'UserMR',
};

describe('CancelRequestButton component', () => {
   let props = { idCatStatus: 1, idGroup: 1 };
   let globalContextMock;
   beforeEach(() => {
      globalContextMock = {
         user: mockUserEF,
         actions: {
            toggleLoading: jest.fn(),
         },
      };

      useGlobalContext.mockReturnValue(globalContextMock);
   });

   test('it the button should be displayed if the user is a specialist', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(CancelRequestButton, props);
      const button = getByTestId('Boton cancelar solicitud');

      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
   });

   test('it should be button disabled if the status does not belong to the specialist', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(CancelRequestButton, { ...props, idCatStatus: 2 });
      const button = getByTestId('Boton cancelar solicitud');

      expect(button).toBeDisabled();
   });

   test('it the button should NOT be displayed if the profile is different from LDC or EF', async () => {
      globalContextMock.user = mockUserMR;
      useGlobalContext.mockReturnValueOnce(globalContextMock);

      const {
         queries: { getByTestId },
      } = await renderPage(CancelRequestButton, { ...props, idCatStatus: 1 });
      const button = getByTestId('Boton cancelar solicitud');
      expect(button).toBeDisabled();
   });

   test('when the user clicks on the button it should show the cancel modal.', async () => {
      const {
         queries: { getByTestId, getByRole },
         user,
      } = await renderPage(CancelRequestButton, props);
      const button = getByTestId('Boton cancelar solicitud');
      await user.click(button);

      const modal = getByRole('dialog');
      const cancelButton = getByRole('button', { name: 'Cancelar' });
      const backButton = getByRole('button', { name: 'Regresar' });
      // Se muestra el modal
      expect(modal).toBeInTheDocument();
      expect(modal).toBeVisible();
      // Revisamos si estan los botones
      expect(cancelButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
   });

   test('clicking CANCEL should close the application and redirect you to the applications screen', async () => {
      onChangeRequestStatusOrAssignUser.mockReturnValueOnce({ status: 204 });
      const {
         queries: { getByTestId, getByRole },
         user,
      } = await renderPage(CancelRequestButton, props);
      const button = getByTestId('Boton cancelar solicitud');
      await user.click(button);

      const cancelButton = getByRole('button', { name: 'Cancelar' });
      // Se lanza evento para cancelar la solicitud
      await user.click(cancelButton);
      expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
         idGroupRequest: 1,
         idCatStatus: 23,
         nextProfile: 'EF',
         userCreate: 'UserEF',
      });
   });

   describe('When profile is LDC', () => {
      beforeEach(() => {
         globalContextMock.user = mockUserLC;
      });

      test('it should button  be displayed if the user is a counterpart leader', async () => {
         const {
            queries: { getByTestId },
         } = await renderPage(CancelRequestButton, { ...props, idCatStatus: 3 });
         const button = getByTestId('Boton cancelar solicitud');

         expect(button).toBeInTheDocument();
         expect(button).not.toBeDisabled();
      });

      test('it the button must be disabled if the status does not belong to the counterpart leader', async () => {
         const {
            queries: { getByTestId },
         } = await renderPage(CancelRequestButton, { ...props, idCatStatus: 2 });
         const button = getByTestId('Boton cancelar solicitud');

         expect(button).toBeDisabled();
      });
   });
});
