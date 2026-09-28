import { screen } from '@testing-library/react';

import HeadCell from '../../../components/Tables/HeadCell';
import { renderComponent } from '../../utils/render';

const cell = { id: 'groupName', display: 'Solicitante', sx: 'col-span-2', description: '(miles usd)' };

const wrap = (props = {}) => (
   <table>
      <thead>
         <tr>
            <HeadCell cell={cell} sortedBy={{ column: null, direction: null }} onHandleSort={jest.fn()} {...props} />
         </tr>
      </thead>
   </table>
);

describe('HeadCell', () => {
   test('shows the title and its description', () => {
      renderComponent(wrap());

      expect(screen.getByRole('columnheader')).toHaveTextContent('Solicitante(miles usd)');
   });

   test('reports the column id when a sortable header is clicked', async () => {
      const onHandleSort = jest.fn();
      const { user } = renderComponent(wrap({ onHandleSort }));

      await user.click(screen.getByText('Solicitante'));

      expect(onHandleSort).toHaveBeenCalledWith('groupName');
   });

   test('does not sort when the header belongs to the function column', async () => {
      const onHandleSort = jest.fn();
      const { user } = renderComponent(wrap({ cell: { id: 'function', display: 'Acciones' }, onHandleSort }));

      await user.click(screen.getByText('Acciones'));

      expect(onHandleSort).not.toHaveBeenCalled();
      expect(screen.getByRole('columnheader')).not.toHaveClass('cursor-pointer');
   });

   test.each([
      ['asc', 'arrow_drop_up'],
      ['desc', 'arrow_drop_down'],
   ])('shows the %s icon only on the sorted column', (direction, icon) => {
      const { rerender } = renderComponent(wrap({ sortedBy: { column: 'groupName', direction } }));
      expect(screen.getByText(icon)).toBeInTheDocument();

      rerender(wrap({ sortedBy: { column: 'other', direction } }));
      expect(screen.queryByText(icon)).not.toBeInTheDocument();
   });
});
