import { screen } from '@testing-library/react';

import { TrackingSelect } from '../../../../components/Tables/Tracking/TrackingSelect';
import { renderComponent } from '../../../utils/render';

const listApplicants = [
   { idClient: 1, idRequest: 100, fullName: 'Ana Lopez', idCatStatus: 10 },
   { idClient: 2, idRequest: 200, fullName: 'Luis Perez', idCatStatus: 11 },
   { idClient: 3, idRequest: 300, fullName: 'Marta Diaz', idCatStatus: 4 },
];

const renderSelect = (props = {}) =>
   renderComponent(
      <TrackingSelect idRequestActive={100} listApplicants={listApplicants} onSelectChange={jest.fn()} {...props} />
   );

describe('TrackingSelect', () => {
   test('shows the applicant of the active request and keeps the list closed', () => {
      renderSelect({ idRequestActive: 200 });

      expect(screen.getByText('Luis Perez')).toBeInTheDocument();
      expect(screen.queryByText('Ana Lopez')).not.toBeInTheDocument();
   });

   test('shows a dash when the active request is not in the list', () => {
      renderSelect({ idRequestActive: 999 });

      expect(screen.getByText('-')).toBeInTheDocument();
   });

   test('opens the list with a status icon for authorized and rejected applicants only', async () => {
      const { user } = renderSelect();

      await user.click(screen.getByText('Ana Lopez'));

      expect(screen.getAllByText('Marta Diaz')).toHaveLength(1);
      expect(screen.getByText('check_circle')).toBeInTheDocument();
      expect(screen.getByText('cancel')).toBeInTheDocument();
      expect(screen.getByText('keyboard_arrow_up')).toBeInTheDocument();
   });

   test('reports the chosen request and closes the list', async () => {
      const onSelectChange = jest.fn();
      const { user } = renderSelect({ onSelectChange });

      await user.click(screen.getByText('Ana Lopez'));
      await user.click(screen.getByText('Marta Diaz'));

      expect(onSelectChange).toHaveBeenCalledWith(300);
      expect(screen.queryByText('Marta Diaz')).not.toBeInTheDocument();
   });

   test('closes the list when the user clicks outside', async () => {
      const { user } = renderSelect();

      await user.click(screen.getByText('Ana Lopez'));
      expect(screen.getByText('Marta Diaz')).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByText('Marta Diaz')).not.toBeInTheDocument();
   });
});
