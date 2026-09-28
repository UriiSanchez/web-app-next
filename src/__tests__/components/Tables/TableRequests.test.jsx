import { screen, within } from '@testing-library/react';

import { TableRequests } from '../../../components/Tables/TableRequests';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const buildItem = (idGroup, groupName, overrides = {}) => ({
   idGroup,
   groupName,
   isGroup: false,
   idCatStatus: 5,
   approvedAmount: idGroup * 1000,
   kindGroupProcedure: 'Nuevo Tramite',
   requestResponseList: [],
   ...overrides,
});
const data = [buildItem(1, 'Beta'), buildItem(2, 'Alfa'), buildItem(3, 'Gamma')];

function setup({ items = data, pagination = {}, ...props } = {}) {
   const actions = createActions({ setPagination: jest.fn(), setExpandedRows: jest.fn() });
   const value = {
      expandedRows: [],
      actions,
      pagination: { currentPage: 1, totalPages: 1, sourcePage: 0, sourceTotalPages: 0, ...pagination },
   };
   const utils = renderComponent(<TableRequests data={items} typeTable='FAC' {...props} />, {
      wrapper: createContextWrapper(value),
   });
   return { actions, ...utils };
}

const groupNames = () => screen.queryAllByText(/^(Alfa|Beta|Gamma|Grupo \d+)$/).map((node) => node.textContent);

describe('TableRequests', () => {
   test('shows only the skeleton while loading', () => {
      setup({ loading: true });

      expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
      expect(groupNames()).toEqual([]);
   });

   test('shows the configured headers and a row per request', () => {
      setup();

      expect(screen.getByTestId('test-thead-groupName')).toHaveTextContent('Solicitante');
      expect(screen.getByTestId('test-thead-approvedAmount')).toHaveTextContent('Monto de línea');
      expect(groupNames()).toEqual(['Beta', 'Alfa', 'Gamma']);
      expect(screen.getByText('$2,000')).toBeInTheDocument();
      expect(screen.getAllByText('En Proceso')).toHaveLength(3);
   });

   test('shows the empty message and no pagination without data', () => {
      setup({ items: [] });

      expect(screen.getByText('No se encontraron registros')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
   });

   test('reports the item when a row is clicked', async () => {
      const onFunc = jest.fn();
      const { user } = setup({ onFunc });

      await user.click(screen.getByText('Alfa'));

      expect(onFunc).toHaveBeenCalledWith(data[1]);
   });

   test('shows the rows of the current page only', () => {
      const items = Array.from({ length: 12 }, (_, i) => buildItem(i + 1, `Grupo ${i + 1}`));
      setup({ items, pagination: { currentPage: 2, totalPages: 2 } });

      expect(groupNames()).toEqual(['Grupo 11', 'Grupo 12']);
   });

   test('sets the total pages and goes back to the first page when the data loads', () => {
      const items = Array.from({ length: 25 }, (_, i) => buildItem(i + 1, `Grupo ${i + 1}`));
      const { actions } = setup({ items, pagination: { currentPage: 2, totalPages: 3 } });

      expect(actions.setPagination).toHaveBeenCalledWith({ currentPage: 1, totalPages: 3, type: false });
   });

   test('keeps the current page when keepCurrentPage is set', () => {
      const { actions } = setup({ keepCurrentPage: true, pagination: { currentPage: 2, totalPages: 2 } });

      expect(actions.setPagination).toHaveBeenCalledWith({ currentPage: 2, totalPages: 1, type: false });
   });

   test('sorts ascending, descending and back to the original order on repeated header clicks', async () => {
      const { user } = setup();
      const header = screen.getByTestId('test-thead-groupName');

      await user.click(header);
      expect(groupNames()).toEqual(['Alfa', 'Beta', 'Gamma']);
      expect(within(header).getByText('arrow_drop_up')).toBeInTheDocument();

      await user.click(header);
      expect(groupNames()).toEqual(['Gamma', 'Beta', 'Alfa']);
      expect(within(header).getByText('arrow_drop_down')).toBeInTheDocument();

      await user.click(header);
      expect(groupNames()).toEqual(['Beta', 'Alfa', 'Gamma']);
      expect(within(header).queryByText(/arrow_drop/)).not.toBeInTheDocument();
   });

   test('starts a new ascending sort when another column is clicked', async () => {
      const { user } = setup();

      await user.click(screen.getByTestId('test-thead-groupName'));
      await user.click(screen.getByTestId('test-thead-groupName'));
      await user.click(screen.getByTestId('test-thead-approvedAmount'));

      expect(groupNames()).toEqual(['Beta', 'Alfa', 'Gamma']);
      expect(within(screen.getByTestId('test-thead-approvedAmount')).getByText('arrow_drop_up')).toBeInTheDocument();
   });

   test('expands the group detail rows of a group request', async () => {
      const group = buildItem(9, 'Grupo Nueve', {
         isGroup: true,
         requestResponseList: [
            {
               idRequest: 1,
               approvedAmount: 700,
               kindProcedure: 'Ampliacion',
               relatedPersonResponseList: [{ idCatTypePerson: 1, fullName: 'Ana Lopez' }],
            },
         ],
      });
      const actions = createActions({ setPagination: jest.fn(), setExpandedRows: jest.fn() });
      const { user } = renderComponent(<TableRequests data={[group]} typeTable='FAC' />, {
         wrapper: createContextWrapper({
            expandedRows: [9],
            actions,
            pagination: { currentPage: 1, totalPages: 1, sourcePage: 0, sourceTotalPages: 0 },
         }),
      });

      expect(await screen.findByText('Ana Lopez')).toBeInTheDocument();
      expect(screen.getByText('$700')).toBeInTheDocument();

      await user.click(screen.getByTestId('btn-expanded-9'));
      expect(actions.setExpandedRows).toHaveBeenCalledWith(9);
   });
});
