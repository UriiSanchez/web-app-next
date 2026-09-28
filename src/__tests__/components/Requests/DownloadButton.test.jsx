import { screen } from '@testing-library/react';

import { DownloadButton } from '../../../components/Requests/DownloadButton';
import { renderComponent } from '../../utils/render';

const url = 'http://localhost:3000/archivo.pdf';

describe('DownloadButton', () => {
   test('renders a download link with the given name when it is enabled', () => {
      renderComponent(<DownloadButton urlDownload={url} isEnabled nameDocument='Estudio' />);

      const link = screen.getByRole('link', { name: 'download' });
      expect(link).toHaveAttribute('href', url);
      expect(link).toHaveAttribute('download', 'Estudio.pdf');
      expect(link).toHaveAttribute('title', 'Descargar archivo');
      expect(link).toHaveAttribute('target', '_blank');
   });

   test('uses the default file name', () => {
      renderComponent(<DownloadButton urlDownload={url} isEnabled />);

      expect(screen.getByRole('link')).toHaveAttribute('download', 'Document.pfd.pdf');
   });

   test.each([
      ['it is not enabled', { urlDownload: url }],
      ['the document is loading', { urlDownload: url, isEnabled: true, loadingDocument: true }],
      ['there is no url', { urlDownload: '', isEnabled: true }],
   ])('shows only the icon when %s', (_label, props) => {
      renderComponent(<DownloadButton {...props} />);

      expect(screen.getByText('download')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
   });
});
