import { fireEvent, screen } from '@testing-library/react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import SearchObligated from '../../../../components/Solidary/Form/SearchObligated';
import { getClientsById, getClientsByName } from '../../../../services';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';
import { createRouter } from '../../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ getClientsById: jest.fn(), getClientsByName: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const pmClient = { idClient: 123, businessName: 'Acme SA', email: 'acme@correo.com', personType: 'PM' };
const pfClient = { idClient: 456, name: 'Ana Uno', email: 'ana@correo.com', personType: 'PF', civilStatus: 'Casada' };

function setup() {
   useRouter.mockReturnValue(createRouter());
   const actions = createActions({ setPagination: jest.fn(), setExpandedRows: jest.fn() });
   const onSetItem = jest.fn();
   const wrapper = createContextWrapper({
      user: { userAD: 'analista01' },
      actions,
      expandedRows: [],
      pagination: { currentPage: 1, totalPages: 1, sourcePage: 0, sourceTotalPages: 0 },
   });
   const utils = renderComponent(<SearchObligated idRequest={7} onSetItem={onSetItem} idx={2} />, { wrapper });
   return { actions, onSetItem, ...utils };
}

const searchInput = () => screen.getByRole('searchbox');
const chooseMode = async (user, title) => {
   await user.click(screen.getByText('arrow_downward'));
   await user.click(screen.getByRole('button', { name: title }));
};

describe('SearchObligated', () => {
   test('searches by name by default', () => {
      setup();

      expect(searchInput()).toHaveAttribute('placeholder', 'Buscar por nombre de persona');
      expect(searchInput()).toHaveValue('');
   });

   test('switches the placeholder and clears the text when the search mode changes', async () => {
      const { user } = setup();
      await user.type(searchInput(), 'Ana');

      await chooseMode(user, 'Número de persona');

      expect(searchInput()).toHaveAttribute('placeholder', 'Buscar por número de persona');
      expect(searchInput()).toHaveValue('');
   });

   test('keeps only digits when searching by number', async () => {
      const { user } = setup();
      await chooseMode(user, 'Número de persona');

      await user.type(searchInput(), '12a3-');

      expect(searchInput()).toHaveValue('123');
   });

   test.each([
      ['Nombre de persona', '¡Ingresa un nombre de cliente!'],
      ['Número de persona', '¡Ingresa un número de cliente!'],
   ])('asks for a value when searching by %s with an empty text', async (mode, message) => {
      const { user } = setup();
      await chooseMode(user, mode);

      await user.type(searchInput(), '{Enter}');

      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ html: message, icon: 'info' }));
      expect(getClientsById).not.toHaveBeenCalled();
      expect(getClientsByName).not.toHaveBeenCalled();
   });

   describe('by number', () => {
      const search = async (user) => {
         await chooseMode(user, 'Número de persona');
         await user.type(searchInput(), '123{Enter}');
      };

      test('selects a legal entity found by number without marital status', async () => {
         getClientsById.mockResolvedValue({ status: 200, data: pmClient });
         const { actions, onSetItem, user } = setup();

         await search(user);

         expect(getClientsById).toHaveBeenCalledWith('idClient=123&typeSolEnum=NONE');
         expect(actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Buscando Obligado Solidario...');
         expect(onSetItem).toHaveBeenCalledWith(
            {
               fullName: 'Acme SA',
               idCatTypePerson: 2,
               idClient: 123,
               idRequest: 7,
               mail: 'acme@correo.com',
               newObli: true,
               personType: 'PM',
               userCreate: 'analista01',
            },
            2
         );
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
         expect(searchInput()).toHaveValue('');
      });

      test('adds the marital status of a natural person, using Soltero as default', async () => {
         getClientsById.mockResolvedValueOnce({ status: 200, data: pfClient });
         const { onSetItem, user } = setup();
         await search(user);
         expect(onSetItem.mock.calls[0][0]).toMatchObject({ fullName: 'Ana Uno', maritalStatus: 'Casada' });

         getClientsById.mockResolvedValueOnce({ status: 200, data: { ...pfClient, civilStatus: undefined } });
         await user.type(searchInput(), '456{Enter}');
         expect(onSetItem.mock.calls[1][0].maritalStatus).toBe('Soltero');
      });

      test('cuts the email to the maximum length', async () => {
         const email = `${'a'.repeat(300)}@correo.com`;
         getClientsById.mockResolvedValue({ status: 200, data: { ...pmClient, email } });
         const { onSetItem, user } = setup();

         await search(user);

         expect(onSetItem.mock.calls[0][0].mail).toHaveLength(253);
      });

      test('warns when no client is found', async () => {
         getClientsById.mockResolvedValue({ status: 404 });
         const { onSetItem, actions, user } = setup();

         await search(user);

         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' }));
         expect(onSetItem).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });
   });

   describe('by name', () => {
      const clients = [pfClient, pmClient];
      const search = async (user, text = 'An') => {
         await user.type(searchInput(), `${text}{Enter}`);
      };

      test('lists the clients found and selects the clicked one', async () => {
         getClientsByName.mockResolvedValue({ status: 200, data: clients });
         const { onSetItem, user } = setup();

         await search(user);

         expect(getClientsByName).toHaveBeenCalledWith('An', 'SHORT');
         expect(searchInput()).toHaveValue('');
         expect(screen.getByText('Ana Uno')).toBeInTheDocument();
         expect(screen.getByText('123')).toBeInTheDocument();

         await user.click(screen.getByText('Ana Uno'));

         expect(onSetItem).toHaveBeenCalledWith(expect.objectContaining({ idClient: 456, fullName: 'Ana Uno' }), 2);
         expect(screen.queryByText('Ana Uno')).not.toBeInTheDocument();
      });

      test('closes the list when clicking outside', async () => {
         getClientsByName.mockResolvedValue({ status: 200, data: clients });
         const { user } = setup();
         await search(user);
         expect(screen.getByText('Ana Uno')).toBeInTheDocument();

         fireEvent.mouseDown(document.body);

         expect(screen.queryByText('Ana Uno')).not.toBeInTheDocument();
      });

      test('warns with the searched name when nothing is found', async () => {
         getClientsByName.mockResolvedValue({ status: 404 });
         const { user } = setup();

         await search(user, 'Zzz');

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: 'No se encontro ningún cliente con:<br/><b>Zzz</b>', icon: 'warning' })
         );
         expect(screen.queryByRole('table')).not.toBeInTheDocument();
      });

      test('hides the loading and clears the text when the service fails', async () => {
         jest.spyOn(console, 'log').mockImplementation(() => {});
         getClientsByName.mockRejectedValue(new Error('sin red'));
         const { actions, user } = setup();

         await search(user);

         expect(console.log).toHaveBeenCalledWith('búsqueda de obligados: ', expect.any(Error));
         expect(actions.toggleLoading).toHaveBeenLastCalledWith();
         expect(searchInput()).toHaveValue('');
      });
   });
});
