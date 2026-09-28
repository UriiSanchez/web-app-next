import { within } from '@testing-library/react';

import { TableDetails } from '../../../components';

import { useGlobalContext } from '../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useSourcePagination: () => ({ sourcePage: 0, totalPages: 1, loadMore: jest.fn() }),
}));

describe('TableDetails component', () => {
   const props = {
      data: [
         {
            idGroup: 1,
            idCatStatus: 4,
            requestAmount: 10,
            requestResponseList: [
               {
                  lastDateExecEm: '2024-01-01T12:12:12',
                  resultExecEm: false,
                  relatedPersonResponseList: [],
               },
            ],
         },
         { idGroup: 2, idCatStatus: 4, requestAmount: 100, requestResponseList: [] },
         { idGroup: 3, idCatStatus: 4, requestAmount: 300, requestResponseList: [] },
         { idGroup: 4, idCatStatus: 4, requestAmount: 200, requestResponseList: [] },
         { idGroup: 5, idCatStatus: 4, requestAmount: 50, requestResponseList: [] },
      ],
      typeTable: 'EMG_REQUEST',
   };

   let globalContext;

   beforeEach(() => {
      globalContext = {
         user: {},
         actions: { setPagination: jest.fn(), setExpandedRows: jest.fn() },
         pagination: { currentPage: 1 },
         expandedRows: [],
      };

      useGlobalContext.mockReturnValue(globalContext);
   });

   test('shows a row for each element in the data array', async () => {
      const {
         queries: { queryAllByRole },
      } = await renderPage(TableDetails, props);

      const [, tableBody] = queryAllByRole('rowgroup');

      expect(within(tableBody).queryAllByRole('row').length).toBe(5);
   });

   test('limits the rows showed by the itemsPerPage property', async () => {
      const {
         queries: { queryAllByRole },
      } = await renderPage(TableDetails, { ...props, itemsPerPage: 2 });

      const [, tableBody] = queryAllByRole('rowgroup');

      expect(within(tableBody).queryAllByRole('row').length).toBe(2);
   });

   test('shows the elements corresponding to the current page', async () => {
      globalContext.pagination.currentPage = 2;
      useGlobalContext.mockReturnValue(globalContext);

      const {
         queries: { queryAllByRole },
      } = await renderPage(TableDetails, { ...props, itemsPerPage: 2 });

      const [, tableBody] = queryAllByRole('rowgroup');

      expect(within(tableBody).queryAllByRole('row').length).toBe(2);
      expect(within(tableBody).getByRole('row', { name: /00000003/ })).toBeInTheDocument();
      expect(within(tableBody).getByRole('row', { name: /00000004/ })).toBeInTheDocument();
   });

   test('it sorts data descending based on the column when clicking a column header', async () => {
      const {
         user,
         queries: { queryAllByRole, getByText },
      } = await renderPage(TableDetails, props);

      await user.click(getByText('Monto de línea'));

      const [, tableBody] = queryAllByRole('rowgroup');
      const rows = within(tableBody).queryAllByRole('row');

      expect(within(rows[0]).getByText('$300')).toBeVisible();
      expect(within(rows[1]).getByText('$200')).toBeVisible();
      expect(within(rows[2]).getByText('$100')).toBeVisible();
      expect(within(rows[3]).getByText('$50')).toBeVisible();
      expect(within(rows[4]).getByText('$10')).toBeVisible();
   });

   test('it sorts data ascending based on the column when clicking a column header twice', async () => {
      const {
         user,
         queries: { queryAllByRole, getByText },
      } = await renderPage(TableDetails, props);

      await user.click(getByText('Monto de línea'));
      await user.click(getByText('Monto de línea'));

      const [, tableBody] = queryAllByRole('rowgroup');
      const rows = within(tableBody).queryAllByRole('row');

      expect(within(rows[0]).getByText('$10')).toBeVisible();
      expect(within(rows[1]).getByText('$50')).toBeVisible();
      expect(within(rows[2]).getByText('$100')).toBeVisible();
      expect(within(rows[3]).getByText('$200')).toBeVisible();
      expect(within(rows[4]).getByText('$300')).toBeVisible();
   });

   test('it shows a message when there are no requests to display', async () => {
      const {
         queries: { getByText },
      } = await renderPage(TableDetails, { ...props, data: [] });

      expect(getByText('No hay solicitudes ingresadas')).toBeVisible();
   });
});
