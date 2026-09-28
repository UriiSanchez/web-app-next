import SearchPage from '../../pages';

import { getRequestsByParam } from '../../services';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../services', () => ({ getRequestsByParam: jest.fn() }));
jest.mock('../../components/Layout', () => ({ MainLayout: ({ children }) => children }));
jest.mock('../../hooks', () => {
   const originalModule = jest.requireActual('../../hooks');

   return {
      __esModule: true,
      ...originalModule,
      useGlobalContext: () => ({
         user: {},
         actions: { setPagination: jest.fn(), setExpandedRows: jest.fn() },
         pagination: { currentPage: 1 },
         expandedRows: [],
      }),
      useSourcePagination: () => ({}),
   };
});

const mockData = [
   { idClient: 1, fullName: 'test name', idGroup: 1, group: 'test group', idCatStatus: 1, statusRequest: "En Proceso", isVisible: true },
   { idClient: 2, fullName: 'test name', idGroup: 2, group: 'test group', idCatStatus: 2, statusRequest: "En Proceso", isVisible: true },
   { idClient: 3, fullName: 'test name', idGroup: 3, group: 'test group', idCatStatus: null, statusRequest: "Sin Solicitud", isVisible: true },
   {
      idClient: 4,
      fullName: 'test name',
      idGroup: 4,
      group: 'test group',
      idCatStatus: 12,
      statusRequest: 'Finalizada',
      isVisible: true,
   },
   {
      idClient: 5,
      fullName: 'test name',
      idGroup: 5,
      group: 'test group',
      idCatStatus: 12,
      statusRequest: 'Finalizada',
      isVisible: true,
   },
   {
      idClient: 6,
      fullName: 'test name',
      idGroup: 6,
      group: 'test group',
      idCatStatus: 12,
      statusRequest: 'Finalizada',
      isVisible: true,
   },
];

const selectSearchOption = async (user, getByRole, option) => {
   await user.click(getByRole('button', { name: 'arrow_downward' }));
   await user.click(getByRole('button', { name: option }));
};

describe('Search page', () => {
   beforeEach(() => {
      getRequestsByParam.mockResolvedValue({
         status: 200,
         requests: mockData,
      });
   });

   describe('when writing in search input', () => {
      test('it should allow only numbers when selecting "Número de Persona"', async () => {
         const {
            user,
            queries: { getByRole, queryByDisplayValue },
         } = await renderPage(SearchPage);

         await selectSearchOption(user, getByRole, 'Número de persona');
         await user.type(getByRole('searchbox'), '23test34');

         expect(queryByDisplayValue('2334')).toBeInTheDocument();
      });

      test('it should allow any character when selecting "Nombre de persona"', async () => {
         const {
            user,
            queries: { getByRole, queryByDisplayValue },
         } = await renderPage(SearchPage);

         await selectSearchOption(user, getByRole, 'Nombre de persona');
         await user.type(getByRole('searchbox'), '23test34');

         expect(queryByDisplayValue('23test34')).toBeInTheDocument();
      });

      test('it should allow any character when selecting "Grupo económico"', async () => {
         const {
            user,
            queries: { getByRole, queryByDisplayValue },
         } = await renderPage(SearchPage);

         await selectSearchOption(user, getByRole, 'Grupo económico');
         await user.type(getByRole('searchbox'), '23test34');

         expect(queryByDisplayValue('23test34')).toBeInTheDocument();
      });
   });

   describe('when pressing enter on search input', () => {
      test('it calls get requests service with idClient query if "Número de persona" option is selected', async () => {
         const {
            user,
            queries: { getByRole },
         } = await renderPage(SearchPage);

         await selectSearchOption(user, getByRole, 'Número de persona');
         await user.type(getByRole('searchbox'), '12345');
         await user.keyboard('{Enter}');

         expect(getRequestsByParam).toHaveBeenCalledWith('forNumber', 'idClient=12345&typeSolEnum=ALL');
      });

      test('it calls get requests service with just the typed string if "Nombre de persona" option is selected', async () => {
         const {
            user,
            queries: { getByRole },
         } = await renderPage(SearchPage);

         await selectSearchOption(user, getByRole, 'Nombre de persona');
         await user.type(getByRole('searchbox'), 'search message');
         await user.keyboard('{Enter}');

         expect(getRequestsByParam).toHaveBeenCalledWith('forName', 'search message');
      });

      test('it calls get requests service with just the typed string if "Grupo económico" option is selected', async () => {
         const {
            user,
            queries: { getByRole },
         } = await renderPage(SearchPage);

         await selectSearchOption(user, getByRole, 'Grupo económico');
         await user.type(getByRole('searchbox'), 'search message');
         await user.keyboard('{Enter}');

         expect(getRequestsByParam).toHaveBeenCalledWith('forGroup', 'search message');
      });
   });

   describe('when clicking on the filter checkboxes', () => {
      test('it filters out assigned requests if checkbox "En proceso" is uncheck', async () => {
         const {
            user,
            queries: { getByRole, queryAllByRole },
         } = await renderPage(SearchPage);

         await user.type(getByRole('searchbox'), '1');
         await user.keyboard('{Enter}');
         await user.click(getByRole('checkbox', { name: 'En curso' }));

         expect(queryAllByRole('row', { name: /En Proceso/ }).length).toBe(0);
         expect(queryAllByRole('row', { name: /Sin Solicitud/ }).length).toBe(1);
         expect(queryAllByRole('row', { name: /Finalizada/ }).length).toBe(3);
      });

      test('it filters out unassigned requests if checkbox "Sin Solicitud" is uncheck', async () => {
         const {
            user,
            queries: { getByRole, queryAllByRole },
         } = await renderPage(SearchPage);

         await user.type(getByRole('searchbox'), '1');
         await user.keyboard('{Enter}');
         await user.click(getByRole('checkbox', { name: 'Sin solicitud' }));

         expect(queryAllByRole('row', { name: /En Proceso/ }).length).toBe(2);
         expect(queryAllByRole('row', { name: /Sin Solicitud/ }).length).toBe(0);
         expect(queryAllByRole('row', { name: /Finalizada/ }).length).toBe(3);
      });

      test('it filters out unassigned requests if checkbox "Finalizado" is uncheck', async () => {
         const {
            user,
            queries: { getByRole, queryAllByRole },
         } = await renderPage(SearchPage);

         await user.type(getByRole('searchbox'), '1');
         await user.keyboard('{Enter}');
         await user.click(getByRole('checkbox', { name: 'Finalizado' }));

         expect(queryAllByRole('row', { name: /En Proceso/ }).length).toBe(2);
         expect(queryAllByRole('row', { name: /Sin Solicitud/ }).length).toBe(1);
         expect(queryAllByRole('row', { name: /Finalizada/ }).length).toBe(0);
      });
   });
});
