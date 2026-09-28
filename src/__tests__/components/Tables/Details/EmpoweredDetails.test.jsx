import { screen } from '@testing-library/react';

import EmpoweredDetails from '../../../../components/Tables/Details/EmpoweredDetails';
import { renderComponent } from '../../../utils/render';

const person = { fullName: 'Ana Lopez' };
const request = { approvedAmount: 2500, kindProcedure: 'Nuevo Tramite' };

const renderDetails = (props = {}) =>
   renderComponent(
      <table>
         <tbody>
            <EmpoweredDetails person={person} request={request} isGroup {...props} />
         </tbody>
      </table>
   );

describe('EmpoweredDetails', () => {
   test('shows the applicant, the approved amount and the procedure of a group request', () => {
      renderDetails();

      expect(screen.getByText('Ana Lopez')).toBeInTheDocument();
      expect(screen.getByText('$2,500')).toBeInTheDocument();
      expect(screen.getByText('Nuevo Tramite')).toBeInTheDocument();
   });

   test('hides the applicant name when the request is not part of a group', () => {
      renderDetails({ isGroup: false });

      expect(screen.queryByText('Ana Lopez')).not.toBeInTheDocument();
      expect(screen.getByText('$2,500')).toBeInTheDocument();
   });
});
