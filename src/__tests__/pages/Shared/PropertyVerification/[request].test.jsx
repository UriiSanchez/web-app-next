import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import PropertyVerification, { getServerSideProps } from '../../../../pages/Shared/PropertyVerification/[request]';
import { getPropertyFormat, savePropertyFormat } from '../../../../services';
import { initConstants } from '../../../../helpers';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getPropertyFormat: jest.fn(),
   savePropertyFormat: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const buildUser = (idProfile, path) => ({ userAD: 'user.ad', path, idProfile, status: [] });
const analyst = buildUser(1, 'ADC');
const receiving = buildUser(2, 'MRC');
const specialist = buildUser(3, 'EMG');

const buildProperty = (idRelOwnership, extra = {}) => ({
   idRelOwnership,
   numberOwnership: idRelOwnership,
   formFoil: `FOL-${idRelOwnership}`,
   customerValue: 2500000,
   landUnit: 'hectare',
   propertyType: 'land',
   buildArea: '80',
   areaDimension: '120',
   location: 'Calle Uno 12',
   validation: true,
   comments: '',
   ...extra,
});
const resumeInd = {
   totalAreaDimension: 120,
   totalBuildArea: 80,
   totalCustomerValue: 2500000,
   resume: {
      inmuebles: { numero: 1, valor: 2500000 },
      libres: { numero: 1, valor: 2500000 },
      gravados: { numero: 0, valor: 0 },
      embargados: { numero: 0, valor: 0 },
      pendientes: { numero: 0, valor: 0 },
      escrituracion: { numero: 0, valor: 0 },
   },
};
const pair = { numero: 1, valor: 1000 };
const buildInfo = ({ format = {}, obligedList, ...extra } = {}) => ({
   idCatStatusGroup: 5,
   hasProperty: true,
   hasPropertyOS: false,
   applicant: {
      idClient: 30,
      idCatTypePerson: 1,
      fullName: 'Empresa Alfa',
      properties: [buildProperty(501)],
      resumeInd,
   },
   obligedList: obligedList ?? [
      { idClient: 31, idCatTypePerson: 2, fullName: 'Carlos Vega', properties: [buildProperty(601)], resumeInd },
   ],
   resumeGeneral: {
      creditRisk: 1500000,
      coverageRatio: 1.5,
      resume: {
         inmueblesApplicant: { pending: pair, verify: pair },
         inmueblesObligated: { pending: pair, verify: pair },
         copropiedadWithOS: pair,
         copropiedadOthers: pair,
         libres: pair,
         gravados: pair,
         embargados: pair,
         pendientes: { pending: pair, verify: pair },
         escrituracion: pair,
         coverageRatioClient: 2,
      },
   },
   propertiesFormat: {
      uniqueFolio: '8899',
      result: 'libre',
      verificationDate: '2024-03-10',
      description: '',
      freezeTitle: 'Congelar formato',
      modifyDate: '01-06-2025',
      idCatStatus: 1,
      ...format,
   },
   ...extra,
});

const setup = async ({ info = buildInfo(), user = analyst, props = {}, context = {}, fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getPropertyFormat.mockResolvedValue({ status: 200, data: info });
   // El servicio real deja en localStorage la última copia guardada; la página la compara para habilitar «Guardar».
   localStorage.setItem('Property_Page', JSON.stringify(info));
   const utils = renderPage(<PropertyVerification idRequest='9' idGroup='7' origin='Documentation' {...props} />, {
      context: { user, ...context },
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   await waitFor(() => expect(screen.getByTestId('fecha-elaboracion')).toHaveTextContent('01-06-2025'));
   return utils;
};
const button = (name) => screen.getByRole('button', { name });
const titleOf = (step) => screen.getByRole('heading', { name: initConstants.title[step] });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (Shared PropertyVerification)', () => {
   test('maps the query to the props of the page', async () => {
      expect(await getServerSideProps({ query: { request: '9', idGroup: '7', origin: 'History' } })).toEqual({
         props: { idRequest: '9', idGroup: '7', origin: 'History' },
      });
   });

   test('defaults the values', async () => {
      expect(await getServerSideProps({ query: {} })).toEqual({
         props: { idRequest: 0, idGroup: 0, origin: 'Documentation' },
      });
   });
});

describe('Shared PropertyVerification page', () => {
   describe('loading', () => {
      test('requests the property format of the request and shows the first step with the elaboration date', async () => {
         await setup();

         expect(getPropertyFormat).toHaveBeenCalledWith('9');
         expect(titleOf(1)).toBeInTheDocument();
         expect(screen.getByTestId('fecha-elaboracion')).toHaveTextContent('01-06-2025');
      });

      test('registers the steps of the format in the stepper', async () => {
         const { context } = await setup();

         expect(context.actions.setStepper).toHaveBeenCalledWith({
            options: initConstants.steps,
            step: 1,
            isShow: true,
         });
      });

      test('keeps the skeleton and no data when the service answers with another status', async () => {
         getPropertyFormat.mockResolvedValue({ status: 404, data: null });

         renderPage(<PropertyVerification idRequest='9' idGroup='7' origin='Documentation' />, {
            context: { user: analyst },
         });

         await waitFor(() => expect(getPropertyFormat).toHaveBeenCalledTimes(1));
         expect(screen.queryByText('FOL-501')).not.toBeInTheDocument();
         expect(screen.getByTestId('fecha-elaboracion')).toHaveTextContent('');
      });

      test('reloads the format when the global reload flag changes', async () => {
         const { updateContext } = await setup();

         updateContext({ isReloading: true });

         await waitFor(() => expect(getPropertyFormat).toHaveBeenCalledTimes(2));
      });
   });

   describe('steps', () => {
      test('walks through the four steps and back', async () => {
         const { user, context } = await setup();

         await user.click(button('Continuar'));
         expect(titleOf(2)).toBeInTheDocument();
         expect(await screen.findByText('FOL-601')).toBeInTheDocument();

         await user.click(button('Continuar'));
         expect(titleOf(3)).toBeInTheDocument();
         expect(await screen.findByRole('table', { name: 'Declaración del cliente' })).toBeInTheDocument();

         await user.click(button('Continuar'));
         expect(titleOf(4)).toBeInTheDocument();
         expect(await screen.findByLabelText('Folio único')).toHaveValue('8899');
         expect(button('Finalizado')).toBeInTheDocument();
         expect(context.actions.setStepper).toHaveBeenLastCalledWith({
            options: initConstants.steps,
            step: 4,
            isShow: true,
         });

         await user.click(button('Regresar'));
         expect(titleOf(3)).toBeInTheDocument();
      });

      test('shows a message when the request has no solidary obligors', async () => {
         const { user } = await setup({ info: buildInfo({ obligedList: [] }) });

         await user.click(button('Continuar'));

         expect(
            await screen.findByText('Esta solicitud no tiene obligados solidarios que mostrar')
         ).toBeInTheDocument();
      });
   });

   describe('closing the format', () => {
      test('goes back to the checklist of the profile from the first step', async () => {
         const { user, router, context } = await setup();
         localStorage.setItem('Property_Page', '{}');

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7');
         expect(localStorage.getItem('Property_Page')).toBeNull();
         expect(context.actions.setStepper).toHaveBeenLastCalledWith({ options: [], step: 1, isShow: false });
      });

      test('goes back to the origin page under Shared when the origin is not the documentation', async () => {
         const { user, router } = await setup({ props: { origin: 'ApplicationEvaluation' } });

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/Shared/ApplicationEvaluation/7');
      });

      test('closes the format when the last step is finished by the receiving desk', async () => {
         const { user, router } = await setup({ user: receiving });
         for (let i = 0; i < 3; i++) await user.click(button('Continuar'));

         await user.click(button('Finalizado'));

         expect(router.push).toHaveBeenCalledWith('/MRC/Documentation/7');
         expect(savePropertyFormat).not.toHaveBeenCalled();
      });
   });

   describe('saving', () => {
      const editFolio = async (user) => {
         for (let i = 0; i < 3; i++) await user.click(button('Continuar'));
         const folio = await screen.findByLabelText('Folio único');
         await user.type(folio, '1');
      };

      test('keeps the save button disabled until something changes', async () => {
         await setup({ user: specialist });

         expect(button('Guardar')).toBeDisabled();
      });

      test('never lets the receiving desk save', async () => {
         await setup({ user: receiving });

         expect(button('Guardar')).toBeDisabled();
      });

      test('saves the modified format with the active user and reloads it', async () => {
         savePropertyFormat.mockResolvedValue({ status: 200 });
         const { user, context } = await setup({ user: specialist });
         await editFolio(user);
         expect(button('Guardar')).toBeEnabled();

         await user.click(button('Guardar'));

         await waitFor(() => expect(savePropertyFormat).toHaveBeenCalledTimes(1));
         const [saved, idProfile] = savePropertyFormat.mock.calls[0];
         expect(idProfile).toBe(3);
         expect(saved.propertiesFormat).toEqual(expect.objectContaining({ uniqueFolio: '88991', userModify: 'user.ad' }));
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando datos...');
         await waitFor(() => expect(context.actions.toggleReloading).toHaveBeenCalledTimes(1));
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Los cambios se han guardado') })
         );
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('shows the error and does not reload when the service answers with another status', async () => {
         savePropertyFormat.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });
         const { user, context } = await setup({ user: specialist });
         await editFolio(user);

         await user.click(button('Guardar'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         await waitFor(() => expect(context.actions.toggleLoading).toHaveBeenLastCalledWith());
         expect(context.actions.toggleReloading).not.toHaveBeenCalled();
      });

      test('logs the error and hides the loader when saving throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         savePropertyFormat.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup({ user: specialist });
         await editFolio(user);

         await user.click(button('Guardar'));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Property Verification', expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('keeps saving disabled for a seized property', async () => {
         const info = buildInfo({ format: { result: 'embargada' } });
         const { user } = await setup({ info, user: specialist });
         for (let i = 0; i < 3; i++) await user.click(button('Continuar'));
         await user.type(await screen.findByLabelText('Folio único'), '1');

         expect(button('Guardar')).toBeDisabled();
         expect(button('Finalizado')).toBeDisabled();
      });
   });

   describe('finishing', () => {
      test('asks the analyst to confirm, saves the format and closes it after a second', async () => {
         savePropertyFormat.mockResolvedValue({ status: 200 });
         const { user, router } = await setup({ fakeTimers: true });
         for (let i = 0; i < 3; i++) await user.click(button('Continuar'));

         await user.click(button('Finalizado'));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ title: '¡Atención!', confirmButtonText: 'Continuar' })
            )
         );
         await waitFor(() => expect(savePropertyFormat).toHaveBeenCalledTimes(1));
         expect(router.push).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(1000);
         });
         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7');
      });

      test('does not save when the confirmation is cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { user, router } = await setup();
         for (let i = 0; i < 3; i++) await user.click(button('Continuar'));

         await user.click(button('Finalizado'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(savePropertyFormat).not.toHaveBeenCalled();
         expect(router.push).not.toHaveBeenCalled();
      });

      test('closes the format for the specialist without asking when there is nothing to save', async () => {
         const { user, router } = await setup({ user: specialist });
         for (let i = 0; i < 3; i++) await user.click(button('Continuar'));

         await user.click(button('Finalizado'));

         expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/7');
         expect(Swal.fire).not.toHaveBeenCalled();
         expect(savePropertyFormat).not.toHaveBeenCalled();
      });

      test('saves the pending changes of the specialist before closing the format', async () => {
         savePropertyFormat.mockResolvedValue({ status: 200 });
         const { user, router } = await setup({ user: specialist });
         for (let i = 0; i < 3; i++) await user.click(button('Continuar'));
         await user.type(await screen.findByLabelText('Folio único'), '1');

         await user.click(button('Finalizado'));

         await waitFor(() => expect(savePropertyFormat).toHaveBeenCalledTimes(1));
         expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/7');
      });

      test('does not ask the analyst to confirm while the verification is incomplete', async () => {
         const info = buildInfo({ format: { result: '' } });
         const { user, router } = await setup({ info });
         for (let i = 0; i < 3; i++) await user.click(button('Continuar'));

         await user.click(button('Finalizado'));

         expect(Swal.fire).not.toHaveBeenCalled();
         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7');
      });
   });

   describe('verification modal', () => {
      test('shows the verification form when the context asks for it', async () => {
         await setup({
            context: {
               verifyProperty: {
                  open: true,
                  item: {
                     idx: 0,
                     idClient: 30,
                     checkNumber: 1,
                     catTypePerson: 1,
                     checkDate: '',
                     ownerType: '',
                     ownerName: '',
                     ownershipStatus: '',
                     typeValue: '',
                     ownershipValue: '',
                     description: '',
                  },
               },
            },
         });

         expect(await screen.findByLabelText('Nombre del propietario')).toBeInTheDocument();
      });

      test('does not show the verification form by default', async () => {
         await setup();

         expect(screen.queryByLabelText('Nombre del propietario')).not.toBeInTheDocument();
      });
   });
});
