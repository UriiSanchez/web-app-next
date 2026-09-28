import { screen } from '@testing-library/react';

import Pagination from '../../../components/Tables/Pagination';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

function setup({ pagination = {} } = {}) {
   const actions = createActions({ setPagination: jest.fn() });
   const value = {
      actions,
      pagination: { currentPage: 5, totalPages: 10, type: null, sourcePage: 0, sourceTotalPages: 0, ...pagination },
   };
   return { actions, ...renderComponent(<Pagination />, { wrapper: createContextWrapper(value) }) };
}

const visiblePages = () =>
   screen
      .getAllByRole('button')
      .map((button) => button.textContent)
      .filter((text) => /^\d+$/.test(text));

describe('Pagination', () => {
   test('shows only the pages within two positions of the current one', () => {
      setup();

      expect(visiblePages()).toEqual(['3', '4', '5', '6', '7']);
   });

   test.each([
      ['Primera', 1],
      ['Anterior', 4],
      ['Siguiente', 6],
      ['Última', 10],
      ['7', 7],
   ])('"%s" moves to page %i', async (label, page) => {
      const { actions, user } = setup();

      await user.click(screen.getByRole('button', { name: label }));

      expect(actions.setPagination).toHaveBeenCalledWith({ currentPage: page });
   });

   test('disables the backward buttons on the first page', () => {
      setup({ pagination: { currentPage: 1 } });

      expect(screen.getByRole('button', { name: 'Primera' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
   });

   test('disables the forward buttons on the last page', () => {
      setup({ pagination: { currentPage: 10 } });

      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Última' })).toBeDisabled();
   });

   test('disables every navigation button when there is a single page', () => {
      setup({ pagination: { currentPage: 1, totalPages: 1 } });

      ['Primera', 'Anterior', 'Siguiente', 'Última'].forEach((label) => {
         expect(screen.getByRole('button', { name: label })).toBeDisabled();
      });
   });

   test('offers "Cargar más" on the last page when the source has more pages', async () => {
      const { actions, user } = setup({ pagination: { currentPage: 10, sourcePage: 0, sourceTotalPages: 3 } });

      expect(screen.queryByRole('button', { name: 'Última' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Cargar más' }));

      expect(actions.setPagination).toHaveBeenCalledWith({ sourcePage: 1 });
   });

   test('does not offer "Cargar más" when the source has no more pages', () => {
      setup({ pagination: { currentPage: 10, sourcePage: 2, sourceTotalPages: 3 } });

      expect(screen.queryByRole('button', { name: 'Cargar más' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Última' })).toBeInTheDocument();
   });

   test('resets the source pagination when it unmounts', () => {
      const { actions, unmount } = setup();

      unmount();

      expect(actions.setPagination).toHaveBeenCalledWith({ sourcePage: 0, sourceTotalPages: 0 });
   });
});
