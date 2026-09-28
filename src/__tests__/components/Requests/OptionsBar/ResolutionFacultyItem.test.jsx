import { screen } from '@testing-library/react';

import { ResolutionFacultyItem } from '../../../../components/Requests/OptionsBar/ResolutionFacultyItem';
import { renderComponent } from '../../../utils/render';

const faculty = { fullName: 'Elena Torres', signatureDate: '2025-02-06T23:54:55', decisionFaculty: 'YES' };

describe('ResolutionFacultyItem', () => {
   test('shows the faculty name, the signature date and an authorized badge', () => {
      renderComponent(<ResolutionFacultyItem faculty={faculty} />);

      expect(screen.getByText('Elena Torres')).toBeInTheDocument();
      expect(screen.getByText('06/02/2025 23:54:55 PM')).toBeInTheDocument();
      const badge = screen.getByTestId('decisionFaculty-YES');
      expect(badge).toHaveTextContent('Autorizado');
      // JSDOM no aplica estilos; el color solo se expresa mediante clases.
      expect(badge).toHaveClass('bg-emerald-600');
   });

   test('shows a rejected badge for a negative decision', () => {
      renderComponent(<ResolutionFacultyItem faculty={{ ...faculty, decisionFaculty: 'NO' }} />);

      const badge = screen.getByTestId('decisionFaculty-NO');
      expect(badge).toHaveTextContent('Rechazado');
      expect(badge).toHaveClass('bg-red-500');
   });

   test('shows a dash when there is no signature date', () => {
      renderComponent(<ResolutionFacultyItem faculty={{ ...faculty, signatureDate: undefined }} />);

      expect(screen.getByText('-')).toBeInTheDocument();
   });
});
