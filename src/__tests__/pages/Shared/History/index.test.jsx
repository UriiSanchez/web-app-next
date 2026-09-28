import { within, waitFor, fireEvent } from '@testing-library/react';

import HistoryPage from '../../../../pages/Shared/History';

import { useRouter } from 'next/router';
import { getQueryGraph } from '../../../../services';
import { useGlobalContext, useSourcePagination } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useSourcePagination: jest.fn(),
}));
jest.mock('../../../../services', () => ({ __esModule: true, getQueryGraph: jest.fn() }));

const mockFACData = [
   {
      idGroup: '1',
      idCatStatus: '12',
      arrivedFcDate: '2024-10-29T00:00',
      groupName: 'Solicitud 1',
      numApplicants: 1,
      requestAmount: 1000,
      kindGroupProcedure: 'Nuevo Tramite',
      instanceEmpowered: 'FM',
      messages: '',
      requestResponseList: [
         {
            idRequest: '1',
            idCatStatus: 11,
            kindProcedure: 'Nuevo Tramite',
            requestAmount: 1000,
            authorizationNotional: 100,
            finalizeDate: '2025-10-29',
            relatedPersonResponseList: [
               {
                  idClient: 1203,
                  fullName: 'Test client 1',
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: '2',
      idCatStatus: '12',
      arrivedFcDate: '2024-10-29T00:00',
      groupName: 'Solicitud 2',
      numApplicants: 2,
      requestAmount: 1000,
      kindGroupProcedure: 'Grupal',
      instanceEmpowered: 'FM',
      messages: '',
      requestResponseList: [
         {
            idRequest: '2',
            idCatStatus: 11,
            kindProcedure: 'Recalificación',
            requestAmount: 1000,
            authorizationNotional: 100,
            finalizeDate: '2025-10-29',
            relatedPersonResponseList: [
               {
                  idClient: 1203,
                  fullName: 'Test client 2',
                  idCatTypePerson: 1,
               },
            ],
         },
         {
            idRequest: '3',
            idCatStatus: 10,
            kindProcedure: 'Nuevo Tramite',
            requestAmount: 1000,
            authorizationNotional: 100,
            finalizeDate: '2025-10-29',
            relatedPersonResponseList: [
               {
                  idClient: 1203,
                  fullName: 'Test client 3',
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: '3',
      idCatStatus: '12',
      arrivedFcDate: '2024-10-29T00:00',
      groupName: 'Solicitud 3',
      numApplicants: 1,
      requestAmount: 1000,
      kindGroupProcedure: 'Nuevo Tramite',
      instanceEmpowered: 'FM',
      messages: '',
      requestResponseList: [
         {
            idRequest: '4',
            idCatStatus: 11,
            kindProcedure: 'Nuevo Tramite',
            requestAmount: 1000,
            authorizationNotional: 100,
            finalizeDate: '2025-10-29',
            relatedPersonResponseList: [
               {
                  idClient: 1203,
                  fullName: 'Test client 4',
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: '4',
      idCatStatus: '12',
      arrivedFcDate: '2024-10-29T00:00',
      groupName: 'Solicitud 4',
      numApplicants: 3,
      requestAmount: 1000,
      kindGroupProcedure: 'Grupal',
      instanceEmpowered: 'FM',
      messages: '',
      requestResponseList: [
         {
            idRequest: '5',
            idCatStatus: 11,
            kindProcedure: 'Recalificación',
            requestAmount: 1000,
            authorizationNotional: 100,
            finalizeDate: '2025-10-29',
            relatedPersonResponseList: [
               {
                  idClient: 656,
                  fullName: 'Test client 5',
                  idCatTypePerson: 1,
               },
            ],
         },
         {
            idRequest: '6',
            idCatStatus: 10,
            kindProcedure: 'Nuevo Tramite',
            requestAmount: 1000,
            authorizationNotional: 100,
            finalizeDate: '2025-10-29',
            relatedPersonResponseList: [
               {
                  idClient: 456,
                  fullName: 'Test client 6',
                  idCatTypePerson: 1,
               },
            ],
         },
         {
            idRequest: '7',
            idCatStatus: 10,
            kindProcedure: 'Incremento',
            requestAmount: 1000,
            authorizationNotional: 100,
            finalizeDate: '2025-10-29',
            relatedPersonResponseList: [
               {
                  idClient: 232,
                  fullName: 'Test client 7',
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
];

describe('History page', () => {
   let routerMock;
   let globalContextMock;
   let serviceMock;

   beforeEach(() => {
      routerMock = {
         push: jest.fn(),
      };

      globalContextMock = {
         user: { idProfile: 3 },
         expandedRows: [],
         actions: { setPagination: jest.fn(), setExpandedRows: jest.fn() },
         pagination: { currentPage: 1 },
      };

      serviceMock = {
         status: 200,
         data: [],
      };

      useSourcePagination.mockReturnValue({ sourcePage: 0, setTotalPages: jest.fn() });
      useGlobalContext.mockReturnValue(globalContextMock);
      useRouter.mockReturnValue(routerMock);
      getQueryGraph.mockResolvedValue(serviceMock);
   });

   test('render search section with input and button', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(HistoryPage);

      expect(getByRole('searchbox')).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
   });

   test('updates input value on change', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(HistoryPage);
      const input = getByRole('searchbox');
      fireEvent.change(input, { target: { value: 'test user' } });
      expect(input.value).toBe('test user');
   });

   test('show message for empty data', async () => {
      const {
         queries: { queryAllByRole },
      } = await renderPage(HistoryPage);
      const [, tBody] = queryAllByRole('rowgroup');
      const emptyRow = within(tBody).queryAllByRole('row');
      expect(emptyRow.length).toBe(1);
      expect(emptyRow[0].textContent).toBe('No hay solicitudes por revisar');
   });

   test('shows an error if the request response status is different than 200', async () => {
      serviceMock = { status: 500, error: 'Test error message' };
      getQueryGraph.mockResolvedValue(serviceMock);

      const {
         user,
         queries: { getByText },
      } = await renderPage(HistoryPage, {}, { delay: null });

      await waitFor(() => expect(getByText('¡Error interno del servidor!')).toBeVisible());
      expect(getByText('[ Test error message ]')).toBeVisible();
   });

   describe('Render data for profile FAC in the page History', () => {
      beforeEach(() => {
         globalContextMock.user.idProfile = 6;
         serviceMock.status = 200;
         serviceMock.data = mockFACData;
      });

      test('shows a row for each element in the data array for FAC', async () => {
         const {
            queries: { queryAllByRole },
         } = await renderPage(HistoryPage);

         const [, tableBody] = queryAllByRole('rowgroup');

         expect(within(tableBody).queryAllByRole('row').length).toBe(4);
      });
   });
});
