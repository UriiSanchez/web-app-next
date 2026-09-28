import { screen } from '@testing-library/react';

import { AvatarUser } from '../../../components/Controls/AvatarUser';
import { renderComponent } from '../../utils/render';

describe('AvatarUser', () => {
   test('shows the initials with the default color and size', () => {
      renderComponent(<AvatarUser firstLetters='TU' />);
      const avatar = screen.getByText('TU').parentElement;

      expect(avatar).toHaveStyle({ backgroundColor: '#475569' });
      expect(avatar).toHaveClass('h-9', 'w-9');
   });

   test('applies a custom color, height and width', () => {
      renderComponent(<AvatarUser firstLetters='AB' color='#ff0000' height='h-12' width='w-12' />);
      const avatar = screen.getByText('AB').parentElement;

      expect(avatar).toHaveStyle({ backgroundColor: '#ff0000' });
      expect(avatar).toHaveClass('h-12', 'w-12');
      expect(avatar).not.toHaveClass('h-9');
   });
});
