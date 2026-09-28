import { useRouter } from 'next/router';

import ApplicationEvaluation from '../../../../pages/ADC/ApplicationEvaluation/[group]';
import { getOneRequest } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ __esModule: true, getOneRequest: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));

describe('ApplicationEvaluation page', () => {
   const props = { idGroup: '1' };

   let routerMock;
   let serviceMock;

   beforeEach(() => {
      routerMock = { push: jest.fn() };

      serviceMock = {
         status: 200,
         data: { requestResponseList: [{ resultExecEm: true, relatedPersonResponseList: [] }] },
      };

      useRouter.mockReturnValue(routerMock);
      useGlobalContext.mockReturnValue({ user: { userAD: 'testuser' } });
      getOneRequest.mockResolvedValue(serviceMock);
   });

   test('it enables visualize button when all requests have executed the model', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(ApplicationEvaluation, props);

      expect(getByRole('button', { name: 'Visualizar' })).toBeEnabled();
   });

   test('it enables edit cover button when all requests have executed the model', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(ApplicationEvaluation, props);

      expect(getByRole('button', { name: 'Editar' })).toBeEnabled();
   });

   test('it shows an error message when service response is not status 200', async () => {
      getOneRequest.mockResolvedValue({ status: 500, error: 'Test error message' });

      const {
         queries: { getByText },
         waitFor
      } = await renderPage(ApplicationEvaluation, props);

      await waitFor(() => expect(getByText('Test error message')).toBeVisible());
   });

   test('it disables execute model button when service response is not status 200', async () => {
      getOneRequest.mockResolvedValue({ status: 500, error: 'Test error message' });

      const {
         user,
         queries: { getByRole },
      } = await renderPage(ApplicationEvaluation, props);

      await user.click(getByRole('button', { name: 'Aceptar' }));

      expect(getByRole('button', { name: 'Ejecutar modelo' })).toBeDisabled();
   });

   test('it enables recommend button when cover is complete', async () => {
      serviceMock.data.requestResponseList[0].coverComplete = true;

      const {
         queries: { getByRole },
      } = await renderPage(ApplicationEvaluation, props);

      expect(getByRole('button', { name: 'Recomendar' })).toBeEnabled();
   });
});
