import { PDFModal } from '../../../components';

import { dowloadDocumentFetch, downloadCoverStudio } from '../../../services';

const togglePDFMock = jest.fn();
jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: () => ({
      user: { userAD: 'testUser', idProfile: 5, path: 'SEC' },
      showPDF: {
         isShow: true,
         folio: 6834908,
         title: 'Documento',
         idRequest: 1,
         idClient: 17498,
         typePDF: 'DOCUMENTS',
      },
      actions: { toggleLoading: jest.fn(), togglePDF: togglePDFMock },
   }),
}));
jest.mock('../../../services', () => ({
   __esModule: true,
   dowloadDocumentFetch: jest.fn(),
   downloadCoverStudio: jest.fn(),
}));
jest.mock('../../../helpers', () => {
   const originalModule = jest.requireActual('../../../helpers');

   return { ...originalModule, createUrlPdf: jest.fn() };
});

const mockDocumentFetch = {
   status: 200,
   data: {
      traceId: 'fc37ce0d-6910-4000-8000-000000000000',
      response:
         'JVBERi0xLjQKJcfsj6IKJSVJbnZvY2F0aW9uOiBwYXRoL2dzIC1zREVWSUNFPXBkZndyaXRlIC1kQ29tcGF0aWJpbGl0eUxldmVsPTEuN',
   },
};
const mockCoverStudio = {
   status: 200,
   data: {
      traceId: '50c5a11d-6910-4000-8000-000000000000',
      response:
         'JVBERi0xLjQKJcfsj6IKJSVJbnZvY2F0aW9uOiBwYXRoL2dzIC1zREVWSUNFPXBkZndyaXRlIC1kQ29tcGF0aWJpbGl0eUxldmVsPTEuNCA',
   },
};

describe('PDFModal component', () => {
   beforeEach(() => {
      dowloadDocumentFetch.mockResolvedValue(mockDocumentFetch);
      downloadCoverStudio.mockResolvedValue(mockCoverStudio);
      togglePDFMock.mockClear();
   });

   test('should it the return and confirm button be displayed', async () => {
      const {
         queries: { getByText, getByRole },
      } = await renderPage(PDFModal);

      expect(getByText('Documento')).toBeVisible();
      expect(getByRole('button', { name: 'Botón regresar' })).toBeVisible();
      expect(getByRole('img', { name: 'Botón de descarga' })).toBeVisible();
   });
});
