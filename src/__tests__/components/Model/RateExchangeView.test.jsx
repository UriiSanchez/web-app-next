import { screen } from '@testing-library/react';

import { RateExchangeView } from '../../../components/Model/RateExchangeView';
import { renderComponent } from '../../utils/render';

const data = {
   customerPosition: 'Exportador',
   salesForLastFiscalYear: 12000000,
   percentageInForeignCurrency: 35,
   foreignCurrencyFlow: 450000,
   coveragePolicy: 80,
   estimatedCumulativePosition: 360000,
   averageTransactionAmount: 25000,
   estimatedRevolving: 'mensual',
   maximumCoverageTermInMonths: 12,
   mpa: 1250000,
   annualConsistencyValidation: { value: 500000, title: 'Congruente', color: 'bg-emerald-600' },
   coverageIndex: 0.756,
   spread: 1.5,
   estimatedLine: 3000000,
};

const valueOf = (label) => screen.getByText(label).nextElementSibling;

describe('RateExchangeView', () => {
   test('shows the title and the elaboration date', () => {
      renderComponent(<RateExchangeView data={data} dateElaboration='12-03-2025' />);

      expect(screen.getByRole('heading', { name: 'Tipo de Cambio' })).toBeInTheDocument();
      expect(screen.getByText('12-03-2025')).toBeInTheDocument();
   });

   test('shows a dash when there is no elaboration date', () => {
      renderComponent(<RateExchangeView data={data} />);

      expect(screen.getByText('Fecha elaboración:').nextElementSibling).toHaveTextContent('-');
   });

   test('shows the position of the customer', () => {
      renderComponent(<RateExchangeView data={data} />);

      expect(valueOf('Posición del Cliente')).toHaveTextContent('Exportador');
      expect(valueOf('Costo de Ventas Último Ejercicio Anual')).toHaveTextContent('$12,000,000');
      expect(valueOf('Costo de Ventas Último Ejercicio Anual').nextElementSibling).toHaveTextContent('MXN');
      expect(valueOf('Porcentaje en Moneda Extranjera (%)')).toHaveTextContent('35%');
      expect(valueOf('Flujo de ME Actualizado')).toHaveTextContent('$450,000');
   });

   test('shows the coverage figures in dollars', () => {
      renderComponent(<RateExchangeView data={data} />);

      expect(valueOf('Política de cobertura (% máximo)')).toHaveTextContent('80%');
      expect(valueOf('Posición acumulada estimada anual')).toHaveTextContent('$360,000');
      expect(valueOf('Posición acumulada estimada anual').nextElementSibling).toHaveTextContent('USD');
      expect(valueOf('Monto promedio por operación')).toHaveTextContent('$25,000');
      expect(valueOf('Revolvencia estimada')).toHaveTextContent('mensual');
      expect(valueOf('Plazo Máximo de cobertura')).toHaveTextContent('12');
      expect(valueOf('Plazo Máximo de cobertura').nextElementSibling).toHaveTextContent('Meses');
      expect(valueOf('Nocional (Máxima Posición Anual)')).toHaveTextContent('$1,250,000');
   });

   test('shows the annual consistency validation with its title and color', () => {
      renderComponent(<RateExchangeView data={data} />);

      expect(valueOf('Validación de Congruencia Anual')).toHaveTextContent('$500,000');
      expect(valueOf('Validación de Congruencia Anual').nextElementSibling).toHaveTextContent('Congruente');
      // JSDOM no aplica estilos; el color solo se expresa mediante clases.
      expect(valueOf('Validación de Congruencia Anual').nextElementSibling).toHaveClass('bg-emerald-600');
      expect(screen.getByText('Calificación Razonabilidad de Cobertura').nextElementSibling).toHaveTextContent(
         'Congruente'
      );
   });

   test('shows the coverage index, the spread and the equivalent amount', () => {
      renderComponent(<RateExchangeView data={data} />);

      expect(valueOf('Índice de Cobertura (%)')).toHaveTextContent('0.76');
      expect(valueOf('Spread de línea solicitado')).toHaveTextContent('$1.50');
      expect(valueOf('Spread de línea solicitado').nextElementSibling).toHaveTextContent('Peso por dólar');
      expect(valueOf('Monto equivalente')).toHaveTextContent('$3,000,000.00');
   });

   test('shows the weighted rating received or the default one', () => {
      const { rerender } = renderComponent(
         <RateExchangeView data={data} resume={{ weightedRating: '7/10', compositeWeightedRating: '2.4/3.5' }} />
      );
      expect(screen.getByText('7/10')).toBeInTheDocument();
      expect(screen.getByText('2.4/3.5')).toBeInTheDocument();

      rerender(<RateExchangeView data={data} />);

      expect(screen.getByText('-/10')).toBeInTheDocument();
      expect(screen.getByText('-/3.5')).toBeInTheDocument();
   });

   test('shows dashes when the model returned no figures', () => {
      renderComponent(<RateExchangeView data={{ annualConsistencyValidation: {} }} />);

      [
         'Posición del Cliente',
         'Costo de Ventas Último Ejercicio Anual',
         'Flujo de ME Actualizado',
         'Posición acumulada estimada anual',
         'Monto promedio por operación',
         'Revolvencia estimada',
         'Plazo Máximo de cobertura',
         'Nocional (Máxima Posición Anual)',
         'Validación de Congruencia Anual',
         'Índice de Cobertura (%)',
         'Spread de línea solicitado',
         'Monto equivalente',
      ].forEach((label) => expect(valueOf(label)).toHaveTextContent('-'));
      expect(valueOf('Porcentaje en Moneda Extranjera (%)')).toHaveTextContent('-%');
      expect(valueOf('Política de cobertura (% máximo)')).toHaveTextContent('-%');
   });
});
