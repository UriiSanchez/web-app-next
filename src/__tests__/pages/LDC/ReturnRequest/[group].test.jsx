import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import ReturnRequest, { getServerSideProps } from '../../../../pages/LDC/ReturnRequest/[group]';
import { getOneRequest, onChangeRequestStatusOrAssignUser } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getOneRequest: jest.fn(),
   onChangeRequestStatusOrAssignUser: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), showLoading: jest.fn() },
}));

const leader = { userAD: 'lc.ad', path: 'LDC', idProfile: 4, status: [] };

const buildRequest = (idRequest, extra = {}) => ({
   idRequest,
   relatedPersonResponseList: [
      { idClient: `10${idRequest}`, idCatTypePerson: 1, fullName: `Solicitante ${idRequest}`, ...extra },
      { idClient: `20${idRequest}`, idCatTypePerson: 2, fullName: `Obligado ${idRequest}` },
   ],
});
const okResponse = (requests = [buildRequest(1), buildRequest(2)], extra = {}) => ({
   status: 200,
   data: { idLeader: 'lc.ad', requestResponseList: requests, ...extra },
});

const setup = async ({
   response = okResponse(),
   origin = 'Documentation',
   fakeTimers = false,
   context = { user: leader },
} = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getOneRequest.mockResolvedValue(response);
   const utils = renderPage(<ReturnRequest idGroup='7' origin={origin} />, {
      context,
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   if (response.status === 200) await screen.findByText('Solicitante 1');
   return utils;
};
const returnButton = () => screen.getByRole('button', { name: /Devolver solicitud/ });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (LDC ReturnRequest)', () => {
   test('passes the group and the origin of the query', async () => {
      expect(await getServerSideProps({ query: { group: '7', origin: 'ApplicationEvaluation' } })).toEqual({
         props: { idGroup: '7', origin: 'ApplicationEvaluation' },
      });
   });

   test('defaults to group 0 and the Documentation origin', async () => {
      expect(await getServerSideProps({ query: {} })).toEqual({ props: { idGroup: 0, origin: 'Documentation' } });
   });
});

describe('LDC ReturnRequest page', () => {
   describe('loading', () => {
      test('requests the group and lists each applicant with its solidary obligors', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByRole('heading', { name: 'Solicitud 0000000007' })).toBeInTheDocument();
         expect(screen.getByText('Solicitante 2')).toBeInTheDocument();
         expect(screen.getByText('Obligado 1')).toBeInTheDocument();
      });

      test('does not request anything without an active user', () => {
         renderPage(<ReturnRequest idGroup='7' origin='Documentation' />, { context: { user: undefined } });

         expect(getOneRequest).not.toHaveBeenCalled();
         expect(screen.getByTestId('applicant-skeleton-container')).toBeInTheDocument();
      });

      test('shows the error and keeps the skeleton when the service answers with another status', async () => {
         await setup({ response: { status: 500, data: { message: 'Fallo' } } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.getByTestId('applicant-skeleton-container')).toBeInTheDocument();
      });

      test('warns and redirects to the requests list when the user is not the leader of the group', async () => {
         jest.useFakeTimers();
         const { router } = await setup({
            response: okResponse(undefined, { idLeader: 'other.ad' }),
            fakeTimers: true,
         });

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('¡No eres el Líder de esta Solicitud!'), timer: 5000 })
         );
         expect(router.replace).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(5000);
         });
         expect(router.replace).toHaveBeenCalledWith('/LDC/RequestsReview');
      });

      test('does not warn when the user is the leader of the group', async () => {
         await setup();

         expect(Swal.fire).not.toHaveBeenCalled();
      });
   });

   describe('navigation', () => {
      test('goes back to the origin page of the group', async () => {
         const { user, router } = await setup({ origin: 'ApplicationEvaluation' });

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/LDC/ApplicationEvaluation/7');
      });

      test('goes back to the checklist when a client changed the financial documents', async () => {
         const response = okResponse([buildRequest(1, { financialDocsChanges: true })]);
         const { user, router } = await setup({ response, origin: 'ApplicationEvaluation' });

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/LDC/Documentation/7');
      });
   });

   describe('returning the request', () => {
      test('asks for confirmation naming the receiver and does not return the request when cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { user } = await setup();

         await user.click(returnButton());

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('especialista de mercados globales') })
            )
         );
         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      });

      test('returns the request to the specialist from the documentation and goes to the requests list', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user, router, context } = await setup({ fakeTimers: true });
         await user.type(screen.getByTestId('text-comment-1'), 'Documentos ilegibles');

         await user.click(returnButton());

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
               idGroupRequest: '7',
               idCatStatus: 8,
               userCreate: 'lc.ad',
               nextProfile: 'EF',
               requests: [
                  { idRequest: 1, comment: 'Documentos ilegibles' },
                  { idRequest: 2, comment: '' },
               ],
            })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Devolviendo solicitud...');
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  title: '¡Solicitud devuelta! Se ha notificado al Especialista de Mercados Globales',
               })
            )
         );
         act(() => {
            jest.advanceTimersByTime(2500);
         });
         expect(router.push).toHaveBeenCalledWith('/LDC/RequestsReview');
      });

      test('returns the request to the analyst from the application evaluation', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user } = await setup({ origin: 'ApplicationEvaluation' });

         await user.click(returnButton());

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
               expect.objectContaining({ idCatStatus: 22, nextProfile: 'AC' })
            )
         );
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ title: '¡Solicitud devuelta! Se ha notificado al Analista' })
            )
         );
      });

      test('shows the error and does not navigate when the service answers with another status', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 400, data: { message: 'Inválido' } });
         const { user, router, context } = await setup();

         await user.click(returnButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         onChangeRequestStatusOrAssignUser.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();

         await user.click(returnButton());

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Devolución solicitud: ', expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
