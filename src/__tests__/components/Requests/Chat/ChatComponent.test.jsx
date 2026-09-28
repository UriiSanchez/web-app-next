import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import { ChatComponent } from '../../../../components/Requests/Chat/ChatComponent';
import { getChatsForRequest, postChatAndResponse } from '../../../../services';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';

jest.mock('../../../../services', () => ({ getChatsForRequest: jest.fn(), postChatAndResponse: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const EN_REVISION_FACULTADO = 26;
const EN_RESOLUCION_SECRETARIADO = 6;

const chats = [
   {
      idMessage: 5,
      messageType: 'INFORMATION',
      userAD: 'otro',
      firstLetters: 'OT',
      fullName: 'Otro Facultado',
      createDate: '2025-02-06T10:30:00',
      message: 'Falta el aval',
      messageResponse: [],
   },
   {
      idMessage: 6,
      messageType: 'INFORMATION',
      userAD: 'yo',
      firstLetters: 'YO',
      fullName: 'Yo Mismo',
      createDate: '2025-02-06T11:00:00',
      message: 'Lo reviso',
      messageResponse: [],
   },
];

async function setup({ idStatusRequest = EN_REVISION_FACULTADO, chatList = chats } = {}) {
   getChatsForRequest.mockResolvedValue(chatList);
   const actions = createActions({ toggleReloading: jest.fn() });
   const wrapper = createContextWrapper({ user: { userAD: 'yo' }, isReloading: false, actions });
   const utils = renderComponent(<ChatComponent idRequest={77} idStatusRequest={idStatusRequest} />, { wrapper });
   await screen.findByRole('heading', { name: 'Chat (Cambios y comentarios)' });
   return { actions, ...utils };
}

const messageInput = () => screen.getByPlaceholderText('Escribe aquí tus comentarios');
const informRadio = () => screen.getByRole('radio');
const sendButton = () => screen.getByTitle('Enviar chat');

describe('ChatComponent', () => {
   test('shows the skeleton while the chats load and then the title and messages', async () => {
      let resolveChats;
      getChatsForRequest.mockReturnValue(new Promise((resolve) => (resolveChats = resolve)));
      const wrapper = createContextWrapper({
         user: { userAD: 'yo' },
         isReloading: false,
         actions: createActions({ toggleReloading: jest.fn() }),
      });
      renderComponent(<ChatComponent idRequest={77} idStatusRequest={EN_REVISION_FACULTADO} />, { wrapper });
      // El esqueleto ya muestra el título; se distingue por la ausencia del formulario.
      expect(screen.queryByPlaceholderText('Escribe aquí tus comentarios')).not.toBeInTheDocument();

      resolveChats(chats);

      expect(await screen.findByPlaceholderText('Escribe aquí tus comentarios')).toBeInTheDocument();
      expect(getChatsForRequest).toHaveBeenCalledWith(77);
      expect(screen.getByText('Falta el aval')).toBeInTheDocument();
      expect(screen.getByText('Lo reviso')).toBeInTheDocument();
   });

   test('renders an empty conversation', async () => {
      await setup({ chatList: [] });

      expect(screen.queryByText('Falta el aval')).not.toBeInTheDocument();
      expect(messageInput()).toBeInTheDocument();
   });

   test('hides the message form when the request is not under faculty review', async () => {
      await setup({ idStatusRequest: EN_RESOLUCION_SECRETARIADO });

      expect(screen.getByText('Falta el aval')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Escribe aquí tus comentarios')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument();
   });

   test('counts the typed characters', async () => {
      const { user } = await setup();

      await user.type(messageInput(), 'Hola');

      expect(screen.getByText('4/3000')).toBeInTheDocument();
   });

   test('hides the send button until there is a message and a message type', async () => {
      const { user } = await setup();
      // JSDOM no aplica estilos; el botón se oculta mediante la clase `hidden`.
      expect(sendButton()).toHaveClass('hidden');

      await user.type(messageInput(), 'Hola');
      expect(sendButton()).toHaveClass('hidden');

      await user.click(informRadio());
      expect(sendButton()).not.toHaveClass('hidden');
   });

   test('sends an informative message and reloads the chats', async () => {
      postChatAndResponse.mockResolvedValue({ status: 204 });
      const { actions, user } = await setup();
      await user.click(informRadio());
      await user.type(messageInput(), 'Todo en orden');

      await user.click(sendButton());

      expect(postChatAndResponse).toHaveBeenCalledWith(
         { message: 'Todo en orden', messageType: 'INFORMATION', userAD: 'yo', idRequest: 77 },
         'SAVE_CHAT'
      );
      await waitFor(() => expect(actions.toggleReloading).toHaveBeenCalledTimes(1));
      expect(messageInput()).toHaveValue('');
      expect(informRadio()).not.toBeChecked();
   });

   test('keeps the message and shows the error when saving fails', async () => {
      postChatAndResponse.mockResolvedValue({ status: 400 });
      const { actions, user } = await setup();
      await user.click(informRadio());
      await user.type(messageInput(), 'Todo en orden');

      await user.click(sendButton());

      await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
      expect(actions.toggleReloading).not.toHaveBeenCalled();
      expect(messageInput()).toHaveValue('Todo en orden');
   });

   test('logs the error when the request throws', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      postChatAndResponse.mockRejectedValue(new Error('sin red'));
      const { actions, user } = await setup();
      await user.click(informRadio());
      await user.type(messageInput(), 'Todo en orden');

      await user.click(sendButton());

      await waitFor(() => expect(console.error).toHaveBeenCalledWith(expect.any(Error)));
      expect(actions.toggleReloading).not.toHaveBeenCalled();
   });

   describe('replying', () => {
      test('shows the answered message instead of the message type selector', async () => {
         const { user } = await setup();

         await user.click(screen.getAllByRole('button', { name: 'Responder' })[0]);

         expect(screen.queryByText('*Tu comentario es para:')).not.toBeInTheDocument();
         expect(screen.getByTitle('Cancelar respuesta')).toBeInTheDocument();
         expect(screen.getAllByText('Falta el aval')).toHaveLength(2);
      });

      test('goes back to a new message when the reply is cancelled', async () => {
         const { user } = await setup();
         await user.click(screen.getAllByRole('button', { name: 'Responder' })[0]);

         await user.click(screen.getByTitle('Cancelar respuesta'));

         expect(screen.getByText('*Tu comentario es para:')).toBeInTheDocument();
         expect(screen.queryByTitle('Cancelar respuesta')).not.toBeInTheDocument();
      });

      test('sends the answer referencing the message without a message type', async () => {
         postChatAndResponse.mockResolvedValue({ status: 204 });
         const { actions, user } = await setup();
         await user.click(screen.getAllByRole('button', { name: 'Responder' })[0]);
         await user.type(messageInput(), 'Ya lo subo');

         await user.click(sendButton());

         expect(postChatAndResponse).toHaveBeenCalledWith(
            { message: 'Ya lo subo', userAD: 'yo', idRequest: 77, idMessage: 5 },
            'SAVE_RESPONSE'
         );
         await waitFor(() => expect(actions.toggleReloading).toHaveBeenCalledTimes(1));
      });
   });
});
