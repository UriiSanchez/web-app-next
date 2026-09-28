import { ChatComponent } from '../../../../components/Requests/Chat/ChatComponent';
import { useGlobalContext } from '../../../../hooks';
import { getChatsForRequest } from '../../../../services';

jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
}));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getChatsForRequest: jest.fn(),
}));

describe('ChatComponent', () => {
   const props = { idRequest: 1, idStatusRequest: 10 };
   let globalServiceMock = {
      user: { userAD: 'user', idProfile: 6 },
      isReloading: false,
      actions: { toggleReloading: jest.fn() },
   };
   beforeEach(() => {
      useGlobalContext.mockReturnValue(globalServiceMock);
      getChatsForRequest.mockResolvedValue([
         {
            idMessage: 11,
            message: 'comentario de prueba',
            messageType: 'INFORMATION',
            userAD: 'testUser',
            fullName: 'USUARIO DE PRUEBAS',
            color: 'hsl(292,99%,45%)',
            createDate: '2025-02-01T10:00:00',
            updateDate: '2025-02-01T10:00:00',
            messageResponse: [
               {
                  idMessageResp: 1,
                  message: 'respuesta de prueba',
                  userAD: 'testUser2',
                  fullName: 'USUARIO DE PRUEBAS 2',
                  color: 'hsl(292,99%,45%)',
                  createDate: '2025-02-01T11:00:00',
                  updateDate: '2025-02-01T11:00:00',
                  deleted: false,
                  firstLetters: 'UP2',
               },
            ],
            deleted: false,
            firstLetters: 'UP',
         },
      ]);
   });

   test('it show information from the faculty member who made the comment', async () => {
      const {
         queries: { getByText },
      } = await renderPage(ChatComponent, props);

      expect(getByText('Informativo')).toBeVisible();
      expect(getByText('UP')).toBeVisible();
      expect(getByText('USUARIO DE PRUEBAS')).toBeVisible();
      expect(getByText('01/02/2025 10:00:00 AM')).toBeVisible();
      expect(getByText('comentario de prueba')).toBeVisible();
   });

   test('it should open comment response', async () => {
      const {
         user,
         queries: { getByRole, getByText },
      } = await renderPage(ChatComponent, props);

      await user.click(getByRole('button', { name: 'Respuestas de facultados 1 Respuesta' }));

      expect(getByText('Respuestas')).toBeVisible();
      expect(getByText('UP2')).toBeVisible();
      expect(getByText('USUARIO DE PRUEBAS 2')).toBeVisible();
      expect(getByText('01/02/2025 11:00:00 AM')).toBeVisible();
      expect(getByText('respuesta de prueba')).toBeVisible();
   });

   test('it should show the icon to close the answers when opening the answers section', async () => {
      const {
         user,
         queries: { getByRole, getByText },
      } = await renderPage(ChatComponent, props);

      await user.click(getByRole('button', { name: 'Respuestas de facultados 1 Respuesta' }));

      expect(getByText('close')).toBeVisible();
   });

   test('it should show delete button if the user is the same one who made the comment', async () => {
      globalServiceMock.user.userAD = 'testUser';
      const {
         user,
         queries: { getByRole },
      } = await renderPage(ChatComponent, { idRequest: 1, idStatusRequest: 26 });

      await user.click(getByRole('button', { name: 'Respuestas de facultados 1 Respuesta' }));

      expect(getByRole('button', { name: 'delete' })).toBeVisible();
   });
});
