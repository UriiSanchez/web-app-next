import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import { PDFModal } from '../../../components/Modal/PDFModal';
import { dowloadDocumentFetch, downloadCoverStudio } from '../../../services';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

jest.mock('../../../services', () => ({ dowloadDocumentFetch: jest.fn(), downloadCoverStudio: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const okResponse = { status: 200, data: { response: 'JVBERi0xLjQ=' } };

const setup = (showPDF = {}) => {
   const actions = createActions({ togglePDF: jest.fn() });
   const value = { showPDF: { title: 'Acta constitutiva', prefixName: 'DOC', ...showPDF }, actions };
   return { actions, ...renderComponent(<PDFModal />, { wrapper: createContextWrapper(value) }) };
};

beforeEach(() => {
   URL.createObjectURL = jest.fn(() => 'blob:mock-pdf');
});

afterEach(() => {
   delete URL.createObjectURL;
});

describe('PDFModal', () => {
   test('shows the provided src without calling any service', () => {
      setup({ src: 'blob:ready#toolbar=1' });

      expect(screen.getByTitle('Visor de PDF')).toHaveAttribute('src', 'blob:ready#toolbar=1');
      expect(dowloadDocumentFetch).not.toHaveBeenCalled();
      expect(downloadCoverStudio).not.toHaveBeenCalled();
   });

   test('downloads a document by folio by default and shows it', async () => {
      dowloadDocumentFetch.mockResolvedValue(okResponse);
      setup({ folio: 55 });

      expect(screen.getByText('Cargando documento...')).toBeInTheDocument();
      const viewer = await screen.findByTitle('Visor de PDF');

      expect(dowloadDocumentFetch).toHaveBeenCalledWith(55);
      expect(viewer.getAttribute('src')).toMatch(/^blob:mock-pdf#toolbar=1/);
      expect(screen.queryByText('Cargando documento...')).not.toBeInTheDocument();
   });

   test('downloads the cover and study with the request and client', async () => {
      downloadCoverStudio.mockResolvedValue(okResponse);
      setup({ typePDF: 'COVER_AND_STUDY', idRequest: 8, idClient: 3 });

      await screen.findByTitle('Visor de PDF');

      expect(downloadCoverStudio).toHaveBeenCalledWith(8, 3);
   });

   test('downloads only the cover with the signatures type', async () => {
      downloadCoverStudio.mockResolvedValue(okResponse);
      setup({ typePDF: 'ONLY_COVER', idRequest: 8, idClient: 3 });

      await screen.findByTitle('Visor de PDF');

      expect(downloadCoverStudio).toHaveBeenCalledWith(8, 3, 'PDF_COVER_SIGNATURES');
   });

   test('shows an error message and hides the download link when the service fails', async () => {
      dowloadDocumentFetch.mockResolvedValue({ status: 404, data: { message: 'No existe' } });
      setup({ folio: 55 });

      expect(await screen.findByText('¡Archivo no disponible! No se pudo cargar el PDF.')).toBeInTheDocument();
      expect(screen.queryByTitle('Visor de PDF')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Descargar archivo')).not.toBeInTheDocument();
      expect(screen.queryByText('Cargando documento...')).not.toBeInTheDocument();
      expect(Swal.fire).toHaveBeenCalledTimes(1);
   });

   test('offers a download link named after the prefix and title', async () => {
      dowloadDocumentFetch.mockResolvedValue(okResponse);
      setup({ folio: 55 });

      const link = await screen.findByTitle('Descargar archivo');
      await waitFor(() => expect(link).toHaveAttribute('href', expect.stringContaining('blob:mock-pdf')));

      expect(link).toHaveAttribute('download', 'DOC-Acta-constitutiva.pdf');
      expect(link).toHaveAttribute('target', '_blank');
   });

   test('shows the title and falls back to "-" without one', () => {
      const { unmount } = setup({ src: 'blob:x' });
      expect(screen.getByRole('heading', { name: 'Acta constitutiva' })).toBeInTheDocument();
      unmount();

      setup({ src: 'blob:x', title: '' });
      expect(screen.getByRole('heading', { name: '-' })).toBeInTheDocument();
   });

   test('resets the PDF state when the back button is clicked', async () => {
      const { user, actions } = setup({ src: 'blob:x' });

      await user.click(screen.getByTitle('Cerrar modal'));

      expect(actions.togglePDF).toHaveBeenCalledWith({
         folio: 0,
         isShow: false,
         src: '',
         title: '',
         idRequest: '',
         idClient: '',
         prefixName: '',
      });
   });

   test('locks page scroll while mounted and restores it on unmount', () => {
      const { unmount } = setup({ src: 'blob:x' });
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('auto');
      expect(document.documentElement.style.overflowY).toBe('auto');
   });
});
