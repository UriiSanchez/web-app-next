import Pagination from '../../../components/Tables/Pagination';

import { useGlobalContext, useSourcePagination } from '../../../hooks';

jest.mock('../../../hooks', () => ({ useGlobalContext: jest.fn(), useSourcePagination: jest.fn() }));

let globalContext;
let sourcePagination;

describe('Pagination component', () => {
   beforeEach(() => {
      globalContext = {
         actions: { setPagination: jest.fn() },
         pagination: { currentPage: 1, totalPages: 1 },
      };

      sourcePagination = {
         sourcePage: 0,
         sourceTotalPages: 1,
         loadMore: jest.fn(),
      };

      useGlobalContext.mockReturnValue(globalContext);
      useSourcePagination.mockReturnValue(sourcePagination);
   });

   test('enables previous and first buttons when current page is greater than 1', async () => {
      globalContext.pagination.currentPage = 2;
      globalContext.pagination.totalPages = 2;
      useGlobalContext.mockReturnValue(globalContext);

      const {
         queries: { getByRole },
      } = await renderPage(Pagination);

      expect(getByRole('button', { name: 'Anterior' })).toBeEnabled();
      expect(getByRole('button', { name: 'Primera' })).toBeEnabled();
   });

   test('enables next and last buttons when there are more elements than the ones in the current page', async () => {
      globalContext.pagination.totalPages = 10;

      const {
         queries: { getByRole },
      } = await renderPage(Pagination);

      expect(getByRole('button', { name: 'Siguiente' })).toBeEnabled();
      expect(getByRole('button', { name: 'Última' })).toBeEnabled();
   });

   test('disables next and last buttons when current page is the last page', async () => {
      globalContext.pagination.currentPage = 3;
      globalContext.pagination.totalPages = 3;
      useGlobalContext.mockReturnValue(globalContext);

      const {
         queries: { getByRole },
      } = await renderPage(Pagination);

      expect(getByRole('button', { name: 'Siguiente' })).toBeDisabled();
      expect(getByRole('button', { name: 'Última' })).toBeDisabled();
   });

   test('shows correct number of page number buttons', async () => {
      globalContext.pagination.totalPages = 3;
      useGlobalContext.mockReturnValue(globalContext);

      const {
         queries: { getByRole },
      } = await renderPage(Pagination);

      expect(getByRole('button', { name: '1' })).toBeEnabled();
      expect(getByRole('button', { name: '2' })).toBeEnabled();
      expect(getByRole('button', { name: '3' })).toBeEnabled();
   });

   test('show load more button instead of last button when in last page and there are more source pages then current page', async () => {
      globalContext.pagination.currentPage = 10;
      globalContext.pagination.totalPages = 10;
      sourcePagination.sourcePage = 10;
      sourcePagination.sourceTotalPages = 15;

      useGlobalContext.mockReturnValue(globalContext);
      useSourcePagination.mockReturnValue(sourcePagination);

      const {
         queries: { getByRole },
      } = await renderPage(Pagination);

      expect(getByRole('button', { name: 'Cargar más' })).toBeEnabled();
   });
});
