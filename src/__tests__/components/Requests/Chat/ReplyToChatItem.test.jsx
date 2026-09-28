import { screen } from '@testing-library/react';

import { ReplyToChatItem } from '../../../../components/Requests/Chat/ReplyToChatItem';
import { renderComponent } from '../../../utils/render';

const comment = {
   idMessage: 5,
   messageType: 'INFORMATION',
   userAD: 'etorres',
   firstLetters: 'ET',
   color: '#123456',
   fullName: 'Elena Torres',
   createDate: '2025-02-06T10:30:00',
   message: 'Falta el aval',
};

describe('ReplyToChatItem', () => {
   test('shows the author, the date and the message being answered', () => {
      renderComponent(<ReplyToChatItem comment={comment} fnAction={jest.fn()} />);

      expect(screen.getByText('ET')).toBeInTheDocument();
      expect(screen.getByText('Elena Torres')).toBeInTheDocument();
      expect(screen.getByText('06/02/2025 10:30:00 AM')).toBeInTheDocument();
      expect(screen.getByText('Falta el aval')).toBeInTheDocument();
   });

   test('cuts messages longer than 300 characters and adds an ellipsis', () => {
      const message = 'a'.repeat(350);
      renderComponent(<ReplyToChatItem comment={{ ...comment, message }} fnAction={jest.fn()} />);

      expect(screen.getByText('a'.repeat(300) + '...')).toBeInTheDocument();
   });

   test('does not add an ellipsis to a message of exactly 300 characters', () => {
      const message = 'a'.repeat(300);
      renderComponent(<ReplyToChatItem comment={{ ...comment, message }} fnAction={jest.fn()} />);

      expect(screen.getByText(message)).toBeInTheDocument();
   });

   test('shows a placeholder when the message is empty', () => {
      renderComponent(<ReplyToChatItem comment={{ ...comment, message: '' }} fnAction={jest.fn()} />);

      expect(screen.getByText('- Mensaje no encontrado -')).toBeInTheDocument();
   });

   test('cancels the reply back to a new chat', async () => {
      const fnAction = jest.fn();
      const { user } = renderComponent(<ReplyToChatItem comment={comment} fnAction={fnAction} />);

      await user.click(screen.getByTitle('Cancelar respuesta'));

      expect(fnAction).toHaveBeenCalledWith({ type: 'SAVE_CHAT', idChatReference: null });
   });
});
