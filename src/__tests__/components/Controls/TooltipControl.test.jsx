import { screen } from '@testing-library/react';

import { TooltipControl } from '../../../components/Controls/TooltipControl';
import { renderComponent } from '../../utils/render';

describe('TooltipControl', () => {
   test('renders the text and is hidden until the parent group is hovered', () => {
      renderComponent(<TooltipControl text='Texto de ayuda' />);

      // La visibilidad depende de clases CSS (hidden / group-hover:block) que JSDOM no evalúa.
      expect(screen.getByText('Texto de ayuda')).toHaveClass('hidden', 'group-hover:block');
   });

   test('applies the extra classes from sx', () => {
      renderComponent(<TooltipControl text='Texto' sx='left-2 top-2' />);

      expect(screen.getByText('Texto')).toHaveClass('left-2', 'top-2');
   });
});
