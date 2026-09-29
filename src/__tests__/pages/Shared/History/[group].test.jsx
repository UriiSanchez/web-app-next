import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import HistoryDetails, { getServerSideProps } from '../../../../pages/Shared/History/[group]';
import { getOneRequest } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getOneRequest: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const viewer = { userAD: 'mrc.ad', path: 'MRC', idProfile: 2, status: [] };

const buildRequest = (idRequest, idCatStatus, name) => ({
   idRequest,
   idGroupRequest: 7,
   idCatStatus,
   relatedPersonResponseList: [
      { idCatTypePerson: 1, idClient: `10${idRequest}`, firstTwoLetters: 'TC', fullName: name, color: '#123456' },
      { idCatTypePerson: 2, idClient: `20${idRequest}`, fullName: `Obligado de ${name}` },
   ],
});
const buildResponse = (requests) => ({
   status: 200,
   data: {
      idGroupRequest: 7,
      isGroup: true,
      branchOffice: 'CORPORATIVO',
      arrivedSecDate: '2025-06-03T08:46:12',
      requestResponseList: requests,
   },
});
const defaultRequests = [
   buildRequest(1, 10, 'Cliente Uno'),
   buildRequest(2, 11, 'Cliente Dos'),
   buildRequest(3, 6, 'Cliente Tres'),
];

const setup = async (response = buildResponse(defaultRequests), context = { user: viewer }) => {
   getOneRequest.mockResolvedValue(response);
   const utils = renderPage(<HistoryDetails idGroup='7' />, { context });
   if (response.status === 200) await screen.findByText('Cliente Uno');
   return utils;
};

describe('getServerSideProps (Shared History group)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('Shared History group page', () => {
   describe('loading', () => {
      test('requests the group with its history and shows the request number in the title', async () => {
         await setup();

         expect(getOneRequest).toHaveBeenCalledWith('7', true);
         expect(screen.getByRole('heading', { name: 'Solicitud 0000000007' })).toBeInTheDocument();
      });

      test('shows the skeleton while the group is loading and hides it afterwards', async () => {
         getOneRequest.mockResolvedValue(buildResponse(defaultRequests));
         const { container } = renderPage(<HistoryDetails idGroup='7' />, { context: { user: viewer } });
         expect(screen.queryByText('Cliente Uno')).not.toBeInTheDocument();
         expect(container.querySelector('.box')).toBeInTheDocument();

         await screen.findByText('Cliente Uno');

         expect(screen.getByText('Solicitantes de grupo económico')).toBeInTheDocument();
      });

      test('shows the error and stops loading when the service answers with another status', async () => {
         getOneRequest.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });
         await act(async () => {
            renderPage(<HistoryDetails idGroup='7' />, { context: { user: viewer } });
         });

         await waitFor(() => expect(screen.getByText('Solicitantes de grupo económico')).toBeInTheDocument());
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
         expect(screen.queryByText('Cliente Uno')).not.toBeInTheDocument();
      });

      test('logs the error and stops loading when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getOneRequest.mockRejectedValue(new Error('boom'));

         renderPage(<HistoryDetails idGroup='7' />, { context: { user: viewer } });

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error en historial: ', expect.any(Error)));
         expect(await screen.findByText('Solicitantes de grupo económico')).toBeInTheDocument();
      });
   });

   describe('requests', () => {
      test('shows a row for each applicant with the request number and its status', async () => {
         await setup();

         expect(screen.getByText('Cliente Dos')).toBeInTheDocument();
         expect(screen.getByText('Cliente Tres')).toBeInTheDocument();
         expect(screen.getByText(/Núm de solicitud:\s*0000000007-1/)).toBeInTheDocument();
         expect(screen.getByText('Aprobada')).toBeInTheDocument();
         expect(screen.getByText('Rechazada')).toBeInTheDocument();
         expect(screen.getByText('Pendiente')).toBeInTheDocument();
      });

      test('expands and collapses the details of a request', async () => {
         const { user } = await setup();
         expect(screen.queryByText('No. de Cliente')).not.toBeInTheDocument();

         await user.click(screen.getAllByRole('button', { name: 'expand_more' })[0]);
         expect(screen.getByText('No. de Cliente')).toBeInTheDocument();
         expect(screen.getByText('101')).toBeInTheDocument();

         await user.click(screen.getByRole('button', { name: 'expand_less' }));
         expect(screen.queryByText('No. de Cliente')).not.toBeInTheDocument();
      });

      test('expands several requests independently', async () => {
         const { user } = await setup();

         // La fila 2 está rechazada y usa otra plantilla de detalles; se expanden la 1 y la 3 (aprobadas).
         await user.click(screen.getAllByRole('button', { name: 'expand_more' })[0]);
         await user.click(screen.getAllByRole('button', { name: 'expand_more' })[1]);

         expect(screen.getAllByText('No. de Cliente')).toHaveLength(2);
      });
   });

   describe('navigation', () => {
      test('goes back to the history list', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/Shared/History');
      });
   });
});
