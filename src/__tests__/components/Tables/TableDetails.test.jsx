import { screen, within } from '@testing-library/react';
import { useRouter } from 'next/router';

import { TableDetails } from '../../../components/Tables/TableDetails';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const buildData = (total) =>
   Array.from({ length: total }, (_, i) => ({
      idGroup: i + 1,
      idClient: 1000 + i,
      name: `Cliente ${String(i + 1).padStart(2, '0')}`,
   }));

function setup({ data = buildData(3), pagination = {}, ...props } = {}) {
   useRouter.mockReturnValue(createRouter());
   const actions = createActions({ setPagination: jest.fn(), setExpandedRows: jest.fn() });
   const value = {
      user: { idProfile: 3, status: [] },
      expandedRows: [],
      actions,
      pagination: { currentPage: 1, totalPages: 1, sourcePage: 0, sourceTotalPages: 0, ...pagination },
   };
   const utils = renderComponent(<TableDetails data={data} typeTable='DROP_LIST_CLIENTS' {...props} />, {
      wrapper: createContextWrapper(value),
   });
   return { actions, data, ...utils };
}

const clientNames = () => screen.queryAllByText(/^Cliente \d+$/).map((node) => node.textContent);

describe('TableDetails', () => {
   test('shows the configured headers and a row per item', () => {
      setup();

      expect(screen.getByText('Número de persona')).toBeInTheDocument();
      expect(screen.getByText('Nombre de persona')).toBeInTheDocument();
      expect(clientNames()).toEqual(['Cliente 01', 'Cliente 02', 'Cliente 03']);
      expect(screen.getByText('1000')).toBeInTheDocument();
   });

   test('shows the empty message and no pagination without data', () => {
      setup({ data: [] });

      expect(screen.getByText('No se encontraron registros')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
   });

   test('shows an empty placeholder instead of rows while loading', () => {
      setup({ isLoading: true });

      expect(clientNames()).toEqual([]);
      expect(screen.queryByText('No se encontraron registros')).not.toBeInTheDocument();
   });

   test('shows the rows of the current page only', () => {
      setup({ data: buildData(12), pagination: { currentPage: 2, totalPages: 2 } });

      expect(clientNames()).toEqual(['Cliente 11', 'Cliente 12']);
   });

   test('respects a custom number of items per page', () => {
      setup({ data: buildData(12), itemsPerPage: 5, pagination: { currentPage: 3, totalPages: 3 } });

      expect(clientNames()).toEqual(['Cliente 11', 'Cliente 12']);
   });

   test('resets the pagination with the total pages when the data loads', () => {
      const { actions } = setup({ data: buildData(25) });

      expect(actions.setPagination).toHaveBeenCalledWith({ currentPage: 1, totalPages: 3, type: 'DROP' });
   });

   test('keeps the current page when keepCurrentPage is set', () => {
      const { actions } = setup({ data: buildData(25), keepCurrentPage: true, pagination: { currentPage: 2 } });

      expect(actions.setPagination).toHaveBeenCalledWith({ currentPage: 2, totalPages: 3, type: 'DROP' });
   });

   test('does not touch the pagination when there is no data', () => {
      const { actions } = setup({ data: [] });

      expect(actions.setPagination).not.toHaveBeenCalledWith(expect.objectContaining({ totalPages: expect.anything() }));
   });

   test('reports the item when a row is clicked', async () => {
      const onFunc = jest.fn();
      const { data, user } = setup({ onFunc });

      await user.click(screen.getByText('Cliente 02'));

      expect(onFunc).toHaveBeenCalledWith(data[1]);
   });

   test('sorts by the clicked header, reverses on a second click and shows the direction icon', async () => {
      const { user } = setup();
      const header = screen.getByText('Nombre de persona').closest('th');

      await user.click(header);
      const first = clientNames();
      expect([...first].sort()).toEqual(['Cliente 01', 'Cliente 02', 'Cliente 03']);
      expect(within(header).getByText('arrow_drop_up')).toBeInTheDocument();

      await user.click(header);
      expect(clientNames()).toEqual([...first].reverse());
      expect(within(header).getByText('arrow_drop_down')).toBeInTheDocument();
   });
});
