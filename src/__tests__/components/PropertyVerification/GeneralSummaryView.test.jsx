import { screen, within } from '@testing-library/react';

import GeneralSummaryView from '../../../components/PropertyVerification/GeneralSummaryView';
import { renderComponent } from '../../utils/render';

const info = {
   creditRisk: 1500000,
   coverageRatio: 1.5,
   resume: {
      inmueblesApplicant: { pending: { numero: 2, valor: 200000 }, verify: { numero: 3, valor: 300000 } },
      inmueblesObligated: { pending: { numero: 1, valor: 100000 }, verify: { numero: 4, valor: 400000 } },
      copropiedadWithOS: { numero: 5, valor: 500000 },
      copropiedadOthers: { numero: 6, valor: 600000 },
      libres: { numero: 7, valor: 700000 },
      gravados: { numero: 8, valor: 800000 },
      embargados: { numero: 9, valor: 900000 },
      pendientes: { pending: { numero: 10, valor: 1000000 }, verify: { numero: 11, valor: 1100000 } },
      escrituracion: { numero: 12, valor: 1200000 },
      coverageRatioClient: 2,
   },
};

const declared = () => screen.getByRole('table', { name: 'Declaración del cliente' });
const verified = () => screen.getByRole('table', { name: 'Propiedades verificadas' });
const cellsOf = (table, label) => {
   const cells = within(within(table).getByText(label).closest('tr')).getAllByRole('cell');
   return [cells[1].textContent, cells[2].textContent];
};

describe('GeneralSummaryView', () => {
   test('shows the properties declared by the client', () => {
      renderComponent(<GeneralSummaryView info={info} />);

      const table = declared();
      expect(cellsOf(table, 'Inmuebles del solicitante')).toEqual(['2', '$200,000.00']);
      expect(cellsOf(table, 'Inmuebles obligado solidario')).toEqual(['1', '$100,000.00']);
      expect(cellsOf(table, 'Pendiente de verificar')).toEqual(['10', '$1,000,000.00']);
   });

   test('shows the rows that are not declared by the client as empty', () => {
      renderComponent(<GeneralSummaryView info={info} />);

      [
         'Co-propiedad con OS',
         'Co-propiedad u otros',
         'Libres de gravamen',
         'Gravados',
         'Embargados',
         'En escrituración',
      ].forEach((label) => expect(cellsOf(declared(), label)).toEqual(['0', '$']));
   });

   test('shows the verified properties', () => {
      renderComponent(<GeneralSummaryView info={info} />);

      const table = verified();
      expect(cellsOf(table, 'Inmuebles del solicitante')).toEqual(['3', '$300,000.00']);
      expect(cellsOf(table, 'Inmuebles obligado solidario')).toEqual(['4', '$400,000.00']);
      expect(cellsOf(table, 'Co-propiedad con OS')).toEqual(['5', '$500,000.00']);
      expect(cellsOf(table, 'Co-propiedad u otros')).toEqual(['6', '$600,000.00']);
      expect(cellsOf(table, 'Libres de gravamen')).toEqual(['7', '$700,000.00']);
      expect(cellsOf(table, 'Gravados')).toEqual(['8', '$800,000.00']);
      expect(cellsOf(table, 'Embargados')).toEqual(['9', '$900,000.00']);
      expect(cellsOf(table, 'Pendiente de verificar')).toEqual(['11', '$1,100,000.00']);
      expect(cellsOf(table, 'En escrituración')).toEqual(['12', '$1,200,000.00']);
   });

   test('shows the totals of pending and free properties', () => {
      renderComponent(<GeneralSummaryView info={info} />);

      expect(screen.getByText('Propiedades pendientes').parentElement).toHaveTextContent(/10\s*\$1,000,000\.00/);
      expect(screen.getByText('Propiedades libres').parentElement).toHaveTextContent(/7\s*\$700,000\.00/);
   });

   test('shows the credit risk and the coverage ratios', () => {
      renderComponent(<GeneralSummaryView info={info} />);

      const risks = screen.getAllByText('Riesgo de crédito solicitado:');
      expect(risks[0].parentElement).toHaveTextContent(/\$1,500,000\.00\s*MXP/);
      expect(risks[1].parentElement).toHaveTextContent(/\$1,500,000\.00\s*MXP/);
      const ratios = screen.getAllByText('Proporción de la cobertura:');
      expect(ratios[0].parentElement).toHaveTextContent(/2\.00$/);
      expect(ratios[1].parentElement).toHaveTextContent(/1\.50$/);
   });

   test('uses a black table when there is at least one verified property', () => {
      renderComponent(<GeneralSummaryView info={info} />);

      // JSDOM no aplica estilos; el color solo se expresa mediante clases.
      expect(verified().querySelector('thead')).toHaveClass('bg-black');
      expect(verified().querySelector('tbody')).toHaveClass('text-black');
   });

   test('uses a gray table and default values when nothing is verified', () => {
      renderComponent(<GeneralSummaryView info={{}} />);

      expect(verified().querySelector('thead')).toHaveClass('bg-gray');
      expect(verified().querySelector('tbody')).toHaveClass('text-gray');
      expect(cellsOf(verified(), 'Libres de gravamen')).toEqual(['0', '$']);
      expect(screen.getAllByText('Riesgo de crédito solicitado:')[0].parentElement).toHaveTextContent(/-\s*MXP/);
      expect(screen.getAllByText('Proporción de la cobertura:')[1].parentElement).toHaveTextContent(/-$/);
   });

   test.each([['copropiedadWithOS'], ['copropiedadOthers']])(
      'uses a black table when only %s has verified properties',
      (key) => {
         renderComponent(<GeneralSummaryView info={{ resume: { [key]: { numero: 1, valor: 10 } } }} />);

         expect(verified().querySelector('thead')).toHaveClass('bg-black');
      }
   );

   test('uses a black table when only the obligors have verified properties', () => {
      renderComponent(
         <GeneralSummaryView info={{ resume: { inmueblesObligated: { verify: { numero: 2, valor: 10 } } } }} />
      );

      expect(verified().querySelector('thead')).toHaveClass('bg-black');
   });
});
