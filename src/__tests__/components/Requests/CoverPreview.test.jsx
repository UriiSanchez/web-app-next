import { CoverPreview } from '../../../components';

import { getLoadDocuments } from '../../../services';

jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: () => ({
      user: { userAD: 'testUser', idProfile: 5, path: 'SEC' },
      isReloading: false,
      actions: { toggleReloading: jest.fn(), toggleLoading: jest.fn() },
   }),
}));
jest.mock('../../../services', () => ({
   __esModule: true,
   getLoadDocuments: jest.fn(),
}));

const mockIndividualRequest = [
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
            signatureDate: '2025-04-08T17:33:07',
            typeFaculty: 'COMERCIAL',
            decisionFaculty: 'YES',
            fullName: 'URIEL ANTONIO CERON SANCHEZ ',
         },
      ],
      resolutionByCredit: null,
      resolutionByCommercial: null,
      sealed: false,
      lastRejection: false,
   },
];

describe('CoverPreview component', () => {
   let props = { idClient: '265900', idRequest: 1, idGroup: 1, isGroup: false };

   beforeEach(() => {
      getLoadDocuments.mockResolvedValue({
         url: 'https://drive.google.com/file/d/1ZWKAwmBCv6sdemL8fsKqQbeN1x2kyiL3/view?usp=drive_link',
         error: '',
      });
   });

   test('should it the return and confirm button be displayed', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(CoverPreview, { ...props, requests: mockIndividualRequest });

      expect(getByRole('button', { name: /Regresar/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /Confirmar/i })).toBeInTheDocument();
   });
});
