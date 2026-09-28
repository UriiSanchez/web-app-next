import { screen } from '@testing-library/react';

import { ToggleSelector } from '../../../components/Controls/ToggleSelector';
import { renderComponent } from '../../utils/render';

describe('ToggleSelector', () => {
   test('shows "Sí" for SI and "No" otherwise', () => {
      const { rerender } = renderComponent(<ToggleSelector name='flag' value='SI' fnSet={jest.fn()} />);
      expect(screen.getByText('Sí')).toBeInTheDocument();

      rerender(<ToggleSelector name='flag' value='NO' fnSet={jest.fn()} />);
      expect(screen.getByText('No')).toBeInTheDocument();
   });

   test.each(['arrow_back_ios', 'arrow_forward_ios'])('the %s arrow switches SI to NO', async (arrow) => {
      const fnSet = jest.fn();
      const { user } = renderComponent(<ToggleSelector name='flag' value='SI' fnSet={fnSet} />);

      await user.click(screen.getByRole('button', { name: arrow }));

      expect(fnSet).toHaveBeenCalledWith('sectorInformationResponse', 'flag', 'NO');
   });

   test('switches NO to SI', async () => {
      const fnSet = jest.fn();
      const { user } = renderComponent(<ToggleSelector name='flag' value='NO' fnSet={fnSet} />);

      await user.click(screen.getByRole('button', { name: 'arrow_forward_ios' }));

      expect(fnSet).toHaveBeenCalledWith('sectorInformationResponse', 'flag', 'SI');
   });
});
