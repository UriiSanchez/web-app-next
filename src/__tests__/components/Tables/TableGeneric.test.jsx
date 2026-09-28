import { within } from '@testing-library/react';

import { TableGeneric } from '../../../components';

import { useRouter } from 'next/router';
import { useGlobalContext } from '../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../hooks', () => ({
   useGlobalContext: jest.fn(),
   useSourcePagination: () => ({ sourcePage: 0, totalPages: 1, loadMore: jest.fn() }),
}));

describe('TableGeneric component', () => {
   const data = [
      { idGroup: 1,idClient: 1, fullName: 'name 1', group: 'group 1', statusRequest: 'Sin Solicitud' },
      { idGroup: 2,idClient: 2, fullName: 'name 2', group: 'group 2', statusRequest: 'Autorizada' },
      { idGroup: 3,idClient: 3, fullName: 'name 3', group: 'group 3', statusRequest: 'No Aprobada' },
      { idGroup: 4,idClient: 4, fullName: 'name 4', group: 'group 4', statusRequest: 'Finalizada' },
      { idGroup: 5,idClient: 5, fullName: 'name 5', group: 'group 5', statusRequest: 'Cancelada' },
   ];

   const props = { data, typeTable: 'EMG_SEARCH', itemsPerPage: 3 };
   let routerMock;


   beforeEach(() => {
      routerMock = {
         push: jest.fn(),
      };

      useRouter.mockReturnValue(routerMock);
      useGlobalContext.mockReturnValue({
         actions: { setPagination: jest.fn(), setExpandedRows: jest.fn() },
         pagination: { currentPage: 1 },
         expandedRows: [],
      });
   });

   test('shows the correct elements for the current page', async () => {
      const {
         queries: { queryAllByRole },
      } = await renderPage(TableGeneric, props);

      const [, tableBody] = queryAllByRole('rowgroup');

      expect(within(tableBody).queryAllByRole('row').length).toBe(3);
      expect(within(tableBody).getByRole('row', { name: /name 1/ })).toBeInTheDocument();
      expect(within(tableBody).getByRole('row', { name: /name 2/ })).toBeInTheDocument();
      expect(within(tableBody).getByRole('row', { name: /name 3/ })).toBeInTheDocument();
   });
});
