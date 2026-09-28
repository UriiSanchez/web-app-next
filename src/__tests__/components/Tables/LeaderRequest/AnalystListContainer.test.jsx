import { fireEvent } from '@testing-library/react';

import { AnalystListContainer } from '../../../../components';
import mockListAnalyst from '../../../../__mocks__/analyst';

describe('AnalystListContainer component', () => {
   const mockOnSelectAnalystFilter = jest.fn();
   let props = { analyst: [], selectedAnalystFilter: '', onSelectedAnalystFilter: mockOnSelectAnalystFilter };

   beforeEach(() => {
      jest.clearAllMocks();
   });

   it('shows the empty container when the list of analysts is empty', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(AnalystListContainer, props);

      expect(getByTestId('skeleton-container-analyst')).toBeInTheDocument();
   });

   it('Render the analyst list correctly.', async () => {
      const {
         queries: { container },
      } = await renderPage(AnalystListContainer, { ...props, analyst: mockListAnalyst });

      const analystItems = container.querySelectorAll('.fadeIn');
      expect(analystItems).toHaveLength(4);

      analystItems.forEach((item) => {
         const divs = item.querySelectorAll('div');
         const paragraphs = item.querySelectorAll('p');
         const spans = item.querySelectorAll('span');

         expect(divs.length).toBeGreaterThanOrEqual(1);
         expect(paragraphs.length).toBe(1);
         expect(spans.length).toBe(1);
      });
   });

   it('call onSelectedAnalystFilter when clicking on an analyst', async () => {
      const {
         queries: { container },
      } = await renderPage(AnalystListContainer, { ...props, analyst: mockListAnalyst });

      const analystItems = container.querySelectorAll('.fadeIn');
      expect(analystItems).toHaveLength(4);

      fireEvent.click(analystItems[0]);
      expect(mockOnSelectAnalystFilter).toHaveBeenCalledWith(mockListAnalyst[0].userAD);

      fireEvent.click(analystItems[1]);
      expect(mockOnSelectAnalystFilter).toHaveBeenCalledWith(mockListAnalyst[1].userAD);
   });

   it('correctly highlights the selected analyst', async () => {
      const {
         queries: { container },
      } = await renderPage(AnalystListContainer, {
         ...props,
         analyst: mockListAnalyst,
         selectedAnalystFilter: 'user2',
      });

      const analystItems = container.querySelectorAll('.fadeIn');
      expect(analystItems).toHaveLength(4);

      expect(analystItems[0].classList.contains('bg-gray-200')).toBe(false);
      expect(analystItems[1].classList.contains('bg-gray-200')).toBe(true);
      expect(analystItems[2].classList.contains('bg-gray-200')).toBe(false);
      expect(analystItems[3].classList.contains('bg-gray-200')).toBe(false);
   });
});
