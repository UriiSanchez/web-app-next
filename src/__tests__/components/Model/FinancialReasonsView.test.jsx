import { screen, within } from '@testing-library/react';

import { FinancialReasonsView } from '../../../components/Model/FinancialReasonsView';
import { renderComponent } from '../../utils/render';

const scenario = (base) => ({
   acido: base + 1,
   apalancamiento: base + 2,
   'cobertura intereses': base + 3,
   'horizonte deuda': base + 4,
   'capacidad pago': base + 5000,
});

const data = {
   'Valor del Calculo': { uno: scenario(10), dos: scenario(20) },
   Calificacion: { uno: scenario(30), dos: scenario(40) },
   'Calificacion Ponderada': { uno: scenario(50), dos: scenario(60) },
   'Calificaciones globales': {
      'Calificación Total UNO': 7.5,
      'Calificación Total DOS': 8,
      'Calificación Total PARCIAL': 6.25,
      'Calificación global UNO': 3,
      'Calificación global DOS': 3.5,
      'Calificación global PARCIAL': 2,
   },
};

const emptyData = {
   'Valor del Calculo': {},
   Calificacion: {},
   'Calificacion Ponderada': {},
   'Calificaciones globales': {},
};

// Cada bloque (valor, calificación, ponderada) es un contenedor con una columna por escenario.
const block = (index) => document.querySelectorAll('.col-span-2.text-sm')[index];
const column = (blockIndex, title) => screen.getAllByText(title)[blockIndex].parentElement;
const cells = (col) => Array.from(col.children).map((c) => c.textContent);

describe('FinancialReasonsView', () => {
   test('shows the title, the elaboration date and the headers', () => {
      renderComponent(<FinancialReasonsView data={data} dateElaboration='12-03-2025' />);

      expect(screen.getByRole('heading', { name: 'Razones financieras' })).toBeInTheDocument();
      expect(screen.getByText('12-03-2025')).toBeInTheDocument();
      ['Valor de cálculo', 'Calificación', 'Calificación Ponderada'].forEach((title) =>
         expect(screen.getAllByText(title).length).toBeGreaterThan(0)
      );
   });

   test('shows the fixed weights of each ratio', () => {
      renderComponent(<FinancialReasonsView data={data} />);

      expect(screen.getAllByText('35%')).toHaveLength(2);
      expect(screen.getAllByText('10%')).toHaveLength(3);
      expect(screen.getByText('100%')).toBeInTheDocument();
   });

   test('shows a column per scenario in the calculated values', () => {
      renderComponent(<FinancialReasonsView data={data} />);

      expect(cells(column(0, 'uno'))).toEqual(['uno', '11', '12', '13', '14', '5,010']);
      expect(cells(column(0, 'dos'))).toEqual(['dos', '21', '22', '23', '24', '5,020']);
   });

   test('shows a column per scenario in the ratings and the weighted ratings', () => {
      renderComponent(<FinancialReasonsView data={data} />);

      expect(cells(column(1, 'uno'))).toEqual(['uno', '31', '32', '33', '34', '5030']);
      expect(cells(column(2, 'dos'))).toEqual(['dos', '61', '62', '63', '64', '5060']);
   });

   test('shows zeros for the ratios that are missing', () => {
      renderComponent(
         <FinancialReasonsView
            data={{ ...emptyData, 'Valor del Calculo': { uno: {} }, Calificacion: { uno: {} }, 'Calificacion Ponderada': { uno: {} } }}
         />
      );

      expect(cells(column(0, 'uno'))).toEqual(['uno', '0', '0', '0', '0', '0']);
      expect(cells(column(1, 'uno'))).toEqual(['uno', '0', '0', '0', '0', '0']);
      expect(cells(column(2, 'uno'))).toEqual(['uno', '0', '0', '0', '0', '0']);
   });

   test('shows the overall ratings formatted', () => {
      renderComponent(<FinancialReasonsView data={data} />);

      const section = screen.getByText('Calificación global (40%)').parentElement.nextElementSibling;
      const totals = within(section).getAllByText(/^\d+\.\d{2}$/).map((n) => n.textContent);
      expect(totals).toEqual(['7.50', '8.00', '6.25', '3.00', '3.50', '2.00']);
   });

   test('shows dashes when the overall ratings are missing', () => {
      renderComponent(<FinancialReasonsView data={emptyData} />);

      const section = screen.getByText('Calificación global (40%)').parentElement.nextElementSibling;
      expect(within(section).getAllByText('-')).toHaveLength(6);
      expect(block(0)).toBeEmptyDOMElement();
   });
});
