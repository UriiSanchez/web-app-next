import { screen, waitFor } from '@testing-library/react';

import { TabOptionDocuments } from '../../../components/Requests/TabOptionDocuments';
import { getLoadDocuments } from '../../../services';
import { renderComponent } from '../../utils/render';

jest.mock('../../../services', () => ({ getLoadDocuments: jest.fn() }));

const props = { idRequest: 9, idClient: '123', fullName: 'Empresa Alfa SA' };

const deferred = () => {
   let resolve;
   const promise = new Promise((res) => (resolve = res));
   return { promise, resolve };
};

const coverTab = () => screen.getByText('Carátula');
const studyTab = () => screen.getByText('Estudio');

describe('TabOptionDocuments', () => {
   test('shows the loading message while the cover loads and then the viewer', async () => {
      const pending = deferred();
      getLoadDocuments.mockReturnValue(pending.promise);
      renderComponent(<TabOptionDocuments {...props} />);

      expect(screen.getByText(/Estamos cargando el documento/)).toBeInTheDocument();
      expect(screen.queryByTitle('Visor de PDF')).not.toBeInTheDocument();

      pending.resolve({ url: 'blob:cover' });

      expect(await screen.findByTitle('Visor de PDF')).toHaveAttribute('src', 'blob:cover');
      expect(screen.queryByText(/Estamos cargando el documento/)).not.toBeInTheDocument();
      expect(getLoadDocuments).toHaveBeenCalledWith(9, '123', 'PDF_COVER_ONLY');
   });

   test('shows the error message returned by the service', async () => {
      getLoadDocuments.mockResolvedValue({ url: '', error: 'No hay documento' });
      renderComponent(<TabOptionDocuments {...props} />);

      expect(await screen.findByText('No hay documento')).toBeInTheDocument();
      expect(screen.queryByTitle('Visor de PDF')).not.toBeInTheDocument();
   });

   test('offers the cover download with the applicant name in the file name', async () => {
      getLoadDocuments.mockResolvedValue({ url: 'blob:cover' });
      renderComponent(<TabOptionDocuments {...props} />);

      const link = await screen.findByRole('link', { name: 'download' });

      expect(link).toHaveAttribute('href', 'blob:cover');
      expect(link).toHaveAttribute('download', 'Carátula-Empresa-Alfa-SA.pdf');
      expect(screen.getAllByText('download')).toHaveLength(2);
   });

   test('loads the study when its tab is selected and moves the download to it', async () => {
      getLoadDocuments.mockResolvedValueOnce({ url: 'blob:cover' }).mockResolvedValueOnce({ url: 'blob:study' });
      const { user } = renderComponent(<TabOptionDocuments {...props} />);
      await screen.findByTitle('Visor de PDF');

      await user.click(studyTab());

      await waitFor(() => expect(screen.getByTitle('Visor de PDF')).toHaveAttribute('src', 'blob:study'));
      expect(getLoadDocuments).toHaveBeenLastCalledWith(9, '123', 'FULL_STUDIO');
      expect(screen.getByRole('link', { name: 'download' })).toHaveAttribute('download', 'Estudio-Empresa-Alfa-SA.pdf');
   });

   test('ignores tab changes while a document is loading', async () => {
      getLoadDocuments.mockReturnValue(new Promise(() => {}));
      const { user } = renderComponent(<TabOptionDocuments {...props} />);

      await user.click(studyTab());

      expect(getLoadDocuments).toHaveBeenCalledTimes(1);
      expect(getLoadDocuments).toHaveBeenCalledWith(9, '123', 'PDF_COVER_ONLY');
   });

   test('reloads the current document when the request changes', async () => {
      getLoadDocuments.mockResolvedValueOnce({ url: 'blob:one' }).mockResolvedValueOnce({ url: 'blob:two' });
      const { rerender } = renderComponent(<TabOptionDocuments {...props} />);
      await screen.findByTitle('Visor de PDF');

      rerender(<TabOptionDocuments {...props} idRequest={10} />);

      await waitFor(() => expect(screen.getByTitle('Visor de PDF')).toHaveAttribute('src', 'blob:two'));
      expect(getLoadDocuments).toHaveBeenLastCalledWith(10, '123', 'PDF_COVER_ONLY');
   });

   test('keeps the cover tab highlighted by default', async () => {
      getLoadDocuments.mockResolvedValue({ url: 'blob:cover' });
      renderComponent(<TabOptionDocuments {...props} />);
      await screen.findByTitle('Visor de PDF');

      // JSDOM no aplica estilos; la pestaña activa solo se distingue por su clase de fondo.
      expect(coverTab().closest('div.bg-black-900')).not.toBeNull();
      expect(studyTab().closest('div.bg-black-900')).toBeNull();
   });
});
