import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import ValidateRequest, { getServerSideProps } from '../../../../pages/MRC/ValidateRequest/[group]';
import { graphGetGroup, onChangeRequestStatusOrAssignUser } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   graphGetGroup: jest.fn(),
   onChangeRequestStatusOrAssignUser: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const desk = { userAD: 'mrc.ad', path: 'MRC', idProfile: 2, status: [] };
const listLeaders = [
   { userAD: 'lc1', fullName: 'Lider Uno' },
   { userAD: 'lc2', fullName: 'Lider Dos' },
];

const buildResponse = ({ sendOtherProfile = true, nameEmg = 'Ema Especialista' } = {}) => ({
   status: 200,
   data: {
      sendOtherProfile,
      nameEmg,
      requestResponseList: [
         {
            idRequest: 1,
            relatedPersonResponseList: [
               { idClient: '101', idCatTypePerson: 1, fullName: 'Solicitante 1' },
               { idClient: '201', idCatTypePerson: 2, fullName: 'Obligado 1' },
            ],
         },
      ],
   },
});

const setup = async (response = buildResponse()) => {
   graphGetGroup.mockResolvedValue(response);
   const utils = renderPage(<ValidateRequest idGroup='7' />, { context: { user: desk, listLeaders } });
   if (response.status === 200) await screen.findByText('Solicitante 1');
   return utils;
};
const assignButton = () => screen.getByRole('button', { name: /Asignar solicitud/ });
const returnButton = () => screen.getByRole('button', { name: /Devolver solicitud/ });
const chooseLeader = async (user, name = 'Lider Dos') => {
   await user.click(screen.getByText('Sin asignar'));
   await user.click(screen.getByText(name));
};

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (MRC ValidateRequest)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('MRC ValidateRequest page', () => {
   describe('loading', () => {
      test('requests the group to validate and shows its data', async () => {
         await setup();

         expect(graphGetGroup).toHaveBeenCalledWith('REQUEST_VALIDATE_MR', '7');
         expect(screen.getByRole('heading', { name: 'Solicitud 0000000007' })).toBeInTheDocument();
         expect(screen.getByText('Ema Especialista')).toBeInTheDocument();
         expect(screen.getByText('Obligado 1')).toBeInTheDocument();
         expect(screen.getByText('Sin asignar')).toBeInTheDocument();
      });

      test('shows "No definido" when the group has no specialist', async () => {
         await setup(buildResponse({ nameEmg: '' }));

         expect(screen.getByText('No definido')).toBeInTheDocument();
      });

      test('shows the error and the skeleton when the service answers with another status', async () => {
         await setup({ status: 500, data: { message: 'Fallo' } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.getByTestId('applicant-skeleton-container')).toBeInTheDocument();
      });

      test('goes back to the checklist of the receiving desk', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/MRC/Documentation/7');
      });
   });

   describe('leader selection', () => {
      test('shows the chosen leader and marks it as selected in the list', async () => {
         const { user } = await setup();

         await chooseLeader(user, 'Lider Dos');

         expect(screen.getByText('Lider Dos')).toBeInTheDocument();
         expect(screen.queryByText('Sin asignar')).not.toBeInTheDocument();
      });

      test('disables the assignment and hints that information is missing until a leader is chosen', async () => {
         await setup();

         expect(assignButton()).toBeDisabled();
         expect(screen.getByRole('tooltip')).toHaveTextContent('Tienes información por completar');
      });

      test('enables the assignment once a leader is chosen', async () => {
         const { user } = await setup();

         await chooseLeader(user);

         expect(assignButton()).toBeEnabled();
         expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });

      test('keeps the assignment disabled without a hint when the group is not ready to be sent', async () => {
         const { user } = await setup(buildResponse({ sendOtherProfile: false }));

         await chooseLeader(user);

         expect(assignButton()).toBeDisabled();
         expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
   });

   describe('assigning the request', () => {
      test('assigns the request to the chosen leader and goes to the requests list', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user, router, context } = await setup();
         await chooseLeader(user, 'Lider Uno');

         await user.click(assignButton());

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
               idGroupRequest: '7',
               idCatStatus: 3,
               idLeader: 'lc1',
               userCreate: 'mrc.ad',
               nextProfile: 'LC',
            })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Asignando...');
         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/MRC/RequestsReview'));
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ icon: 'success', text: 'Se asignó la solicitud con éxito' })
         );
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('shows the error and does not navigate when the service answers with another status', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 400, data: { message: 'Inválido' } });
         const { user, router, context } = await setup();
         await chooseLeader(user);

         await user.click(assignButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         onChangeRequestStatusOrAssignUser.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();
         await chooseLeader(user);

         await user.click(assignButton());

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });

   describe('returning the request', () => {
      test('returns the request to the specialist with the typed comments and goes to the requests list', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user, router, context } = await setup();
         await user.type(screen.getByTestId('text-comment-1'), 'Documentos ilegibles');

         await user.click(returnButton());

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
               idGroupRequest: '7',
               idCatStatus: 7,
               userCreate: 'mrc.ad',
               nextProfile: 'EF',
               requests: [{ idRequest: 1, comment: 'Documentos ilegibles' }],
            })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Devolviendo...');
         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/MRC/RequestsReview'));
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ title: '¡Solicitud devuelta!', icon: 'success' })
         );
      });

      test('shows the error and does not navigate when the service answers with another status', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 400, data: { message: 'Inválido' } });
         const { user, router } = await setup();

         await user.click(returnButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' })));
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         onChangeRequestStatusOrAssignUser.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();

         await user.click(returnButton());

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
