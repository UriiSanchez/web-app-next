import { screen } from '@testing-library/react';

import SecretaryDetails from '../../../../components/Tables/Details/SecretaryDetails';
import { renderComponent } from '../../../utils/render';

const person = { fullName: 'Ana Lopez' };
const request = { requestAmount: 3000, approvedAmount: 1, kindProcedure: 'Ampliacion' };

const renderDetails = (props = {}) =>
   renderComponent(
      <table>
         <tbody>
            <SecretaryDetails person={person} request={request} isGroup {...props} />
         </tbody>
      </table>
   );

describe('SecretaryDetails', () => {
   test('shows the applicant, the requested amount and the procedure of a group request', () => {
      renderDetails();

      expect(screen.getByText('Ana Lopez')).toBeInTheDocument();
      expect(screen.getByText('$3,000')).toBeInTheDocument();
      expect(screen.queryByText('$1')).not.toBeInTheDocument();
      expect(screen.getByText('Ampliacion')).toBeInTheDocument();
   });

   test('hides the applicant name when the request is not part of a group', () => {
      renderDetails({ isGroup: false });

      expect(screen.queryByText('Ana Lopez')).not.toBeInTheDocument();
      expect(screen.getByText('$3,000')).toBeInTheDocument();
   });
});
