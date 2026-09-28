import { within, waitFor, fireEvent } from '@testing-library/react';

import RequestsReview from '../../../../pages/FAC/RequestsReview';

import { getQueryGraph } from '../../../../services';
import { useGlobalContext, useSourcePagination } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../components/Layout', () => ({
   __esModule: true,
   MainLayout: ({ children }) => children,
}));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useSourcePagination: jest.fn(),
}));
jest.mock('../../../../services', () => ({ __esModule: true, getQueryGraph: jest.fn() }));

describe('RequestsReview FAC', () => {
   beforeEach(() => {
      useGlobalContext.mockReturnValue({
         user: { userAD: 'testUser', idProfile: 6 },
         actions: { setPagination: jest.fn(), setExpandedRows: jest.fn() },
         pagination: { currentPage: 1 },
      });

      useSourcePagination.mockReturnValue({
         sourcePage: 0,
         setTotalPages: jest.fn(),
      });

      getQueryGraph.mockResolvedValue({ status: 200, data: [] });
   });

   test('render search section with input and button', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsReview);

      expect(getByRole('searchbox')).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
   });

   test('updates input value on change', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsReview);
      const input = getByRole('searchbox');
      fireEvent.change(input, { target: { value: 'test user' } });
      expect(input.value).toBe('test user');
   });

   test('show message for empty data', async () => {
      const {
         queries: { queryAllByRole },
      } = await renderPage(RequestsReview);
      const [, tBody] = queryAllByRole('rowgroup');
      const emptyRow = within(tBody).queryAllByRole('row');
      expect(emptyRow.length).toBe(1);
      expect(emptyRow[0].textContent).toBe('No se encontraron registros');
   });

   test('shows an error if the request response status is different than 200', async () => {
      getQueryGraph.mockResolvedValue({ status: 500, error: 'Test error message' });

      const {
         queries: { getByText },
      } = await renderPage(RequestsReview);

      await waitFor(() => expect(getByText('¡Error interno del servidor!')).toBeVisible());
      expect(getByText('[ Test error message ]')).toBeVisible();
   });
});
