import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import TrackingDetails from '../../../../components/Tables/Details/TrackingDetails';
import { getDetailsTrackingForIdRequest } from '../../../../services';
import { renderComponent } from '../../../utils/render';

jest.mock('../../../../services', () => ({ getDetailsTrackingForIdRequest: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const listRequests = [
   { idRequest: 100, kindProcedure: 'Nuevo Tramite' },
   { idRequest: 200, kindProcedure: 'Ampliacion' },
];
const listApplicants = [
   { idClient: 1, idRequest: 100, fullName: 'Ana Lopez', idCatStatus: 4 },
   { idClient: 2, idRequest: 200, fullName: 'Luis Perez', idCatStatus: 4 },
];
const movementsFor = (fullName) => ({
   status: 200,
   data: {
      trackingDetailResponse: [
         { idTracking: 1, profile: 'ANALISTA', flagDevolution: false, fullName, createDate: '2025-06-03T08:46:12' },
      ],
   },
});

const renderDetails = (props = {}) =>
   renderComponent(
      <TrackingDetails
         onExpand={jest.fn()}
         isGroup={false}
         idGroup={5}
         requestPerGroup={2}
         listRequests={listRequests}
         groupName='Grupo Alfa'
         listApplicants={listApplicants}
         {...props}
      />
   );

describe('TrackingDetails', () => {
   test('shows the group header, the procedure and the movements of the first request', async () => {
      getDetailsTrackingForIdRequest.mockResolvedValue(movementsFor('Ana Lopez'));

      renderDetails();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Grupo Alfa' })).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/Esta solicitud es/)).toHaveTextContent('Esta solicitud es un Nuevo Tramite');
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(await screen.findByText('Ana Lopez')).toBeInTheDocument();
      expect(getDetailsTrackingForIdRequest).toHaveBeenCalledWith(100);
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
   });

   test('does not show the applicant select for an individual request', async () => {
      getDetailsTrackingForIdRequest.mockResolvedValue(movementsFor('Ana Lopez'));

      renderDetails({ isGroup: false });
      await screen.findByText('Ana Lopez');

      expect(screen.queryByTestId('tracking-select')).not.toBeInTheDocument();
   });

   test('loads the movements of the applicant chosen in a group', async () => {
      getDetailsTrackingForIdRequest.mockImplementation(async (idRequest) =>
         movementsFor(idRequest === 100 ? 'Movimiento de Ana' : 'Movimiento de Luis')
      );
      const { user } = renderDetails({ isGroup: true });
      await screen.findByText('Movimiento de Ana');

      await user.click(screen.getByTestId('tracking-select').firstChild);
      await user.click(screen.getByText('Luis Perez'));

      expect(await screen.findByText('Movimiento de Luis')).toBeInTheDocument();
      expect(getDetailsTrackingForIdRequest).toHaveBeenLastCalledWith(200);
      expect(screen.getByText(/Esta solicitud es/)).toHaveTextContent('Esta solicitud es una Ampliacion');
   });

   test('reports the error and shows no movements when the service fails', async () => {
      getDetailsTrackingForIdRequest.mockResolvedValue({ status: 400, data: {} });

      renderDetails();

      expect(await screen.findByText('No se encontraron movimientos')).toBeInTheDocument();
      await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
   });

   test('asks the parent to close the panel when the backdrop is clicked', async () => {
      getDetailsTrackingForIdRequest.mockResolvedValue(movementsFor('Ana Lopez'));
      const onExpand = jest.fn();
      const { user } = renderDetails({ onExpand });
      await screen.findByText('Ana Lopez');

      // El fondo no tiene rol ni texto: es el hermano previo del diálogo.
      await user.click(screen.getByRole('dialog').previousElementSibling);

      expect(onExpand).toHaveBeenCalledTimes(1);
   });
});
