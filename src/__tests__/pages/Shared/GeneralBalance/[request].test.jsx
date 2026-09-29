import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import GeneralBalance, { getServerSideProps } from '../../../../pages/Shared/GeneralBalance/[request]';
import { getBalanceSheet, saveBalanceSheet } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getBalanceSheet: jest.fn(),
   saveBalanceSheet: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const buildUser = (idProfile, path) => ({ userAD: 'user.ad', path, idProfile, status: [] });
const analyst = buildUser(1, 'ADC');
const leader = buildUser(4, 'LDC');

const concept = (idItem, idItemChild, description, extra = {}) => ({
   idItem,
   idItemChild,
   description,
   value: '10',
   percentage: '0',
   automatic: false,
   toolTip: false,
   summary: false,
   ...extra,
});
const buildPeriod = (year, conceptOverrides = {}) => ({
   year,
   periodType: 'ANNUAL',
   month: 'diciembre',
   sourceInformation: 'SAT',
   officeOrAccountant: 'Despacho ABC',
   concepts: [
      concept(26, 30, 'Inventarios', { value: '1000', ...conceptOverrides[30] }),
      concept(83, 97, 'Pasivo financiero', conceptOverrides[97]),
      concept(83, 100, 'Pasivo buró', conceptOverrides[100]),
      concept(83, 101, 'Diferencia', conceptOverrides[101]),
   ],
});
const buildData = (extra = {}, conceptOverrides = {}) => ({
   idCatTypePerson: 1,
   fullName: 'Cliente Uno',
   dateElaboration: '01-06-2025',
   periods: [buildPeriod(2023, conceptOverrides), buildPeriod(2024, conceptOverrides)],
   ...extra,
});

const props = { idClient: '500', idGroup: '7', idRequest: '9', rfc: 'AAA010101AAA' };
const valueInput = (container, index, idItemChild) => container.querySelector(`#period${index}-value-${idItemChild}`);

const setup = async ({ data = buildData(), user = analyst, status = 200 } = {}) => {
   getBalanceSheet.mockResolvedValue({ status, data });
   // El servicio real deja en localStorage la última copia guardada; la página la compara para habilitar «Guardar».
   localStorage.setItem('BS_Page', JSON.stringify(data));
   const utils = renderPage(<GeneralBalance {...props} />, { context: { user } });
   if (status === 200) await screen.findByText('Fecha elaboración');
   return utils;
};
const button = (name) => screen.getByRole('button', { name });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (Shared GeneralBalance)', () => {
   test('maps the query to the props of the page', async () => {
      expect(
         await getServerSideProps({ query: { idClient: '500', idGroup: '7', request: '9', rfc: 'AAA010101AAA' } })
      ).toEqual({ props: { idClient: '500', idGroup: '7', idRequest: '9', rfc: 'AAA010101AAA' } });
   });

   test('defaults every value to 0', async () => {
      expect(await getServerSideProps({ query: {} })).toEqual({
         props: { idClient: 0, idGroup: 0, idRequest: 0, rfc: 0 },
      });
   });
});

describe('Shared GeneralBalance page', () => {
   describe('loading', () => {
      test('requests the balance sheet of the request and shows its title and elaboration date', async () => {
         await setup();

         expect(getBalanceSheet).toHaveBeenCalledWith('AAA010101AAA', '9', '500');
         expect(screen.getByRole('heading', { name: 'Solicitante: Cliente Uno' })).toBeInTheDocument();
         expect(screen.getByText('01-06-2025')).toBeInTheDocument();
         expect(screen.getByText('Inventarios')).toBeInTheDocument();
      });

      test('titles the page with the solidary obligor when the person is not the applicant', async () => {
         await setup({ data: buildData({ idCatTypePerson: 2, fullName: 'Obligado Uno' }) });

         expect(screen.getByRole('heading', { name: 'Obligado solidario: Obligado Uno' })).toBeInTheDocument();
      });

      test('keeps the skeleton and no values when the service answers with another status', async () => {
         const { container } = await setup({ status: 404, data: null });

         await waitFor(() => expect(getBalanceSheet).toHaveBeenCalledTimes(1));
         expect(screen.queryByText('Inventarios')).not.toBeInTheDocument();
         expect(container.querySelectorAll('input')).toHaveLength(0);
         expect(screen.getByRole('heading', { name: 'Obligado solidario:' })).toBeInTheDocument();
      });

      test('reloads the balance sheet when the global reload flag changes', async () => {
         const { updateContext } = await setup();

         updateContext({ isReloading: true });

         await waitFor(() => expect(getBalanceSheet).toHaveBeenCalledTimes(2));
      });

      test('shows one period block per period of the balance sheet', async () => {
         await setup();

         expect(screen.getAllByRole('heading', { name: 'Anual' })).toHaveLength(2);
         expect(screen.getByText('2023')).toBeInTheDocument();
         expect(screen.getByText('2024')).toBeInTheDocument();
      });
   });

   describe('analyst', () => {
      test('lets the analyst edit the periods and the values', async () => {
         const { container } = await setup();

         expect(screen.getAllByLabelText('Fuente de información')).toHaveLength(2);
         expect(valueInput(container, 0, 30)).toBeEnabled();
         expect(button('Finalizar')).toBeInTheDocument();
      });

      test('keeps the save button disabled until something changes', async () => {
         await setup();

         expect(button('Guardar')).toBeDisabled();
      });

      test('enables the save button after changing a value and recalculates', async () => {
         const { container, user } = await setup();

         await user.clear(valueInput(container, 0, 30));

         expect(button('Guardar')).toBeEnabled();
         expect(valueInput(container, 0, 30)).toHaveValue('');
      });

      test('enables the save button after changing the source of information of a period', async () => {
         const { user } = await setup();

         await user.selectOptions(screen.getAllByLabelText('Fuente de información')[1], 'Interno');

         expect(button('Guardar')).toBeEnabled();
      });

      test('enables the save button after changing the office of a period', async () => {
         const { user } = await setup();

         await user.type(screen.getAllByLabelText('Despacho, contador o interno')[0], 'X');

         expect(button('Guardar')).toBeEnabled();
      });

      test('enables finishing only when every field is filled', async () => {
         await setup();
         await waitFor(() => expect(button('Finalizar')).toBeEnabled());
      });

      test('keeps finishing disabled while some value is missing', async () => {
         await setup({ data: buildData({}, { 30: { value: null } }) });

         expect(button('Finalizar')).toBeDisabled();
      });
   });

   describe('saving', () => {
      test('saves the modified balance sheet as a draft and reloads it', async () => {
         saveBalanceSheet.mockResolvedValue({ status: 204 });
         const { container, user, context } = await setup();
         await user.clear(valueInput(container, 0, 30));

         await user.click(button('Guardar'));

         await waitFor(() => expect(saveBalanceSheet).toHaveBeenCalledTimes(1));
         expect(saveBalanceSheet).toHaveBeenCalledWith(
            expect.objectContaining({ status: 20, dataOrigin: 'MANUAL', userModify: 'user.ad', fullName: 'Cliente Uno' })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando...');
         await waitFor(() => expect(context.actions.toggleReloading).toHaveBeenCalledTimes(1));
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ html: expect.stringContaining('Los cambios se han guardado') }));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('does not show a confirmation nor reload when the service answers with another status', async () => {
         saveBalanceSheet.mockResolvedValue({ status: 400 });
         const { container, user, context } = await setup();
         await user.clear(valueInput(container, 0, 30));

         await user.click(button('Guardar'));

         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(context.actions.toggleReloading).not.toHaveBeenCalled();
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('shows a message and logs the error when saving throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         saveBalanceSheet.mockRejectedValue(new Error('boom'));
         const { container, user, context } = await setup();
         await user.clear(valueInput(container, 0, 30));

         await user.click(button('Guardar'));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: 'No se pudo guardar la información, intente mas tarde', icon: 'info' })
            )
         );
         expect(consoleSpy).toHaveBeenCalledWith('Error al guardar el balance general', expect.any(Error));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('finishes the balance sheet and goes to the checklist', async () => {
         saveBalanceSheet.mockResolvedValue({ status: 204 });
         const { user, router, context } = await setup();

         await user.click(button('Finalizar'));

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7'));
         expect(saveBalanceSheet).toHaveBeenCalledWith(expect.objectContaining({ status: 21 }));
         expect(localStorage.getItem('BS_Page')).toBeNull();
         expect(context.actions.toggleReloading).not.toHaveBeenCalled();
      });
   });

   describe('navigation', () => {
      test('goes back to the checklist discarding the stored copy', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7');
         expect(localStorage.getItem('BS_Page')).toBeNull();
      });
   });

   describe('other profiles', () => {
      test('shows the balance sheet read only with a continue button', async () => {
         const { container, user, router } = await setup({ user: leader });

         expect(valueInput(container, 0, 30)).toBeDisabled();
         expect(screen.queryByLabelText('Fuente de información')).not.toBeInTheDocument();
         await waitFor(() => expect(button('Continuar')).toBeEnabled());
         expect(screen.queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument();

         await user.click(button('Continuar'));

         expect(router.push).toHaveBeenCalledWith('/LDC/Documentation/7');
         expect(saveBalanceSheet).not.toHaveBeenCalled();
      });

      test('disables continuing while some value is missing', async () => {
         await setup({ user: leader, data: buildData({}, { 30: { value: null } }) });

         expect(button('Continuar')).toBeDisabled();
      });
   });
});
