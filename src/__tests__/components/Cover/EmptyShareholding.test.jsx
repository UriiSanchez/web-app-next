import { screen } from '@testing-library/react';

import { EmptySharedholding } from '../../../components/Cover/EmptyShareholding';
import { renderComponent } from '../../utils/render';

describe('EmptySharedholding', () => {
   test('shows the shareholding table headers', () => {
      renderComponent(<EmptySharedholding />);

      expect(screen.getByText('Tenencia accionario')).toBeInTheDocument();
      ['Accionistas', 'RFC', '% Part. Directa', '% Part. Indirecta'].forEach((header) =>
         expect(screen.getByText(header)).toBeInTheDocument()
      );
   });

   test('marks only the first shareholder row as not applicable', () => {
      renderComponent(<EmptySharedholding />);

      expect(screen.getAllByText('N/A')).toHaveLength(4);
   });

   test('shows the Otros and Total summary rows without editable fields', () => {
      renderComponent(<EmptySharedholding />);

      expect(screen.getByText('Otros')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
   });
});
