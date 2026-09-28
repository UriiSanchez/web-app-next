import { screen } from '@testing-library/react';

import { Tooltip } from '../../../components/Controls/Tooltip';
import { renderComponent } from '../../utils/render';

// JSDOM no aplica CSS: la visibilidad del mensaje solo se distingue por las clases visible/invisible.
describe('Tooltip', () => {
   test('renders the default info icon and hides the message initially', () => {
      renderComponent(<Tooltip msg='Ayuda' />);

      expect(screen.getByRole('button', { name: 'info' })).toBeInTheDocument();
      expect(screen.getByText('Ayuda')).toHaveClass('invisible');
   });

   test('uses a custom icon', () => {
      renderComponent(<Tooltip msg='Ayuda' icon='help' />);

      expect(screen.getByRole('button', { name: 'help' })).toBeInTheDocument();
   });

   test('toggles the message when the button is clicked', async () => {
      const { user } = renderComponent(<Tooltip msg='Ayuda' />);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(screen.getByText('Ayuda')).toHaveClass('visible');

      await user.click(button);
      expect(screen.getByText('Ayuda')).toHaveClass('invisible');
   });

   test('hides the message when clicking outside', async () => {
      const { user } = renderComponent(<Tooltip msg='Ayuda' />);
      await user.click(screen.getByRole('button'));

      await user.click(document.body);

      expect(screen.getByText('Ayuda')).toHaveClass('invisible');
   });

   test('uses a scrollable box for long messages and a compact one for short messages', () => {
      const long = 'x'.repeat(101);
      const { rerender } = renderComponent(<Tooltip msg={long} />);
      expect(screen.getByText(long)).toHaveClass('container-overflow');

      rerender(<Tooltip msg='corto' />);
      expect(screen.getByText('corto')).toHaveClass('whitespace-nowrap');
   });
});
