import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import SolidaryPage, { getServerSideProps } from '../../../../pages/EMG/Solidary/[group]';
import { getInfoSolidary, patchRequestAndApplicants, postSavePersons } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getInfoSolidary: jest.fn(),
   patchRequestAndApplicants: jest.fn(),
   postSavePersons: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const specialist = { userAD: 'emg.ad', path: 'EMG', idProfile: 3, status: [] };
const general = { alertsModel: { show: false, alerts: [] }, UDI: '8' };
// Con UDI = 8 el límite es 2,000,000 * 8 - 1 menos el monto ya usado por el grupo.
const LIMIT = 15999999;

const buildApplicant = (idRequest, extra = {}) => ({
   idRequest,
   kindProcedure: 'Nuevo Tramite',
   requestAmount: 1000000,
   oldAmount: 0,
   validate: { valid: true, procedure: '' },
   relatedPersonResponseList: [
      { idCatTypePerson: 1, idClient: idRequest * 10, fullName: `Solicitante ${idRequest}` },
      { idCatTypePerson: 2, idClient: idRequest * 10 + 1, idRequest, fullName: `Obligado ${idRequest}`, personType: 'PF' },
   ],
   ...extra,
});
const buildResponse = ({ applicants = [buildApplicant(1)], idCatStatus = 1, credits } = {}) => ({
   status: 200,
   data: {
      idCatStatus,
      applicants,
      credits: credits ?? { creditTotalAmount: 0, applicantNotParticipateInRequest: [] },
   },
});

const setup = async ({ response = buildResponse(), context = { general } } = {}) => {
   getInfoSolidary.mockResolvedValue(response);
   const utils = renderPage(<SolidaryPage idGroup={5} />, { context: { user: specialist, ...context } });
   if (response.status === 200) await screen.findByText('Solicitante 1');
   return utils;
};
const continueButton = () => screen.getByRole('button', { name: 'Continuar' });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (EMG Solidary)', () => {
   test('passes the group of the route as a number', async () => {
      expect(await getServerSideProps({ params: { group: '5' } })).toEqual({ props: { idGroup: 5 } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('EMG Solidary page', () => {
   describe('loading', () => {
      test('requests the group and shows the request number and its applicants', async () => {
         await setup();

         expect(getInfoSolidary).toHaveBeenCalledWith(5);
         expect(screen.getByRole('heading', { name: /Solicitud Núm\.\s+0000000005/ })).toBeInTheDocument();
         expect(document.querySelector('#kindProcedure-1')).toHaveValue('Nuevo Tramite');
         expect(document.querySelector('#requestAmount-1')).toBeInTheDocument();
      });

      test('shows the skeleton while the group is loading', () => {
         getInfoSolidary.mockReturnValue(new Promise(() => {}));

         renderPage(<SolidaryPage idGroup={5} />, { context: { user: specialist, general } });

         expect(screen.queryByText('Solicitante 1')).not.toBeInTheDocument();
         expect(continueButton()).toBeDisabled();
      });

      test('keeps the skeleton when the service answers with another status', async () => {
         getInfoSolidary.mockResolvedValue({ status: 500, data: null });

         renderPage(<SolidaryPage idGroup={5} />, { context: { user: specialist, general } });

         await waitFor(() => expect(getInfoSolidary).toHaveBeenCalledTimes(1));
         expect(screen.queryByText('Solicitante 1')).not.toBeInTheDocument();
      });

      test('logs the error when loading throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getInfoSolidary.mockRejectedValue(new Error('boom'));

         renderPage(<SolidaryPage idGroup={5} />, { context: { user: specialist, general } });

         await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith('Error al cargar la información: ', expect.any(Error))
         );
      });
   });

   describe('available amount', () => {
      test('shows the requested amount out of the available limit in green', async () => {
         await setup();

         const message = await screen.findByText(/Estás solicitando/);
         expect(message).toHaveTextContent('$1,000,000');
         expect(message).toHaveTextContent('$15,999,999');
         expect(message.parentElement).toHaveClass('bg-emerald-600');
         expect(continueButton()).toBeEnabled();
      });

      test('warns in red and blocks continuing when the total exceeds the limit', async () => {
         await setup({ response: buildResponse({ applicants: [buildApplicant(1, { requestAmount: 20000000 })] }) });

         const message = await screen.findByText(/Sobrepasaste el límite/);
         expect(message.parentElement).toHaveClass('bg-red-400');
         expect(continueButton()).toBeDisabled();
      });

      test('subtracts the amount already used by other members of the group from the limit', async () => {
         const credits = { creditTotalAmount: 5000000, applicantNotParticipateInRequest: [] };
         await setup({ response: buildResponse({ credits }) });

         expect(await screen.findByText(/Estás solicitando/)).toHaveTextContent('$10,999,999');
      });

      test('reports that the UDI value is not available and blocks continuing', async () => {
         await setup({ context: { general: { alertsModel: { show: false, alerts: [] }, UDI: '' } } });

         expect(await screen.findByText('No se encuentra disponible el valor de la UDI')).toBeInTheDocument();
         expect(continueButton()).toBeDisabled();
      });

      test('updates the total and the message when the amount is edited', async () => {
         const { user } = await setup();
         const amount = document.querySelector('#requestAmount-1');

         await user.clear(amount);
         expect(continueButton()).toBeDisabled();
         await user.type(amount, '3000000');

         expect(await screen.findByText(/Estás solicitando/)).toHaveTextContent('$3,000,000');
         expect(continueButton()).toBeEnabled();
      });

      test('blocks continuing while an applicant has no procedure type', async () => {
         await setup({ response: buildResponse({ applicants: [buildApplicant(1, { kindProcedure: '' })] }) });

         expect(continueButton()).toBeDisabled();
      });

      test('blocks continuing while an applicant has an invalid amount', async () => {
         const invalid = buildApplicant(1, { validate: { valid: false, procedure: '' } });
         await setup({ response: buildResponse({ applicants: [invalid] }) });

         expect(continueButton()).toBeDisabled();
      });
   });

   describe('credits of other members', () => {
      const credits = {
         creditTotalAmount: 3000000,
         applicantNotParticipateInRequest: [{ lineNumber: 1, nameClient: 'Beta SA', authorizedAmount: 3000000 }],
      };

      test('opens a modal listing the credits when other members use part of the limit', async () => {
         await setup({ response: buildResponse({ credits }) });

         expect(await screen.findByText(/Existen otros miembros del grupo económico/)).toBeInTheDocument();
         expect(screen.getByText('Beta SA - $3,000,000')).toBeInTheDocument();
      });

      test('closes the modal and opens it again from the info icon', async () => {
         const { user } = await setup({ response: buildResponse({ credits }) });
         await screen.findByText(/Existen otros miembros del grupo económico/);

         await user.click(screen.getByTitle('Cerrar modal'));
         expect(screen.queryByText(/Existen otros miembros del grupo económico/)).not.toBeInTheDocument();

         await user.click(screen.getByText('info', { selector: 'span.filled' }));
         expect(await screen.findByText(/Existen otros miembros del grupo económico/)).toBeInTheDocument();
      });

      test('does not open the modal from the info icon when there is nothing to show', async () => {
         const { user } = await setup();

         await user.click(screen.getByText('info', { selector: 'span.filled' }));

         expect(screen.queryByText(/Existen otros miembros/)).not.toBeInTheDocument();
         expect(screen.queryByText('Posibles soluciones')).not.toBeInTheDocument();
      });

      test('shows the possible solutions when the UDI value is not available', async () => {
         const { user } = await setup({
            context: { general: { alertsModel: { show: false, alerts: [] }, UDI: '' } },
         });

         await user.click(screen.getByText('info', { selector: 'span.filled' }));

         expect(await screen.findByText('Posibles soluciones')).toBeInTheDocument();
      });
   });

   describe('continuing', () => {
      test('saves the request and the persons, discards the stored copy and goes to the checklist', async () => {
         patchRequestAndApplicants.mockResolvedValue({ status: 204 });
         postSavePersons.mockResolvedValue({ status: 200 });
         localStorage.setItem('Solidary_Page', '{}');
         const { user, router, context } = await setup();

         await user.click(continueButton());

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/5'));
         expect(patchRequestAndApplicants).toHaveBeenCalledWith(
            [expect.objectContaining({ idRequest: 1 })],
            { requestAmount: 1000000, idGroup: 5, idCatStatus: 1 },
            'emg.ad'
         );
         expect(postSavePersons).toHaveBeenCalledWith([expect.objectContaining({ idRequest: 1 })], 'emg.ad');
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando información...');
         expect(localStorage.getItem('Solidary_Page')).toBeNull();
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('goes to the checklist without saving when the request cannot be edited', async () => {
         const { user, router } = await setup({ response: buildResponse({ idCatStatus: 4 }) });

         await user.click(continueButton());

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/5'));
         expect(patchRequestAndApplicants).not.toHaveBeenCalled();
         expect(postSavePersons).not.toHaveBeenCalled();
      });

      test('shows the error and does not save the persons when the request update answers with another status', async () => {
         patchRequestAndApplicants.mockResolvedValue({ status: 400, data: { message: 'Inválido' } });
         const { user, router, context } = await setup();

         await user.click(continueButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(postSavePersons).not.toHaveBeenCalled();
         expect(router.push).not.toHaveBeenCalled();
      });

      test('shows the error and does not navigate when saving the persons answers with another status', async () => {
         patchRequestAndApplicants.mockResolvedValue({ status: 204 });
         postSavePersons.mockResolvedValue({ status: 500, error: { message: 'Fallo' } });
         const { user, router } = await setup();

         await user.click(continueButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when saving throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         patchRequestAndApplicants.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();

         await user.click(continueButton());

         await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Aplicantes & Obligados: '))
         );
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
