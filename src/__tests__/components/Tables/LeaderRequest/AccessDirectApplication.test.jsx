import { screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { AccessDirectApplication } from '../../../../components/Tables/LeaderRequest/AccessDirectApplication';
import { renderComponent } from '../../../utils/render';
import { createRouter } from '../../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const user = { userAD: 'leader1', path: 'LDC', status: [5, 6] };
const baseProps = {
   idGroup: 7,
   idStatusRequest: 5,
   userActive: user,
   assignedLeader: 'leader1',
   resultModel: true,
   hasChangeFinancial: false,
};

function setup(props = {}, onParentClick = jest.fn()) {
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const utils = renderComponent(
      <div onClick={onParentClick}>
         <AccessDirectApplication {...baseProps} {...props} />
      </div>
   );
   return { router, onParentClick, ...utils };
}

describe('AccessDirectApplication', () => {
   test('goes to the application evaluation without triggering the parent click', async () => {
      const { router, onParentClick, user: person } = setup();

      await person.click(screen.getByTestId('btnAccessDirect-7'));

      expect(router.push).toHaveBeenCalledWith('/LDC/ApplicationEvaluation/7');
      expect(onParentClick).not.toHaveBeenCalled();
   });

   test('shows the tooltip when the request status is available to the user', () => {
      setup();

      expect(screen.getByText('Ver resultado del modelo')).toBeInTheDocument();
   });

   test.each([
      ['another leader is assigned', { assignedLeader: 'other' }],
      ['the model has no result', { resultModel: null }],
      ['the status is not available to the user', { idStatusRequest: 1 }],
      ['the client has financial changes', { hasChangeFinancial: true }],
   ])('is disabled and does not navigate when %s', async (_, props) => {
      const { router, user: person } = setup(props);
      const button = screen.getByTestId('btnAccessDirect-7');

      await person.click(button);

      expect(button).toBeDisabled();
      expect(router.push).not.toHaveBeenCalled();
   });

   test('hides the tooltip when the status is not available to the user', () => {
      setup({ idStatusRequest: 1 });

      expect(screen.queryByText('Ver resultado del modelo')).not.toBeInTheDocument();
   });
});
