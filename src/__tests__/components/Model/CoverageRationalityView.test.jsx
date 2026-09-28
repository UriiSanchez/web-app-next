import { screen } from '@testing-library/react';

import { CoverageRationalityView } from '../../../components/Model/CoverageRationalityView';
import { renderComponent } from '../../utils/render';

const data = {
   sourcerOfCredit: 'base',
   balanceMxn: '2,500',
   congruenceCreditors: 1,
   rateCalculator: {
      amountOfCredit: 1500000,
      creditTermValue: 24,
      creditTermType: 'months',
      amortizationStyle: 'bullet',
      coverageType: 'variable-fija',
      tableDerivaties: 3000,
      pointsToCover: 15,
      swapRate: 9.5,
      theoreticalLine: 2000000,
      requestedLineAmount: 2500000,
      sufficiency: 1.256,
      congruenceCalculator: 2,
   },
};

// La celda de valor es la que sigue a la etiqueta de la fila.
const valueOf = (label) => screen.getByText(label).nextElementSibling;

describe('CoverageRationalityView', () => {
   test('shows the title and the elaboration date', () => {
      renderComponent(<CoverageRationalityView data={data} dateElaboration='12-03-2025' />);

      expect(screen.getByRole('heading', { name: 'Razonabilidad de cobertura' })).toBeInTheDocument();
      expect(screen.getByText('12-03-2025')).toBeInTheDocument();
   });

   test('shows the credit to cover', () => {
      renderComponent(<CoverageRationalityView data={data} />);

      expect(valueOf('El crédito a cubrir ¿Qué origen tiene?')).toHaveTextContent('Propio, de Banco Base');
      expect(valueOf('Monto del crédito a cubrir?')).toHaveTextContent('$1,500,000');
      expect(valueOf('Saldo en MN')).toHaveTextContent('$2,500');
   });

   test('shows the term and the swap of the credit', () => {
      renderComponent(<CoverageRationalityView data={data} />);

      expect(valueOf('Plazo del crédito')).toHaveTextContent('24');
      expect(valueOf('Plazo del crédito').nextElementSibling).toHaveTextContent('Meses');
      expect(valueOf('Estilo de amortización del crédito')).toHaveTextContent('Bullet');
      expect(valueOf('Dirección de la cobertura')).toHaveTextContent('Variable a fija');
      expect(valueOf('PV01 (DV01) proporcionado por la MESA')).toHaveTextContent('$3,000');
      expect(valueOf('Puntos (PV01) a cubrir')).toHaveTextContent('15');
      expect(valueOf('Tasa SWAP cotizada')).toHaveTextContent('9.5%');
   });

   test('shows the lines and the sufficiency', () => {
      renderComponent(<CoverageRationalityView data={data} />);

      expect(valueOf('Línea teórica')).toHaveTextContent('$2,000,000');
      expect(valueOf('Monto de línea solicitado')).toHaveTextContent('$2,500,000');
      expect(valueOf('Suficiencia')).toHaveTextContent('1.26');
   });

   test('shows the congruence validations with their meaning', () => {
      renderComponent(<CoverageRationalityView data={data} />);

      expect(valueOf('Validación de congruencia')).toHaveTextContent('Línea excedida');
      expect(valueOf('Congruencia de línea')).toHaveTextContent('Congruente');
      // La calificación repite la congruencia de línea.
      expect(screen.getByText('Calificación Razonabilidad de Cobertura').nextElementSibling).toHaveTextContent(
         'Congruente'
      );
   });

   test('colors the congruence cells with the color of the result', () => {
      renderComponent(<CoverageRationalityView data={data} />);

      // JSDOM no aplica estilos; el color solo se expresa mediante clases.
      expect(valueOf('Validación de congruencia')).toHaveClass('bg-red-500');
      expect(valueOf('Congruencia de línea')).toHaveClass('bg-emerald-600');
   });

   test('shows the weighted rating received', () => {
      renderComponent(<CoverageRationalityView data={data} resume={{ weightedRating: '7/10', compositeWeightedRating: '2.4/3.5' }} />);

      expect(screen.getByText('7/10')).toBeInTheDocument();
      expect(screen.getByText('2.4/3.5')).toBeInTheDocument();
   });

   test('shows default values when the model returned no information', () => {
      renderComponent(<CoverageRationalityView data={{ rateCalculator: {} }} />);

      expect(valueOf('El crédito a cubrir ¿Qué origen tiene?')).toHaveTextContent('-');
      expect(valueOf('Saldo en MN')).toHaveTextContent('$-');
      expect(valueOf('Plazo del crédito')).toHaveTextContent('0');
      expect(valueOf('Plazo del crédito').nextElementSibling).toHaveTextContent('-');
      expect(valueOf('Tasa SWAP cotizada')).toHaveTextContent('-%');
      expect(valueOf('Validación de congruencia')).toHaveTextContent('-');
      expect(valueOf('Validación de congruencia')).toHaveClass('bg-gray');
      expect(screen.getByText('-/10')).toBeInTheDocument();
      expect(screen.getByText('-/3.5')).toBeInTheDocument();
   });
});
