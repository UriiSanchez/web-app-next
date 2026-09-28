import { useRouter } from 'next/router';

import ApplicationEvaluation from '../../../../pages/LDC/ApplicationEvaluation/[group]';
import { getOneRequest } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ __esModule: true, getOneRequest: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));

const mockData = {
   idGroup: 1,
   groupName: 'test group',
   requestResponseList: [
      {
         resultExecEm: false,
         coverComplete: true,
         recommendationLc: null,
         relatedPersonResponseList: [],
      },
   ],
};

describe('ApplicationEvaluation LDC page', () => {
   const props = { idGroup: '1' };
   let pushMock;
   let serviceMock;

   beforeEach(() => {
      jest.clearAllMocks();
      pushMock = jest.fn();

      serviceMock = {
         status: 200,
         data: mockData,
      };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue({ user: mockUsers.LDC });
      getOneRequest.mockResolvedValue(serviceMock);
   });

   test('it initial render show enable buttons "Visualizar", "Editar" and disabled "Recomendar" buttons', async () => {
      const {
         queries: { getByRole, getByTestId, getByText },
      } = await renderPage(ApplicationEvaluation, props);

      const title = getByTestId('title-request');

      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Solicitud 0000000001');
      expect(getByText('test group')).toBeInTheDocument();

      //Validamos que los botones Validar del modelo, Editar de la carátula y Devolver solicitud esten habilitados
      const btnShow = getByRole('button', { name: /Visualizar/i });
      const btnEdit = getByRole('button', { name: /Editar/i });
      const btnReturn = getByRole('button', { name: /Devolver solicitud al analista/i });

      expect(btnShow).toBeInTheDocument();
      expect(btnEdit).toBeInTheDocument();
      expect(btnReturn).toBeInTheDocument();

      expect(btnShow).toBeEnabled();
      expect(btnEdit).toBeEnabled();
      expect(btnReturn).toBeEnabled();
      const btnRecommend = getByRole('button', { name: /Recomendar/i });
      expect(btnRecommend).toBeInTheDocument();
      expect(btnRecommend).toBeEnabled();
   });

   test('it shows an error message when service response is not status 200', async () => {
      getOneRequest.mockResolvedValueOnce({ status: 500, error: 'Test error message' });

      const {
         queries: { getByText },
         waitFor,
      } = await renderPage(ApplicationEvaluation, props);

      await waitFor(() => expect(getByText('¡Error interno del servidor!')).toBeVisible());
      expect(getByText('[ Test error message ]')).toBeVisible();
   });

   test('it should navigate to "Documentation" page when "Regresar" button is clicked', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(ApplicationEvaluation, props);

      await user.click(getByRole('button', { name: 'Regresar' }));

      expect(pushMock).toHaveBeenCalledWith('/LDC/Documentation/1');
   });

   test('it should navigate to "ReturnRequest" page when "Devolver solicitud al analista" button is clicked', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(ApplicationEvaluation, props);

      await user.click(getByRole('button', { name: /Devolver solicitud al analista/i }));

      expect(pushMock).toHaveBeenCalledWith('/LDC/ReturnRequest/1?origin=ApplicationEvaluation');
   });
});
