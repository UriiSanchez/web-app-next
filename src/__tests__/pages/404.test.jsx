import Page404 from '../../pages/404';

import { useRouter } from 'next/router';
import { useGlobalContext } from '../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../components/Layout', () => ({ MainLayout: ({ children }) => children }));
jest.mock('../../hooks', () => {
   const originalModule = jest.requireActual('../../hooks');

   return { ...originalModule, useGlobalContext: jest.fn() };
});

describe('404 Page', () => {
   let routerMock;
   let globalContextMock;

   beforeEach(() => {
      routerMock = {
         back: jest.fn(),
      };

      globalContextMock = {
         user: { userAD: 'tester', idProfile: 4 },
      };

      useRouter.mockReturnValue(routerMock);
      useGlobalContext.mockReturnValue(globalContextMock);
   });

   test('renders page 404 with correct content', async () => {
      const {
         queries: { getByText },
         waitFor,
      } = await renderPage(Page404);
      await waitFor(() => expect(getByText('404')).toBeVisible());
      await waitFor(() => expect(getByText('No hemos encontrado nada por aquí')).toBeVisible());
   });
});
