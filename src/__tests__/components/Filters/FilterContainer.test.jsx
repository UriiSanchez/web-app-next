import { act, screen } from '@testing-library/react';

import { FilterContainer } from '../../../components/Filters/FilterContainer';
import { renderComponent } from '../../utils/render';
import { createContextWrapper } from '../../utils/context';

const DATE_RANGE = /^\d{2}-\d{2}-\d{4}, \d{2}-\d{2}-\d{4}$/;

const setup = (user, onApplyFilters = jest.fn()) => {
   jest.useFakeTimers();
   return {
      onApplyFilters,
      ...renderComponent(<FilterContainer onApplyFilters={onApplyFilters} />, {
         wrapper: createContextWrapper({ user }),
         userOptions: { advanceTimers: jest.advanceTimersByTime },
      }),
   };
};

describe('FilterContainer', () => {
   test('renders the four filters', () => {
      setup({ userAD: 'lider', idProfile: 4 });

      expect(screen.getByPlaceholderText('Busca por nombre o grupo')).toBeInTheDocument();
      ['Trámite', 'Periodo', 'Sucursal'].forEach((name) =>
         expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument()
      );
   });

   test('does not apply filters while there is no user', () => {
      const { onApplyFilters } = setup({});

      expect(onApplyFilters).not.toHaveBeenCalled();
   });

   test('applies only the date range at start for a profile without user restriction', () => {
      const { onApplyFilters } = setup({ userAD: 'lider', idProfile: 4 });

      expect(onApplyFilters).toHaveBeenCalledTimes(1);
      expect(onApplyFilters).toHaveBeenCalledWith({ byDateRange: expect.stringMatching(DATE_RANGE) });
   });

   test('restricts an analyst profile to their own requests through idAnalyst', () => {
      const { onApplyFilters } = setup({ userAD: 'ana', idProfile: 1 });

      expect(onApplyFilters).toHaveBeenCalledWith(expect.objectContaining({ idAnalyst: 'ana' }));
   });

   test('restricts an executive profile to the requests they created through userCreate', () => {
      const { onApplyFilters } = setup({ userAD: 'eve', idProfile: 3 });

      expect(onApplyFilters).toHaveBeenCalledWith(expect.objectContaining({ userCreate: 'eve' }));
   });

   test('applies the typed name only after the debounce delay', async () => {
      const { user, onApplyFilters } = setup({ userAD: 'lider', idProfile: 4 });
      onApplyFilters.mockClear();

      await user.type(screen.getByRole('searchbox'), 'Ana');
      expect(onApplyFilters).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(1500));

      expect(onApplyFilters).toHaveBeenLastCalledWith(
         expect.objectContaining({ searchByName: 'Ana', byDateRange: expect.stringMatching(DATE_RANGE) })
      );
   });

   test('joins the selected procedure types and branches with commas', async () => {
      const { user, onApplyFilters } = setup({ userAD: 'lider', idProfile: 4 });

      await user.click(screen.getByRole('button', { name: /Trámite/ }));
      await user.click(screen.getByLabelText('Incremento'));
      await user.click(screen.getByLabelText('Decremento'));
      await user.click(screen.getByRole('button', { name: /Sucursal/ }));
      await user.click(screen.getByLabelText('Guadalajara'));
      act(() => jest.advanceTimersByTime(1500));

      expect(onApplyFilters).toHaveBeenLastCalledWith(
         expect.objectContaining({ byApplicationTypes: 'Incremento,Decremento', byBranches: 'Guadalajara' })
      );
   });
});
