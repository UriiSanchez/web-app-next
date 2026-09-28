import { fireEvent, getByText, within } from '@testing-library/react';
import { useRouter } from 'next/router';

import RequestsReview from '../../../../pages/LDC/RequestsReview';
import { getQueryGraph, onAssignAnalystToRequest } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import { mockRequestChangeFinancials, mockRequestNoChangeFinancials } from '../../../../__mocks__/request';
import mockListAnalyst from '../../../../__mocks__/analyst';
import mockListLeaders from '../../../../__mocks__/leaders';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getQueryGraph: jest.fn(),
   onAssignAnalystToRequest: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../components/Filters', () => ({
   FilterSearchByName: ({ onSetValue }) => (
      <input
         data-testid='search-filter'
         placeholder='Buscar'
         onChange={(e) => onSetValue('byGroupName', e.target.value)}
      />
   ),
   FilterCustomCheck: ({ onSetCheckFilter }) => (
      <button data-testid='leader-filter' onClick={() => onSetCheckFilter(['L1'])}>
         Filtro líder
      </button>
   ),
}));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');
   return { ...originalModule, useGlobalContext: jest.fn(), useDebounce: jest.fn((value) => value) };
});

describe('RequestsReview page', () => {
   let globalContextMock;
   const pushMock = jest.fn();
   const mockToggleLoading = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();

      globalContextMock = {
         listAnalyst: mockListAnalyst,
         listLeaders: mockListLeaders,
         isReloading: false,
         user: mockUsers.LDC,
         expandedRows: [],
         actions: { toggleReloading: jest.fn(), toggleLoading: mockToggleLoading, setExpandedRows: jest.fn() },
      };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      getQueryGraph.mockResolvedValue(mockRequestChangeFinancials);
   });

   test('it should display a message when there are no requests to show', async () => {
      getQueryGraph.mockResolvedValueOnce({ status: 200, data: [] });

      const {
         queries: { getByText },
      } = await renderPage(RequestsReview);

      expect(getByText('No hay solicitudes por revisar')).toBeVisible();
   });

   test('shows the total number of requests returned by getQueryGraph', async () => {
      getQueryGraph.mockResolvedValueOnce(mockRequestChangeFinancials);
      const {
         queries: { getByTestId, getByText },
      } = await renderPage(RequestsReview);

      expect(getByText('Total de casos activos')).toBeInTheDocument();
      expect(getByTestId('total-requests')).toBeInTheDocument();
      expect(getByTestId('total-requests')).toHaveTextContent(mockRequestChangeFinancials.data.length);
   });

   test('Runs fetchAsynData again when the text in the search box is changed.', async () => {
      const {
         queries: { getByTestId },
         waitFor,
      } = await renderPage(RequestsReview);

      const searchInput = getByTestId('search-filter');
      fireEvent.change(searchInput, { target: { value: 'Grupo A' } });

      await waitFor(() => {
         expect(getQueryGraph).toHaveBeenCalledWith({
            status: '3, 4, 5, 6, 8, 9, 22, 26',
            name: 'Grupo A',
         });
      });
   });

   test('correctly applies the filter by leader when using FilterCustomCheck', async () => {
      const {
         queries: { getByTestId, getAllByText },
         waitFor,
      } = await renderPage(RequestsReview);

      const leaderFilter = getByTestId('leader-filter');
      fireEvent.click(leaderFilter);

      await waitFor(() => {
         const requests = getAllByText(/Solicitud/);
         expect(requests.length).toBe(1);
      });
   });

   test('this not brake is getQueryGraph launch exception', async () => {
      getQueryGraph.mockResolvedValueOnce({ status: 500, error:'Network error' });
      const { waitFor } = await renderPage(RequestsReview);

      await waitFor(() => {
         expect(getQueryGraph).toHaveBeenCalled();
      })
   });
});
