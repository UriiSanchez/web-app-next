import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import Documentation, { getServerSideProps } from '../../../../pages/EMG/Documentation/[group]';
import {
   getDocumentation,
   getLegalRepresent,
   getOneRequest,
   onChangeRequestStatusOrAssignUser,
} from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getDocumentation: jest.fn(),
   getLegalRepresent: jest.fn(),
   getOneRequest: jest.fn(),
   onChangeRequestStatusOrAssignUser: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), showLoading: jest.fn() },
}));

const specialist = { userAD: 'emg.ad', path: 'EMG', idProfile: 3, status: [] };

const buildResponse = ({ idCatStatus = 1, sendOtherProfile = true, oldStatus } = {}) => ({
   status: 200,
   data: {
      idCatStatus,
      sendOtherProfile,
      oldStatus,
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
const docsResponse = (extra = {}) => ({
   status: 200,
   data: {
      idClient: '101',
      personType: 'PM',
      documentation: [
         {
            _id: 'ACT',
            title: 'Acta constitutiva',
            toAction: [{ type: 'func', enable: true, label: 'Representantes' }],
         },
      ],
      ...extra,
   },
});

const setup = async ({ response = buildResponse(), fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getOneRequest.mockResolvedValue(response);
   const utils = renderPage(<Documentation idGroup={7} />, {
      context: { user: specialist },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   await screen.findByText('Solicitante: Solicitante 1');
   return utils;
};
const sendButton = (name = 'Enviar solicitud') => screen.getByRole('button', { name });
const confirmSend = async (user, name) => {
   await user.click(sendButton(name));
};

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (EMG Documentation)', () => {
   test('passes the group of the route as a number', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: 7 } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('EMG Documentation page', () => {
   describe('loading', () => {
      test('requests the group and lists its participants', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith(7);
         expect(screen.getByText('Obligado Solidario: Obligado 1')).toBeInTheDocument();
      });

      test('shows the error and no participants when the service answers with another status', async () => {
         getOneRequest.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderPage(<Documentation idGroup={7} />, { context: { user: specialist } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByRole('radio')).not.toBeInTheDocument();
      });

      test.each([12, 23, 24])(
         'warns that the request is closed and redirects to the requests list for status %i',
         async (idCatStatus) => {
            const { router } = await setup({ response: buildResponse({ idCatStatus }), fakeTimers: true });

            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('Cancelada'), timer: 5000 })
            );
            expect(router.push).not.toHaveBeenCalled();
            act(() => {
               jest.advanceTimersByTime(5000);
            });
            expect(router.push).toHaveBeenCalledWith('/EMG/RequestsReview');
         }
      );

      test('does not warn for an open request', async () => {
         await setup();

         expect(Swal.fire).not.toHaveBeenCalled();
      });
   });

   describe('navigation and send button', () => {
      test('goes back to the solidary obligors page', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/EMG/Solidary/7');
      });

      test('enables "Enviar solicitud" with the specialist and a complete checklist', async () => {
         await setup({ response: buildResponse({ idCatStatus: 1, sendOtherProfile: true }) });

         expect(sendButton('Enviar solicitud')).toBeEnabled();
      });

      test('names the button "Reenviar solicitud" when the request was returned', async () => {
         await setup({ response: buildResponse({ idCatStatus: 7, sendOtherProfile: true }) });

         expect(sendButton('Reenviar solicitud')).toBeEnabled();
      });

      test('disables the button while the checklist is incomplete', async () => {
         await setup({ response: buildResponse({ idCatStatus: 1, sendOtherProfile: false }) });

         expect(sendButton('Enviar solicitud')).toBeDisabled();
      });

      test('disables the button when the request is with another profile', async () => {
         await setup({ response: buildResponse({ idCatStatus: 4, sendOtherProfile: true }) });

         expect(sendButton('Reenviar solicitud')).toBeDisabled();
      });
   });

   describe('sending the request', () => {
      test('asks for a last review and does not send the request when cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { user } = await setup();

         await confirmSend(user);

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: '¡Última revisión!' })));
         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      });

      test('sends a new request to the receiving desk and goes to the home page', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user, router } = await setup({ fakeTimers: true });

         await confirmSend(user);

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
               idGroupRequest: 7,
               idCatStatus: 2,
               nextProfile: 'MR',
               userCreate: 'emg.ad',
            })
         );
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ title: 'La solicitud ha pasado a Mesa Receptora', icon: 'success' })
            )
         );
         expect(router.push).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(1000);
         });
         expect(router.push).toHaveBeenCalledWith('/');
      });

      test('returns a request to the profile that sent it back using its previous status', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user } = await setup({ response: buildResponse({ idCatStatus: 8, oldStatus: 5 }) });

         await confirmSend(user, 'Reenviar solicitud');

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
               expect.objectContaining({ idCatStatus: 5, nextProfile: 'LC' })
            )
         );
      });

      test('shows the error and does not navigate when the service answers with another status', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 400, data: { message: 'Inválido' } });
         const { user, router } = await setup();

         await confirmSend(user);

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' })));
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         onChangeRequestStatusOrAssignUser.mockRejectedValue(new Error('boom'));
         const { user } = await setup();

         await confirmSend(user);

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Pase de solicitud MRC: ', expect.any(Error)));
      });
   });

   describe('participant documentation', () => {
      test('requests the documents of the selected participant and shows them', async () => {
         getDocumentation.mockResolvedValue(docsResponse());
         const { user, context } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Solicitante: Solicitante 1' }));

         expect(await screen.findByText('Acta constitutiva')).toBeInTheDocument();
         expect(getDocumentation).toHaveBeenCalledWith(
            expect.objectContaining({ idClient: '101', idGroup: 7, idStatusGroup: 1 }),
            specialist
         );
         expect(context.actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Buscando documentos...');
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
      });

      test('shows the error when the service answers with another status', async () => {
         getDocumentation.mockResolvedValue({ status: 500, data: { documentation: [] } });
         const { user } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Solicitante: Solicitante 1' }));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
      });

      test('logs the error and hides the loader when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getDocumentation.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Solicitante: Solicitante 1' }));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });

   describe('legal representatives modal', () => {
      const openModal = async (user) => {
         await user.click(screen.getByRole('radio', { name: 'Solicitante: Solicitante 1' }));
         await user.click(await screen.findByRole('button', { name: 'Representantes' }));
      };

      test('opens the modal with the legal representatives of the selected participant', async () => {
         getDocumentation.mockResolvedValue(docsResponse());
         getLegalRepresent.mockResolvedValue({
            status: 200,
            data: { thirdRepresentatives: [{ idClient: 301, idRequest: 1, fullName: 'Representante Uno', rfc: 'RFC1' }] },
         });
         const { user } = await setup();

         await openModal(user);

         expect(await screen.findByRole('heading', { name: 'Representantes Legales' })).toBeInTheDocument();
         expect(screen.getByText('Representante Uno')).toBeInTheDocument();
         expect(getLegalRepresent).toHaveBeenCalledWith(expect.objectContaining({ idClient: '101' }), specialist);
      });

      test('closes the modal when the representatives cannot be loaded', async () => {
         getDocumentation.mockResolvedValue(docsResponse());
         getLegalRepresent.mockResolvedValue({ status: 404, data: {} });
         const { user } = await setup();

         await openModal(user);

         await waitFor(() => expect(getLegalRepresent).toHaveBeenCalledTimes(1));
         await waitFor(() => expect(screen.queryByRole('heading', { name: 'Representantes Legales' })).not.toBeInTheDocument());
      });

      test('closes the modal after the user confirms leaving it', async () => {
         getDocumentation.mockResolvedValue(docsResponse());
         getLegalRepresent.mockResolvedValue({
            status: 200,
            data: { thirdRepresentatives: [{ idClient: 301, idRequest: 1, fullName: 'Representante Uno', rfc: 'RFC1' }] },
         });
         const { user } = await setup();
         await openModal(user);
         await screen.findByRole('heading', { name: 'Representantes Legales' });

         await user.click(screen.getByTitle('Cerrar modal'));

         await waitFor(() => expect(screen.queryByRole('heading', { name: 'Representantes Legales' })).not.toBeInTheDocument());
      });
   });
});
