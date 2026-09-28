import Page500 from '../../pages/500';

import { useRouter } from 'next/router';
import { useGlobalContext } from '../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../components/Layout', () => ({ MainLayout: ({ children }) => children }));
jest.mock('../../hooks', () => {
   const originalModule = jest.requireActual('../../hooks');

   return { ...originalModule, useGlobalContext: jest.fn() };
});

describe('500 Page', () => {
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

   test('renders page 500 with correct content', async () => {
      const {
         queries: { getByText },
         waitFor,
      } = await renderPage(Page500);
      await waitFor(() => expect(getByText('500')).toBeVisible());
      await waitFor(() => expect(getByText('Server-side error occurred')).toBeVisible());
   });
});
