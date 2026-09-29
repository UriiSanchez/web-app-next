import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import BuroValidation, { getServerSideProps } from '../../../../pages/MRC/BuroValidation/[client]';
import { getInfoClient, onBureauConfirmation, updateInfoClient } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getInfoClient: jest.fn(),
   onBureauConfirmation: jest.fn(),
   updateInfoClient: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const desk = { userAD: 'mrc.ad', path: 'MRC', idProfile: 2, status: [] };

const buildStorage = ({ folio = 12, showSignature = true } = {}) => ({
   idRequest: 9,
   idClient: '500',
   userActive: 'mrc.ad',
   documentation: [
      {
         _id: 'MCBC',
         selectedType: 'Consulta manual',
         folio,
         screenBureau: { title: 'Datos para la consulta de Buró', showSignature, signatureDate: '03-06-2025', docs: [] },
      },
   ],
});
const buildClient = (extra = {}) => ({
   accountType: 'PM',
   birthdate: '',
   rfc: 'ALF010101AAA',
   address: 'Reforma',
   neighborhood: 'Juárez',
   city: 'Ciudad de México',
   state: 'AGUASCALIENTES',
   zipCode: '06600',
   exteriorNumber: '100',
   interiorNumber: '',
   country: 'México',
   municipality: 'Cuauhtémoc',
   nationality: 'MX',
   phone: '5555555555',
   creditReference: '',
   ...extra,
});

const setup = async ({ client = buildClient(), storage = buildStorage(), fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   localStorage.setItem('infoMRC', JSON.stringify(storage));
   getInfoClient.mockResolvedValue({ status: 200, data: client });
   const utils = renderPage(<BuroValidation idClient='500' idRequest='9' idGroup='7' />, {
      context: { user: desk },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   await screen.findByRole('heading', { name: 'Datos para la consulta de Buró' });
   return utils;
};
const button = (name) => screen.getByRole('button', { name });
const field = (id) => document.getElementById(id);

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (MRC BuroValidation)', () => {
   test('maps the query to the props of the page', async () => {
      expect(await getServerSideProps({ query: { client: '500', idRequest: '9', idGroup: '7' } })).toEqual({
         props: { idClient: '500', idRequest: '9', idGroup: '7' },
      });
   });

   test('defaults the client and the request to 0', async () => {
      expect(await getServerSideProps({ query: {} })).toEqual({
         props: { idClient: 0, idRequest: 0, idGroup: undefined },
      });
   });
});

describe('MRC BuroValidation page', () => {
   describe('loading', () => {
      test('requests the client information with the user of the stored session', async () => {
         await setup();

         expect(getInfoClient).toHaveBeenCalledWith('500', 'mrc.ad', '9');
         expect(screen.getByRole('heading', { name: 'Validación de datos para consulta de Buró de Crédito' })).toBeInTheDocument();
      });

      test('shows the client data in the form and translates the nationality code', async () => {
         await setup();

         expect(field('rfc')).toHaveValue('ALF010101AAA');
         expect(field('address')).toHaveValue('Reforma');
         expect(field('neighborhood')).toHaveValue('Juárez');
         expect(field('zipCode')).toHaveValue('06600');
         expect(field('nationality')).toHaveValue('México');
         expect(field('municipality')).toHaveValue('Cuauhtémoc');
         expect(field('state')).toHaveValue('AGUASCALIENTES');
         expect(JSON.parse(localStorage.getItem('BureData')).nationality).toBe('México');
      });

      test('shows the consult method of the stored documentation', async () => {
         await setup();

         expect(screen.getByRole('heading', { name: 'Método para la consulta de Buró de Crédito' })).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: 'Consulta manual' })).toBeInTheDocument();
      });

      test('shows the skeleton and no form while the client is loading', () => {
         localStorage.setItem('infoMRC', JSON.stringify(buildStorage()));
         getInfoClient.mockReturnValue(new Promise(() => {}));

         renderPage(<BuroValidation idClient='500' idRequest='9' idGroup='7' />, { context: { user: desk } });

         expect(field('rfc')).not.toBeInTheDocument();
      });

      test('keeps the skeleton when the service answers with another status', async () => {
         localStorage.setItem('infoMRC', JSON.stringify(buildStorage()));
         getInfoClient.mockResolvedValue({ status: 404, data: null });

         renderPage(<BuroValidation idClient='500' idRequest='9' idGroup='7' />, { context: { user: desk } });

         await waitFor(() => expect(getInfoClient).toHaveBeenCalledTimes(1));
         expect(field('rfc')).not.toBeInTheDocument();
      });

      test('goes back to the checklist discarding the stored client data', async () => {
         const { user, router } = await setup();
         localStorage.setItem('BureData', '{}');

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/MRC/Documentation/7');
         expect(localStorage.getItem('BureData')).toBeNull();
      });
   });

   describe('person type', () => {
      test('offers only the legal entity option and hides the birth date for a legal entity', async () => {
         await setup();

         expect([...field('accountType').options].map((option) => option.textContent.trim())).toEqual([
            '- Seleccionar -',
            'Persona Moral',
         ]);
         expect(screen.queryByText('Fecha de nacimiento')).not.toBeInTheDocument();
      });

      test('offers the natural person options and shows the birth date otherwise', async () => {
         await setup({ client: buildClient({ accountType: 'PF', birthdate: '1990-05-10' }) });

         expect([...field('accountType').options].map((option) => option.textContent.trim())).toEqual([
            '- Seleccionar -',
            'Persona Física',
            'Persona Física con Actividad Empresarial',
         ]);
         expect(screen.getByText('Fecha de nacimiento')).toBeInTheDocument();
         expect(document.querySelector('input[type="date"]')).toHaveValue('1990-05-10');
      });

      test('shows the signature date only when the screen asks for it', async () => {
         await setup();
         expect(field('signatureDate')).toHaveValue('03-06-2025');
      });

      test('hides the authorization block when the screen does not ask for the signature', async () => {
         await setup({ storage: buildStorage({ showSignature: false }) });

         expect(field('signatureDate')).not.toBeInTheDocument();
         expect(screen.queryByText('Autorización')).not.toBeInTheDocument();
      });
   });

   describe('validation', () => {
      test('requires the address', async () => {
         const { user } = await setup();

         await user.clear(field('address'));

         expect(await screen.findByText('Este campo no puede quedar vacío')).toBeInTheDocument();
      });

      test('rejects symbols in the address', async () => {
         const { user } = await setup();

         await user.type(field('address'), '$');

         expect(await screen.findByText('Solo puedes ingresar números y letras')).toBeInTheDocument();
      });

      test('rejects digits in the city', async () => {
         const { user } = await setup();

         await user.type(field('city'), '1');

         expect(await screen.findByText('Solo puedes ingresar letras')).toBeInTheDocument();
      });

      test('keeps only digits in the zip code and requires five of them', async () => {
         const { user } = await setup();
         await user.clear(field('zipCode'));

         await user.type(field('zipCode'), 'a1b2c3');

         expect(field('zipCode')).toHaveValue('123');
         expect(await screen.findByText('Longitud inválida')).toBeInTheDocument();
      });
   });

   describe('updating', () => {
      test('keeps the update button disabled and the confirmation enabled until something changes', async () => {
         await setup();

         expect(button('Actualizar')).toBeDisabled();
         expect(button('Confirmar')).toBeEnabled();
      });

      test('enables the update and disables the confirmation after a change', async () => {
         const { user } = await setup();

         await user.type(field('address'), ' 2');

         await waitFor(() => expect(button('Actualizar')).toBeEnabled());
         expect(button('Confirmar')).toBeDisabled();
      });

      test('disables the confirmation when the credit bureau document has no folio', async () => {
         await setup({ storage: buildStorage({ folio: 0 }) });

         expect(button('Confirmar')).toBeDisabled();
      });

      test('updates the client information with the user and restores the buttons', async () => {
         updateInfoClient.mockResolvedValue({ status: 200 });
         const { user, context } = await setup();
         await user.type(field('address'), ' 2');
         await waitFor(() => expect(button('Actualizar')).toBeEnabled());

         await user.click(button('Actualizar'));

         await waitFor(() => expect(updateInfoClient).toHaveBeenCalledTimes(1));
         expect(updateInfoClient).toHaveBeenCalledWith(
            expect.objectContaining({ address: 'Reforma 2', rfc: 'ALF010101AAA', userModify: 'mrc.ad' })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando...');
         await waitFor(() => expect(button('Actualizar')).toBeDisabled());
         expect(button('Confirmar')).toBeEnabled();
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Los cambios se han guardado') })
         );
         expect(JSON.parse(localStorage.getItem('BureData')).address).toBe('Reforma 2');
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('shows the error and keeps the changes when the update answers with another status', async () => {
         updateInfoClient.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });
         const { user, context } = await setup();
         await user.type(field('address'), ' 2');
         await waitFor(() => expect(button('Actualizar')).toBeEnabled());

         await user.click(button('Actualizar'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(button('Actualizar')).toBeEnabled();
      });

      test('logs the error and hides the loader when the update throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         updateInfoClient.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();
         await user.type(field('address'), ' 2');
         await waitFor(() => expect(button('Actualizar')).toBeEnabled());

         await user.click(button('Actualizar'));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Validación de Datos', expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });

   describe('confirming', () => {
      test('confirms the information, shows the notice and goes to the checklist after a second and a half', async () => {
         onBureauConfirmation.mockResolvedValue({ status: 200 });
         const { user, router, context } = await setup({ fakeTimers: true });

         await user.click(button('Confirmar'));

         await waitFor(() =>
            expect(onBureauConfirmation).toHaveBeenCalledWith({
               idRequest: 9,
               idClient: '500',
               confirmInfoBureau: true,
               userModify: 'mrc.ad',
            })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Procesando...');
         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('Se validó la información correctamente') })
            )
         );
         expect(router.push).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(1500);
         });
         expect(router.push).toHaveBeenCalledWith('/MRC/Documentation/7');
         expect(localStorage.getItem('infoMRC')).toBeNull();
      });

      test('does not confirm while the form has invalid fields', async () => {
         const { user, context } = await setup({ client: buildClient({ address: '' }) });

         await user.click(button('Confirmar'));

         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(onBureauConfirmation).not.toHaveBeenCalled();
      });

      test('shows the error and does not navigate when the confirmation answers with another status', async () => {
         onBureauConfirmation.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });
         const { user, router, context } = await setup();

         await user.click(button('Confirmar'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(router.push).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when the confirmation throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         onBureauConfirmation.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();

         await user.click(button('Confirmar'));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Confirmación Buró', expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
