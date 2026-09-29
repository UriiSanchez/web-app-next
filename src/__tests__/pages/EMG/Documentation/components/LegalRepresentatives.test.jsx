import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import LegalRepresentatives from '../../../../../pages/EMG/Documentation/components/LegalRepresentatives';
import { getLegalRepresent, saveRepresent } from '../../../../../services';
import { renderComponent } from '../../../../utils/render';
import { createActions, createContextWrapper } from '../../../../utils/context';
import { createRouter } from '../../../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../../services', () => ({ getLegalRepresent: jest.fn(), saveRepresent: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: {
      fire: jest.fn(),
      mixin: jest.fn(() => ({})),
      showLoading: jest.fn(),
      getHtmlContainer: jest.fn(),
      getTimerLeft: jest.fn(),
   },
}));

const info = { idRequest: 1, idClient: 500 };
const user = { idProfile: 2, fullName: 'Ana Lopez' };

const rep = (idClient, overrides = {}) => ({
   idClient,
   idRequest: 1,
   fullName: `Representante ${idClient}`,
   rfc: `RFC${idClient}`,
   isSelected: false,
   idClientManual: '',
   ...overrides,
});
// Uno sin cliente registrado (idClient 0) y uno ya guardado (idRelatedPerson) y seleccionado.
const buildLegalData = () => ({
   thirdRepresentatives: [rep(101), rep(0, { fullName: 'Representante nuevo' }), rep(103, { isSelected: true, idRelatedPerson: 9 })],
});

const setup = async ({ data = buildLegalData(), fakeTimers = false } = {}) => {
   if (fakeTimers) jest.useFakeTimers();
   getLegalRepresent.mockResolvedValue({ status: 200, data });
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const actions = createActions();
   const fnSet = jest.fn();
   const utils = renderComponent(<LegalRepresentatives info={info} fnSet={fnSet} />, {
      wrapper: createContextWrapper({ user, actions }),
      userOptions: fakeTimers ? { delay: null } : undefined,
   });
   await screen.findByRole('dialog');
   return { actions, fnSet, router, ...utils };
};

const checkboxes = () => screen.getAllByRole('checkbox');
const idInputs = () => screen.getAllByRole('textbox');
const saveButton = () => screen.getByRole('button', { name: 'Seleccionar' });
// onKeyNumbers lee `keyCode`, que user-event no informa para los dígitos: el valor se cambia con fireEvent.
const typeId = (index, value) => fireEvent.change(idInputs()[index], { target: { value } });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: false });
});

describe('LegalRepresentatives', () => {
   describe('loading', () => {
      test('requests the legal representatives of the request with the current user', async () => {
         await setup();

         expect(getLegalRepresent).toHaveBeenCalledWith(info, user);
      });

      test('toggles the loader while searching and hides it afterwards', async () => {
         const { actions } = await setup();

         expect(actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Buscando representantes legales...');
         expect(actions.toggleLoading).toHaveBeenNthCalledWith(2);
      });

      test('renders nothing until the representatives arrive', () => {
         getLegalRepresent.mockReturnValue(new Promise(() => {}));
         useRouter.mockReturnValue(createRouter());

         renderComponent(<LegalRepresentatives info={info} fnSet={jest.fn()} />, {
            wrapper: createContextWrapper({ user, actions: createActions() }),
         });

         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      test('lists every representative with id, name and RFC', async () => {
         await setup();

         expect(screen.getByRole('heading', { name: 'Representantes Legales' })).toBeInTheDocument();
         expect(screen.getByText('Representante 101')).toBeInTheDocument();
         expect(screen.getByText('Representante nuevo')).toBeInTheDocument();
         expect(screen.getByText('RFC103')).toBeInTheDocument();
         expect(checkboxes()).toHaveLength(3);
      });

      test('starts with the already saved representatives selected and the others unchecked', async () => {
         await setup();

         expect(checkboxes().map((checkbox) => checkbox.checked)).toEqual([false, false, true]);
         expect(idInputs().map((input) => input.disabled)).toEqual([true, true, false]);
      });

      test('closes the modal without rendering it when the service answers with another status', async () => {
         getLegalRepresent.mockResolvedValue({ status: 404, data: {} });
         const fnSet = jest.fn();
         const actions = createActions();
         useRouter.mockReturnValue(createRouter());

         renderComponent(<LegalRepresentatives info={info} fnSet={fnSet} />, {
            wrapper: createContextWrapper({ user, actions }),
         });

         await waitFor(() => expect(fnSet).toHaveBeenCalledTimes(1));
         await waitFor(() => expect(actions.toggleLoading).toHaveBeenCalledTimes(2));
         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      test('logs the error and hides the loader when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getLegalRepresent.mockRejectedValue(new Error('boom'));
         const fnSet = jest.fn();
         const actions = createActions();
         useRouter.mockReturnValue(createRouter());

         renderComponent(<LegalRepresentatives info={info} fnSet={fnSet} />, {
            wrapper: createContextWrapper({ user, actions }),
         });

         await waitFor(() => expect(actions.toggleLoading).toHaveBeenCalledTimes(2));
         expect(consoleSpy).toHaveBeenCalledWith('Obtener Representantes: ', expect.any(Error));
         expect(fnSet).not.toHaveBeenCalled();
         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
   });

   describe('selection', () => {
      test('enables the save button when between one and three representatives are selected', async () => {
         await setup();

         expect(saveButton()).toBeEnabled();
      });

      test('disables the save button when no representative is selected', async () => {
         await setup({ data: { thirdRepresentatives: [rep(101), rep(102)] } });

         expect(saveButton()).toBeDisabled();
      });

      test('selecting a representative enables its alternative id input', async () => {
         const { user: ui } = await setup();

         await ui.click(checkboxes()[0]);

         expect(checkboxes()[0]).toBeChecked();
         expect(idInputs()[0]).toBeEnabled();
      });

      test('unselecting a representative clears and disables its alternative id', async () => {
         const { user: ui } = await setup();
         typeId(2, '55');
         expect(idInputs()[2]).toHaveValue('55');

         await ui.click(checkboxes()[2]);

         expect(checkboxes()[2]).not.toBeChecked();
         expect(idInputs()[2]).toHaveValue('');
         expect(idInputs()[2]).toBeDisabled();
      });

      test('warns and blocks saving when more than three representatives are selected', async () => {
         const data = { thirdRepresentatives: [rep(1), rep(2), rep(3), rep(4), rep(5)] };
         const { user: ui } = await setup({ data });

         await ui.click(checkboxes()[0]);
         await ui.click(checkboxes()[1]);
         await ui.click(checkboxes()[2]);
         expect(screen.queryByText(/solo puedes seleccionar un maximo de 3/)).not.toBeInTheDocument();
         expect(saveButton()).toBeEnabled();

         await ui.click(checkboxes()[3]);

         expect(
            screen.getByText('Recuerda que solo puedes seleccionar un maximo de 3 Representantes Legales.')
         ).toBeInTheDocument();
         expect(saveButton()).toBeDisabled();
      });
   });

   describe('alternative id', () => {
      test('requires it for a representative without client id and accepts it once typed', async () => {
         const { user: ui } = await setup();

         await ui.click(checkboxes()[1]);
         expect(screen.getByText('Obligatorio')).toBeInTheDocument();
         expect(saveButton()).toBeDisabled();

         typeId(1, '123');

         expect(idInputs()[1]).toHaveValue('123');
         expect(screen.queryByText('Obligatorio')).not.toBeInTheDocument();
         expect(saveButton()).toBeEnabled();
      });

      test('requires it again when the typed id is erased', async () => {
         const { user: ui } = await setup();
         await ui.click(checkboxes()[1]);
         typeId(1, '5');
         expect(screen.queryByText('Obligatorio')).not.toBeInTheDocument();

         typeId(1, '');

         expect(screen.getByText('Obligatorio')).toBeInTheDocument();
         expect(saveButton()).toBeDisabled();
      });

      test('removes the requirement when the representative is unselected', async () => {
         const { user: ui } = await setup();
         await ui.click(checkboxes()[1]);
         expect(screen.getByText('Obligatorio')).toBeInTheDocument();

         await ui.click(checkboxes()[1]);

         expect(screen.queryByText('Obligatorio')).not.toBeInTheDocument();
         expect(saveButton()).toBeEnabled();
      });

      test('does not require it for a representative that already has a client id', async () => {
         const { user: ui } = await setup();

         await ui.click(checkboxes()[0]);
         typeId(0, '7');

         expect(idInputs()[0]).toHaveValue('7');
         expect(screen.queryByText('Obligatorio')).not.toBeInTheDocument();
         expect(saveButton()).toBeEnabled();
      });

      test('flags an invalid format and blocks saving', async () => {
         const { user: ui } = await setup();
         await ui.click(checkboxes()[0]);

         typeId(0, '.');

         expect(screen.getByText('Formato inválido')).toBeInTheDocument();
         expect(idInputs()[0]).toHaveClass('text-red-500');
         expect(saveButton()).toBeDisabled();
      });

      test('blocks non numeric keys, allows digits and limits the id to 10 characters', async () => {
         const { user: ui } = await setup();
         await ui.click(checkboxes()[0]);

         // fireEvent devuelve false cuando el manejador llamó a preventDefault.
         expect(fireEvent.keyDown(idInputs()[0], { keyCode: 65 })).toBe(false);
         expect(fireEvent.keyDown(idInputs()[0], { keyCode: 53 })).toBe(true);
         expect(idInputs()[0]).toHaveAttribute('maxLength', '10');
      });
   });

   describe('saving', () => {
      test('saves the selected representatives and those unselected that were already saved', async () => {
         saveRepresent.mockResolvedValue({ status: 204 });
         const { user: ui, actions } = await setup();
         await ui.click(checkboxes()[0]);
         await ui.click(checkboxes()[2]);

         await ui.click(saveButton());

         await waitFor(() => expect(saveRepresent).toHaveBeenCalledTimes(1));
         expect(saveRepresent).toHaveBeenCalledWith([
            expect.objectContaining({ idClient: 101, isSelected: true, deleted: false }),
            expect.objectContaining({ idClient: 103, isSelected: false, deleted: true }),
         ]);
         expect(actions.toggleLoading).toHaveBeenCalledWith('Guardando Representantes Legales...');
      });

      test('shows the success message and reloads the page after two seconds', async () => {
         saveRepresent.mockResolvedValue({ status: 204 });
         const { user: ui, router } = await setup({ fakeTimers: true });

         await ui.click(saveButton());

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ icon: 'success', title: '¡Se guardo la información correctamente!' })
            )
         );
         expect(router.reload).not.toHaveBeenCalled();
         act(() => {
            jest.advanceTimersByTime(2000);
         });
         expect(router.reload).toHaveBeenCalledTimes(1);
      });

      test('shows the error and does not reload when the service answers with another status', async () => {
         saveRepresent.mockResolvedValue({ status: 400, data: { message: 'Datos inválidos' } });
         const { user: ui, router, actions } = await setup();

         await ui.click(saveButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' })));
         expect(router.reload).not.toHaveBeenCalled();
         await waitFor(() => expect(actions.toggleLoading).toHaveBeenLastCalledWith());
      });

      test('logs the error and hides the loader when saving throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         saveRepresent.mockRejectedValue(new Error('boom'));
         const { user: ui, router, actions } = await setup();

         await ui.click(saveButton());

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Save Representantes: ', expect.any(Error)));
         expect(router.reload).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });

   describe('closing', () => {
      test('asks for confirmation before closing', async () => {
         const { user: ui, fnSet } = await setup();

         await ui.click(screen.getByTitle('Cerrar modal'));

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
               title: 'Recuerda que...',
               confirmButtonText: 'Salir',
               cancelButtonText: 'Continuar',
               showCancelButton: true,
            })
         );
         expect(fnSet).not.toHaveBeenCalled();
      });

      test('closes the modal when the user confirms leaving', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: true });
         const { user: ui, fnSet } = await setup();

         await ui.click(screen.getByTitle('Cerrar modal'));

         await waitFor(() => expect(fnSet).toHaveBeenCalledTimes(1));
      });
   });

   test('locks the page scroll while mounted and restores it on unmount', async () => {
      const { unmount } = await setup();
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.documentElement.style.overflowY).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('auto');
      expect(document.documentElement.style.overflowY).toBe('auto');
   });
});
