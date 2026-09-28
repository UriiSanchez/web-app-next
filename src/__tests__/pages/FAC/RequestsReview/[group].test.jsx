import RequestsDetails from '../../../../pages/FAC/RequestsReview/[group]';

import {
   getEmpoweredInformation,
   getLoadDocuments,
   getChatsForRequest,
   postSaveAuthorization,
} from '../../../../services';
import { useDetectClickOutside, useDivMeasure, useGlobalContext, useLocalStorage } from '../../../../hooks';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({
   __esModule: true,
   MainLayout: ({ children }) => children,
}));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useLocalStorage: jest.fn(),
   useDivMeasure: jest.fn(),
   useDetectClickOutside: jest.fn(),
}));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getEmpoweredInformation: jest.fn(),
   postSaveAuthorization: jest.fn(),
   getLoadDocuments: jest.fn(),
   getChatsForRequest: jest.fn(),
}));

const mockData = {
   idGroup: 10,
   idCatStatus: 26,
   groupName: 'TOYOTA',
   branchOffice: 'MONTERREY',
   requests: [
      {
         idRequest: 12,
         idCatStatus: 26,
         fullName: 'PHITEN MEXICO S.A. DE C.V.',
         idCatTypePerson: 1,
         personType: 'PM',
         idClient: '121400',
         authorizationsFaculty: [],
         resolutionByCredit: 'PENDING',
         resolutionByCommercial: 'PENDING',
         lastRejection: false,
      },
      {
         idRequest: 13,
         idCatStatus: 26,
         fullName: 'RELEVANCIA MOTRIZ S.A. DE C.V.',
         idCatTypePerson: 1,
         personType: 'PM',
         idClient: '3433700',
         authorizationsFaculty: [],
         resolutionByCredit: 'PENDING',
         resolutionByCommercial: 'PENDING',
         lastRejection: false,
      },
   ],
};

describe('RequestsDetails FAC', () => {
   const props = { idGroup: '10' };
   let routerMock;
   beforeEach(() => {
      routerMock = { push: jest.fn() };
      useGlobalContext.mockReturnValue({
         user: { userAD: 'testUser', idProfile: 6, path: 'FAC' },
         isReloading: false,
         actions: { toggleReloading: jest.fn() },
      });

      getEmpoweredInformation.mockResolvedValue(mockData);
      getLoadDocuments.mockResolvedValue({
         url: 'https://docs.google.com/document/d/1Afdb5Svz0y8devIYeASOpGOdPWm8CCK9-ha8xdJXOx8/edit?usp=drive_link',
         error: '',
      });
      getChatsForRequest.mockResolvedValue([
         {
            idMessage: 11,
            message: 'comentario prueba 1123...',
            messageType: 'INFORMATION',
            userAD: 'usertests',
            fullName: 'USUARIO DE PRUEBAS ',
            color: 'hsl(292,99%,45%)',
            createDate: '2025-02-28T11:55:42',
            updateDate: '2025-02-28T11:55:42',
            messageResponse: [],
            deleted: false,
            firstLetters: 'UT',
         },
      ]);

      postSaveAuthorization.mockResolvedValue(true);

      localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 10, idRequest: 12 }));
      useLocalStorage.mockReturnValue(['ACTIVE_APPLICANT', jest.fn()]);
      useDivMeasure.mockReturnValue([null, { width: 800, height: 670 }]);
      useDetectClickOutside.mockReturnValue(false);
      useRouter.mockReturnValue(routerMock);
   });

   test('it should display the skeleton of the page when the information service fails', async () => {
      getEmpoweredInformation.mockResolvedValue({});

      const {
         queries: { getByText },
         waitFor,
      } = await renderPage(RequestsDetails, props);

      await waitFor(
         () => expect(getByText('Solicitudes')).toBeVisible(),
         expect(getByText('chevron_right')).toBeVisible()
      );
   });

   test('it should be displayed link back and redirect to requests review page', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsDetails, props);
      let link = getByRole('link', { name: 'Solicitudes' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/FAC/RequestsReview');
   });

   test('it should display the aplicant name', async () => {
      const {
         queries: { getAllByRole },
      } = await renderPage(RequestsDetails, props);
      let nameApplicant = getAllByRole('paragraph');
      expect(nameApplicant[0]).toBeInTheDocument();
   });

   test('it should be displayed reject and authorize buttons ', async () => {
      const {
         queries: { getByText },
      } = await renderPage(RequestsDetails, props);
      expect(getByText('Rechazar')).toBeVisible();
      expect(getByText('Autorizar')).toBeVisible();
   });

   test('it should be displayed the cover section', async () => {
      const {
         queries: { getByText },
      } = await renderPage(RequestsDetails, props);
      expect(getByText('Carátula')).toBeVisible();
   });

   test('it should be displayed the cover PDF with the correct visual configuration', async () => {
      const {
         queries: { getByTitle },
      } = await renderPage(RequestsDetails, props);
      expect(getByTitle('Visor de PDF')).toBeVisible();
   });

   test('it should be displayed the study section', async () => {
      const {
         queries: { getByText },
      } = await renderPage(RequestsDetails, props);
      expect(getByText('Estudio')).toBeVisible();
   });

   test('it should be displayed the information icon', async () => {
      const {
         queries: { getByText },
      } = await renderPage(RequestsDetails, props);
      expect(getByText('info')).toBeVisible();
   });

   test('it should be displayed the chat image', async () => {
      const {
         queries: { getByAltText },
      } = await renderPage(RequestsDetails, props);
      expect(getByAltText('Chat')).toBeVisible();
   });

   test('it should open the information section ', async () => {
      const {
         user,
         queries: { getByRole, getByText },
      } = await renderPage(RequestsDetails, props);

      await user.click(getByRole('button', { name: 'info' }));

      expect(getByText('Área Crédito')).toBeVisible();
      expect(getByText('Área Comercial')).toBeVisible();
   });

   test('it should open the chat section ', async () => {
      const {
         user,
         queries: { getByRole, getByText },
      } = await renderPage(RequestsDetails, props);

      await user.click(getByRole('button', { name: 'Chat' }));

      expect(getByText('Chat (Cambios y comentarios)')).toBeVisible();
   });
});
