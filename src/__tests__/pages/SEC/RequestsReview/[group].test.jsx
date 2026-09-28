import RequestsDetails from '../../../../pages/SEC/RequestsReview/[group]';

import { getEmpoweredInformation, getLoadDocuments } from '../../../../services';
import { useDetectClickOutside, useDivMeasure, useLocalStorage } from '../../../../hooks';

jest.mock('../../../../components/Layout', () => ({
   __esModule: true,
   MainLayout: ({ children }) => children,
}));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: () => ({
      user: { userAD: 'testUser', idProfile: 5, path: 'SEC' },
      isReloading: false,
      actions: { toggleReloading: jest.fn() },
   }),
   useLocalStorage: jest.fn(),
   useDivMeasure: jest.fn(),
   useDetectClickOutside: jest.fn(),
}));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getEmpoweredInformation: jest.fn(),
   getLoadDocuments: jest.fn(),
}));

const mockData = {
   idGroup: 1,
   idCatStatus: 6,
   groupName: 'NIKKEN',
   branchOffice: 'MONTERREY',
   requests: [
      {
         idRequest: 1,
         idCatStatus: 10,
         fullName: 'NIKKEN LATINOAMERICA S. DE R.L. DE C.V.',
         idCatTypePerson: 1,
         personType: 'PM',
         idClient: '265900',
         authorizationsFaculty: [
            {
               userAD: 'tterrazas',
               signatureDate: '2025-03-06T10:22:34',
               typeFaculty: 'CREDITO',
               decisionFaculty: 'YES',
               fullName: 'TATIANA  TERRAZAS CAZARES ',
            },
            {
               userAD: 'uceron',
               signatureDate: '2025-03-06T10:21:29',
               typeFaculty: 'COMERCIAL',
               decisionFaculty: 'YES',
               fullName: 'URIEL ANTONIO CERON SANCHEZ ',
            },
         ],
         resolutionByCredit: null,
         resolutionByCommercial: null,
         lastRejection: false,
         sealed: false,
      },
      {
         idRequest: 2,
         idCatStatus: 10,
         fullName: 'NIKKEN DE MEXICO S. DE R.L. DE C.V.',
         idCatTypePerson: 1,
         personType: 'PM',
         idClient: '632400',
         authorizationsFaculty: [
            {
               userAD: 'tterrazas',
               signatureDate: '2025-03-06T10:18:05',
               typeFaculty: 'CREDITO',
               decisionFaculty: 'YES',
               fullName: 'TATIANA  TERRAZAS CAZARES ',
            },
            {
               userAD: 'uceron',
               signatureDate: '2025-03-06T10:21:49',
               typeFaculty: 'COMERCIAL',
               decisionFaculty: 'YES',
               fullName: 'URIEL ANTONIO CERON SANCHEZ ',
            },
         ],
         resolutionByCredit: null,
         resolutionByCommercial: null,
         lastRejection: false,
         sealed: false,
      },
   ],
};

describe('RequestsDetails Secretary', () => {
   const props = { idGroup: '1', coverPreview: false };

   beforeEach(() => {
      getEmpoweredInformation.mockResolvedValue(mockData);
      getLoadDocuments.mockResolvedValue({
         url: 'https://drive.google.com/file/d/1ZWKAwmBCv6sdemL8fsKqQbeN1x2kyiL3/view?usp=drive_link',
         error: '',
      });

      localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 1, idRequest: 1 }));
      useLocalStorage.mockReturnValue(['ACTIVE_APPLICANT', jest.fn()]);
      useDivMeasure.mockReturnValue([null, { width: 800, height: 670 }]);
      useDetectClickOutside.mockReturnValue(false);
   });

   test('should display the requests link and should have the correct path to the requests screen.', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsDetails, props);

      const link = getByRole('link', { name: /Solicitudes/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/SEC/RequestsReview');
   });

   test('must show the edit link and must have the correct path to the cover screen', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsDetails, props);

      const link = getByRole('link', { name: /Editar/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/SEC/Cover/1?idRequest=1`);
   });

   test('must show the stamping link and must have the correct path to the show coverPreview component', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsDetails, props);

      const link = getByRole('link', { name: /Sellar/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/SEC/RequestsReview/1?coverPreview=true`);
   });

   test('it should the edit and stamp buttons should be enable if the application has a authorized status', async () => {
      mockData.requests[0].idCatStatus = 10;
      getEmpoweredInformation.mockResolvedValue(mockData);
      const {
         queries: { getByRole },
      } = await renderPage(RequestsDetails, props);

      expect(getByRole('link', { name: 'Editar' })).toBeInTheDocument();
      expect(getByRole('link', { name: 'Sellar arrow_forward' })).toBeInTheDocument();
   });

   test('it should the edit and stamp buttons should be disabled if the application has a rejected status', async () => {
      mockData.requests[0].idCatStatus = 11;
      getEmpoweredInformation.mockResolvedValue(mockData);
      const {
         queries: { getByRole },
      } = await renderPage(RequestsDetails, props);

      expect(getByRole('button', { name: /Editar/i })).toBeDisabled();
      expect(getByRole('button', { name: /Sellar/i })).toBeDisabled();
   });

   test('it should be displayed the information icon', async () => {
      const {
         queries: { getByText },
      } = await renderPage(RequestsDetails, props);
      expect(getByText('info')).toBeVisible();
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
});
