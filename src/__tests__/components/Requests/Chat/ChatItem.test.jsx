import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import { ChatItem } from '../../../../components/Requests/Chat/ChatItem';
import { postChatAndResponse } from '../../../../services';
import { renderComponent } from '../../../utils/render';

jest.mock('../../../../services', () => ({ postChatAndResponse: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const chat = {
   idMessage: 5,
   messageType: 'INFORMATION',
   userAD: 'yo',
   firstLetters: 'YO',
   color: '#123456',
   fullName: 'Yo Mismo',
   createDate: '2025-02-06T10:30:00',
   message: 'Falta el aval',
   messageResponse: [],
};
const answers = [
   {
      idMessageResp: 71,
      userAD: 'yo',
      firstLetters: 'YO',
      fullName: 'Yo Mismo',
      createDate: '2025-02-07T09:00:00',
      message: 'Ya lo subí',
   },
   {
      idMessageResp: 72,
      userAD: 'otro',
      firstLetters: 'OT',
      fullName: 'Otro Facultado',
      createDate: '2025-02-07T10:00:00',
      message: 'Gracias',
   },
];

function setup({ props = {}, chatProps = {} } = {}) {
   const fnAnswer = jest.fn();
   const fnReload = jest.fn();
   const utils = renderComponent(
      <ChatItem
         chat={{ ...chat, ...chatProps }}
         userActive='yo'
         fnAnswer={fnAnswer}
         fnReload={fnReload}
         enableModify
         {...props}
      />
   );
   return { fnAnswer, fnReload, ...utils };
}

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('ChatItem', () => {
   test('shows the message with its type, author and date', () => {
      setup();

      expect(screen.getByText('Informativo')).toBeInTheDocument();
      expect(screen.getByText('Yo Mismo')).toBeInTheDocument();
      expect(screen.getByText('06/02/2025 10:30:00 AM')).toBeInTheDocument();
      expect(screen.getByText('Falta el aval')).toBeInTheDocument();
   });

   test('offers to answer only while the chat can be modified', async () => {
      const { fnAnswer, user, unmount } = setup();

      await user.click(screen.getByRole('button', { name: 'Responder' }));
      expect(fnAnswer).toHaveBeenCalledWith({ type: 'SAVE_RESPONSE', idChatReference: 5 });
      unmount();

      setup({ props: { enableModify: false } });
      expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument();
   });

   test('offers to delete only the own messages while the chat can be modified', () => {
      const { unmount } = setup();
      expect(screen.getByTitle('Eliminar comentario')).toBeInTheDocument();
      unmount();

      const { unmount: unmountOther } = setup({ props: { userActive: 'otro' } });
      expect(screen.queryByTitle('Eliminar comentario')).not.toBeInTheDocument();
      unmountOther();

      setup({ props: { enableModify: false } });
      expect(screen.queryByTitle('Eliminar comentario')).not.toBeInTheDocument();
   });

   test('deletes the chat after confirming and reloads', async () => {
      postChatAndResponse.mockResolvedValue({ status: 204 });
      const { fnReload, user } = setup();

      await user.click(screen.getByTitle('Eliminar comentario'));

      expect(Swal.fire).toHaveBeenCalledWith(
         expect.objectContaining({ html: expect.stringContaining('Estas apunto de eliminar tu comentario') })
      );
      await waitFor(() => expect(fnReload).toHaveBeenCalledTimes(1));
      expect(postChatAndResponse).toHaveBeenCalledWith({ idMessage: 5, userAD: 'yo' }, 'DELETE_CHAT_ALL');
   });

   test('does not delete the chat when the confirmation is cancelled', async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });
      const { fnReload, user } = setup();

      await user.click(screen.getByTitle('Eliminar comentario'));

      await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
      expect(postChatAndResponse).not.toHaveBeenCalled();
      expect(fnReload).not.toHaveBeenCalled();
   });

   test('shows the error and does not reload when the deletion fails', async () => {
      postChatAndResponse.mockResolvedValue({ status: 400 });
      const { fnReload, user } = setup();

      await user.click(screen.getByTitle('Eliminar comentario'));

      await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(2));
      expect(fnReload).not.toHaveBeenCalled();
   });

   test('logs the error when the deletion request throws', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      postChatAndResponse.mockRejectedValue(new Error('sin red'));
      const { fnReload, user } = setup();

      await user.click(screen.getByTitle('Eliminar comentario'));

      await waitFor(() => expect(console.error).toHaveBeenCalledWith(expect.any(Error)));
      expect(fnReload).not.toHaveBeenCalled();
   });

   describe('answers', () => {
      test('does not show the answers counter without answers', () => {
         setup();

         expect(screen.queryByText(/Respuesta/)).not.toBeInTheDocument();
      });

      test('uses the singular for one answer and the plural for several', () => {
         const { unmount } = setup({ chatProps: { messageResponse: [answers[0]] } });
         expect(screen.getByText('1 Respuesta')).toBeInTheDocument();
         unmount();

         setup({ chatProps: { messageResponse: answers } });
         expect(screen.getByText('2 Respuestas')).toBeInTheDocument();
      });

      test('opens and closes the list of answers', async () => {
         const { user } = setup({ chatProps: { messageResponse: answers } });
         expect(screen.queryByText('Ya lo subí')).not.toBeInTheDocument();

         await user.click(screen.getByText('2 Respuestas'));
         expect(screen.getByRole('heading', { name: 'Respuestas' })).toBeInTheDocument();
         expect(screen.getByText('Ya lo subí')).toBeInTheDocument();
         expect(screen.getByText('Otro Facultado')).toBeInTheDocument();

         await user.click(screen.getByTitle('Cerrar respuestas'));
         expect(screen.queryByText('Ya lo subí')).not.toBeInTheDocument();
      });

      test('offers to delete only the own answers', async () => {
         const { user } = setup({ chatProps: { messageResponse: answers } });
         await user.click(screen.getByText('2 Respuestas'));

         // Un botón de eliminar para el chat propio y otro para la respuesta propia.
         expect(screen.getAllByTitle('Eliminar comentario')).toHaveLength(2);
      });

      test('deletes an own answer, confirms with a snackbar and reloads', async () => {
         postChatAndResponse.mockResolvedValue({ status: 204 });
         const { fnReload, user } = setup({ chatProps: { messageResponse: answers } });
         await user.click(screen.getByText('2 Respuestas'));

         const [, deleteAnswer] = screen.getAllByTitle('Eliminar comentario');
         await user.click(deleteAnswer);

         await waitFor(() => expect(fnReload).toHaveBeenCalledTimes(1));
         expect(postChatAndResponse).toHaveBeenCalledWith({ idMessage: 71, userAD: 'yo' }, 'DELETE_RESPONSE');
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ html: '¡Comentario eliminado!' }));
      });

      test('closes the answers panel when the only answer is deleted', async () => {
         postChatAndResponse.mockResolvedValue({ status: 204 });
         const { user } = setup({ chatProps: { messageResponse: [answers[0]] } });
         await user.click(screen.getByText('1 Respuesta'));

         const [, deleteAnswer] = screen.getAllByTitle('Eliminar comentario');
         await user.click(deleteAnswer);

         await waitFor(() => expect(screen.queryByText('Ya lo subí')).not.toBeInTheDocument());
      });
   });
});
