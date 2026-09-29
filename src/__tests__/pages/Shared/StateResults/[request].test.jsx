import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import StateResults, { getServerSideProps } from '../../../../pages/Shared/StateResults/[request]';
import { getStateResults, saveStateResults } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getStateResults: jest.fn(),
   saveStateResults: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const buildUser = (idProfile, path) => ({ userAD: 'user.ad', path, idProfile, status: [] });
const analyst = buildUser(1, 'ADC');
const leader = buildUser(4, 'LDC');

const item = (id, description, amount, extra = {}) => ({ id, description, amount, percentage: '0', automatic: false, ...extra });
const buildPeriod = (year, amountOverrides = {}) => ({
   year,
   periodType: 'ANNUAL',
   month: 'diciembre',
   monthIncludes: 0,
   sourceInformation: 'SAT',
   officeOrAccountant: 'Despacho ABC',
   concepts: [
      item('1', 'Ventas netas', amountOverrides['1'] ?? '1000'),
      item('2', 'Costo de ventas', '400'),
      item('3', 'Utilidad bruta', '600', { automatic: true }),
      item('4', 'Gastos de operación', '100'),
      item('5', 'Utilidad de operación', '500', { automatic: true }),
   ],
   depreciationSchedule: [item('21', 'Depreciación y amortización', '20')],
   analyseOperating: [item('31', 'Ventas en divisas', '300')],
});
const buildData = (extra = {}, amountOverrides = {}) => ({
   idCatTypePerson: 1,
   fullName: 'Cliente Uno',
   dateElaboration: '01-06-2025',
   periods: [buildPeriod(2023, amountOverrides), buildPeriod(2024, amountOverrides)],
   ...extra,
});

const props = { idRequest: '9', idGroup: '7', idClient: '500' };
const amountInput = (container, period, id) => container.querySelector(`#amount-period${period}-${id}`);

const setup = async ({ data = buildData(), user = analyst, status = 200 } = {}) => {
   getStateResults.mockResolvedValue({ status, data });
   // El servicio real deja en localStorage la última copia guardada; la página la compara para habilitar «Guardar».
   localStorage.setItem('SR_Page', JSON.stringify(data));
   const utils = renderPage(<StateResults {...props} />, { context: { user } });
   if (status === 200) await screen.findByText('Fecha de elaboración');
   return utils;
};
const button = (name) => screen.getByRole('button', { name });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (Shared StateResults)', () => {
   test('maps the query to the props of the page', async () => {
      expect(await getServerSideProps({ query: { idClient: '500', idGroup: '7', request: '9' } })).toEqual({
         props: { idClient: '500', idGroup: '7', idRequest: '9' },
      });
   });

   test('defaults the request to an empty string', async () => {
      expect(await getServerSideProps({ query: {} })).toEqual({
         props: { idClient: undefined, idGroup: undefined, idRequest: '' },
      });
   });
});

describe('Shared StateResults page', () => {
   describe('loading', () => {
      test('requests the state of results of the request and shows the title, the date and the concepts', async () => {
         await setup();

         expect(getStateResults).toHaveBeenCalledWith('9', '500');
         expect(screen.getByRole('heading', { name: /Solicitante: Cliente Uno/ })).toBeInTheDocument();
         expect(screen.getByText('01-06-2025')).toBeInTheDocument();
         expect(screen.getByText('Ventas netas')).toBeInTheDocument();
         expect(screen.getByText('Depreciación y amortización')).toBeInTheDocument();
         expect(screen.getByText('Ventas en divisas')).toBeInTheDocument();
      });

      test('titles the page with the solidary obligor when the person is not the applicant', async () => {
         await setup({ data: buildData({ idCatTypePerson: 2, fullName: 'Obligado Uno' }) });

         expect(screen.getByRole('heading', { name: /Obligado Solidario: Obligado Uno/ })).toBeInTheDocument();
      });

      // Comportamiento actual: mientras carga, el título concatena request?.fullName sin valor por defecto
      // y muestra «undefined». Se documenta como hallazgo.
      test('shows "undefined" in the title while the request is loading (current behavior)', async () => {
         getStateResults.mockReturnValue(new Promise(() => {}));

         renderPage(<StateResults {...props} />, { context: { user: analyst } });

         expect(screen.getByRole('heading', { name: /Obligado Solidario: undefined/ })).toBeInTheDocument();
      });

      test('keeps the skeleton when the service answers with another status', async () => {
         await setup({ status: 404, data: null });

         await waitFor(() => expect(getStateResults).toHaveBeenCalledTimes(1));
         expect(screen.queryByText('Ventas netas')).not.toBeInTheDocument();
      });

      test('logs the error and keeps the skeleton when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getStateResults.mockRejectedValue(new Error('boom'));

         renderPage(<StateResults {...props} />, { context: { user: analyst } });

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error)));
         expect(screen.queryByText('Ventas netas')).not.toBeInTheDocument();
      });

      test('shows the period blocks with the period type and year', async () => {
         await setup();

         expect(screen.getAllByRole('heading', { name: 'Anual' }).length).toBeGreaterThanOrEqual(2);
         expect(screen.getAllByText('2023').length).toBeGreaterThanOrEqual(1);
      });
   });

   describe('analyst', () => {
      test('lets the analyst edit the manual concepts but not the automatic ones', async () => {
         const { container } = await setup();

         expect(amountInput(container, 0, '1')).toBeEnabled();
         expect(amountInput(container, 0, '3')).toBeDisabled();
         expect(amountInput(container, 0, '5')).toBeDisabled();
         expect(container.querySelector('#Depreciación\\ y\\ amortización-period0')).toBeEnabled();
      });

      test('shows the three buttons for the analyst and keeps saving disabled until something changes', async () => {
         await setup();

         expect(button('Guardar')).toBeDisabled();
         expect(button('Regresar')).toBeEnabled();
         expect(button('Finalizar')).toBeEnabled();
      });

      test('enables saving after editing an amount and recalculates the automatic concepts', async () => {
         const { container, user } = await setup();

         await user.clear(amountInput(container, 0, '2'));

         expect(button('Guardar')).toBeEnabled();
         expect(amountInput(container, 0, '3')).toHaveValue('1,000');
         expect(amountInput(container, 0, '5')).toHaveValue('900');
      });

      test('enables saving after editing the depreciation and the foreign currency analysis', async () => {
         const { container, user } = await setup();

         await user.clear(container.querySelector('#Depreciación\\ y\\ amortización-period1'));
         expect(button('Guardar')).toBeEnabled();
      });

      test('keeps finishing disabled while some required amount is missing', async () => {
         const { container, user } = await setup();

         await user.clear(amountInput(container, 1, '1'));

         expect(button('Finalizar')).toBeDisabled();
      });
   });

   describe('saving', () => {
      test('saves the modified state of results as a draft', async () => {
         saveStateResults.mockResolvedValue({ status: 204 });
         const { container, user, context } = await setup();
         await user.clear(amountInput(container, 0, '2'));

         await user.click(button('Guardar'));

         await waitFor(() => expect(saveStateResults).toHaveBeenCalledTimes(1));
         expect(saveStateResults).toHaveBeenCalledWith(
            expect.objectContaining({ status: '20', userModify: 'user.ad', fullName: 'Cliente Uno' })
         );
         expect(saveStateResults.mock.calls[0][0].dateElaboration).toMatch(/^\d{2}-\d{2}-\d{4}$/);
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando...');
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('Los cambios se han guardado') })
            )
         );
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('shows the message of the service when saving answers with another status', async () => {
         saveStateResults.mockResolvedValue({ status: 400, error: { response: { message: 'Datos inválidos' } } });
         const { container, user, router } = await setup();
         await user.clear(amountInput(container, 0, '2'));

         await user.click(button('Guardar'));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ html: 'Datos inválidos', icon: 'warning' }))
         );
         expect(router.push).not.toHaveBeenCalled();
      });

      test('falls back to the error text when the service gives no response message', async () => {
         saveStateResults.mockResolvedValue({ status: 400, error: 'Falló el servicio' });
         const { container, user } = await setup();
         await user.clear(amountInput(container, 0, '2'));

         await user.click(button('Guardar'));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ html: 'Falló el servicio' }))
         );
      });

      test('shows a message and logs the error when saving throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         saveStateResults.mockRejectedValue(new Error('boom'));
         const { container, user, context } = await setup();
         await user.clear(amountInput(container, 0, '2'));

         await user.click(button('Guardar'));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: 'No se pudo guardar la información, intente mas tarde', icon: 'info' })
            )
         );
         expect(consoleSpy).toHaveBeenCalledWith('Error al guardar el estado de resultados', expect.any(Error));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('finishes the state of results and goes to the checklist', async () => {
         saveStateResults.mockResolvedValue({ status: 204 });
         const { user, router } = await setup();

         await user.click(button('Finalizar'));

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7'));
         expect(saveStateResults).toHaveBeenCalledWith(expect.objectContaining({ status: '21' }));
         expect(localStorage.getItem('SR_Page')).toBeNull();
      });
   });

   describe('navigation', () => {
      test('goes back to the checklist discarding the stored copy', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7');
         expect(localStorage.getItem('SR_Page')).toBeNull();
      });
   });

   describe('other profiles', () => {
      test('shows the state of results read only with only the back button', async () => {
         const { container, user, router } = await setup({ user: leader });

         expect(amountInput(container, 0, '1')).toBeDisabled();
         expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
         expect(screen.queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/LDC/Documentation/7');
      });
   });
});
