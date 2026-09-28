import { fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import { AccessDirectApplication } from '../../../../components/Tables/LeaderRequest/AccessDirectApplication';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

describe('AccessDirectApplication Component', () => {
   const props = {
      idGroup: 1,
      idStatusRequest: 3,
      userActive: mockUsers.LDC,
      assignedLeader: 'UserLDC',
      resultModel: true,
      hasChangeFinancial: false,
   };
   const pushMock = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      useRouter.mockReturnValue({ push: pushMock });
   });

   test('should render the button and be enabled if it complies with all the rules', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(AccessDirectApplication, props);

      const btnAccess = getByTestId('btnAccessDirect-' + props.idGroup);

      expect(btnAccess).toBeInTheDocument();
      expect(btnAccess).toBeEnabled();
   });

   test('the button must be disabled if it is not in the leader status.', async () => {
      const customProps = { ...props, idStatusRequest: 2 };
      const {
         queries: { getByTestId },
      } = await renderPage(AccessDirectApplication, customProps);

      const btnAccess = getByTestId('btnAccessDirect-' + props.idGroup);

      expect(btnAccess).toBeDisabled();
   });

   test('The button should be disabled if the model is not yet running.', async () => {
      const customProps = { ...props, resultModel: null };
      const {
         queries: { getByTestId },
      } = await renderPage(AccessDirectApplication, customProps);

      const btnAccess = getByTestId('btnAccessDirect-' + props.idGroup);

      expect(btnAccess).toBeDisabled();
   });

   test('The button must be disabled if there have been changes in the financials.', async () => {
      const customProps = { ...props, hasChangeFinancial: true };
      const {
         queries: { getByTestId },
      } = await renderPage(AccessDirectApplication, customProps);

      const btnAccess = getByTestId('btnAccessDirect-' + props.idGroup);

      expect(btnAccess).toBeDisabled();
   });

   test('The button must be disabled if the active leader is not the same as the one assigned to the request.', async () => {
      const customProps = { ...props, assignedLeader: "UserLC2" };
      const {
         queries: { getByTestId },
      } = await renderPage(AccessDirectApplication, customProps);

      const btnAccess = getByTestId('btnAccessDirect-' + props.idGroup);

      expect(btnAccess).toBeDisabled();
   });

   test('If the button is enabled, clicking it should redirect to the `Evaluate request` screen.', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(AccessDirectApplication, props);

      const btnAccess = getByTestId('btnAccessDirect-' + props.idGroup);

      fireEvent.click(btnAccess);
      expect(pushMock).toHaveBeenCalledWith("/LDC/ApplicationEvaluation/"+ props.idGroup)
   });
});
