import { screen, within } from '@testing-library/react';

import { TableDemo } from '../../../components/Tables/TableDemo';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const data = [
   { idGroup: 2, groupName: 'Beta', branchOffice: 'Norte', requestAmount: 2000, requestPerGroup: 1, requestResponseList: [] },
   { idGroup: 1, groupName: 'Alfa', branchOffice: 'Sur', requestAmount: 1000, requestPerGroup: 1, requestResponseList: [] },
   { idGroup: 3, groupName: 'Gamma', branchOffice: 'Centro', requestAmount: 3000, requestPerGroup: 1, requestResponseList: [] },
];

function setup(props = {}) {
   const actions = createActions({ setExpandedRows: jest.fn() });
   const utils = renderComponent(<TableDemo data={data} typeTable='ALL_TRACKING' {...props} />, {
      wrapper: createContextWrapper({ expandedRows: [], actions }),
   });
   return { actions, ...utils };
}

const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row');
const groupNames = () => bodyRows().map((row) => within(row).getByText(/^(Alfa|Beta|Gamma)$/).textContent);

describe('TableDemo', () => {
   test('shows only the skeleton while loading', () => {
      setup({ loading: true });

      expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
      expect(screen.queryByText('Alfa')).not.toBeInTheDocument();
   });

   test('shows the configured headers and a row per item', () => {
      setup();

      expect(screen.getByTestId('test-thead-branchOffice')).toHaveTextContent('Sucursal');
      expect(screen.getByTestId('test-thead-requestAmount')).toHaveTextContent('Monto de línea');
      expect(groupNames()).toEqual(['Beta', 'Alfa', 'Gamma']);
      expect(screen.getByText('$1,000')).toBeInTheDocument();
   });

   test('shows the empty message when there is no data', () => {
      setup({ data: [] });

      expect(screen.getByText('No se encontraron registros')).toBeInTheDocument();
   });

   test('reports the item when a row is clicked', async () => {
      const onFunc = jest.fn();
      const { user } = setup({ onFunc });

      await user.click(screen.getByText('Alfa'));

      expect(onFunc).toHaveBeenCalledWith(data[1]);
   });

   test('sorts ascending, descending and back to the original order on repeated header clicks', async () => {
      const { user } = setup();
      // Sucursales: Beta = Norte, Alfa = Sur, Gamma = Centro.
      const branch = screen.getByTestId('test-thead-branchOffice');

      await user.click(branch);
      expect(groupNames()).toEqual(['Gamma', 'Beta', 'Alfa']);
      expect(within(branch).getByText('arrow_drop_up')).toBeInTheDocument();

      await user.click(branch);
      expect(groupNames()).toEqual(['Alfa', 'Beta', 'Gamma']);
      expect(within(branch).getByText('arrow_drop_down')).toBeInTheDocument();

      await user.click(branch);
      expect(groupNames()).toEqual(['Beta', 'Alfa', 'Gamma']);
      expect(within(branch).queryByText(/arrow_drop/)).not.toBeInTheDocument();
   });

   test('does not sort by a column marked as not sortable', async () => {
      const { user } = setup();

      await user.click(screen.getByTestId('test-thead-function'));

      expect(groupNames()).toEqual(['Beta', 'Alfa', 'Gamma']);
   });
});
