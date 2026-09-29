import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import Documentation, { getServerSideProps } from '../../../../pages/LDC/Documentation/[group]';
import { getDocumentation, getOneRequest } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getDocumentation: jest.fn(),
   getOneRequest: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const leader = { userAD: 'lc.ad', path: 'LDC', idProfile: 4, status: [] };
const listAnalyst = [{ userAD: 'ana.ad', fullName: 'Ana Analista', color: '#111111', firstLetters: 'AA' }];

const buildRequest = (idRequest, personExtra = {}) => ({
   idRequest,
   hasVerification: true,
   relatedPersonResponseList: [
      { idClient: `10${idRequest}`, idCatTypePerson: 1, fullName: `Solicitante ${idRequest}`, ...personExtra },
      { idClient: `20${idRequest}`, idCatTypePerson: 2, fullName: `Obligado ${idRequest}` },
   ],
});
const buildResponse = ({ idCatStatus = 5, requests = [buildRequest(1)], ...group } = {}) => ({
   status: 200,
   data: {
      requestResponseList: requests,
      idCatStatus,
      idLeader: 'lc.ad',
      idAnalyst: 'ana.ad',
      idGroup: 7,
      ...group,
   },
});
const docsResponse = {
   status: 200,
   data: { personType: 'PM', documentation: [{ _id: 'd1', title: 'Acta constitutiva', toAction: [] }] },
};

const setup = async (response = buildResponse(), { fakeTimers = false, context = {} } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getOneRequest.mockResolvedValue(response);
   const utils = renderPage(<Documentation idGroup='7' />, {
      context: { user: leader, listAnalyst, ...context },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   await screen.findByText('Solicitante: Solicitante 1');
   return utils;
};
const button = (name) => screen.getByRole('button', { name });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true, value: true });
});

describe('getServerSideProps (LDC Documentation)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('LDC Documentation page', () => {
   describe('loading', () => {
      test('requests the group and lists its participants', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByText('Obligado Solidario: Obligado 1')).toBeInTheDocument();
      });

      test('does not request anything without an active user', () => {
         renderPage(<Documentation idGroup='7' />, { context: { user: undefined } });

         expect(getOneRequest).not.toHaveBeenCalled();
         expect(screen.queryByRole('radio')).not.toBeInTheDocument();
      });

      test('shows the error and no participants when the service answers with another status', async () => {
         getOneRequest.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderPage(<Documentation idGroup='7' />, { context: { user: leader } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByRole('radio')).not.toBeInTheDocument();
      });

      test('does not warn the assigned leader', async () => {
         await setup();

         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('warns and redirects to the requests list when the user is not the leader of the group', async () => {
         const { router } = await setup(buildResponse({ idLeader: 'other.ad' }), { fakeTimers: true });

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('¡No eres el Líder de esta Solicitud!'), timer: 5000 })
         );
         act(() => {
            jest.advanceTimersByTime(5000);
         });
         expect(router.replace).toHaveBeenCalledWith('/LDC/RequestsReview');
      });

      test('reloads the group and resets the reload flag when the global reload flag is set', async () => {
         const { updateContext, context } = await setup();

         updateContext({ isReloading: true });

         await waitFor(() => expect(getOneRequest).toHaveBeenCalledTimes(2));
         expect(context.actions.toggleReloading).toHaveBeenCalledTimes(1);
      });
   });

   describe('header buttons', () => {
      test('goes back to the requests list', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/LDC/RequestsReview');
      });

      test('enables returning and evaluating in leader review with an assigned analyst', async () => {
         const { user, router } = await setup(buildResponse({ idCatStatus: 5, idAnalyst: 'ana.ad' }));
         expect(button('Devolver solicitud')).toBeEnabled();
         expect(button('Evaluar solicitud')).toBeEnabled();

         await user.click(button('Devolver solicitud'));
         expect(router.push).toHaveBeenLastCalledWith('/LDC/ReturnRequest/7?origin=Documentation');

         await user.click(button('Evaluar solicitud'));
         expect(router.push).toHaveBeenLastCalledWith('/LDC/ApplicationEvaluation/7');
      });

      test('disables the evaluation without an assigned analyst', async () => {
         await setup(buildResponse({ idCatStatus: 5, idAnalyst: '' }));

         expect(button('Devolver solicitud')).toBeEnabled();
         expect(button('Evaluar solicitud')).toBeDisabled();
      });

      test('allows returning but not evaluating while the analyst is working on the request', async () => {
         await setup(buildResponse({ idCatStatus: 3 }));

         expect(button('Devolver solicitud')).toBeEnabled();
         expect(button('Evaluar solicitud')).toBeDisabled();
      });

      test('disables both buttons in any other status', async () => {
         await setup(buildResponse({ idCatStatus: 4 }));

         expect(button('Devolver solicitud')).toBeDisabled();
         expect(button('Evaluar solicitud')).toBeDisabled();
      });
   });

   describe('participant documentation', () => {
      test('requests the documents of the selected participant and shows them', async () => {
         getDocumentation.mockResolvedValue(docsResponse);
         const { user, context } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Solicitante: Solicitante 1' }));

         expect(await screen.findByText('Acta constitutiva')).toBeInTheDocument();
         expect(getDocumentation).toHaveBeenCalledWith(
            expect.objectContaining({ idClient: '101', idGroup: '7', idStatusGroup: 5, hasVerification: true }),
            leader
         );
         expect(context.actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Buscando documentos...');
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
      });

      test('shows the error and no documents when the service answers with another status', async () => {
         getDocumentation.mockResolvedValue({ status: 500, data: undefined });
         const { user } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Solicitante: Solicitante 1' }));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByText('Acta constitutiva')).not.toBeInTheDocument();
      });

      test('logs the error and hides the loader when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getDocumentation.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Obligado Solidario: Obligado 1' }));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });

   describe('financial documents changes', () => {
      const withChanges = (idCatStatus) =>
         buildResponse({ idCatStatus, requests: [buildRequest(1, { financialDocsChanges: true })] });

      test('warns with an accept button while the analyst can still fix it', async () => {
         const { router } = await setup(withChanges(4));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  html: expect.stringContaining('Se detectó una actualización de la información financiera'),
                  confirmButtonText: 'Aceptar',
               })
            )
         );
         expect(router.push).not.toHaveBeenCalled();
      });

      test('warns with a return button and sends the leader to the return page while reviewing', async () => {
         const { router } = await setup(withChanges(5));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: 'Devolver al analista' }))
         );
         await waitFor(() =>
            expect(router.push).toHaveBeenCalledWith('/LDC/ReturnRequest/7?origin=ApplicationEvaluation')
         );
      });

      test('does not warn when no client changed the financial documents', async () => {
         await setup();

         expect(Swal.fire).not.toHaveBeenCalled();
      });
   });
});
