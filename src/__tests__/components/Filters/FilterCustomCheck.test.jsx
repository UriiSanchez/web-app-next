import { screen } from '@testing-library/react';

import { FilterCustomCheck } from '../../../components/Filters/FilterCustomCheck';
import { renderComponent } from '../../utils/render';

const listItems = [
   { idLeader: 'l1', name: 'Ana' },
   { idLeader: 'l2', name: 'Luis' },
   { idLeader: 'l3', name: '' },
];

const renderFilter = (props = {}) => {
   const onSetCheckFilter = jest.fn();
   return {
      onSetCheckFilter,
      ...renderComponent(
         <FilterCustomCheck
            title='Líder'
            listItems={listItems}
            selectedItems={[]}
            keyFilter='idLeader'
            valueFilter='name'
            onSetCheckFilter={onSetCheckFilter}
            {...props}
         />
      ),
   };
};

describe('FilterCustomCheck', () => {
   test('shows the title and hides the options initially', () => {
      renderFilter();

      expect(screen.getByRole('button', { name: /Líder/ })).toBeInTheDocument();
      expect(screen.queryByLabelText('Ana')).not.toBeInTheDocument();
   });

   test('lists the options and falls back to "-" for empty labels', async () => {
      const { user } = renderFilter();
      await user.click(screen.getByRole('button', { name: /Líder/ }));

      expect(screen.getByLabelText('Ana')).toBeInTheDocument();
      expect(screen.getByLabelText('Luis')).toBeInTheDocument();
      expect(screen.getByLabelText('-')).toHaveAttribute('value', 'l3');
   });

   test('shows the selected count badge only when there are selections', () => {
      const { unmount } = renderFilter({ selectedItems: ['l1', 'l2'] });
      expect(screen.getByRole('button', { name: /Líder/ })).toHaveTextContent('2');
      expect(screen.getByText('2')).toHaveClass('opacity-100');
      unmount();

      renderFilter({ selectedItems: [] });
      expect(screen.getByRole('button', { name: /Líder/ }).querySelector('.opacity-0')).toBeInTheDocument();
   });

   test('marks the selected options', async () => {
      const { user } = renderFilter({ selectedItems: ['l2'] });
      await user.click(screen.getByRole('button', { name: /Líder/ }));

      expect(screen.getByLabelText('Luis')).toBeChecked();
      expect(screen.getByLabelText('Ana')).not.toBeChecked();
   });

   test('reports the new selection when an option is checked', async () => {
      const { user, onSetCheckFilter } = renderFilter({ selectedItems: ['l2'] });
      await user.click(screen.getByRole('button', { name: /Líder/ }));

      await user.click(screen.getByLabelText('Ana'));

      expect(onSetCheckFilter).toHaveBeenCalledWith(['l2', 'l1']);
   });

   test('reports the remaining selection when an option is unchecked', async () => {
      const { user, onSetCheckFilter } = renderFilter({ selectedItems: ['l1', 'l2'] });
      await user.click(screen.getByRole('button', { name: /Líder/ }));

      await user.click(screen.getByLabelText('Ana'));

      expect(onSetCheckFilter).toHaveBeenCalledWith(['l2']);
   });

   test('closes the list when clicking outside', async () => {
      const { user } = renderFilter();
      await user.click(screen.getByRole('button', { name: /Líder/ }));

      await user.click(document.body);

      expect(screen.queryByLabelText('Ana')).not.toBeInTheDocument();
   });
});
