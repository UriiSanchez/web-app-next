import { within } from '@testing-library/react';

import { TableRequests } from '../../../components';

import { useGlobalContext } from '../../../hooks';

jest.mock('../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useSourcePagination: () => ({ sourcePage: 0, totalPages: 1, loadMore: jest.fn() }),
}));

let mockData = [
   {
      idGroup: 2,
      arrivedFcDate: '',
      arrivedSecDate: '',
      groupName: 'group-2',
      numApplicants: 1,
      idCatStatus: 26,
      requestAmount: 100,
      approvedAmount: 100,
      kindGroupProcedure: 'Nuevo tramite',
      instanceEmpowered: 'FM',
      status: 'En Proceso',
      nameEmg: 'Test User Especialista',
      nameAnalyst: 'Test User Analista',
      branchOffice: 'LOMAS',
      requestResponseList: [
         {
            idRequest: 1,
            requestAmount: 100,
            approvedAmount: 100,
            kindProcedure: 'Nuevo tramite',
            authorizationNotional: 100,
            finalizeDate: '',
            relatedPersonResponseList: [{
               fullName: 'User applicant 1',
               idClient: 100,
               idCatTypePerson: 1,
            }],
         },
      ],
   },
   {
      idGroup: 3,
      arrivedFcDate: '',
      arrivedSecDate: '',
      groupName: 'group-3',
      numApplicants: 1,
      idCatStatus: 26,
      requestAmount: 300,
      approvedAmount: 300,
      kindGroupProcedure: 'Recalificación',
      instanceEmpowered: 'FM',
      status: 'En Proceso',
      requestResponseList: [
         {
            idRequest: 2,
            requestAmount: 100,
            approvedAmount: 100,
            kindProcedure: 'Recalificación',
            authorizationNotional: 100,
            finalizeDate: '',
            relatedPersonResponseList: [{
               fullName: 'User applicant 2',
               idClient: 200,
               idCatTypePerson: 1,
            }],
         },
      ],
      nameEmg: 'Test User Especialista',
      nameAnalyst: 'Test User Analista',
      branchOffice: 'LOMAS',
   },
   {
      idGroup: 4,
      arrivedFcDate: '',
      arrivedSecDate: '',
      groupName: 'group-4',
      numApplicants: 1,
      idCatStatus: 26,
      requestAmount: 200,
      approvedAmount: 200,
      kindGroupProcedure: 'Nuevo tramite',
      instanceEmpowered: 'FM',
      status: 'En Proceso',
      requestResponseList: [
         {
            idRequest: 3,
            requestAmount: 100,
            approvedAmount: 100,
            kindProcedure: 'Nuevo tramite',
            authorizationNotional: 100,
            finalizeDate: '',
            relatedPersonResponseList: [{
               fullName: 'User applicant 3',
               idClient: 300,
               idCatTypePerson: 1,
            }],
         },
      ],
      nameEmg: 'Test User Especialista',
      nameAnalyst: 'Test User Analista',
      branchOffice: 'MONTERREY',
   },
   {
      idGroup: 5,
      arrivedFcDate: '',
      arrivedSecDate: '',
      groupName: 'group-5',
      numApplicants: 1,
      idCatStatus: 26,
      requestAmount: 50,
      approvedAmount: 50,
      kindGroupProcedure: 'Grupal',
      instanceEmpowered: 'FM',
      status: 'En Proceso',
      nameEmg: 'Test User Especialista',
      nameAnalyst: 'Test User Analista',
      branchOffice: 'GUADALAJARA',
      requestResponseList: [
         {
            idRequest: 10,
            requestAmount: 100,
            approvedAmount: 100,
            kindProcedure: 'Nuevo tramite',
            authorizationNotional: 100,
            finalizeDate: '',
            relatedPersonResponseList: [{
               fullName: 'User applicant 4',
               idClient: 400,
               idCatTypePerson: 1,
            }],
         },
         {
            idRequest: 11,
            requestAmount: 200,
            approvedAmount: 200,
            kindProcedure: 'Nuevo tramite',
            authorizationNotional: 100,
            finalizeDate: '',
            relatedPersonResponseList: [{
               fullName: 'User applicant 5',
               idClient: 500,
               idCatTypePerson: 1,
            }],
         },
      ],
   },
];

let mockFACRequestHeaders = [
   { id: 'idGroup', text: 'N° de Solicitud' },
   { id: 'arrivedFcDate', text: 'LLegada de solicitud' },
   { id: 'groupName', text: 'Solicitante' },
   { id: 'numApplicants', text: '' },
   { id: 'approvedAmount', text: 'Monto de línea' },
   { id: 'kindGroupProcedure', text: 'Trámite' },
   { id: 'instanceEmpowered', text: 'Instancia Facultada' },
   { id: 'status', text: 'Sub estatus' },
   { id: 'idCatStatus', text: 'Estatus' },
];

let mockSECRequestsHeaders = [
   { id: 'idGroup', text: 'N° de Solicitud' },
   { id: 'arrivedSecDate', text: 'LLegada de solicitud' },
   { id: 'groupName', text: 'Solicitante' },
   { id: 'numApplicants', text: '' },
   { id: 'requestAmount', text: 'Monto de línea' },
   { id: 'kindGroupProcedure', text: 'Trámite' },
   { id: 'instanceEmpowered', text: 'Instancia Facultada' },
   { id: 'status', text: 'Sub estatus' },
   { id: 'idCatStatus', text: 'Estatus' },
];

let mockFacHistoryHeaders = [
   { id: 'idGroup', text: 'N° de Solicitud' },
   { id: 'arrivedFcDate', text: 'LLegada de solicitud' },
   { id: 'groupName', text: 'Solicitante' },
   { id: 'numApplicants', text: '' },
   { id: 'requestAmount', text: 'Monto de línea' },
   { id: 'kindGroupProcedure', text: 'Trámite' },
   { id: 'instanceEmpowered', text: 'Instancia Facultada' },
   { id: 'idCatStatus', text: 'Estatus' },
   { id: 'messages', text: 'Comentarios' },
];

let mockSecHistoryHeaders = [
   { id: 'idGroup', text: 'N° de solicitud' },
   { id: 'arrivedSecDate', text: 'LLegada de solicitud' },
   { id: 'groupName', text: 'Solicitante' },
   { id: 'numApplicants', text: '' },
   { id: 'requestAmount', text: 'Monto de línea' },
   { id: 'kindGroupProcedure', text: 'Trámite' },
   { id: 'instanceEmpowered', text: 'Instancia Facultada' },
   { id: 'branchOffice', text: 'Sucursal' },
   { id: 'idCatStatus', text: 'Estatus' },
   { id: 'messages', text: 'Comentarios' },
   { id: 'details', text: 'Detalles' },
];

describe('TableRequests Component', () => {
   let globalContext;
   const props = {
      data: mockData,
      typeTable: 'FAC',
      loading: false,
   };

   beforeEach(() => {
      globalContext = {
         user: { userAD: 'testuser', idProfile: 6 },
         actions: { setPagination: jest.fn(), setExpandedRows: jest.fn() },
         pagination: { currentPage: 1 },
         expandedRows: [],
      };

      useGlobalContext.mockReturnValue(globalContext);
   });

   test('it show a message when there are no requests to display', async () => {
      const {
         queries: { getByText },
      } = await renderPage(TableRequests, { ...props, data: [] });

      let emptyRow = getByText('No se encontraron registros');
      expect(emptyRow).toBeVisible();
   });

   test('show TableSkeleton when prop loading is true', async () => {
      const {
         queries: { queryAllByRole },
      } = await renderPage(TableRequests, { ...props, loading: true, data: [] });

      const [, tableBody] = queryAllByRole('rowgroup');
      const row = within(tableBody).queryAllByRole('row');
      expect(row[0]).toHaveClass('box');
   });

   test('shows a row for each element in the data array', async () => {
      const {
         queries: { queryAllByRole },
      } = await renderPage(TableRequests, props);
      const [, tableBody] = queryAllByRole('rowgroup');
      const rows = within(tableBody).queryAllByRole('row');
      expect(rows.length).toBe(4);
   });

   test('it sorts data ascending based on the column when clicking a column header twice', async () => {
      const {
         user,
         queries: { queryAllByRole, getByText },
      } = await renderPage(TableRequests, props);

      await user.click(getByText('Monto de línea'));

      const [, tableBody] = queryAllByRole('rowgroup');
      const rows = within(tableBody).queryAllByRole('row');
      expect(within(rows[0]).getByText('$50')).toBeVisible();
      expect(within(rows[1]).getByText('$100')).toBeVisible();
      expect(within(rows[2]).getByText('$200')).toBeVisible();
      expect(within(rows[3]).getByText('$300')).toBeVisible();
   });

   test('it sort the data in descending order by column when the second click is made on a column header.', async () => {
      const {
         user,
         queries: { queryAllByRole, getByText },
      } = await renderPage(TableRequests, props);

      await user.click(getByText('Monto de línea'));
      await user.click(getByText('Monto de línea'));

      const [, tableBody] = queryAllByRole('rowgroup');
      const rows = within(tableBody).queryAllByRole('row');
      expect(within(rows[0]).getByText('$300')).toBeVisible();
      expect(within(rows[1]).getByText('$200')).toBeVisible();
      expect(within(rows[2]).getByText('$100')).toBeVisible();
      expect(within(rows[3]).getByText('$50')).toBeVisible();
   });

   test('the table order is restored when a third click is made on a column heading', async () => {
      const {
         user,
         queries: { queryAllByRole, getByText },
      } = await renderPage(TableRequests, props);

      await user.click(getByText('Monto de línea'));
      await user.click(getByText('Monto de línea'));
      await user.click(getByText('Monto de línea'));

      const [, tableBody] = queryAllByRole('rowgroup');
      const rows = within(tableBody).queryAllByRole('row');
      expect(within(rows[0]).getByText('$100')).toBeVisible();
      expect(within(rows[1]).getByText('$300')).toBeVisible();
      expect(within(rows[2]).getByText('$200')).toBeVisible();
      expect(within(rows[3]).getByText('$50')).toBeVisible();
   });

   test('it should render the correct columns for typeTable SEC', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(TableRequests, { ...props, typeTable: 'SEC' });

      mockSECRequestsHeaders.forEach((head) => {
         const th = getByTestId('test-thead-' + head.id);
         expect(th).toBeInTheDocument();
         expect(th).toHaveTextContent(head.text);
      });
   });

   test('it should render the correct columns for typeTable FAC', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(TableRequests, props);

      mockFACRequestHeaders.forEach((head) => {
         const th = getByTestId('test-thead-' + head.id);
         expect(th).toBeInTheDocument();
         expect(th).toHaveTextContent(head.text);
      });
   });

   test('it should render the correct columns for typeTable FAC in page History', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(TableRequests, { ...props, typeTable: 'FAC_HISTORY' });

      mockFacHistoryHeaders.forEach((head) => {
         const th = getByTestId('test-thead-' + head.id);
         expect(th).toBeInTheDocument();
         expect(th).toHaveTextContent(head.text);
      });
   });

   test('it should render the correct columns for typeTable SEC in page History', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(TableRequests, { ...props, typeTable: 'SEC_HISTORY' });

      mockSecHistoryHeaders.forEach((head) => {
         const th = getByTestId('test-thead-' + head.id);
         expect(th).toBeInTheDocument();
         expect(th).toHaveTextContent(head.text);
      });
   });
});
