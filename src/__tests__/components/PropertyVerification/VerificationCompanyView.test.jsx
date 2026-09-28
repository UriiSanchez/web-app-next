import { fireEvent, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import VerificationCompanyView from '../../../components/PropertyVerification/VerificationCompanyView';
import { onChangeRequestStatusOrAssignUser, savePropertyFormat } from '../../../services';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../services', () => ({
   onChangeRequestStatusOrAssignUser: jest.fn(),
   savePropertyFormat: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const ADC = 1;
const MRC = 2;
const EMG = 3;
const LDC = 4;
const CANCELADA_POR_EMBARGO = 24;

const buildInfo = (format = {}) => ({
   propertiesFormat: {
      uniqueFolio: '8899',
      result: 'libre',
      verificationDate: '2024-03-10',
      description: '',
      freezeTitle: 'Congelar formato',
      ...format,
   },
});

function setup({ info = buildInfo(), idProfile = ADC, btnState = { freezeDisabled: false } } = {}) {
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const onUpdateData = jest.fn();
   const actions = createActions();
   const wrapper = createContextWrapper({ user: { idProfile, userAD: 'analista', path: 'AC' }, actions });
   const utils = renderComponent(
      <VerificationCompanyView
         info={info}
         onUpdateData={onUpdateData}
         idGroup='55'
         btnState={btnState}
         genericUrl='/AC/RequestsReview/55'
      />,
      { wrapper }
   );
   return { router, onUpdateData, actions, ...utils };
}

const folio = () => screen.getByLabelText('Folio único');
const result = () => screen.getByLabelText('Resultado');
const date = () => screen.getByLabelText('Fecha verificación');
const description = () => screen.getByLabelText(/Descripción/);
const freezeButton = () => screen.getByRole('button', { name: 'Congelar formato' });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('VerificationCompanyView', () => {
   describe('fields', () => {
      test('shows the captured verification', () => {
         setup();

         expect(folio()).toHaveValue('8899');
         expect(result()).toHaveValue('libre');
         expect(date()).toHaveValue('2024-03-10');
         expect(description()).toHaveValue('');
      });

      test('shows empty fields when there is no verification yet', () => {
         setup({ info: { propertiesFormat: {} } });

         expect(folio()).toHaveValue('');
         expect(result()).toHaveValue('');
         expect(date()).toHaveValue('');
      });

      test('offers the possible results', () => {
         setup();

         expect(Array.from(result().options).map((o) => o.textContent)).toEqual([
            '- Seleccionar -',
            'Libre',
            'Gravamen',
            'Embargada',
         ]);
      });

      test('locks every field for the reception desk profile', () => {
         setup({ idProfile: MRC, info: buildInfo({ result: 'gravamen' }) });

         [folio(), result(), date(), description()].forEach((field) => expect(field).toBeDisabled());
      });

      test('enables the fields for the other profiles', () => {
         setup({ idProfile: LDC });

         [folio(), result(), date()].forEach((field) => expect(field).toBeEnabled());
      });

      test('enables the description only when the result is a lien', () => {
         setup({ info: buildInfo({ result: 'gravamen', description: 'Hipoteca' }) });

         expect(description()).toBeEnabled();
         expect(description()).toHaveValue('Hipoteca');
      });

      test('disables the description for any other result', () => {
         setup({ info: buildInfo({ result: 'libre' }) });

         expect(description()).toBeDisabled();
      });
   });

   describe('editing', () => {
      test('notifies the result selected keeping the rest of the format', async () => {
         const { onUpdateData, user } = setup();

         await user.selectOptions(result(), 'gravamen');

         expect(onUpdateData).toHaveBeenCalledWith('propertiesFormat', { ...buildInfo().propertiesFormat, result: 'gravamen' });
      });

      test('clears the description when the result is not a lien anymore', async () => {
         const { onUpdateData, user } = setup({ info: buildInfo({ result: 'gravamen', description: 'Hipoteca' }) });

         await user.selectOptions(result(), 'libre');

         expect(onUpdateData).toHaveBeenCalledWith(
            'propertiesFormat',
            expect.objectContaining({ result: 'libre', description: '' })
         );
      });

      test('keeps the description when the result stays as a lien', async () => {
         const { onUpdateData, user } = setup({ info: buildInfo({ result: 'gravamen', description: 'Hipoteca' }) });

         await user.selectOptions(result(), 'gravamen');

         expect(onUpdateData).toHaveBeenCalledWith(
            'propertiesFormat',
            expect.objectContaining({ result: 'gravamen', description: 'Hipoteca' })
         );
      });

      test('notifies the description typed', () => {
         const { onUpdateData } = setup({ info: buildInfo({ result: 'gravamen' }) });

         fireEvent.change(description(), { target: { value: 'Banco X' } });

         expect(onUpdateData).toHaveBeenCalledWith(
            'propertiesFormat',
            expect.objectContaining({ description: 'Banco X' })
         );
      });

      test('notifies the verification date', () => {
         const { onUpdateData } = setup();

         fireEvent.change(date(), { target: { value: '2024-04-01' } });

         expect(onUpdateData).toHaveBeenCalledWith(
            'propertiesFormat',
            expect.objectContaining({ verificationDate: '2024-04-01' })
         );
      });

      test('notifies the unique folio typed', async () => {
         const { onUpdateData, user } = setup({ info: buildInfo({ uniqueFolio: '' }) });

         await user.type(folio(), '7');

         expect(onUpdateData).toHaveBeenCalledWith(
            'propertiesFormat',
            expect.objectContaining({ uniqueFolio: '7' })
         );
      });

      test('does not modify the format received from the parent', async () => {
         const info = buildInfo();
         const { user } = setup({ info });

         await user.selectOptions(result(), 'gravamen');

         expect(info.propertiesFormat.result).toBe('libre');
      });
   });

   describe('seized company', () => {
      test('keeps the cancellation notice closed for other results', () => {
         setup();

         expect(screen.queryByRole('heading', { name: '¡Sociedad embargada!' })).not.toBeInTheDocument();
      });

      test('warns that the request will be cancelled when the result is seized', () => {
         setup({ info: buildInfo({ result: 'embargada' }) });

         expect(screen.getByRole('heading', { name: '¡Sociedad embargada!' })).toBeInTheDocument();
         expect(screen.getByRole('button', { name: 'Sí, cancelar' })).toBeInTheDocument();
      });

      test('closes the notice without cancelling when going back', async () => {
         const { user } = setup({ info: buildInfo({ result: 'embargada' }) });

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(screen.queryByRole('heading', { name: '¡Sociedad embargada!' })).not.toBeInTheDocument();
         expect(onChangeRequestStatusOrAssignUser).not.toHaveBeenCalled();
      });

      test('cancels the group of requests and goes back to the requests', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
         const { router, actions, user } = setup({ info: buildInfo({ result: 'embargada' }) });

         await user.click(screen.getByRole('button', { name: 'Sí, cancelar' }));

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/AC/RequestsReview'));
         expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith({
            idGroupRequest: '55',
            idCatStatus: CANCELADA_POR_EMBARGO,
            userCreate: 'analista',
            nextProfile: 'EF',
         });
         expect(actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Cancelando solicitud');
         expect(actions.toggleLoading).toHaveBeenLastCalledWith();
         expect(screen.queryByRole('heading', { name: '¡Sociedad embargada!' })).not.toBeInTheDocument();
      });

      test('informs when the request could not be cancelled', async () => {
         onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 500 });
         const { router, actions, user } = setup({ info: buildInfo({ result: 'embargada' }) });

         await user.click(screen.getByRole('button', { name: 'Sí, cancelar' }));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: 'No se pudo asignar la solicitud', icon: 'info' })
            )
         );
         expect(router.push).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });

      test('logs the error and hides the loading when the cancellation throws', async () => {
         jest.spyOn(console, 'log').mockImplementation(() => {});
         onChangeRequestStatusOrAssignUser.mockRejectedValue(new Error('sin red'));
         const { router, actions, user } = setup({ info: buildInfo({ result: 'embargada' }) });

         await user.click(screen.getByRole('button', { name: 'Sí, cancelar' }));

         await waitFor(() =>
            expect(console.log).toHaveBeenCalledWith('Error al intentar cancelar la solicitud: ', expect.any(Error))
         );
         expect(router.push).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });
   });

   describe('freezing the format', () => {
      test.each([[ADC], [LDC]])('shows the freeze button with its title for profile %i', (idProfile) => {
         setup({ idProfile });

         expect(freezeButton()).toBeEnabled();
      });

      test.each([[MRC], [EMG]])('hides the freeze button for profile %i', (idProfile) => {
         setup({ idProfile });

         expect(screen.queryByRole('button', { name: 'Congelar formato' })).not.toBeInTheDocument();
      });

      test('disables the freeze button when the parent does not allow it', () => {
         setup({ btnState: { freezeDisabled: true } });

         expect(freezeButton()).toBeDisabled();
      });

      test('asks for confirmation before freezing', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { user } = setup();

         await user.click(freezeButton());

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
               title: '¿Estás seguro de continuar?',
               confirmButtonText: 'Continuar',
               cancelButtonText: 'Cancelar',
            })
         );
         expect(savePropertyFormat).not.toHaveBeenCalled();
      });

      test('saves the frozen format and goes to the next page', async () => {
         savePropertyFormat.mockResolvedValue({ status: 200 });
         const info = buildInfo();
         const { router, actions, user } = setup({ info });

         await user.click(freezeButton());

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/AC/RequestsReview/55'));
         expect(savePropertyFormat).toHaveBeenCalledWith(
            { propertiesFormat: { ...info.propertiesFormat, userModify: 'analista' } },
            ADC,
            true
         );
         expect(actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Guardando en expediente digital...');
         expect(actions.toggleLoading).toHaveBeenLastCalledWith();
         expect(info.propertiesFormat.userModify).toBeUndefined();
      });

      test('shows the error and stays when the format could not be saved', async () => {
         savePropertyFormat.mockResolvedValue({ status: 400, data: { message: 'Formato inválido' } });
         const { router, actions, user } = setup();

         await user.click(freezeButton());

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('¡La solicitud no pudo procesarse') })
            )
         );
         expect(router.push).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });

      test('logs the error and hides the loading when freezing throws', async () => {
         jest.spyOn(console, 'log').mockImplementation(() => {});
         savePropertyFormat.mockRejectedValue(new Error('sin red'));
         const { router, actions, user } = setup();

         await user.click(freezeButton());

         await waitFor(() =>
            expect(console.log).toHaveBeenCalledWith('Congelado Relación de Propiedad', expect.any(Error))
         );
         expect(router.push).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });
   });
});
