import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import AnalystRecomendation, { getServerSideProps } from '../../../../pages/ADC/Recomendation/[group]';
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

const analyst = { userAD: 'ana.ad', path: 'ADC', idProfile: 1, status: [] };

const buildRequest = (idRequest, extra = {}) => ({
   idRequest,
   commentAc: '',
   recommendationAc: null,
   relatedPersonResponseList: [{ idClient: `10${idRequest}`, idCatTypePerson: 1, fullName: `Solicitante ${idRequest}` }],
   ...extra,
});
const okResponse = (...requests) => ({ status: 200, data: { requestResponseList: requests } });

const setup = async ({ requests = [buildRequest(1), buildRequest(2)], fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getOneRequest.mockResolvedValue(okResponse(...requests));
   const utils = renderPage(<AnalystRecomendation idGroup='7' />, {
      context: { user: analyst },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   await screen.findByText('Solicitante 1');
   return utils;
};
const finishButton = () => screen.getByRole('button', { name: /Finalizar/ });
const recommend = async (user, index) => user.click(screen.getAllByRole('button', { name: 'done Recomiendo' })[index]);
const rejectRequest = async (user, index) => user.click(screen.getAllByRole('button', { name: 'close No Recomiendo' })[index]);

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (ADC Recomendation)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('ADC Recomendation page', () => {
   describe('loading', () => {
      test('requests the group and shows one card per request under the group heading', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByRole('heading', { name: 'Solicitud 0000000007' })).toBeInTheDocument();
         expect(screen.getByText('Solicitante 2')).toBeInTheDocument();
      });

      test('uses a generic heading when the group has a single request', async () => {
         await setup({ requests: [buildRequest(1)] });

         expect(screen.getByRole('heading', { name: 'Solicitudes' })).toBeInTheDocument();
      });

      test('shows the error and no requests when the service answers with another status', async () => {
         getOneRequest.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderPage(<AnalystRecomendation idGroup='7' />, { context: { user: analyst } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
         expect(finishButton()).toBeDisabled();
      });

      test('goes back to the application evaluation', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/ADC/ApplicationEvaluation/7');
      });
   });

   describe('finish button', () => {
      test('stays disabled until every request has a recommendation', async () => {
         const { user } = await setup();
         expect(finishButton()).toBeDisabled();

         await recommend(user, 0);
         expect(finishButton()).toBeDisabled();

         await rejectRequest(user, 1);
         expect(finishButton()).toBeEnabled();
      });

      test('opens the confirmation and closes it when cancelled', async () => {
         const { user } = await setup();
         await recommend(user, 0);
         await recommend(user, 1);
         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

         await user.click(finishButton());
         expect(screen.getByRole('dialog')).toBeInTheDocument();
         expect(screen.getByText('Al continuar finalizarás el proceso de la solicitud')).toBeInTheDocument();

         await user.click(screen.getByRole('button', { name: 'Cancelar' }));
         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      });
   });

   describe('finishing the recommendation', () => {
      test('sends the recommendations, adds only the typed comments and goes to the requests list', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { user, router, context } = await setup({ fakeTimers: true });
         await recommend(user, 0);
         await rejectRequest(user, 1);
         await user.type(screen.getAllByPlaceholderText('Ingresa aquí los comentarios')[1], 'Sin flujo');

         await user.click(finishButton());
         await user.click(screen.getByRole('button', { name: 'Continuar' }));

         await waitFor(() =>
            expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
               idGroupRequest: '7',
               idCatStatus: 5,
               userCreate: 'ana.ad',
               nextProfile: 'LC',
               requests: [
                  { idRequest: 1, recommendationAc: true },
                  { idRequest: 2, recommendationAc: false, comment: 'Sin flujo' },
               ],
            })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Finalizando este proceso tardará unos segundos...');
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  html: expect.stringContaining('Finalizaste la solicitud con éxito'),
                  timer: 3000,
               })
            )
         );
         expect(router.push).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(3000);
         });
         expect(router.push).toHaveBeenCalledWith('/ADC/RequestsReview');
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('shows the error and does not navigate when the service answers with another status', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 400, data: { message: 'Inválido' } });
         const { user, router, context } = await setup();
         await recommend(user, 0);
         await recommend(user, 1);

         await user.click(finishButton());
         await user.click(screen.getByRole('button', { name: 'Continuar' }));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         onChangeRequestStatusOrAssignUser.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();
         await recommend(user, 0);
         await recommend(user, 1);

         await user.click(finishButton());
         await user.click(screen.getByRole('button', { name: 'Continuar' }));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
