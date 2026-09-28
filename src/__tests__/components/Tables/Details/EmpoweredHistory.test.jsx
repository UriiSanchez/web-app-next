import { screen } from '@testing-library/react';

import EmpoweredHistory from '../../../../components/Tables/Details/EmpoweredHistory';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';

const person = { fullName: 'ANA LOPEZ S.A. DE C.V. ', idClient: 55 };
const authorized = {
   idRequest: 7,
   idCatStatus: 10,
   kindProcedure: 'Nuevo Tramite',
   requestAmount: 3000,
   authorizationNotional: 120,
   resolutionDate: '2025-06-03T08:46:12',
   finalizeDate: '2026-06-03T08:46:12',
};
const rejected = { ...authorized, idCatStatus: 11 };

function setup({ request = authorized, idx = 1 } = {}) {
   const actions = createActions({ togglePDF: jest.fn() });
   const utils = renderComponent(
      <table>
         <tbody>
            <EmpoweredHistory person={person} request={request} idx={idx} />
         </tbody>
      </table>,
      { wrapper: createContextWrapper({ actions }) }
   );
   return { actions, ...utils };
}

describe('EmpoweredHistory', () => {
   test('shows the resolution data of the request', () => {
      setup();

      expect(screen.getByText('ANA LOPEZ S.A. DE C.V.')).toBeInTheDocument();
      expect(screen.getByText('Nuevo Tramite')).toBeInTheDocument();
      expect(screen.getByText('$3,000')).toBeInTheDocument();
      expect(screen.getByText('$120')).toBeInTheDocument();
      expect(screen.getByText('03/06/2025 08:46:12 AM')).toBeInTheDocument();
      expect(screen.getByText('03/06/2026 08:46:12 AM')).toBeInTheDocument();
   });

   test('shows the column titles only for the first request', () => {
      const { unmount } = setup({ idx: 0 });
      expect(screen.getByText('Monto autorizado MXN')).toBeInTheDocument();
      unmount();

      setup({ idx: 1 });
      expect(screen.queryByText('Monto autorizado MXN')).not.toBeInTheDocument();
   });

   test('shows the check icon and the cover button for an authorized request', () => {
      setup();

      expect(screen.getByText('check_circle')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'visibility' })).toBeInTheDocument();
   });

   test('shows the cancel icon and no cover button for a rejected request', () => {
      setup({ request: rejected });

      expect(screen.getByText('cancel')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'visibility' })).not.toBeInTheDocument();
   });

   test('opens the cover PDF of the request', async () => {
      const { actions, user } = setup();

      await user.click(screen.getByRole('button', { name: 'visibility' }));

      expect(actions.togglePDF).toHaveBeenCalledWith({
         idRequest: 7,
         idClient: 55,
         title: 'ANA LOPEZ S.A. DE C.V.',
         prefixName: 'Carátula',
         typePDF: 'ONLY_COVER',
      });
   });
});
