import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import ReturnRequest, { getServerSideProps } from '../../../../pages/ADC/ReturnRequest/[group]';
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

const analyst = { userAD: 'ana.ad', path: 'ADC', idProfile: 1, status: [] };

const buildRequest = (idRequest) => ({
   idRequest,
   relatedPersonResponseList: [
      { idClient: `10${idRequest}`, idCatTypePerson: 1, fullName: `Solicitante ${idRequest}` },
      { idClient: `20${idRequest}`, idCatTypePerson: 2, fullName: `Obligado ${idRequest}` },
   ],
});
const okResponse = (...requests) => ({ status: 200, data: { requestResponseList: requests } });

const setup = async ({ response = okResponse(buildRequest(1), buildRequest(2)), fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getOneRequest.mockResolvedValue(response);
   const utils = renderPage(<ReturnRequest idGroup='7' />, {
      context: { user: analyst },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   if (response.status === 200) await screen.findByText('Solicitante 1');
   return utils;
};
const returnButton = () => screen.getByRole('button', { name: /Devolver solicitud/ });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (ADC ReturnRequest)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('ADC ReturnRequest page', () => {
   describe('loading', () => {
      test('requests the group and lists each applicant with its solidary obligors', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByRole('heading', { name: 'Solicitud 0000000007' })).toBeInTheDocument();
         expect(screen.getByText('Solicitante 2')).toBeInTheDocument();
         expect(screen.getByText('Obligado 1')).toBeInTheDocument();
         expect(screen.getAllByPlaceholderText('Ingresa aquí los comentarios')).toHaveLength(2);
      });

      test('shows the skeleton while the group is loading', () => {
         getOneRequest.mockReturnValue(new Promise(() => {}));

         renderPage(<ReturnRequest idGroup='7' />, { context: { user: analyst } });

         expect(screen.getByTestId('applicant-skeleton-container')).toBeInTheDocument();
      });

      test('shows the error and keeps the skeleton when the service answers with another status', async () => {
         await setup({ response: { status: 500, data: { message: 'Fallo' } } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.getByTestId('applicant-skeleton-container')).toBeInTheDocument();
      });
   });

   describe('navigation', () => {
      test('goes back to the checklist of the group', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7');
      });
   });

   describe('returning the request', () => {
      test('asks for confirmation and does not return the request when cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { user } = await setup();

         await user.click(returnButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: '¿Estás seguro?' })));
         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      });

      test('sends the typed comments to the specialist and goes to the requests list', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user, router, context } = await setup({ fakeTimers: true });
         await user.type(screen.getByTestId('text-comment-2'), 'Falta el balance');

         await user.click(returnButton());

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
               idGroupRequest: '7',
               idCatStatus: 9,
               userCreate: 'ana.ad',
               nextProfile: 'EF',
               requests: [
                  { idRequest: 1, comment: '' },
                  { idRequest: 2, comment: 'Falta el balance' },
               ],
            })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Devolviendo solicitud...');
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  icon: 'success',
                  title: 'Solicitud devuelta, se ha notificado al Especialista de Mercados Globales',
               })
            )
         );
         expect(router.push).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(2500);
         });
         expect(router.push).toHaveBeenCalledWith('/ADC/RequestsReview');
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
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
