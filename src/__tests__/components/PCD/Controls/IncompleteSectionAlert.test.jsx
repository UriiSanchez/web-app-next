import { screen } from '@testing-library/react';

import { IncompleteSectionAlert } from '../../../../components/PCD/Controls/IncompleteSectionAlert';
import { renderComponent } from '../../../utils/render';

describe('IncompleteSectionAlert', () => {
   test('warns that the section has mandatory fields to answer', () => {
      renderComponent(<IncompleteSectionAlert />);

      expect(screen.getByText(/Tienes/)).toHaveTextContent('Tienes campos obligatorios por responder en esta sección');
      expect(screen.getByText('campos obligatorios').tagName).toBe('B');
   });

   test('shows the information icon with a description', () => {
      renderComponent(<IncompleteSectionAlert />);

      expect(screen.getByRole('img', { name: 'Información del completado de los campos de la sección' })).toBeInTheDocument();
   });
});
