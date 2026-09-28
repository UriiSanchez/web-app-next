import { screen, within } from '@testing-library/react';

import IndividualSummary from '../../../../components/PropertyVerification/Details/IndividualSummary';
import { renderComponent } from '../../../utils/render';

const data = {
   totalAreaDimension: 120.5,
   totalBuildArea: 80,
   totalCustomerValue: 2500000,
   resume: {
      inmuebles: { numero: 4, valor: 4000000 },
      libres: { numero: 1, valor: 1000000 },
      gravados: { numero: 1, valor: 500000 },
      embargados: { numero: 0, valor: 0 },
      pendientes: { numero: 2, valor: 2500000 },
      escrituracion: { numero: 3, valor: 300 },
   },
};

const totalsBar = () => screen.getByText(/Dimensiones de terreno en m/).parentElement;
const row = (label) => screen.getByText(label).parentElement;

describe('IndividualSummary', () => {
   test('shows the totals of the participant', () => {
      renderComponent(<IndividualSummary data={data} />);

      const bar = totalsBar();
      expect(bar).toHaveTextContent(/Dimensiones de terreno en m2:\s*120\.5/);
      expect(bar).toHaveTextContent(/m2 de construcción:\s*80/);
      expect(bar).toHaveTextContent(/Valor s\/cliente:\s*\$2,500,000\.00/);
   });

   test('shows the number of properties per status', () => {
      renderComponent(<IndividualSummary data={data} />);

      const cells = within(row('Número de inmuebles')).getAllByText(/^\d+$/);
      expect(cells.map((c) => c.textContent)).toEqual(['4', '1', '1', '0', '2', '3']);
   });

   test('shows the value of the properties per status', () => {
      renderComponent(<IndividualSummary data={data} />);

      const cells = within(row('Valor de propiedad')).getAllByText(/^\$/);
      expect(cells.map((c) => c.textContent)).toEqual([
         '$4,000,000.00',
         '$1,000,000.00',
         '$500,000.00',
         '$0.00',
         '$2,500,000.00',
         '$300.00',
      ]);
   });

   test('shows the headers of the individual summary', () => {
      renderComponent(<IndividualSummary data={data} />);

      ['Resumen individual', 'Inmueble(s) del solicitante', 'Libres de gravamen', 'Gravados', 'Embargados'].forEach(
         (title) => expect(screen.getByText(title)).toBeInTheDocument()
      );
      expect(screen.getByText('Pendientes por verificar')).toBeInTheDocument();
      expect(screen.getByText('En escrituración')).toBeInTheDocument();
   });

   test('shows dashes in the totals and zeros in the counts when there is no resume', () => {
      renderComponent(<IndividualSummary data={{}} />);

      expect(totalsBar()).toHaveTextContent(/Dimensiones de terreno en m2:\s*-/);
      expect(within(row('Número de inmuebles')).getAllByText('0')).toHaveLength(6);
      expect(within(row('Valor de propiedad')).getAllByText('$')).toHaveLength(6);
   });
});
