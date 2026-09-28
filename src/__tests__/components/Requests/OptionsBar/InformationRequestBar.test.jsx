import { screen, within } from '@testing-library/react';

import { InformationRequestBar } from '../../../../components/Requests/OptionsBar/InformationRequestBar';
import { renderComponent } from '../../../utils/render';

const authorizations = [
   { userAD: 'c1', fullName: 'Comercial Uno', signatureDate: '2025-02-06T10:00:00', typeFaculty: 'COMERCIAL', decisionFaculty: 'YES' },
   { userAD: 'r1', fullName: 'Crédito Uno', signatureDate: '2025-02-06T11:00:00', typeFaculty: 'CREDITO', decisionFaculty: 'NO' },
   { userAD: 'r2', fullName: 'Crédito Dos', signatureDate: '2025-02-06T12:00:00', typeFaculty: 'CREDITO', decisionFaculty: 'YES' },
];

// Cada área es un h2 seguido de sus decisiones hasta el siguiente encabezado.
const namesUnder = (heading) => {
   const names = [];
   let node = screen.getByRole('heading', { name: heading }).nextElementSibling;
   while (node && node.tagName !== 'H2' && node.tagName !== 'BR') {
      names.push(within(node).getByText(/Uno|Dos/).textContent);
      node = node.nextElementSibling;
   }
   return names;
};

describe('InformationRequestBar', () => {
   test('shows the applicant name as title', () => {
      renderComponent(<InformationRequestBar fullName='Empresa Alfa' authorizations={authorizations} />);

      expect(screen.getByRole('heading', { level: 1, name: 'Empresa Alfa' })).toBeInTheDocument();
   });

   test('groups the decisions by area', () => {
      renderComponent(<InformationRequestBar fullName='Empresa Alfa' authorizations={authorizations} />);

      expect(namesUnder('Área Crédito')).toEqual(['Crédito Uno', 'Crédito Dos']);
      expect(namesUnder('Área Comercial')).toEqual(['Comercial Uno']);
   });

   test('shows the decision of every faculty', () => {
      renderComponent(<InformationRequestBar fullName='Empresa Alfa' authorizations={authorizations} />);

      expect(screen.getAllByTestId('decisionFaculty-YES')).toHaveLength(2);
      expect(screen.getAllByTestId('decisionFaculty-NO')).toHaveLength(1);
   });

   test('shows both areas without decisions when nobody has signed', () => {
      renderComponent(<InformationRequestBar fullName='Empresa Alfa' authorizations={[]} />);

      expect(screen.getByRole('heading', { name: 'Área Crédito' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Área Comercial' })).toBeInTheDocument();
      expect(screen.queryByText(/Autorizado|Rechazado/)).not.toBeInTheDocument();
   });
});
