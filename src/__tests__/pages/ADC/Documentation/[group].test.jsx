import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import Documentation, { getServerSideProps } from '../../../../pages/ADC/Documentation/[group]';
import { getDocumentation, getOneRequest, updateFinancialFlag } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getDocumentation: jest.fn(),
   getOneRequest: jest.fn(),
   updateFinancialFlag: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const analyst = { userAD: 'ana.ad', path: 'ADC', idProfile: 1, status: [] };

const buildRequest = (idRequest, personExtra = {}) => ({
   idRequest,
   hasVerification: true,
   relatedPersonResponseList: [
      { idClient: `10${idRequest}`, idCatTypePerson: 1, fullName: `Solicitante ${idRequest}`, ...personExtra },
      { idClient: `20${idRequest}`, idCatTypePerson: 2, fullName: `Obligado ${idRequest}` },
   ],
});
const buildResponse = ({ idCatStatus = 4, sendOtherProfile = true, requests = [buildRequest(1)] } = {}) => ({
   status: 200,
   data: { requestResponseList: requests, idCatStatus, sendOtherProfile, idLeader: 'lc.ad' },
});
const docsResponse = {
   status: 200,
   data: { personType: 'PM', documentation: [{ _id: 'd1', title: 'Acta constitutiva', toAction: [] }] },
};

const setup = async (response = buildResponse()) => {
   getOneRequest.mockResolvedValue(response);
   const utils = renderPage(<Documentation idGroup='7' />, { context: { user: analyst } });
   await screen.findByText('Solicitante: Solicitante 1');
   return utils;
};
const button = (name) => screen.getByRole('button', { name });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true, value: true });
});

describe('getServerSideProps (ADC Documentation)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('ADC Documentation page', () => {
   describe('loading', () => {
      test('requests the group and lists its participants', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7');
         expect(screen.getByRole('heading', { name: /Documentación requerida/ })).toBeInTheDocument();
         expect(screen.getByText('Obligado Solidario: Obligado 1')).toBeInTheDocument();
      });

      test('shows the error and no participants when the service answers with another status', async () => {
         getOneRequest.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderPage(<Documentation idGroup='7' />, { context: { user: analyst } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByRole('radio')).not.toBeInTheDocument();
      });
   });

   describe('header buttons', () => {
      test('goes back to the requests list', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/ADC/RequestsReview');
      });

      test('enables returning and evaluating while the analyst has the request and it is complete', async () => {
         const { user, router } = await setup(buildResponse({ idCatStatus: 4, sendOtherProfile: true }));
         expect(button('Devolver solicitud')).toBeEnabled();
         expect(button('Evaluar solicitud')).toBeEnabled();

         await user.click(button('Devolver solicitud'));
         expect(router.push).toHaveBeenLastCalledWith('/ADC/ReturnRequest/7?origin=Documentation');

         await user.click(button('Evaluar solicitud'));
         expect(router.push).toHaveBeenLastCalledWith('/ADC/ApplicationEvaluation/7');
      });

      test('enables the buttons when the request was returned to the analyst by the leader', async () => {
         await setup(buildResponse({ idCatStatus: 22 }));

         expect(button('Devolver solicitud')).toBeEnabled();
         expect(button('Evaluar solicitud')).toBeEnabled();
      });

      test('disables only the evaluation while the checklist is incomplete', async () => {
         await setup(buildResponse({ idCatStatus: 4, sendOtherProfile: false }));

         expect(button('Devolver solicitud')).toBeEnabled();
         expect(button('Evaluar solicitud')).toBeDisabled();
      });

      test('disables both buttons when the request is not with the analyst', async () => {
         await setup(buildResponse({ idCatStatus: 5 }));

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
            expect.objectContaining({
               idClient: '101',
               fullName: 'Solicitante 1',
               idGroup: '7',
               idStatusGroup: 4,
               hasVerification: true,
            }),
            analyst
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
      const withChanges = () => buildResponse({ requests: [buildRequest(1, { financialDocsChanges: true })] });

      test('warns the analyst and updates the financial flag once accepted', async () => {
         updateFinancialFlag.mockResolvedValue({});
         await setup(withChanges());

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  html: expect.stringContaining('Se detectó una actualización de la información financiera'),
                  confirmButtonText: 'Aceptar',
                  allowOutsideClick: false,
               })
            )
         );
         await waitFor(() => expect(updateFinancialFlag).toHaveBeenCalledWith('7'));
      });

      test('does not update the flag when the alert is dismissed', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false, value: undefined });
         await setup(withChanges());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(updateFinancialFlag).not.toHaveBeenCalled();
      });

      test('does not warn when the request is not with the analyst', async () => {
         await setup(buildResponse({ idCatStatus: 5, requests: [buildRequest(1, { financialDocsChanges: true })] }));

         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('does not warn when no client changed the financial documents', async () => {
         await setup();

         expect(Swal.fire).not.toHaveBeenCalled();
      });
   });
});
