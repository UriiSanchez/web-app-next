import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { ExchangeRateCalculatorView } from '../../../components/PCD/ExchangeRateCalculatorView';
import { templateDerivatives } from '../../../helpers';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const DOLLAR = 20;

const buildInfo = (overrides = {}) => ({ ...structuredClone(templateDerivatives.calculatorRateExchange), ...overrides });

// El componente es controlado: entrega el objeto completo y el padre lo devuelve como info.
function Harness({ start, onUpdate, ...props }) {
   const [info, setInfo] = useState(start);
   const handleUpdate = (key, next) => {
      onUpdate(key, next);
      setInfo(next);
   };
   return (
      <ExchangeRateCalculatorView info={info} onUpdateData={handleUpdate} dollar={DOLLAR} isDisabled={false} {...props} />
   );
}

function setup({ info = buildInfo(), ...props } = {}) {
   const onUpdate = jest.fn();
   const wrapper = createContextWrapper({ general: { DOLLAR: String(DOLLAR) }, actions: createActions() });
   const utils = renderComponent(<Harness start={info} onUpdate={onUpdate} {...props} />, { wrapper });
   return { onUpdate, ...utils };
}

const lastInfo = (onUpdate) => onUpdate.mock.calls.at(-1)[1];
const boxOf = (label) => screen.getByText(label).nextElementSibling;
const validationBar = () => screen.getByText(/Validación de congruencia anual:/).parentElement;

describe('ExchangeRateCalculatorView', () => {
   test('shows the exchange rate section and the block titles', () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Calculadora de Parámetros de Operación' })).toBeInTheDocument();
      ['Estimación de cobertura anual', 'Parámetros de operación', 'Congruencia de la línea'].forEach((title) =>
         expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
      );
      expect(screen.getByText('*Todos los datos mostrados son anuales')).toBeInTheDocument();
   });

   test('warns about the pending fields only when the section was saved incomplete', () => {
      const { unmount } = setup({ isSave: true, isComplete: false });
      expect(screen.getByText(/campos obligatorios/)).toBeInTheDocument();
      unmount();

      setup({ isSave: true, isComplete: true });

      expect(screen.queryByText(/campos obligatorios/)).not.toBeInTheDocument();
   });

   describe('estimation', () => {
      test('shows a dash while the customer has no position', () => {
         setup();

         expect(boxOf('Posición del cliente')).toHaveTextContent('-');
      });

      test('asks for the sales of the last year for a selling position', () => {
         setup({ info: buildInfo({ customerPosition: 'Venta de dólares' }) });

         expect(boxOf('Posición del cliente')).toHaveTextContent('Venta de dólares');
         expect(screen.getByText('Ventas del último ejercicio')).toBeInTheDocument();
      });

      test('asks for the cost of sales for a buying position', () => {
         setup({ info: buildInfo({ customerPosition: 'Compra de dólares' }) });

         expect(screen.getByText('Costo de ventas último del ejercicio')).toBeInTheDocument();
         expect(screen.queryByText('Ventas del último ejercicio')).not.toBeInTheDocument();
      });

      test('shows the values calculated by the model', () => {
         setup({
            info: buildInfo({
               percentageInForeignCurrency: '50',
               coveragePolicy: '80',
               foreignCurrencyFlow: 25,
               estimatedCumulativePosition: 20,
               coverageIndex: 60,
            }),
         });

         expect(boxOf('% en moneda extranjera')).toHaveTextContent('50%');
         expect(boxOf('Politica de cobertura')).toHaveTextContent('80%');
         expect(boxOf('Flujo de moneda extranjera*')).toHaveTextContent('$25.00');
         expect(boxOf('Posición acumulada estimada*')).toHaveTextContent('$20.00');
         expect(boxOf('Índice de cobertura')).toHaveTextContent('60%');
      });

      test('shows zeros for the percentages that are missing', () => {
         setup();

         expect(boxOf('% en moneda extranjera')).toHaveTextContent('0%');
         expect(boxOf('Politica de cobertura')).toHaveTextContent('0%');
      });

      test('recalculates the foreign currency flow and the position when the sales change', () => {
         const { onUpdate } = setup({ info: buildInfo({ percentageInForeignCurrency: '50', coveragePolicy: '80' }) });

         fireEvent.change(screen.getAllByPlaceholderText('$ 0')[0], { target: { value: '$1,000' } });

         expect(lastInfo(onUpdate)).toEqual(
            expect.objectContaining({ salesForLastFiscalYear: '1000', foreignCurrencyFlow: 25, estimatedCumulativePosition: 20 })
         );
         expect(boxOf('Flujo de moneda extranjera*')).toHaveTextContent('$25.00');
         expect(boxOf('Posición acumulada estimada*')).toHaveTextContent('$20.00');
      });
   });

   describe('operation parameters', () => {
      test('shows the parameters captured', () => {
         setup({
            info: buildInfo({
               averageTransactionAmount: '5000',
               estimatedRevolving: 'mensual',
               maximumCoverageTermInMonths: '6',
               mpa: 30000,
            }),
         });

         expect(screen.getByLabelText('Revolvencia estimada')).toHaveDisplayValue('Mensual');
         expect(screen.getByLabelText('Plazo máximo de cobertura en meses')).toHaveDisplayValue('06');
         expect(screen.getByText('MPA (máxima posición abierta)').nextElementSibling).toHaveTextContent('$30,000.00');
      });

      test('offers the revolving periods and up to sixty months', () => {
         setup();

         expect(Array.from(screen.getByLabelText('Revolvencia estimada').options).map((o) => o.textContent)).toEqual([
            'Seleccionar',
            'Semanal',
            'Quincenal',
            'Mensual',
            'Bimestral',
            'Trimestral',
         ]);
         const months = Array.from(screen.getByLabelText('Plazo máximo de cobertura en meses').options);
         expect(months).toHaveLength(61);
         expect(months.at(-1).textContent).toBe('60');
      });

      test('calculates the MPA, the annual validation and the coverage index with the selections', async () => {
         const { onUpdate, user } = setup({
            info: buildInfo({
               averageTransactionAmount: '1000',
               salesForLastFiscalYear: '1000',
               percentageInForeignCurrency: '50',
               coveragePolicy: '80',
            }),
         });

         await user.selectOptions(screen.getByLabelText('Revolvencia estimada'), 'mensual');
         await user.selectOptions(screen.getByLabelText('Plazo máximo de cobertura en meses'), '12');

         expect(lastInfo(onUpdate)).toEqual(
            expect.objectContaining({
               mpa: 12000,
               estimatedCumulativePosition: 20,
               annualConsistencyValidation: { value: 12000, color: 'bg-red-500', title: 'No congruencia' },
            })
         );
         expect(screen.getByText('MPA (máxima posición abierta)').nextElementSibling).toHaveTextContent('$12,000.00');
         expect(validationBar()).toHaveTextContent('No congruencia');
         expect(validationBar()).toHaveClass('bg-red-500');
      });

      test('shows a valid congruence when the annual validation is lower than the position', async () => {
         const { user } = setup({
            info: buildInfo({
               averageTransactionAmount: '10',
               salesForLastFiscalYear: '200000',
               percentageInForeignCurrency: '100',
               coveragePolicy: '100',
            }),
         });

         await user.selectOptions(screen.getByLabelText('Revolvencia estimada'), 'mensual');

         expect(validationBar()).toHaveTextContent('Congruencia válida');
         expect(validationBar()).toHaveClass('bg-emerald-600');
      });

      test('captures the average transaction amount without the money format', async () => {
         const { onUpdate, user } = setup({
            info: buildInfo({ salesForLastFiscalYear: '1000', percentageInForeignCurrency: '50', coveragePolicy: '80' }),
         });

         await user.type(screen.getAllByPlaceholderText('$ 0')[1], '2500');

         expect(lastInfo(onUpdate).averageTransactionAmount).toBe('2500');
      });

      test('shows a gray bar without result while nothing was calculated', () => {
         setup({ info: buildInfo({ annualConsistencyValidation: undefined }) });

         expect(validationBar()).toHaveClass('bg-gray');
      });
   });

   describe('line congruence', () => {
      test('captures the spread and calculates the estimated line', () => {
         const { onUpdate } = setup({
            info: buildInfo({ mpa: 12000, averageTransactionAmount: '1000', estimatedRevolving: 'mensual', maximumCoverageTermInMonths: '12' }),
         });

         // El campo bloquea el tecleo con `keyCode` (user-event no lo reporta), por lo que se dispara el cambio.
         fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value: '3' } });

         expect(lastInfo(onUpdate)).toEqual(expect.objectContaining({ spread: '3', estimatedLine: 36000 }));
         expect(screen.getByText('Línea estimada').nextElementSibling).toHaveTextContent('$36,000');
      });

      test('shows the estimated line as zero by default', () => {
         setup();

         expect(screen.getByText('Línea estimada').nextElementSibling).toHaveTextContent('$ 0');
      });

      test.each([['6'], ['1000']])('ignores the spread "%s" out of range', (value) => {
         const { onUpdate } = setup();

         fireEvent.change(screen.getByPlaceholderText('0.0'), { target: { value } });

         expect(onUpdate).not.toHaveBeenCalled();
      });
   });

   test('locks every field when disabled', () => {
      setup({ isDisabled: true });

      expect(screen.getByPlaceholderText('0.0')).toBeDisabled();
      expect(screen.getByLabelText('Revolvencia estimada')).toBeDisabled();
      expect(screen.getByLabelText('Plazo máximo de cobertura en meses')).toBeDisabled();
   });

   test('marks the empty fields as mandatory once the section was saved', () => {
      setup({ isSave: true });

      expect(screen.getByLabelText('Revolvencia estimada')).toHaveClass('mandatory');
      expect(screen.getByPlaceholderText('0.0').parentElement).toHaveClass('mandatory');
   });
});
