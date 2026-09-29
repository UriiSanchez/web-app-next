import { screen } from '@testing-library/react';

import Page500 from '../../pages/500';
import { renderPage } from '../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));

describe('500 page', () => {
   test('shows the error code and the server error message inside the layout', () => {
      renderPage(<Page500 />);

      expect(screen.getByRole('heading', { name: '500' })).toBeInTheDocument();
      expect(screen.getByText('Server-side error occurred')).toBeInTheDocument();
      expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: '500' }));
   });

   test('goes back in the history when the back button is clicked', async () => {
      const { user, router } = renderPage(<Page500 />);

      await user.click(screen.getByRole('button', { name: 'Regresar' }));

      expect(router.back).toHaveBeenCalledTimes(1);
      expect(router.push).not.toHaveBeenCalled();
   });
});
