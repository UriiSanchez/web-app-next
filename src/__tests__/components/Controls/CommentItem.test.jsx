import { screen } from '@testing-library/react';

import { CommentItem } from '../../../components/Controls/CommentItem';
import { renderComponent } from '../../utils/render';

describe('CommentItem', () => {
   test('opens the comments panel with the title and text when there are comments', async () => {
      const { user } = renderComponent(<CommentItem title='Notas' comments='Todo correcto' />);

      expect(screen.getByText('Haz clic para ver los comentarios')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Comentarios' }));

      expect(screen.getByText('Notas')).toBeInTheDocument();
      expect(screen.getByText('Todo correcto')).toBeInTheDocument();
   });

   test('falls back to the default title', async () => {
      const { user } = renderComponent(<CommentItem comments='Texto' />);

      await user.click(screen.getByRole('button', { name: 'Comentarios' }));

      expect(screen.getByText('Comentarios -')).toBeInTheDocument();
   });

   test('does not open anything when there are no comments', async () => {
      const { user } = renderComponent(<CommentItem title='Notas' comments='' />);

      await user.click(screen.getByRole('button', { name: 'Comentarios' }));

      expect(screen.getByText('No hay comentarios')).toBeInTheDocument();
      expect(screen.queryByText('Notas')).not.toBeInTheDocument();
   });

   test('closes with the close icon', async () => {
      const { user } = renderComponent(<CommentItem title='Notas' comments='Texto' />);
      await user.click(screen.getByRole('button', { name: 'Comentarios' }));

      // El icono de cierre es un span sin rol; se ubica por su texto.
      await user.click(screen.getByText('close'));

      expect(screen.queryByText('Texto')).not.toBeInTheDocument();
   });

   test('closes when clicking outside', async () => {
      const { user } = renderComponent(<CommentItem title='Notas' comments='Texto' />);
      await user.click(screen.getByRole('button', { name: 'Comentarios' }));

      await user.click(document.body);

      expect(screen.queryByText('Texto')).not.toBeInTheDocument();
   });
});
