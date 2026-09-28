import { screen } from '@testing-library/react';

import BodyRow from '../../../components/Tables/BodyRow';
import { getDetailsTrackingForIdRequest } from '../../../services';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

jest.mock('../../../services', () => ({ getDetailsTrackingForIdRequest: jest.fn() }));

const cells = [
   { id: 'groupName', sx: '' },
   { id: 'function', sx: '', type: 'expand' },
];
const request = (idRequest, fullName, overrides = {}) => ({
   idRequest,
   idClient: idRequest,
   kindProcedure: 'Nuevo Tramite',
   requestAmount: 4000,
   approvedAmount: 2500,
   relatedPersonResponseList: [{ idCatTypePerson: 1, fullName }],
   ...overrides,
});
const item = {
   idGroup: 8,
   isGroup: true,
   groupName: 'Grupo Ocho',
   requestPerGroup: 2,
   listApplicants: [],
   requestResponseList: [request(1, 'Ana Lopez'), request(2, 'Luis Perez')],
};

function setup({ typeTable = 'SEC', expandedRows = [], row = item, onFunc } = {}) {
   const actions = createActions({ setExpandedRows: jest.fn(), togglePDF: jest.fn() });
   const utils = renderComponent(
      <table>
         <tbody>
            <BodyRow item={row} cells={cells} onFunc={onFunc} typeTable={typeTable} />
         </tbody>
      </table>,
      { wrapper: createContextWrapper({ expandedRows, actions }) }
   );
   return { actions, ...utils };
}

describe('BodyRow', () => {
   test('shows the main row without details while it is collapsed', () => {
      setup();

      expect(screen.getAllByRole('row')).toHaveLength(1);
      expect(screen.getByText('Grupo Ocho')).toBeInTheDocument();
      expect(screen.getByTestId('btn-expanded-8')).toHaveAttribute('aria-expanded', 'false');
   });

   test('reports the item when the row is clicked', async () => {
      const onFunc = jest.fn();
      const { user } = setup({ onFunc });

      await user.click(screen.getByText('Grupo Ocho'));

      expect(onFunc).toHaveBeenCalledWith(item);
   });

   test('does not mark the row as clickable without onFunc', () => {
      setup();

      expect(screen.getByText('Grupo Ocho').closest('tr')).not.toHaveClass('cursor-pointer');
   });

   test('toggles the expanded row without triggering the row click', async () => {
      const onFunc = jest.fn();
      const { actions, user } = setup({ onFunc });

      await user.click(screen.getByTestId('btn-expanded-8'));

      expect(actions.setExpandedRows).toHaveBeenCalledWith(8);
      expect(onFunc).not.toHaveBeenCalled();
   });

   test.each([
      ['SEC', '$4,000'],
      ['FAC', '$2,500'],
   ])('shows the %s detail rows of every request when expanded', async (typeTable, amount) => {
      setup({ typeTable, expandedRows: [8] });

      expect(await screen.findByText('Ana Lopez')).toBeInTheDocument();
      expect(screen.getByText('Luis Perez')).toBeInTheDocument();
      expect(screen.getAllByText(amount)).toHaveLength(2);
      expect(screen.getByTestId('btn-expanded-8')).toHaveAttribute('aria-expanded', 'true');
   });

   test.each(['SEC_HISTORY', 'FAC_HISTORY'])('shows the %s history rows when expanded', async (typeTable) => {
      setup({ typeTable, expandedRows: [8] });

      expect(await screen.findByText('Ana Lopez')).toBeInTheDocument();
      expect(screen.getByText('Luis Perez')).toBeInTheDocument();
      expect(screen.getAllByText('Solicitante')).toHaveLength(1);
   });

   test('shows no detail rows for a table type without details', () => {
      setup({ typeTable: 'HISTORY', expandedRows: [8] });

      expect(screen.getAllByRole('row')).toHaveLength(1);
   });

   test('shows the tracking panel and lets the user close it', async () => {
      getDetailsTrackingForIdRequest.mockResolvedValue({ status: 200, data: { trackingDetailResponse: [] } });
      const { actions, user } = setup({ typeTable: 'ALL_TRACKING', expandedRows: [8] });

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Grupo Ocho' })).toBeInTheDocument();

      // El fondo del panel no tiene rol ni texto: es el hermano previo del diálogo.
      await user.click(screen.getByRole('dialog').previousElementSibling);

      expect(actions.setExpandedRows).toHaveBeenCalledWith(8);
   });

   test('does not show the tracking panel while collapsed', () => {
      setup({ typeTable: 'ALL_TRACKING' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
   });
});
