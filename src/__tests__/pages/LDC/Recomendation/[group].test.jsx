import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import LeaderRecomendation, { getServerSideProps } from '../../../../pages/LDC/Recomendation/[group]';
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
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const leader = { userAD: 'lc.ad', path: 'LDC', idProfile: 4, status: [] };

const buildRequest = (idRequest, extra = {}) => ({
   idRequest,
   commentAc: 'Comentario del analista',
   recommendationAc: true,
   commentLc: '',
   recommendationLc: null,
   relatedPersonResponseList: [{ idClient: `10${idRequest}`, idCatTypePerson: 1, fullName: `Solicitante ${idRequest}` }],
   ...extra,
});
const okResponse = (...requests) => ({ status: 200, data: { requestResponseList: requests } });

const setup = async ({ requests = [buildRequest(1), buildRequest(2)], fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getOneRequest.mockResolvedValue(okResponse(...requests));
   const utils = renderPage(<LeaderRecomendation idGroup='7' />, {
      context: { user: leader },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   await screen.findByText('Solicitante 1');
   return utils;
};
const finishButton = () => screen.getByRole('button', { name: /Finalizar/ });
// Cada fila tiene dos pares de botones: el del analista (solo lectura) y el del líder (índice impar).
const leaderYes = (index) => screen.getAllByRole('button', { name: 'done Recomiendo' })[index * 2 + 1];
const leaderNo = (index) => screen.getAllByRole('button', { name: 'close No Recomiendo' })[index * 2 + 1];

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (LDC Recomendation)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('LDC Recomendation page', () => {
   describe('loading', () => {
      test('requests the group and shows one row per request with the analyst comment', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByRole('heading', { name: 'Solicitantes' })).toBeInTheDocument();
         expect(screen.getByText('Solicitante 2')).toBeInTheDocument();
         expect(screen.getAllByText('Comentario del analista')).toHaveLength(2);
      });

      test('shows the error and no requests when the service answers with another status', async () => {
         getOneRequest.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderPage(<LeaderRecomendation idGroup='7' />, { context: { user: leader } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
         expect(finishButton()).toBeDisabled();
      });

      test('goes back to the application evaluation of the leader', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/LDC/ApplicationEvaluation/7');
      });
   });

   describe('finish button', () => {
      test('stays disabled until the leader has recommended every request', async () => {
         const { user } = await setup();
         expect(finishButton()).toBeDisabled();

         await user.click(leaderYes(0));
         expect(finishButton()).toBeDisabled();

         await user.click(leaderNo(1));
         expect(finishButton()).toBeEnabled();
      });

      test('is enabled from the start when every request already has a leader decision', async () => {
         await setup({ requests: [buildRequest(1, { recommendationLc: false })] });

         expect(finishButton()).toBeEnabled();
      });

      test('opens the confirmation and closes it when cancelled', async () => {
         const { user } = await setup({ requests: [buildRequest(1, { recommendationLc: true })] });
         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

         await user.click(finishButton());
         expect(screen.getByRole('dialog')).toBeInTheDocument();

         await user.click(screen.getByRole('button', { name: 'Cancelar' }));
         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      });
   });

   describe('finishing the recommendation', () => {
      test('sends each decision with its status and the group in faculty review when any is recommended', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user, router, context } = await setup({ fakeTimers: true });
         await user.click(leaderYes(0));
         await user.click(leaderNo(1));
         await user.type(screen.getAllByPlaceholderText('Ingresa aquí los comentarios')[0], 'Buen perfil');

         await user.click(finishButton());
         await user.click(screen.getByRole('button', { name: 'Continuar' }));

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
               idGroupRequest: '7',
               idCatStatus: 26,
               userCreate: 'lc.ad',
               nextProfile: 'FC',
               requests: [
                  { idRequest: 1, recommendationLc: true, comment: 'Buen perfil', idCatStatus: 26 },
                  { idRequest: 2, recommendationLc: false, idCatStatus: 11 },
               ],
            })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Finalizando este proceso tardará unos segundos...');
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('Finalizaste la solicitud con éxito'), timer: 3000 })
            )
         );
         act(() => {
            jest.advanceTimersByTime(3000);
         });
         expect(router.push).toHaveBeenCalledWith('/LDC/RequestsReview');
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('finishes the group when no request is recommended', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user } = await setup({ requests: [buildRequest(1, { recommendationLc: false })] });

         await user.click(finishButton());
         await user.click(screen.getByRole('button', { name: 'Continuar' }));

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
               expect.objectContaining({
                  idCatStatus: 12,
                  requests: [{ idRequest: 1, recommendationLc: false, idCatStatus: 11 }],
               })
            )
         );
      });

      test('shows the error and does not navigate when the service answers with another status', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 400, data: { message: 'Inválido' } });
         const { user, router, context } = await setup({ requests: [buildRequest(1, { recommendationLc: true })] });

         await user.click(finishButton());
         await user.click(screen.getByRole('button', { name: 'Continuar' }));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         onChangeRequestStatusOrAssignUser.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup({ requests: [buildRequest(1, { recommendationLc: true })] });

         await user.click(finishButton());
         await user.click(screen.getByRole('button', { name: 'Continuar' }));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
