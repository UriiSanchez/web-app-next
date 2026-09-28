import { screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { RequestsContainer } from '../../../../components/Tables/LeaderRequest/RequestsContainer';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';
import { createRouter } from '../../../utils/router';
import listAnalyst from '../../../../__mocks__/analyst';
import listLeaders from '../../../../__mocks__/leaders';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ onChangeRequestStatusOrAssignUser: jest.fn() }));

const buildRequest = (idGroup, overrides = {}) => ({
   idGroup,
   isGroup: false,
   isVisible: true,
   groupName: `Empresa ${idGroup}`,
   idCatStatus: 4,
   idLeader: 'testLC1',
   idAnalyst: 'user1',
   requestResponseList: [
      { idRequest: idGroup * 10, relatedPersonResponseList: [{ idCatTypePerson: 1, fullName: `Empresa ${idGroup}` }] },
   ],
   ...overrides,
});

function setup({ requests, isLoading, expandedRows = [], user = { userAD: 'testLC1', path: 'LDC', status: [4] } } = {}) {
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const actions = createActions({ setExpandedRows: jest.fn() });
   const utils = renderComponent(<RequestsContainer requests={requests} isLoading={isLoading} />, {
      wrapper: createContextWrapper({ expandedRows, user, actions, listLeaders, listAnalyst }),
   });
   return { router, actions, ...utils };
}

describe('RequestsContainer', () => {
   test('shows the skeleton while loading, even if there are requests', () => {
      setup({ requests: [buildRequest(1)], isLoading: true });

      expect(screen.getByTestId('skeleton-requests-container')).toBeInTheDocument();
      expect(screen.queryByTestId('card-group-1')).not.toBeInTheDocument();
   });

   test.each([[[]], [undefined]])('shows the empty message when requests is %p', (requests) => {
      setup({ requests });

      expect(screen.getByText('No hay solicitudes por revisar')).toBeInTheDocument();
   });

   test('renders a card only for the visible requests', () => {
      setup({ requests: [buildRequest(1), buildRequest(2, { isVisible: false }), buildRequest(3)] });

      expect(screen.getByTestId('card-group-1')).toBeInTheDocument();
      expect(screen.queryByTestId('card-group-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('card-group-3')).toBeInTheDocument();
   });

   test('goes to the checklist when the assigned leader clicks the card', async () => {
      const { router, user } = setup({ requests: [buildRequest(1)] });

      await user.click(screen.getByTestId('card-group-1'));

      expect(router.push).toHaveBeenCalledWith('/LDC/Documentation/1');
   });

   test('does not navigate when the user is not the assigned leader', async () => {
      const { router, user } = setup({ requests: [buildRequest(1, { idLeader: 'other' })] });

      await user.click(screen.getByTestId('card-group-1'));

      expect(router.push).not.toHaveBeenCalled();
   });

   test('toggles the expanded row without navigating when the expand button is clicked', async () => {
      const { router, actions, user } = setup({ requests: [buildRequest(1)] });

      await user.click(screen.getByRole('button', { name: 'expand_less' }));

      expect(actions.setExpandedRows).toHaveBeenCalledWith(1);
      expect(router.push).not.toHaveBeenCalled();
   });

   test('shows the details only of the expanded requests', () => {
      setup({ requests: [buildRequest(1), buildRequest(2)], expandedRows: [2] });
      const detailsOf = (idGroup) =>
         screen.getByTestId(`card-group-${idGroup}`).querySelector('.transition-all.duration-300.ease-in-out');

      expect(detailsOf(1)).toHaveClass('invisible');
      expect(detailsOf(2)).toHaveClass('visible');
   });
});
