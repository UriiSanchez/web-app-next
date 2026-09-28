import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import { RequestsDetailsCard } from '../../../../components/Tables/LeaderRequest/RequestsDetailsCard';
import { onChangeRequestStatusOrAssignUser } from '../../../../services';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';
import listAnalyst from '../../../../__mocks__/analyst';
import listLeaders from '../../../../__mocks__/leaders';

jest.mock('../../../../services', () => ({ onChangeRequestStatusOrAssignUser: jest.fn() }));
jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const applicant = (idRequest, fullName) => ({
   idRequest,
   kindProcedure: idRequest === 100 ? 'Nuevo Tramite' : 'Ampliacion',
   notional: 1000 * idRequest,
   requestAmount: 5000 + idRequest,
   lastDateExecEm: '2025-06-03T08:46:12',
   resultExecEm: true,
   recommendationAc: true,
   recommendationLc: false,
   relatedPersonResponseList: [{ idCatTypePerson: 1, fullName, financialDocsChanges: false }],
});

const individual = {
   idGroup: 1,
   isGroup: false,
   groupName: 'Empresa Uno',
   nameEmg: 'Especialista Uno',
   status: 'En analista',
   idCatStatus: 4,
   idLeader: 'testLC1',
   idAnalyst: 'user1',
   requestAmount: 9999,
   requestResponseList: [applicant(100, 'Empresa Uno')],
};
const group = {
   ...individual,
   idGroup: 2,
   isGroup: true,
   groupName: 'Grupo Dos',
   requestResponseList: [applicant(100, 'ana lopez'), applicant(200, 'luis perez')],
};
const leaderUser = { userAD: 'testLC1', path: 'LDC', status: [4, 5] };

function setup({ info = individual, user = leaderUser, isExpanded = true, ...props } = {}) {
   const actions = createActions({ setDataAnalyst: jest.fn(), toggleReloading: jest.fn() });
   const value = { listLeaders, listAnalyst, user, actions, isReloading: false };
   const handlers = { onExpand: jest.fn(), onRedirectToChecklist: jest.fn() };
   const utils = renderComponent(
      <RequestsDetailsCard
         info={info}
         idGroup={info.idGroup}
         isGroup={info.isGroup}
         isExpanded={isExpanded}
         {...handlers}
         {...props}
      />,
      { wrapper: createContextWrapper(value), userOptions: { advanceTimers: jest.advanceTimersByTime } }
   );
   return { actions, ...handlers, ...utils };
}

beforeEach(() => {
   jest.useFakeTimers();
});

describe('RequestsDetailsCard', () => {
   test('shows the summary of an individual request', () => {
      setup();

      expect(screen.getByText('0000000001')).toBeInTheDocument();
      expect(screen.getByText('Empresa Uno')).toBeInTheDocument();
      expect(screen.getByText('Especialista Uno')).toBeInTheDocument();
      expect(screen.getByText('En analista')).toBeInTheDocument();
   });

   test('shows dashes when the optional summary data is missing', () => {
      setup({ info: { ...individual, nameEmg: undefined, status: undefined } });

      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
   });

   test('shows the procedure, the notional and the amount of the selected request', () => {
      setup();

      expect(screen.getByText('Nuevo Tramite')).toBeInTheDocument();
      expect(screen.getByText('$100,000')).toBeInTheDocument();
      expect(screen.getByText('$5,100')).toBeInTheDocument();
   });

   test('reports the redirection click on the card and the expand click separately', async () => {
      const { user, onRedirectToChecklist, onExpand } = setup();

      await user.click(screen.getByTestId('card-group-1'));
      expect(onRedirectToChecklist).toHaveBeenCalledTimes(1);
      expect(onExpand).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'expand_less' }));
      expect(onExpand).toHaveBeenCalledTimes(1);
   });

   test('shows the group amount until an applicant is chosen and then that applicant data', async () => {
      const { user } = setup({ info: group });
      expect(screen.getByText('$9,999')).toBeInTheDocument();

      await user.click(screen.getByTestId('name-applicant'));
      await user.click(screen.getByTestId('option-luis-perez'));

      expect(screen.getByText('Ampliacion')).toBeInTheDocument();
      expect(screen.getByText('$5,200')).toBeInTheDocument();
      expect(screen.getByTestId('name-applicant')).toHaveTextContent('luis perez');
   });

   test('enables the analyst reassignment only for the assigned leader in an allowed status', async () => {
      const { user, unmount } = setup();
      await user.click(screen.getByText('Test User Analyst One'));
      expect(screen.getByTestId('menu-option-user2')).toBeInTheDocument();
      unmount();

      const other = setup({ user: { ...leaderUser, userAD: 'someone' } });
      await other.user.click(screen.getByText('Test User Analyst One'));
      expect(screen.queryByTestId('menu-option-user2')).not.toBeInTheDocument();
   });

   test('reassigns the analyst, confirms it and reloads the analyst list after the delay', async () => {
      onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
      localStorage.setItem('listAnalyst', 'cache');
      const { user, actions } = setup();

      await user.click(screen.getByText('Test User Analyst One'));
      await user.click(screen.getByTestId('menu-option-user2'));

      await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
      expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
         { idGroupRequest: 1, userAD: 'user2', nextProfile: 'AC' },
         true
      );
      expect(actions.setDataAnalyst).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(1200));

      expect(localStorage.getItem('listAnalyst')).toBeNull();
      expect(actions.setDataAnalyst).toHaveBeenCalledWith(true);
   });

   test('assigns instead of reassigns when the request has no analyst yet', async () => {
      onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
      const { user } = setup({ info: { ...individual, idAnalyst: '' } });

      await user.click(screen.getByText('Sin asignar'));
      await user.click(screen.getByTestId('menu-option-user2'));

      await waitFor(() => expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledTimes(1));
      expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
         { idGroupRequest: 1, userCreate: 'testLC1', idCatStatus: 4, nextProfile: 'AC', idAnalyst: 'user2' },
         false
      );
   });

   test('reassigns the leader and reloads the requests after the delay', async () => {
      onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
      const { user, actions } = setup();

      await user.click(screen.getByText('TEST USER LEADER ONE'));
      await user.click(screen.getByTestId('menu-option-testLC2'));

      await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
      expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
         { idGroupRequest: 1, userAD: 'testLC2', nextProfile: 'LC' },
         true
      );

      act(() => jest.advanceTimersByTime(1200));

      expect(actions.toggleReloading).toHaveBeenCalledTimes(1);
   });

   test('does nothing when the chosen user is already assigned', async () => {
      const { user } = setup();

      await user.click(screen.getByText('Test User Analyst One'));
      await user.click(screen.getByTestId('menu-option-user1'));

      expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      expect(Swal.fire).not.toHaveBeenCalled();
   });

   test('reports the error and does not reload when the reassignment fails', async () => {
      onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 400, data: {} });
      const { user, actions } = setup();

      await user.click(screen.getByText('Test User Analyst One'));
      await user.click(screen.getByTestId('menu-option-user2'));

      await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' }));
      act(() => jest.advanceTimersByTime(1200));
      expect(actions.setDataAnalyst).not.toHaveBeenCalled();
      expect(actions.toggleReloading).not.toHaveBeenCalled();
   });
});
