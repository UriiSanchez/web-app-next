import { screen, waitFor, within } from '@testing-library/react';
import Swal from 'sweetalert2';

import RequestsReview from '../../../../pages/LDC/RequestsReview';
import { getQueryGraph } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getQueryGraph: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const STATUS = '3, 4, 5, 6, 8, 9, 22, 26';
const listAnalyst = [
   { userAD: 'user1', fullName: 'Ana Analista', color: '#111111', requestsAssigned: 2, firstLetters: 'AA' },
   { userAD: 'user2', fullName: 'Beto Analista', color: '#222222', requestsAssigned: 1, firstLetters: 'BA' },
];
const listLeaders = [
   { userAD: 'lc1', fullName: 'Lider Uno' },
   { userAD: 'lc2', fullName: 'Lider Dos' },
];

const buildItem = (idGroup, idAnalyst, idLeader) => ({
   idGroup,
   groupName: `Cliente ${idGroup}`,
   isGroup: false,
   idAnalyst,
   idLeader,
   idCatStatus: 5,
   nameEmg: 'Ema Especialista',
   status: 'En análisis',
   requestResponseList: [
      { idRequest: idGroup * 10, requestAmount: 1000, notional: '10', kindProcedure: 'Nuevo', relatedPersonResponseList: [] },
   ],
});
const items = [buildItem(1, 'user1', 'lc1'), buildItem(2, 'user2', 'lc1'), buildItem(3, 'user1', 'lc2')];
const okResponse = (data = items) => ({ status: 200, data });

const renderReview = (context = {}) =>
   renderPage(<RequestsReview />, { context: { listAnalyst, listLeaders, ...context } });
const card = (idGroup) => screen.queryByTestId(`card-group-${idGroup}`);
const visibleCards = () => [1, 2, 3].filter((id) => card(id));
const total = () => screen.getByTestId('total-requests');

describe('LDC RequestsReview page', () => {
   describe('loading requests', () => {
      test('requests the leader statuses without a name filter', async () => {
         getQueryGraph.mockResolvedValue(okResponse());

         renderReview();

         await waitFor(() => expect(card(1)).toBeInTheDocument());
         expect(getQueryGraph).toHaveBeenCalledTimes(1);
         expect(getQueryGraph).toHaveBeenCalledWith({ status: STATUS });
      });

      test('shows the skeleton while loading and then one card per request with the total', async () => {
         getQueryGraph.mockResolvedValue(okResponse());

         renderReview();

         expect(screen.getByTestId('skeleton-requests-container')).toBeInTheDocument();
         await waitFor(() => expect(visibleCards()).toEqual([1, 2, 3]));
         expect(screen.queryByTestId('skeleton-requests-container')).not.toBeInTheDocument();
         expect(total()).toHaveTextContent('3');
         expect(screen.getByRole('heading', { name: 'Solicitudes' })).toBeInTheDocument();
         expect(screen.getByText('Cliente 2')).toBeInTheDocument();
      });

      test('shows the empty message and a zero total when there are no requests', async () => {
         getQueryGraph.mockResolvedValue(okResponse([]));

         renderReview();

         expect(await screen.findByText('No hay solicitudes por revisar')).toBeInTheDocument();
         expect(total()).toHaveTextContent('0');
      });

      test('shows the error and stops loading when the service answers with another status', async () => {
         getQueryGraph.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderReview();

         expect(await screen.findByText('No hay solicitudes por revisar')).toBeInTheDocument();
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
      });

      test('logs the error and stops loading when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getQueryGraph.mockRejectedValue(new Error('boom'));

         renderReview();

         expect(await screen.findByText('No hay solicitudes por revisar')).toBeInTheDocument();
         expect(consoleSpy).toHaveBeenCalledWith('Error al obtener las solicitudes', expect.any(Error));
      });

      test('reloads the requests when the global reload flag changes', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { updateContext } = renderReview();
         await waitFor(() => expect(card(1)).toBeInTheDocument());

         updateContext({ isReloading: true });

         await waitFor(() => expect(getQueryGraph).toHaveBeenCalledTimes(2));
         expect(getQueryGraph).toHaveBeenLastCalledWith({ status: STATUS });
      });
   });

   describe('analyst filter', () => {
      test('lists the analysts with their assigned requests', async () => {
         getQueryGraph.mockResolvedValue(okResponse());

         renderReview();

         expect(screen.getByText('ANA ANALISTA')).toBeInTheDocument();
         expect(screen.getByText('BETO ANALISTA')).toBeInTheDocument();
         await waitFor(() => expect(card(1)).toBeInTheDocument());
      });

      test('shows only the requests of the selected analyst and restores them when selected again', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { user } = renderReview();
         await waitFor(() => expect(visibleCards()).toEqual([1, 2, 3]));

         await user.click(screen.getByText('ANA ANALISTA'));
         expect(visibleCards()).toEqual([1, 3]);
         expect(total()).toHaveTextContent('3');

         await user.click(screen.getByText('ANA ANALISTA'));
         expect(visibleCards()).toEqual([1, 2, 3]);
      });

      test('switches to the requests of another analyst', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { user } = renderReview();
         await waitFor(() => expect(visibleCards()).toEqual([1, 2, 3]));
         await user.click(screen.getByText('ANA ANALISTA'));

         await user.click(screen.getByText('BETO ANALISTA'));

         expect(visibleCards()).toEqual([2]);
      });
   });

   describe('leader filter', () => {
      const openLeaders = async (user) => user.click(screen.getByRole('button', { name: /Líder/ }));

      test('shows only the requests of the selected leaders', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { user } = renderReview();
         await waitFor(() => expect(visibleCards()).toEqual([1, 2, 3]));

         await openLeaders(user);
         await user.click(screen.getByRole('checkbox', { name: 'Lider Dos' }));
         expect(visibleCards()).toEqual([3]);

         await user.click(screen.getByRole('checkbox', { name: 'Lider Uno' }));
         expect(visibleCards()).toEqual([1, 2, 3]);

         await user.click(screen.getByRole('checkbox', { name: 'Lider Dos' }));
         expect(visibleCards()).toEqual([1, 2]);
      });

      test('combines the analyst and leader filters', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { user } = renderReview();
         await waitFor(() => expect(visibleCards()).toEqual([1, 2, 3]));

         await user.click(screen.getByText('ANA ANALISTA'));
         await openLeaders(user);
         await user.click(screen.getByRole('checkbox', { name: 'Lider Uno' }));

         expect(visibleCards()).toEqual([1]);
      });

      test('restores every request once the leaders are unchecked', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { user } = renderReview();
         await waitFor(() => expect(visibleCards()).toEqual([1, 2, 3]));
         await openLeaders(user);
         await user.click(screen.getByRole('checkbox', { name: 'Lider Dos' }));

         await user.click(screen.getByRole('checkbox', { name: 'Lider Dos' }));

         expect(visibleCards()).toEqual([1, 2, 3]);
      });
   });

   describe('search by name', () => {
      test('requests the requests filtered by the typed name after the debounce', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { user } = renderReview();
         await waitFor(() => expect(visibleCards()).toEqual([1, 2, 3]));
         getQueryGraph.mockResolvedValue(okResponse([items[1]]));

         await user.type(screen.getByPlaceholderText('Busca por nombre o grupo'), 'Cliente 2');

         await waitFor(() => expect(getQueryGraph).toHaveBeenLastCalledWith({ status: STATUS, name: 'Cliente 2' }), {
            timeout: 3000,
         });
         await waitFor(() => expect(visibleCards()).toEqual([2]));
         expect(getQueryGraph).toHaveBeenCalledTimes(2);
      });

      test('requests everything again when the name is erased', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { user } = renderReview();
         await waitFor(() => expect(visibleCards()).toEqual([1, 2, 3]));
         const input = screen.getByPlaceholderText('Busca por nombre o grupo');
         await user.type(input, 'X');
         await waitFor(() => expect(getQueryGraph).toHaveBeenCalledTimes(2), { timeout: 3000 });

         await user.clear(input);

         await waitFor(() => expect(getQueryGraph).toHaveBeenCalledTimes(3), { timeout: 3000 });
         expect(getQueryGraph).toHaveBeenLastCalledWith({ status: STATUS });
      });
   });

   describe('opening a request', () => {
      test('goes to the checklist only when the active user is the leader of the request', async () => {
         getQueryGraph.mockResolvedValue(okResponse());
         const { user, router } = renderReview({ user: { userAD: 'lc1', path: 'LDC', idProfile: 4, status: [] } });
         await waitFor(() => expect(card(1)).toBeInTheDocument());

         await user.click(card(3));
         expect(router.push).not.toHaveBeenCalled();

         await user.click(card(1));
         expect(router.push).toHaveBeenCalledWith('/LDC/Documentation/1');
      });

      test('shows the request details of the card', async () => {
         getQueryGraph.mockResolvedValue(okResponse([items[0]]));

         renderReview();

         const cardElement = await screen.findByTestId('card-group-1');
         expect(within(cardElement).getByText('Cliente 1')).toBeInTheDocument();
         expect(within(cardElement).getByText('Ema Especialista')).toBeInTheDocument();
         expect(within(cardElement).getByText('En análisis')).toBeInTheDocument();
      });
   });
});
