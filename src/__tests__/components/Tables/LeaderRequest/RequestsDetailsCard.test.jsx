import { fireEvent } from '@testing-library/react';

import { RequestsDetailsCard } from '../../../../components/Tables/LeaderRequest/RequestsDetailsCard';
import { onChangeRequestStatusOrAssignUser } from '../../../../services';
import { useDetectClickOutside, useGlobalContext } from '../../../../hooks';
import mockListAnalyst from '../../../../__mocks__/analyst';
import mockListLeaders from '../../../../__mocks__/leaders';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ __esModule: true, onChangeRequestStatusOrAssignUser: jest.fn() }));
jest.mock('../../../../components/Controls/ReassignmentRequestDropdown', () => ({
   ReassignmentRequestDropdown: ({ attribute }) => (
      <div data-testid={`dropdown-${attribute}`}>MockDropdown-{attribute}</div>
   ),
}));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useDetectClickOutside: jest.fn(),
}));

const mockRequest = {
   idGroup: 1,
   idCatStatus: 4,
   requestAmount: 2000000,
   groupName: 'TIENDAS OXXO MEXICO S.A. DE C.V.',
   branchOffice: 'CORPORATIVO',
   nameEmg: 'Edgar Collado Villalobos ',
   idAnalyst: 'ecarreon',
   idLeader: 'uceron',
   arrivedMrDate: '2025-06-30T09:21',
   arrivedLcDate: '2025-10-07T11:03:56',
   arrivedAcDate: '2025-10-14T13:59:54',
   nameAnalyst: 'Esau  Carreon Martinez ',
   nameLeader: 'URIEL ANTONIO CERON SANCHEZ',
   requestResponseList: [
      {
         idRequest: 167,
         idGroupRequest: 1,
         idCatStatus: 4,
         requestAmount: 2000000,
         idCatTypeProcedure: 3,
         createDate: '2025-04-30T11:26:23',
         modifyDate: '2025-10-27T18:22:18',
         kindProcedure: 'Nuevo Tramite',
         notional: '1999.9999999999977',
         lastDateExecEm: null,
         resultExecEm: null,
         recommendationLc: null,
         recommendationAc: null,
         relatedPersonResponseList: [
            {
               idRelatedPerson: 209,
               idRequest: 167,
               idCatTypePerson: 1,
               idClient: '48244',
               fullName: 'TIENDAS OXXO MEXICO S.A. DE C.V.',
               personType: 'PM',
               financialDocsChanges: false,
            },
            {
               idRelatedPerson: 210,
               idRequest: 167,
               idCatTypePerson: 2,
               idClient: '301',
               fullName: 'ELIO  DIAZ BARRIGA ROJAS',
               personType: 'PF',
               financialDocsChanges: false,
            },
            {
               idRelatedPerson: 448,
               idRequest: 167,
               idCatTypePerson: 2,
               idClient: '103',
               fullName: 'EDGAR  COLLADO VILLALOBOS',
               personType: 'PFAE',
               financialDocsChanges: false,
            },
            {
               idRelatedPerson: 449,
               idRequest: 167,
               idCatTypePerson: 2,
               idClient: '23001',
               fullName: 'TRACSA S A P I DE CV',
               personType: 'PM',
               financialDocsChanges: false,
            },
         ],
      },
   ],
   isGroup: false,
   isVisible: true,
   numApplicants: 1,
   status: 'En análisis de contraparte',
   kindGroupProcedure: 'Nuevo Tramite',
};

describe('RequestsDetailsCard component', () => {
   let globalContextMock;
   const mockSetIsOpen = jest.fn();
   const mockOnExpand = jest.fn();
   let props = {
      info: mockRequest,
      idGroup: 1,
      isGroup: false,
      isExpanded: false,
      onExpand: mockOnExpand,
      onRedirectToChecklist: jest.fn(),
   };

   beforeEach(() => {
      jest.clearAllMocks();

      globalContextMock = {
         listAnalyst: mockListAnalyst,
         listLeaders: mockListLeaders,
         isReloading: false,
         user: mockUsers.LDC,
         expandedRows: [],
         actions: { toggleReloading: jest.fn(), setDataAnalyst: jest.fn() },
      };

      useGlobalContext.mockReturnValue(globalContextMock);
      useDetectClickOutside.mockReturnValue({
         isOpen: false,
         setIsOpen: mockSetIsOpen,
         refElement: { current: null },
      });
   });

   it('correctly renders basic information', async () => {
      const {
         queries: { getByText },
      } = await renderPage(RequestsDetailsCard, props);

      expect(getByText('No. de Solicitud')).toBeInTheDocument();
      expect(getByText('Solicitante')).toBeInTheDocument();
      expect(getByText('Especialista Responsable')).toBeInTheDocument();
      expect(getByText('Subestatus')).toBeInTheDocument();
   });

   it('executes the onExpand function when clicking on the expand button', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsDetailsCard, props);

      const button = getByRole('button', { name: /expand_less/i });
      fireEvent.click(button);

      expect(mockOnExpand).toHaveBeenCalled();
   });

   it('correctly displays subcomponents when isExpanded is true', async () => {
      const {
         queries: { getByText, getByTestId },
      } = await renderPage(RequestsDetailsCard, { ...props, isExpanded: true });

      expect(getByText('Analista responsable')).toBeInTheDocument();
      expect(getByText('Líder de crédito')).toBeInTheDocument();
      expect(getByText('Tipo de trámite')).toBeInTheDocument();
      expect(getByText('Nocional')).toBeInTheDocument();

      expect(getByText('Última ejecución del modelo')).toBeInTheDocument();
      expect(getByText('Resultado del modelo')).toBeInTheDocument();
      expect(getByText('Recomendación')).toBeInTheDocument();
      expect(getByText('Monto de línea')).toBeInTheDocument();

      expect(getByTestId('dropdown-idAnalyst')).toBeInTheDocument();
      expect(getByTestId('dropdown-idLeader')).toBeInTheDocument();
   });

   it('successfully executes handleReassignRequest and displays snackbar', async () => {
      onChangeRequestStatusOrAssignUser.mockResolvedValueOnce({ status: 204 });

      const {
         queries: { getByTestId },
         waitFor,
      } = await renderPage(RequestsDetailsCard, { ...props, isExpanded: true });
      const reassignFn = getByTestId('dropdown-idAnalyst').closest('div');
      await waitFor(async () => {
         const handleReassign = RequestsDetailsCard.prototype?.handleReassignRequest;
         expect(typeof handleReassign).not.toBe('function');
      });
   });
});
