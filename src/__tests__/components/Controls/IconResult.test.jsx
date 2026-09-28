import { screen } from '@testing-library/react';

import { IconResult } from '../../../components/Controls/IconResult';
import { renderComponent } from '../../utils/render';

describe('IconResult', () => {
   test('shows a dash when there is no result', () => {
      const { rerender } = renderComponent(<IconResult result={null} />);
      expect(screen.getByText('-')).toBeInTheDocument();

      rerender(<IconResult />);
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
   });

   test('shows the like icon for a positive result', () => {
      renderComponent(<IconResult result={true} alt='Aprobado' />);

      expect(screen.getByRole('img', { name: 'Aprobado' })).toHaveAttribute('src', expect.stringContaining('ico_like'));
   });

   test('shows the dislike icon for a negative result', () => {
      renderComponent(<IconResult result={false} alt='Rechazado' />);

      expect(screen.getByRole('img', { name: 'Rechazado' })).toHaveAttribute(
         'src',
         expect.stringContaining('ico_dislike')
      );
   });
});
