import { screen } from '@testing-library/react';

import { NewPagination } from '../../../components/Tables/NewPagination';
import { renderComponent } from '../../utils/render';

const renderPagination = (props = {}) =>
   renderComponent(<NewPagination currentPage={5} totalPages={10} onPageChange={jest.fn()} {...props} />);

const visiblePages = () =>
   screen
      .getAllByRole('button')
      .map((button) => button.textContent)
      .filter((text) => /^\d+$/.test(text));

describe('NewPagination', () => {
   test('shows only the pages within two positions of the current one', () => {
      renderPagination();

      expect(visiblePages()).toEqual(['3', '4', '5', '6', '7']);
   });

   test('reports the chosen page number', async () => {
      const onPageChange = jest.fn();
      const { user } = renderPagination({ onPageChange });

      await user.click(screen.getByRole('button', { name: '7' }));

      expect(onPageChange).toHaveBeenCalledWith(7);
   });

   test('goes to the next page with "Siguiente"', async () => {
      const onPageChange = jest.fn();
      const { user } = renderPagination({ onPageChange });

      await user.click(screen.getByRole('button', { name: 'Siguiente' }));

      expect(onPageChange).toHaveBeenCalledWith(6);
   });

   test('disables the backward button on the first page and "Siguiente" on the last one', () => {
      const { rerender } = renderPagination({ currentPage: 1 });
      expect(screen.getByRole('button', { name: 'Primera' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();

      rerender(<NewPagination currentPage={10} totalPages={10} onPageChange={jest.fn()} />);
      expect(screen.getByRole('button', { name: 'Primera' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
   });

   test('disables both navigation buttons when there is a single page', () => {
      renderPagination({ currentPage: 1, totalPages: 1 });

      expect(screen.getByRole('button', { name: 'Primera' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
      expect(visiblePages()).toEqual(['1']);
   });
});
