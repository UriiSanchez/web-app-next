import { screen, waitFor, within } from '@testing-library/react';
import Swal from 'sweetalert2';

import SearchPage from '../../pages';
import { getRequestsByParam } from '../../services';
import { renderPage } from '../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../services', () => ({
   ...jest.requireActual('../../services'),
   getRequestsByParam: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const specialist = { userAD: 'emg.ad', path: 'EMG', idProfile: 3, status: [] };

const buildPerson = (idClient, fullName, extra = {}) => ({
   idClient,
   fullName,
   group: `Grupo ${fullName}`,
   idCatStatus: 4,
   statusRequest: 'En proceso',
   createUser: 'emg.ad',
   idGroup: idClient * 10,
   idCatTypeProcedure: 3,
   ...extra,
});
const okResponse = (...requests) => ({ status: 200, requests });

const renderSearch = () => renderPage(<SearchPage />, { context: { user: specialist } });
const searchInput = () => screen.getByRole('searchbox');
const search = async (user, text) => {
   await user.type(searchInput(), `${text}{Enter}`);
};
const chooseMode = async (user, title) => {
   await user.click(screen.getByRole('button', { name: 'arrow_downward' }));
   await user.click(within(document.querySelector('#menu')).getByText(title));
};

beforeEach(() => {
   localStorage.setItem('idGroup', '7');
});

describe('Search page', () => {
   describe('layout', () => {
      test('shows the heading, the default placeholder and the empty table message', () => {
         renderSearch();

         expect(screen.getByRole('heading', { name: 'Buscador de personas' })).toBeInTheDocument();
         expect(screen.getByPlaceholderText('¿A quién quieres encontrar hoy?')).toBeInTheDocument();
         expect(screen.getByText('Escribe en el buscador para mostrar resultados')).toBeInTheDocument();
         expect(screen.getByLabelText('En curso')).toBeChecked();
         expect(screen.getByLabelText('Sin solicitud')).toBeChecked();
         expect(screen.getByLabelText('Finalizado')).toBeChecked();
      });
   });

   describe('search modes', () => {
      test('changes the placeholder and clears the text when the mode changes', async () => {
         const { user } = renderSearch();
         await user.type(searchInput(), '123');

         await chooseMode(user, 'Nombre de persona');

         expect(screen.getByPlaceholderText('Buscar por Nombre de persona')).toHaveValue('');
      });

      test('keeps only digits when searching by person number', async () => {
         const { user } = renderSearch();

         await user.type(searchInput(), 'a1b2');

         expect(searchInput()).toHaveValue('12');
      });

      test('keeps any text when searching by name', async () => {
         const { user } = renderSearch();
         await chooseMode(user, 'Nombre de persona');

         await user.type(searchInput(), 'Ana 2');

         expect(searchInput()).toHaveValue('Ana 2');
      });
   });

   describe('searching', () => {
      test('asks for a value when the search is empty', async () => {
         const { user } = renderSearch();

         await user.type(searchInput(), '{Enter}');

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  html: 'Es necesario que ingreses un número de cliente o el nombre que deseas buscar.',
                  icon: 'warning',
               })
            )
         );
         expect(getRequestsByParam).not.toHaveBeenCalled();
      });

      test('searches by person number and lists the results', async () => {
         getRequestsByParam.mockResolvedValue(okResponse(buildPerson(101, 'Ana'), buildPerson(102, 'Beto')));
         const { user } = renderSearch();

         await search(user, '101');

         expect(await screen.findByText('Ana')).toBeInTheDocument();
         expect(screen.getByText('Beto')).toBeInTheDocument();
         expect(getRequestsByParam).toHaveBeenCalledWith('forNumber', 'idClient=101&typeSolEnum=ALL');
      });

      test('searches by name with the trimmed text', async () => {
         getRequestsByParam.mockResolvedValue(okResponse(buildPerson(101, 'Ana')));
         const { user } = renderSearch();
         await chooseMode(user, 'Nombre de persona');

         await search(user, 'Ana ');

         await screen.findByText('Grupo Ana');
         expect(getRequestsByParam).toHaveBeenCalledWith('forName', 'Ana');
      });

      test('searches by economic group', async () => {
         getRequestsByParam.mockResolvedValue(okResponse(buildPerson(101, 'Ana')));
         const { user } = renderSearch();
         await chooseMode(user, 'Grupo económico');

         await search(user, 'Alfa');

         await screen.findByText('Grupo Ana');
         expect(getRequestsByParam).toHaveBeenCalledWith('forGroup', 'Alfa');
      });

      test('empties the table when the service answers with another status', async () => {
         getRequestsByParam.mockResolvedValueOnce(okResponse(buildPerson(101, 'Ana')));
         getRequestsByParam.mockResolvedValueOnce({ status: 500, requests: [] });
         const { user } = renderSearch();
         await search(user, '101');
         await screen.findByText('Ana');

         await user.clear(searchInput());
         await search(user, '102');

         await waitFor(() => expect(screen.queryByText('Ana')).not.toBeInTheDocument());
         expect(screen.getByText('Escribe en el buscador para mostrar resultados')).toBeInTheDocument();
      });

      test('warns that natural persons cannot be applicants', async () => {
         getRequestsByParam.mockResolvedValue({ status: 200, requests: 'PF' });
         const { user } = renderSearch();

         await search(user, '101');

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  title: '¡Recuerda que!',
                  html: expect.stringContaining('Personas Físicas'),
               })
            )
         );
      });

      test('logs the error and stops loading when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getRequestsByParam.mockRejectedValue(new Error('boom'));
         const { user } = renderSearch();

         await search(user, '101');

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Busqueda de clientes: ', expect.any(Error)));
      });
   });

   describe('filters', () => {
      const mixedResults = () =>
         okResponse(
            buildPerson(101, 'Terminada', { idCatStatus: 12, statusRequest: 'Finalizada' }),
            buildPerson(102, 'EnCurso', { idCatStatus: 4 }),
            buildPerson(103, 'SinSolicitud', { idCatStatus: null, statusRequest: 'Sin Solicitud' })
         );

      test('shows every kind of request by default', async () => {
         getRequestsByParam.mockResolvedValue(mixedResults());
         const { user } = renderSearch();

         await search(user, '101');

         expect(await screen.findByText('Terminada')).toBeInTheDocument();
         expect(screen.getByText('EnCurso')).toBeInTheDocument();
         expect(screen.getByText('SinSolicitud')).toBeInTheDocument();
      });

      test.each([
         ['Finalizado', 'Terminada'],
         ['En curso', 'EnCurso'],
         ['Sin solicitud', 'SinSolicitud'],
      ])('hides the requests of the %s filter when it is unchecked', async (label, hiddenName) => {
         getRequestsByParam.mockResolvedValue(mixedResults());
         const { user } = renderSearch();
         await search(user, '101');
         await screen.findByText(hiddenName);

         await user.click(screen.getByLabelText(label));

         await waitFor(() => expect(screen.queryByText(hiddenName)).not.toBeInTheDocument());
         expect(screen.getByLabelText(label)).not.toBeChecked();
      });
   });

   describe('opening a result', () => {
      const open = async (person) => {
         getRequestsByParam.mockResolvedValue(okResponse(person));
         const utils = renderSearch();
         await search(utils.user, '101');
         await utils.user.click(await screen.findByText(person.fullName));
         return utils;
      };

      test('goes to the general information of a person without a request', async () => {
         const { router } = await open(
            buildPerson(101, 'Ana', { idCatStatus: null, statusRequest: 'Sin Solicitud' })
         );

         expect(router.push).toHaveBeenCalledWith('/EMG/GeneralInformation/101');
         expect(localStorage.getItem('idGroup')).toBeNull();
      });

      test('warns when the request was created by another user', async () => {
         const { router } = await open(buildPerson(101, 'Ana', { createUser: 'otro.ad' }));

         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('¡Solicitud creada por otro usuario!') })
         );
         expect(router.push).not.toHaveBeenCalled();
      });

      test('goes to the checklist of an own request in progress', async () => {
         const { router } = await open(buildPerson(101, 'Ana', { idGroup: 55, idCatTypeProcedure: 3 }));

         expect(router.push).toHaveBeenCalledWith('/EMG/Documentation/55');
      });

      test('goes to the solidary obligors page when the request is at that step', async () => {
         const { router } = await open(buildPerson(101, 'Ana', { idGroup: 55, idCatTypeProcedure: 2 }));

         expect(router.push).toHaveBeenCalledWith('/EMG/Solidary/55');
      });

      test('does not navigate for an own finished request', async () => {
         const { router } = await open(buildPerson(101, 'Ana', { idCatStatus: 12, statusRequest: 'Finalizada' }));

         expect(router.push).not.toHaveBeenCalled();
      });
   });
});
