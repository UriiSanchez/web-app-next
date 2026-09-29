import { screen } from '@testing-library/react';

import Page404 from '../../pages/404';
import { renderPage } from '../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));

describe('404 page', () => {
   test('shows the error code and the not found message inside the layout', () => {
      renderPage(<Page404 />);

      expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
      expect(screen.getByText('No hemos encontrado nada por aquí')).toBeInTheDocument();
      expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: '404' }));
   });

   test('goes back in the history when the back button is clicked', async () => {
      const { user, router } = renderPage(<Page404 />);

      await user.click(screen.getByRole('button', { name: 'Regresar' }));

      expect(router.back).toHaveBeenCalledTimes(1);
      expect(router.push).not.toHaveBeenCalled();
   });
});
