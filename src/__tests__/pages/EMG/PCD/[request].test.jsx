import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import PCDPage, { getServerSideProps } from '../../../../pages/EMG/PCD/[request]';
import { getCustomerProfile, parseDerivaties, saveCustomerProfile } from '../../../../services';
import { initDerivatives as init, templateDerivatives } from '../../../../helpers';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getCustomerProfile: jest.fn(),
   saveCustomerProfile: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const specialist = { userAD: 'emg.ad', path: 'EMG', idProfile: 3, status: [] };
const leader = { userAD: 'lc.ad', path: 'LDC', idProfile: 4, status: [] };
const general = { alertsModel: { show: false, alerts: [] }, DOLLAR: '20' };

// Usa el parseo real del servicio: rellena las plantillas y deja la copia base en localStorage (PCD_Page).
const buildData = ({ isType = '', idGroupStatus = 1, hasHistory = false, mutate } = {}) => {
   const coverageProfile = structuredClone(templateDerivatives.coverageProfile);
   coverageProfile.calculatorType = { ...coverageProfile.calculatorType, isType };
   const data = parseDerivaties(
      {
         clientName: 'Empresa Alfa',
         idGroupStatus,
         requestAmount: 1500000,
         hasHistory,
         coverageProfile: JSON.stringify(coverageProfile),
         calculatorRate: '',
         calculatorRateExchange: '',
         profileResume: '',
      },
      '9',
      true
   );
   // Las plantillas se comparten entre pruebas; cada caso trabaja con su propia copia.
   ['calculatorRate', 'calculatorRateExchange', 'profileResume'].forEach((key) => {
      data[key] = structuredClone(data[key]);
   });
   mutate?.(data);
   localStorage.setItem('PCD_Page', JSON.stringify(data));
   return data;
};

const setup = async ({ data = buildData(), step, user = specialist } = {}) => {
   if (step) localStorage.setItem('Step_PCD', String(step));
   getCustomerProfile.mockResolvedValue({ status: 200, data });
   const utils = renderPage(<PCDPage idRequest='9' idGroup='7' />, { context: { user, general } });
   await screen.findByRole('heading', { name: 'Solicitante: Empresa Alfa' });
   return utils;
};
const button = (name) => screen.getByRole('button', { name });
const editSummary = async (user) => {
   await user.type(await screen.findByTestId('mainBusinessActivity'), 'Venta de textiles');
};

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (EMG PCD)', () => {
   test('maps the query to the props of the page', async () => {
      expect(await getServerSideProps({ query: { request: '9', idGroup: '7' } })).toEqual({
         props: { idRequest: '9', idGroup: '7' },
      });
   });

   test('defaults the values to 0', async () => {
      expect(await getServerSideProps({ query: {} })).toEqual({ props: { idRequest: 0, idGroup: 0 } });
   });
});

describe('EMG PCD page', () => {
   describe('loading', () => {
      test('requests the customer profile for editing and shows the first step', async () => {
         const { context } = await setup();

         expect(getCustomerProfile).toHaveBeenCalledWith('9', true);
         expect(await screen.findByRole('heading', { name: 'Perfil de cobertura' })).toBeInTheDocument();
         expect(context.actions.setStepper).toHaveBeenCalledWith({ options: init.steps, step: 1, isShow: true });
      });

      test('shows the skeleton and requests nothing without an active user', () => {
         renderPage(<PCDPage idRequest='9' idGroup='7' />, { context: { user: undefined, general } });

         expect(getCustomerProfile).not.toHaveBeenCalled();
         expect(screen.queryByRole('heading', { name: /Solicitante:/ })).not.toBeInTheDocument();
      });

      test('keeps the skeleton when the service answers with another status', async () => {
         getCustomerProfile.mockResolvedValue({ status: 404, data: null });

         renderPage(<PCDPage idRequest='9' idGroup='7' />, { context: { user: specialist, general } });

         await waitFor(() => expect(getCustomerProfile).toHaveBeenCalledTimes(1));
         expect(screen.queryByRole('heading', { name: /Solicitante:/ })).not.toBeInTheDocument();
      });

      test('reloads the profile when the global reload flag changes', async () => {
         const { updateContext } = await setup();

         updateContext({ isReloading: true });

         await waitFor(() => expect(getCustomerProfile).toHaveBeenCalledTimes(2));
      });
   });

   describe('views', () => {
      test('shows the rate calculator in the second step when the coverage is of type rate', async () => {
         await setup({ data: buildData({ isType: 'rate' }), step: 2 });

         expect(await screen.findByText('Crédito(s) a cubrir')).toBeInTheDocument();
      });

      test('shows the exchange rate calculator in the second step for the exchange coverage', async () => {
         await setup({ data: buildData({ isType: 'typechange' }), step: 2 });

         expect(await screen.findByRole('heading', { name: 'Estimación de cobertura anual' })).toBeInTheDocument();
      });

      test('shows the customer profile in the third step', async () => {
         await setup({ step: 3 });

         expect(await screen.findByRole('heading', { name: 'Perfil del Cliente' })).toBeInTheDocument();
      });

      test('closes the format and shows an error message for a step beyond the last one', async () => {
         const { router } = await setup({ step: 4 });

         expect(await screen.findByText('Ocurrió un error al procesar la información.')).toBeInTheDocument();
         expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/7');
      });

      test('locks the answers for a profile that cannot edit', async () => {
         await setup({ user: leader });

         await screen.findByRole('heading', { name: 'Perfil de cobertura' });
         screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
      });

      test('locks the answers when the request is no longer with the specialist', async () => {
         await setup({ data: buildData({ idGroupStatus: 4 }) });

         await screen.findByRole('heading', { name: 'Perfil de cobertura' });
         screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
      });

      test('lets the specialist answer while the request is in his hands', async () => {
         await setup();

         await screen.findByRole('heading', { name: 'Perfil de cobertura' });
         screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeEnabled());
      });
   });

   describe('next button', () => {
      test('is disabled in the first step until a coverage type is selected', async () => {
         const { user } = await setup();
         expect(button('Continuar')).toBeDisabled();

         await user.click(await screen.findByTestId('rate'));

         expect(button('Continuar')).toBeEnabled();
      });

      test('selecting the exchange coverage prepares the exchange calculator', async () => {
         const { user } = await setup({ data: buildData({ isType: 'rate' }) });
         await screen.findByRole('heading', { name: 'Perfil de cobertura' });

         await user.click(screen.getByTestId('typechange'));
         await user.click(button('Continuar'));

         expect(await screen.findByRole('heading', { name: 'Estimación de cobertura anual' })).toBeInTheDocument();
      });

      test.each([
         ['exceeded credit congruence', (data) => (data.calculatorRate.congruenceCreditors = 2)],
         ['insufficient line', (data) => (data.calculatorRate.rateCalculator.congruenceCalculator = 3)],
         ['exceeded line', (data) => (data.calculatorRate.rateCalculator.congruenceCalculator = 2)],
      ])('is disabled in the rate calculator step with %s', async (_label, mutate) => {
         await setup({ data: buildData({ isType: 'rate', mutate }), step: 2 });

         expect(button('Continuar')).toBeDisabled();
      });

      test('is enabled in the rate calculator step when the congruence is fine', async () => {
         await setup({ data: buildData({ isType: 'rate' }), step: 2 });

         expect(button('Continuar')).toBeEnabled();
      });

      test('is disabled in the exchange calculator step without annual congruence', async () => {
         const mutate = (data) => {
            data.calculatorRateExchange.annualConsistencyValidation = { title: 'No congruencia' };
         };
         await setup({ data: buildData({ isType: 'typechange', mutate }), step: 2 });

         expect(button('Continuar')).toBeDisabled();
      });

      test('is enabled in the exchange calculator step with annual congruence', async () => {
         await setup({ data: buildData({ isType: 'typechange' }), step: 2 });

         expect(button('Continuar')).toBeEnabled();
      });

      test('names the last step button "Finalizar"', async () => {
         await setup({ step: 3 });

         expect(button('Finalizar')).toBeEnabled();
      });
   });

   describe('navigation', () => {
      test('goes to the next step without saving when there are no changes', async () => {
         const { user, context } = await setup({ data: buildData({ isType: 'rate' }) });
         await screen.findByRole('heading', { name: 'Perfil de cobertura' });

         await user.click(button('Continuar'));

         expect(await screen.findByText('Crédito(s) a cubrir')).toBeInTheDocument();
         expect(saveCustomerProfile).not.toHaveBeenCalled();
         expect(context.actions.setStepper).toHaveBeenLastCalledWith({ options: init.steps, step: 2, isShow: true });
      });

      test('closes the format from the first step and discards the stored copies', async () => {
         const { user, router, context } = await setup();
         localStorage.setItem('Step_PCD', '1');

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/7');
         expect(localStorage.getItem('Step_PCD')).toBeNull();
         expect(localStorage.getItem('PCD_Page')).toBeNull();
         expect(context.actions.setStepper).toHaveBeenLastCalledWith({ options: [], step: 1, isShow: false });
      });

      test('goes back to the previous step without reloading when everything is saved', async () => {
         const { user, context } = await setup({ data: buildData({ isType: 'rate' }), step: 2 });
         await screen.findByText('Crédito(s) a cubrir');

         await user.click(button('Regresar'));

         expect(await screen.findByRole('heading', { name: 'Perfil de cobertura' })).toBeInTheDocument();
         expect(context.actions.toggleReloading).not.toHaveBeenCalled();
      });

      test('reloads the profile when going back with unsaved changes', async () => {
         const { user, context } = await setup({ step: 3 });
         await editSummary(user);

         await user.click(button('Regresar'));

         expect(context.actions.toggleReloading).toHaveBeenCalledTimes(1);
         expect(await screen.findByRole('heading', { name: 'Estimación de cobertura anual' })).toBeInTheDocument();
      });
   });

   describe('saving', () => {
      test('keeps saving disabled until something changes', async () => {
         await setup({ step: 3 });

         expect(button('Guardar')).toBeDisabled();
      });

      test('saves the modified profile with the current step and the user', async () => {
         saveCustomerProfile.mockResolvedValue({ status: 204 });
         const { user, context } = await setup({ step: 3 });
         await editSummary(user);
         expect(button('Guardar')).toBeEnabled();

         await user.click(button('Guardar'));

         await waitFor(() => expect(saveCustomerProfile).toHaveBeenCalledTimes(1));
         const [saved, step, userAD] = saveCustomerProfile.mock.calls[0];
         expect(saved.profileResume.mainBusinessActivity).toBe('Venta de textiles');
         expect([step, userAD]).toEqual([3, 'emg.ad']);
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando...');
         await waitFor(() => expect(button('Guardar')).toBeDisabled());
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Los cambios se han guardado') })
         );
         expect(JSON.parse(localStorage.getItem('PCD_Page')).profileResume.mainBusinessActivity).toBe(
            'Venta de textiles'
         );
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('shows the error and keeps the changes when saving answers with another status', async () => {
         saveCustomerProfile.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });
         const { user, context } = await setup({ step: 3 });
         await editSummary(user);

         await user.click(button('Guardar'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(button('Guardar')).toBeEnabled();
      });

      // Comportamiento actual: el catch de handleSaveData está vacío, de modo que una excepción deja el
      // indicador de carga encendido y sin mensaje. Se documenta como hallazgo.
      test('leaves the loader on without a message when saving throws (current behavior)', async () => {
         saveCustomerProfile.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup({ step: 3 });
         await editSummary(user);

         await user.click(button('Guardar'));

         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando...'));
         expect(context.actions.toggleLoading).toHaveBeenCalledTimes(1);
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('saves pending changes before moving to the next step', async () => {
         saveCustomerProfile.mockResolvedValue({ status: 204 });
         const { user } = await setup({ data: buildData({ isType: 'rate' }), step: 2 });
         await screen.findByText('Crédito(s) a cubrir');
         const amount = document.querySelector('#creditors-0, input[type="text"]:not([disabled])');
         await user.type(amount, '1');
         expect(button('Guardar')).toBeEnabled();

         await user.click(button('Continuar'));

         await waitFor(() => expect(saveCustomerProfile).toHaveBeenCalledTimes(1));
         expect(await screen.findByRole('heading', { name: 'Perfil del Cliente' })).toBeInTheDocument();
      });
   });

   describe('finishing', () => {
      const complete = (extra = {}) =>
         buildData({
            mutate: (data) => {
               data.isCompleted = true;
               Object.assign(data, extra);
            },
         });

      test('lists the pending sections and does not save when the user chooses to complete them', async () => {
         Swal.fire.mockResolvedValue({ value: false });
         const { user } = await setup({ step: 3 });

         await user.click(button('Finalizar'));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  html: expect.stringContaining('Información incompleta'),
                  confirmButtonText: 'Guardar y salir',
                  cancelButtonText: 'Ir a completar',
               })
            )
         );
         expect(saveCustomerProfile).not.toHaveBeenCalled();
         expect(screen.getByRole('heading', { name: 'Perfil del Cliente' })).toBeInTheDocument();
      });

      test('saves an incomplete profile and closes the format when the user chooses to save and leave', async () => {
         Swal.fire.mockResolvedValue({ value: true });
         saveCustomerProfile.mockResolvedValue({ status: 204 });
         const { user, router } = await setup({ step: 3 });

         await user.click(button('Finalizar'));

         await waitFor(() => expect(saveCustomerProfile).toHaveBeenCalledTimes(1));
         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/7'));
      });

      test('asks for the veracity declaration of a complete profile and saves it once accepted', async () => {
         saveCustomerProfile.mockResolvedValue({ status: 204 });
         const { user, router } = await setup({ data: complete(), step: 3 });

         await user.click(button('Finalizar'));
         expect(await screen.findByRole('heading', { name: 'Declaración de veracidad' })).toBeInTheDocument();
         expect(saveCustomerProfile).not.toHaveBeenCalled();

         await user.click(button('Acepto'));

         await waitFor(() => expect(saveCustomerProfile).toHaveBeenCalledTimes(1));
         expect(saveCustomerProfile.mock.calls[0][0].veracity).toBe(true);
         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/7'));
         expect(screen.queryByRole('heading', { name: 'Declaración de veracidad' })).not.toBeInTheDocument();
      });

      test('closes the format without saving when the profile is complete, verified and saved', async () => {
         const { user, router } = await setup({ data: complete({ veracity: true }), step: 3 });

         await user.click(button('Finalizar'));

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/7'));
         expect(saveCustomerProfile).not.toHaveBeenCalled();
      });
   });

   describe('previous information', () => {
      test('asks to reuse the previous information and reloads once it is loaded', async () => {
         Swal.fire.mockResolvedValue({ value: true });
         saveCustomerProfile.mockResolvedValue({ status: 204 });
         const { context } = await setup({ data: buildData({ hasHistory: true }) });

         await waitFor(() =>
            expect(saveCustomerProfile).toHaveBeenCalledWith(
               expect.objectContaining({ needsHistory: true }),
               init.Enum.LOAD_INFORMATION,
               'emg.ad'
            )
         );
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
               confirmButtonText: 'Si, usar información',
               cancelButtonText: 'No, empezar desde cero',
               showCancelButton: true,
            })
         );
         await waitFor(() => expect(context.actions.toggleReloading).toHaveBeenCalledTimes(1));
      });

      test('starts from scratch when the user declines the previous information', async () => {
         Swal.fire.mockResolvedValue({ value: undefined });
         saveCustomerProfile.mockResolvedValue({ status: 204 });
         await setup({ data: buildData({ hasHistory: true }) });

         await waitFor(() =>
            expect(saveCustomerProfile).toHaveBeenCalledWith(
               expect.objectContaining({ needsHistory: false }),
               init.Enum.LOAD_INFORMATION,
               'emg.ad'
            )
         );
      });

      test('shows the error and does not reload when loading the previous information fails', async () => {
         Swal.fire.mockResolvedValue({ value: true });
         saveCustomerProfile.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });
         const { context } = await setup({ data: buildData({ hasHistory: true }) });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(context.actions.toggleReloading).not.toHaveBeenCalled();
      });

      test('does not ask anything when there is no previous information', async () => {
         await setup();

         expect(Swal.fire).not.toHaveBeenCalled();
      });
   });
});
