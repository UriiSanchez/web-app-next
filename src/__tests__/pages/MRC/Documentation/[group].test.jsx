import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import Documentation, { getServerSideProps } from '../../../../pages/MRC/Documentation/[group]';
import { execCreditBureuQuery, getDocumentation, getOneRequest } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   execCreditBureuQuery: jest.fn(),
   getDocumentation: jest.fn(),
   getOneRequest: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const desk = { userAD: 'mrc.ad', path: 'MRC', idProfile: 2, status: [] };

const buildResponse = ({ idCatStatus = 2 } = {}) => ({
   status: 200,
   data: {
      idCatStatus,
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
const buroDocs = (extra = {}) => ({
   status: 200,
   data: {
      idClient: '101',
      idRequest: 1,
      personType: 'PF',
      retrieveBureau: false,
      documentation: [
         { _id: 'BC', title: 'Consulta de Buró', toAction: [{ type: 'func', enable: true, label: 'Consultar' }] },
      ],
      ...extra,
   },
});

const setup = async ({ response = buildResponse(), fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getOneRequest.mockResolvedValue(response);
   const utils = renderPage(<Documentation idGroup='7' />, {
      context: { user: desk },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   await screen.findByText('Solicitante: Solicitante 1');
   return utils;
};
const selectApplicant = async (user) => {
   await user.click(screen.getByRole('radio', { name: 'Solicitante: Solicitante 1' }));
   return screen.findByRole('button', { name: 'Consultar' });
};

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (MRC Documentation)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('MRC Documentation page', () => {
   describe('loading', () => {
      test('requests the group and lists its participants', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByText('Obligado Solidario: Obligado 1')).toBeInTheDocument();
      });

      test('shows the error and no participants when the service answers with another status', async () => {
         getOneRequest.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderPage(<Documentation idGroup='7' />, { context: { user: desk } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByRole('radio')).not.toBeInTheDocument();
      });
   });

   describe('header buttons', () => {
      test('goes back to the requests list of the receiving desk', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/MRC/RequestsReview');
      });

      test('enables the validation while the request is in the receiving desk', async () => {
         const { user, router } = await setup();
         const validate = screen.getByRole('button', { name: 'Validar Solicitud' });
         expect(validate).toBeEnabled();

         await user.click(validate);

         expect(router.push).toHaveBeenCalledWith('/MRC/ValidateRequest/7');
      });

      test('disables the validation in any other status', async () => {
         await setup({ response: buildResponse({ idCatStatus: 3 }) });

         expect(screen.getByRole('button', { name: 'Validar Solicitud' })).toBeDisabled();
      });
   });

   describe('participant documentation', () => {
      test('requests the documents, stores them for the bureau screens and shows them', async () => {
         getDocumentation.mockResolvedValue(buroDocs());
         const { user, context } = await setup();

         await selectApplicant(user);

         expect(screen.getByText('Consulta de Buró')).toBeInTheDocument();
         expect(getDocumentation).toHaveBeenCalledWith(
            expect.objectContaining({ idClient: '101', idGroup: '7', idStatusGroup: 2 }),
            desk
         );
         expect(JSON.parse(localStorage.getItem('infoMRC'))).toEqual(
            expect.objectContaining({ idClient: '101', idRequest: 1, userActive: 'mrc.ad' })
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

   describe('credit bureau query', () => {
      test('runs the first query directly, shows the notice and reloads the page after a second', async () => {
         localStorage.setItem('BureauError', 'x');
         execCreditBureuQuery.mockResolvedValue({ status: 200 });
         getDocumentation.mockResolvedValue(buroDocs());
         const { user, router, context } = await setup({ fakeTimers: true });

         await user.click(await selectApplicant(user));

         await waitFor(() =>
            expect(execCreditBureuQuery).toHaveBeenCalledWith({
               idClient: '101',
               idRequest: 1,
               userConsulting: 'mrc.ad',
               process: 'BUREA_MODEL',
            })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Ejecutando consulta a Buró...');
         expect(localStorage.getItem('BureauError')).toBeNull();
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: '¡En proceso!', icon: 'success' }))
         );
         expect(Swal.fire).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Buró de Crédito' }));
         expect(router.reload).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(1000);
         });
         expect(router.reload).toHaveBeenCalledTimes(1);
      });

      test('asks for confirmation before running the query again', async () => {
         execCreditBureuQuery.mockResolvedValue({ status: 200 });
         getDocumentation.mockResolvedValue(buroDocs({ retrieveBureau: true }));
         const { user } = await setup();

         await user.click(await selectApplicant(user));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ title: 'Buró de Crédito', confirmButtonText: 'Sí, ejecutar' })
            )
         );
         await waitFor(() => expect(execCreditBureuQuery).toHaveBeenCalledTimes(1));
      });

      test('does not run the query again when the confirmation is cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         getDocumentation.mockResolvedValue(buroDocs({ retrieveBureau: true }));
         const { user } = await setup();

         await user.click(await selectApplicant(user));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(execCreditBureuQuery).not.toHaveBeenCalled();
      });

      test('shows the error and does not reload when the query answers with another status', async () => {
         execCreditBureuQuery.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });
         getDocumentation.mockResolvedValue(buroDocs());
         const { user, router, context } = await setup();

         await user.click(await selectApplicant(user));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(router.reload).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when the query throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         execCreditBureuQuery.mockRejectedValue(new Error('boom'));
         getDocumentation.mockResolvedValue(buroDocs());
         const { user, context } = await setup();

         await user.click(await selectApplicant(user));

         await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith('Ejecución de Buró de Crédito: ', expect.any(Error))
         );
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
