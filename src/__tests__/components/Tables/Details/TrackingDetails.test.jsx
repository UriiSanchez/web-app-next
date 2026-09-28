import TrackingDetails from '../../../../components/Tables/Details/TrackingDetails';
import { getDetailsTrackingForIdRequest } from '../../../../services';

jest.mock('../../../../services', () => ({ __esModule: true, getDetailsTrackingForIdRequest: jest.fn() }));

const mockListRequests = [
   {
      idRequest: 1,
      idGroupRequest: 1,
      idCatStatus: 4,
      kindProcedure: 'Nuevo Tramite',
      relatedPersonResponseList: [
         {
            idClient: '38100',
            fullName: 'SOLICITANTE 1',
            idRequest: 1,
            idCatTypePerson: 1,
         },
      ],
   },
   {
      idRequest: 2,
      idGroupRequest: 1,
      idCatStatus: 4,
      kindProcedure: 'Modificacion',
      relatedPersonResponseList: [
         {
            idClient: '3230',
            fullName: 'SOLICITANTE 2',
            idRequest: 2,
            idCatTypePerson: 1,
         },
      ],
   },
];
const mockListApplicants = [
   { idRequest: 1, idClient: 2134, fullName: 'Solicitante 1', idCatStatus: 10 },
   { idRequest: 2, idClient: 4312, fullName: 'Solicitante 2', idCatStatus: 11 },
];

describe('Tracking Details Component', () => {
   const props = {
      isGroup: true,
      idGroup: 1,
      requestPerGroup: 2,
      listRequests: mockListRequests,
      listApplicants: mockListApplicants,
      groupName: 'Grupo de Prueba',
   };
   const mockOnExpand = jest.fn();
   let serviceMock;
   const mockApiErrorResponse = { status: 500 };

   beforeEach(() => {
      serviceMock = {
         status: 200,
         data: {
            trackingDetailResponse: [
               {
                  idTracking: 1002,
                  profile: 'MESA RECEPTORA',
                  idCatStatus: 2,
                  flagDevolution: false,
                  fullName: 'USER TEST MR',
                  createDate: '2025-08-13T10:45:20',
               },
            ],
         },
      };

      getDetailsTrackingForIdRequest.mockResolvedValue(serviceMock);
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   test('it must reorder the initial information and the table of movements in group mode', async () => {
      const {
         queries: { getByText, getByTestId },
      } = await renderPage(TrackingDetails, { ...props, onExpand: mockOnExpand });

      // Verificar que el nombre del grupo y la cantidad de solicitudes se renderizan
      expect(getByText('Grupo de Prueba')).toBeInTheDocument();
      expect(getByText('2')).toBeInTheDocument();
      // Verificar que también se muestre el primer solicitante
      expect(getByText(/SOLICITANTE 1/i)).toBeInTheDocument();
      // Verificar que el tipo de trámite inicial se renderice
      expect(getByText(/Nuevo Tramite/i)).toBeInTheDocument();

      // Verificar que el componente TrackingSelect se renderice
      expect(getByTestId('tracking-select')).toBeInTheDocument();

      // Verificar que la API fue llamada con el idRequest de la primera solicitud.
      expect(getDetailsTrackingForIdRequest).toHaveBeenCalledWith(1);
   });

   test('it should render without TrackingSelect and with the initial information in non-group mode.', async () => {
      let newMockRequests = [mockListRequests[1]];
      const {
         queries: { getByText, getByTestId },
      } = await renderPage(TrackingDetails, {
         isGroup: false,
         requestPerGroup: 1,
         groupName: 'Solicitante 2',
         listRequests: newMockRequests,
         onExpand: mockOnExpand,
      });

      expect(getByText('Solicitante 2')).toBeInTheDocument();
      expect(getByText('1')).toBeInTheDocument();

      // Verificar que el tipo de trámite inicial se renderice
      expect(getByText(/Modificacion/i)).toBeInTheDocument();

      // Verificar que la API fue llamada con el idRequest de la primera solicitud.
      expect(getDetailsTrackingForIdRequest).toHaveBeenCalledWith(2);
   });
});
