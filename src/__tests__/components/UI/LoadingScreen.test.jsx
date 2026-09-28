import { screen } from '@testing-library/react';

import { LoadingScreen } from '../../../components/UI/LoadingScreen';
import { renderComponent } from '../../utils/render';

describe('LoadingScreen', () => {
   test('shows the loading image', () => {
      renderComponent(<LoadingScreen />);

      expect(screen.getByAltText('Loading EasyCreadit')).toBeInTheDocument();
   });

   test('shows the copyright with the current year', () => {
      renderComponent(<LoadingScreen />);

      const year = new Date().getFullYear();
      expect(screen.getByText(`Copyright @BancoBase${year} | Política de Privacidad`)).toBeInTheDocument();
   });
});
