import { within, waitFor } from '@testing-library/react';

import LeaderRecomendation from '../../../../pages/LDC/Recomendation/[group]';

import { useRouter } from 'next/router';
import { getOneRequest, onChangeRequestStatusOrAssignUser } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getOneRequest: jest.fn(),
   onChangeRequestStatusOrAssignUser: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');

   return { ...originalModule, useGlobalContext: jest.fn() };
});

describe('LeaderRecomendation page', () => {
   const props = { idGroup: '1' };

   let routerMock;
   let globalContextMock;
   let getOneRequestMock;

   beforeEach(() => {
      routerMock = { push: jest.fn() };

      globalContextMock = {
         user: { userAD: 'testuser' },
         actions: { toggleLoading: jest.fn() },
      };

      getOneRequestMock = {
         status: 200,
         data: {
            requestResponseList: [
               {
                  idRequest: 1,
                  idCatStatus: 5,
                  commentAc: 'test comment ac',
                  recommendationAc: true,
                  relatedPersonResponseList: [
                     {
                        idClient: '1100',
                        idCatTypePerson: 1,
                        fullName: 'Related person name',
                     },
                  ],
               },
            ],
         },
      };

      useRouter.mockReturnValue(routerMock);
      useGlobalContext.mockReturnValue(globalContextMock);
      getOneRequest.mockResolvedValue(getOneRequestMock);
      onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
   });

   test('it should display an error message when the service that loads data respond with an error', async () => {
      getOneRequestMock.status = 500;
      getOneRequestMock.error = { response: { message: 'Test Error Message' }, traceId: '123' };

      const {
         queries: { getByText },
      } = await renderPage(LeaderRecomendation, props);

      await waitFor(() => expect(getByText('¡Error interno del servidor!')).toBeVisible());
      expect(getByText('[ Test Error Message ]')).toBeVisible();
   });

   test('it should not allow to edit analyst comments', async () => {
      const {
         queries: { getByText },
      } = await renderPage(LeaderRecomendation, props);

      const analystSection = getByText('Analista de Contraparte').closest('div');

      expect(within(analystSection).queryByRole('textbox')).toBeNull();
   });

   test('it should redirect to application evaluation page when clicking on back button', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(LeaderRecomendation, props);

      await user.click(getByRole('button', { name: 'Regresar' }));

      expect(routerMock.push).toHaveBeenCalledWith('/LDC/ApplicationEvaluation/1');
   });

   test('it should send a request with positive recommendation when the user clicks in recommend button and finish', async () => {
      const {
         user,
         queries: { getByText, getByRole },
      } = await renderPage(LeaderRecomendation, props);

      const leaderSection = getByText('Líder de Contraparte').closest('div');
      await user.click(within(leaderSection).getByRole('button', { name: 'done Recomiendo' }));
      await user.click(getByRole('button', { name: 'Finalizar arrow_forward' }));
      await user.click(getByRole('button', { name: 'Continuar' }));

      expect(onChangeRequestStatusOrAssignUser.mock.calls[0][0].requests[0].recommendationLc).toBe(true);
   });

   test('it should send a request with negative recommendation when the user clicks in recommend button and finish', async () => {
      const {
         user,
         queries: { getByText, getByRole },
      } = await renderPage(LeaderRecomendation, props);

      const leaderSection = getByText('Líder de Contraparte').closest('div');
      await user.click(within(leaderSection).getByRole('button', { name: 'close No Recomiendo' }));
      await user.click(getByRole('button', { name: 'Finalizar arrow_forward' }));
      await user.click(getByRole('button', { name: 'Continuar' }));

      expect(onChangeRequestStatusOrAssignUser.mock.calls[0][0].requests[0].recommendationLc).toBe(false);
   });

   test('it should send a request with the comment typed by the user in the leader section', async () => {
      const {
         user,
         queries: { getByText, getByRole },
      } = await renderPage(LeaderRecomendation, props);

      const leaderSection = getByText('Líder de Contraparte').closest('div');
      await user.type(
         within(leaderSection).getByPlaceholderText('Ingresa aquí los comentarios'),
         'This is a comment by the LDC profile'
      );
      await waitFor(() => expect(getByText('36/2000')).toBeVisible());
      await user.click(within(leaderSection).getByRole('button', { name: 'done Recomiendo' }));
      await user.click(getByRole('button', { name: 'Finalizar arrow_forward' }));
      await user.click(getByRole('button', { name: 'Continuar' }));

      expect(onChangeRequestStatusOrAssignUser.mock.calls[0][0].requests[0].comment).toBe(
         'This is a comment by the LDC profile'
      );
   });

   test('it should send a request with the comment typed by the user in the leader section and show the number of characters', async () => {
      const {
         user,
         queries: { getByText, getByRole },
      } = await renderPage(LeaderRecomendation, props);

      const leaderSection = getByText('Líder de Contraparte').closest('div');
      await user.type(
         within(leaderSection).getByPlaceholderText('Ingresa aquí los comentarios'),
         'This is a comment by the LDC profile'
      );
      await waitFor(() => expect(getByText('36/2000')).toBeVisible());
      await user.click(within(leaderSection).getByRole('button', { name: 'done Recomiendo' }));
      await user.click(getByRole('button', { name: 'Finalizar arrow_forward' }));
      await user.click(getByRole('button', { name: 'Continuar' }));

      expect(onChangeRequestStatusOrAssignUser.mock.calls[0][0].requests[0].comment).toBe(
         'This is a comment by the LDC profile'
      );
   });

   test('it should display an error message when the request to update leader recommendation responds with a status different than 204', async () => {
      onChangeRequestStatusOrAssignUser.mockResolvedValue({
         status: 500,
         error: { response: { message: 'Test error 202' }, traceId: '123' },
      });

      const {
         user,
         queries: { getByText, getByRole },
      } = await renderPage(LeaderRecomendation, props);

      const leaderSection = getByText('Líder de Contraparte').closest('div');
      await waitFor(() => expect(getByText('0/2000')).toBeVisible());
      await user.click(within(leaderSection).getByRole('button', { name: 'done Recomiendo' }));
      await user.click(getByRole('button', { name: 'Finalizar arrow_forward' }));
      await user.click(getByRole('button', { name: 'Continuar' }));

      await waitFor(() => expect(getByText('¡Error interno del servidor!')).toBeVisible());
      expect(getByText('[ Test error 202 ]')).toBeVisible();
   });
});
