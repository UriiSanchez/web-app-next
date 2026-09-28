import { screen } from '@testing-library/react';

import { CellItem } from '../../../../components/Tables/Items/CellItem';
import { renderComponent } from '../../../utils/render';

const cell = { id: 'idGroup', display: 'Solicitud', sort: true, subtitle: { text: '(folio)' } };

const wrap = (props = {}) => (
   <table>
      <thead>
         <tr>
            <CellItem cell={cell} sortedBy={{ column: null, direction: null }} onHandleSort={jest.fn()} {...props} />
         </tr>
      </thead>
   </table>
);

describe('CellItem', () => {
   test('shows the title, the subtitle and the tooltip text', () => {
      renderComponent(wrap({ cell: { ...cell, tooltip: { text: 'Envió a mesa receptora' } } }));

      expect(screen.getByRole('columnheader')).toHaveTextContent('Solicitud(folio)Envió a mesa receptora');
   });

   test('reports the column id when the header is sortable', async () => {
      const onHandleSort = jest.fn();
      const { user } = renderComponent(wrap({ onHandleSort }));

      await user.click(screen.getByText('Solicitud'));

      expect(onHandleSort).toHaveBeenCalledWith('idGroup');
   });

   test('does not sort when the column is not sortable', async () => {
      const onHandleSort = jest.fn();
      const { user } = renderComponent(wrap({ cell: { ...cell, sort: false }, onHandleSort }));

      await user.click(screen.getByText('Solicitud'));

      expect(onHandleSort).not.toHaveBeenCalled();
   });

   test('shows the direction icon only on the sorted column', () => {
      const { rerender } = renderComponent(wrap({ sortedBy: { column: 'idGroup', direction: 'desc' } }));
      expect(screen.getByText('arrow_drop_down')).toBeInTheDocument();

      rerender(wrap({ sortedBy: { column: 'other', direction: 'desc' } }));
      expect(screen.queryByText('arrow_drop_down')).not.toBeInTheDocument();
   });
});
