import { screen, waitFor, within } from '@testing-library/react';
import Swal from 'sweetalert2';

import VerificationForm from '../../../../components/PropertyVerification/ModalVerification/VerificationForm';
import { savePropertyAfterVerification, saveVerification } from '../../../../services';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';

jest.mock('../../../../services', () => ({
   saveVerification: jest.fn(),
   savePropertyAfterVerification: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const APPLICANT_TYPE = 1;
const OBLIGATED_TYPE = 2;

const propertyInfo = {
   applicant: { fullName: 'Empresa Alfa' },
   obligedList: [
      { idClient: 10, fullName: 'Carlos Vega' },
      { idClient: 11, fullName: 'Laura Mena' },
   ],
   propertiesFormat: { userModify: '', uniqueFolio: '55' },
};

const emptyItem = {
   idx: 0,
   idClient: 20,
   checkNumber: 3,
   catTypePerson: APPLICANT_TYPE,
   checkDate: '',
   ownerType: '',
   ownerName: '',
   ownershipStatus: '',
   typeValue: '',
   ownershipValue: '',
   description: '',
   otherName1: '',
   otherName2: '',
   otherName3: '',
   otherName4: '',
   otherName5: '',
};

const completeItem = {
   ...emptyItem,
   checkDate: '2024-01-15',
   ownerType: 'APPLICANT',
   ownerName: 'Empresa Alfa',
   ownershipStatus: 'libre',
   typeValue: 'appraisal',
   ownershipValue: '1500000',
};

function setup({ item = emptyItem, info = propertyInfo } = {}) {
   const actions = createActions({
      toggleReloading: jest.fn(),
      toggleVerification: jest.fn(),
   });
   const wrapper = createContextWrapper({ user: { userAD: 'analista' }, verifyProperty: { item }, actions });
   const utils = renderComponent(<VerificationForm propertyInfo={info} />, { wrapper });
   return { actions, ...utils };
}

const ownerSelect = () => screen.getByLabelText('Nombre del propietario');
const statusSelect = () => screen.getByLabelText('Estatus de propiedad');
const typeValueSelect = () => screen.getByLabelText('Valor propiedad');
const saveButton = () => screen.getByRole('button', { name: 'Guardar y salir' });
const optionLabels = (select) => within(select).getAllByRole('option').map((o) => o.textContent);

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
   saveVerification.mockResolvedValue({ status: 200, data: { idCheckOwnership: 900 } });
   savePropertyAfterVerification.mockResolvedValue({ status: 200 });
});

describe('VerificationForm', () => {
   test('shows the check number and the data of the verification', () => {
      setup({ item: completeItem });

      expect(screen.getByText(/Verificación\s*03/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
      expect(ownerSelect()).toHaveValue('APPLICANT');
      expect(statusSelect()).toHaveValue('libre');
      expect(typeValueSelect()).toHaveValue('appraisal');
      expect(screen.getByLabelText('Valor')).toHaveValue('$1,500,000');
   });

   test('blocks the scroll of the page while it is open and restores it when it closes', () => {
      document.documentElement.style.overflow = 'auto';
      const { unmount } = setup();
      expect(document.documentElement.style.overflow).toBe('hidden');

      unmount();

      expect(document.documentElement.style.overflow).not.toBe('hidden');
   });

   test('closes the modal from the close button', async () => {
      const { actions, user } = setup();

      await user.click(screen.getByTestId('close-modal-verification'));

      expect(actions.toggleVerification).toHaveBeenCalledTimes(1);
   });

   describe('owner options', () => {
      test('offers the applicant options', () => {
         setup();

         expect(optionLabels(ownerSelect())).toEqual([
            '- Seleccionar -',
            'Solicitante',
            'Co-propietario (Solicitante y otros)',
            'Co-propietario (Solicitante y Obligado Solidario)',
            'Otros',
         ]);
      });

      test('offers the obligor options', () => {
         setup({ item: { ...emptyItem, catTypePerson: OBLIGATED_TYPE } });

         expect(optionLabels(ownerSelect())).toEqual([
            '- Seleccionar -',
            'Obligado solidario',
            'Co-propietario (Obligado solidario y otros)',
            'Co-propietario (Firmantes)',
            'Otros',
         ]);
      });

      test('removes the co-owner with obligors option when the request has none', () => {
         setup({ info: { ...propertyInfo, obligedList: [] } });

         expect(optionLabels(ownerSelect())).not.toContain('Co-propietario (Solicitante y Obligado Solidario)');
         expect(optionLabels(ownerSelect())).toHaveLength(4);
      });

      test('does not show the owner detail until an owner type is selected', () => {
         setup();

         expect(screen.queryByPlaceholderText('Nombre del propietario')).not.toBeInTheDocument();
         expect(screen.queryByTitle('Empresa Alfa')).not.toBeInTheDocument();
      });

      test('selects the applicant name for an applicant owner', async () => {
         const { user } = setup();

         await user.selectOptions(ownerSelect(), 'APPLICANT');

         expect(screen.getByTitle('Empresa Alfa')).toBeInTheDocument();
      });

      test('selects the name of the obligor being verified for an obligor owner', async () => {
         const { user } = setup({ item: { ...emptyItem, catTypePerson: OBLIGATED_TYPE, idClient: 11 } });

         await user.selectOptions(ownerSelect(), 'APPLICANT');

         expect(screen.getByTitle('Laura Mena')).toBeInTheDocument();
      });

      test('lists the applicant and every obligor for a co-owner with obligors', async () => {
         const { user } = setup();

         await user.selectOptions(ownerSelect(), 'CO_OBLIGED');

         expect(screen.getByTitle('Empresa Alfa')).toBeInTheDocument();
         expect(screen.getByTitle('Carlos Vega')).toBeInTheDocument();
         expect(screen.getByTitle('Laura Mena')).toBeInTheDocument();
      });

      test('shows an empty input for a co-owner with others', async () => {
         const { user } = setup();

         await user.selectOptions(ownerSelect(), 'CO_OTHERS');

         expect(screen.getByTitle('Empresa Alfa')).toBeInTheDocument();
         expect(screen.getAllByPlaceholderText('Nombre del propietario')).toHaveLength(1);
      });

      test('shows inputs to capture other owners', async () => {
         const { user } = setup();

         await user.selectOptions(ownerSelect(), 'OTHERS');

         expect(screen.getAllByPlaceholderText('Nombre del propietario')).toHaveLength(1);
      });

      test('clears the previous co-owners when the owner type changes', async () => {
         const { user } = setup({
            item: { ...completeItem, ownerType: 'CO_OTHERS', otherName1: 'Ana Ruiz', otherName2: 'Luis Paz' },
         });
         expect(screen.getAllByPlaceholderText('Nombre del propietario')).toHaveLength(2);

         await user.selectOptions(ownerSelect(), 'OTHERS');

         expect(screen.getByPlaceholderText('Nombre del propietario')).toHaveValue('');
      });

      test('counts the captured co-owners to show their inputs', () => {
         setup({ item: { ...completeItem, ownerType: 'OTHERS', otherName1: 'Ana', otherName3: 'Luis' } });

         expect(screen.getAllByPlaceholderText('Nombre del propietario')).toHaveLength(2);
      });

      test('captures the name typed in a co-owner input', async () => {
         const { user } = setup({ item: { ...completeItem, ownerType: 'OTHERS' } });

         await user.type(screen.getByPlaceholderText('Nombre del propietario'), 'Ana');

         expect(screen.getByPlaceholderText('Nombre del propietario')).toHaveValue('Ana');
      });

      test('removes a co-owner from the list', async () => {
         const { user } = setup({
            item: { ...completeItem, catTypePerson: OBLIGATED_TYPE, ownerType: 'CO_OBLIGED', otherName1: 'Ana Ruiz' },
         });

         await user.click(screen.getByTestId('deleted-otherName1'));

         expect(screen.queryByTitle('Ana Ruiz')).not.toBeInTheDocument();
      });
   });

   describe('ownership status', () => {
      test.each([['gravado'], ['embargado']])('asks for a description when the property is %s', async (status) => {
         const { user } = setup({ item: completeItem });

         await user.selectOptions(statusSelect(), status);
         await user.type(screen.getByPlaceholderText(/Completar con el nombre de la institución/), 'Banco X');

         expect(screen.getByPlaceholderText(/Completar con el nombre de la institución/)).toHaveValue('Banco X');
      });

      test.each([['libre'], ['pendiente'], ['escrituracion'], ['donada'], ['']])(
         'does not ask for a description when the property is "%s"',
         (status) => {
            setup({ item: { ...completeItem, ownershipStatus: status } });

            expect(screen.queryByPlaceholderText(/Completar con el nombre de la institución/)).not.toBeInTheDocument();
         }
      );
   });

   describe('saving', () => {
      test('does not submit while a required field is missing', async () => {
         const { user } = setup({ item: { ...completeItem, ownershipStatus: '' } });

         await user.click(saveButton());

         expect(saveVerification).not.toHaveBeenCalled();
      });

      test('saves the verification and then the property format', async () => {
         const { actions, user } = setup({ item: completeItem });

         await user.click(saveButton());

         await waitFor(() => expect(actions.toggleVerification).toHaveBeenCalledTimes(1));
         expect(saveVerification).toHaveBeenCalledWith(expect.objectContaining({ ownershipValue: '1500000' }));
         expect(savePropertyAfterVerification).toHaveBeenCalledWith(
            expect.objectContaining({ ownershipValue: '1500000', idCheckOwnership: 900 }),
            expect.objectContaining({ propertiesFormat: { userModify: 'analista', uniqueFolio: '55' } })
         );
         expect(actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Guardando datos...');
         expect(actions.toggleLoading).toHaveBeenLastCalledWith();
         expect(actions.toggleReloading).toHaveBeenCalledTimes(1);
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('¡Listo! La verificación se ha guardado') })
         );
      });

      test('does not modify the property info received from the parent', async () => {
         const { actions, user } = setup({ item: completeItem });

         await user.click(saveButton());

         await waitFor(() => expect(actions.toggleVerification).toHaveBeenCalled());
         expect(propertyInfo.propertiesFormat.userModify).toBe('');
      });

      test('sends the values typed by the user', async () => {
         const { actions, user } = setup({ item: { ...completeItem, ownershipValue: '' } });

         await user.type(screen.getByLabelText('Valor'), '2500');
         await user.click(saveButton());

         await waitFor(() => expect(actions.toggleVerification).toHaveBeenCalled());
         expect(saveVerification).toHaveBeenCalledWith(expect.objectContaining({ ownershipValue: '2500' }));
      });

      test('stops when the verification could not be saved', async () => {
         saveVerification.mockResolvedValue({ status: 400, data: {} });
         const { actions, user } = setup({ item: completeItem });

         await user.click(saveButton());

         await waitFor(() => expect(actions.toggleLoading).toHaveBeenCalledTimes(2));
         expect(savePropertyAfterVerification).not.toHaveBeenCalled();
         expect(actions.toggleVerification).not.toHaveBeenCalled();
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('reports the error but closes when the property update fails', async () => {
         jest.spyOn(console, 'error').mockImplementation(() => {});
         savePropertyAfterVerification.mockResolvedValue({ status: 500 });
         const { actions, user } = setup({ item: completeItem });

         await user.click(saveButton());

         await waitFor(() => expect(actions.toggleVerification).toHaveBeenCalledTimes(1));
         expect(console.error).toHaveBeenCalledWith('Error al guardar después de la verificación');
      });

      test('logs the error and hides the loading when saving throws', async () => {
         jest.spyOn(console, 'log').mockImplementation(() => {});
         saveVerification.mockRejectedValue(new Error('sin red'));
         const { actions, user } = setup({ item: completeItem });

         await user.click(saveButton());

         await waitFor(() => expect(console.log).toHaveBeenCalledWith('Modal Verification', expect.any(Error)));
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
         expect(actions.toggleVerification).not.toHaveBeenCalled();
      });
   });
});
