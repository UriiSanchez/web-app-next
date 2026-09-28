import { screen } from '@testing-library/react';

import { AnalystListContainer } from '../../../../components/Tables/LeaderRequest/AnalystListContainer';
import { renderComponent } from '../../../utils/render';
import listAnalyst from '../../../../__mocks__/analyst';

describe('AnalystListContainer', () => {
   test.each([[[]], [undefined]])('shows the skeleton when the analyst list is %p', (analyst) => {
      renderComponent(<AnalystListContainer analyst={analyst} onSelectedAnalystFilter={jest.fn()} />);

      expect(screen.getByTestId('skeleton-container-analyst')).toBeInTheDocument();
   });

   test('lists every analyst with initials, uppercase name and assigned requests', () => {
      renderComponent(<AnalystListContainer analyst={listAnalyst} onSelectedAnalystFilter={jest.fn()} />);

      expect(screen.queryByTestId('skeleton-container-analyst')).not.toBeInTheDocument();
      listAnalyst.forEach(({ fullName, firstLetters, requestsAssigned }) => {
         expect(screen.getByText(fullName.toUpperCase())).toBeInTheDocument();
         expect(screen.getByText(firstLetters)).toBeInTheDocument();
         expect(screen.getAllByText(String(requestsAssigned)).length).toBeGreaterThan(0);
      });
   });

   test('reports the userAD of the clicked analyst', async () => {
      const onSelectedAnalystFilter = jest.fn();
      const { user } = renderComponent(
         <AnalystListContainer analyst={listAnalyst} onSelectedAnalystFilter={onSelectedAnalystFilter} />
      );

      await user.click(screen.getByText(listAnalyst[1].fullName.toUpperCase()));

      expect(onSelectedAnalystFilter).toHaveBeenCalledWith(listAnalyst[1].userAD);
   });

   test('highlights only the selected analyst', () => {
      renderComponent(
         <AnalystListContainer
            analyst={listAnalyst}
            selectedAnalystFilter={listAnalyst[0].userAD}
            onSelectedAnalystFilter={jest.fn()}
         />
      );
      // No hay rol ni atributo accesible para la selección: se comprueba la clase del renglón.
      const row = (analyst) => screen.getByText(analyst.fullName.toUpperCase()).parentElement;

      expect(row(listAnalyst[0])).toHaveClass('bg-gray-200');
      expect(row(listAnalyst[1])).not.toHaveClass('bg-gray-200');
   });
});
