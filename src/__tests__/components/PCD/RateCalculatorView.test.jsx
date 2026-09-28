import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { RateCalculatorView } from '../../../components/PCD/RateCalculatorView';
import { templateDerivatives } from '../../../helpers';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const DOLLAR = 20;

const buildInfo = (overrides = {}, rateOverrides = {}) => {
   const base = structuredClone(templateDerivatives.calculatorRate);
   return { ...base, ...overrides, rateCalculator: { ...base.rateCalculator, ...rateOverrides } };
};

// El componente es controlado: entrega el objeto completo y el padre lo devuelve como info.
function Harness({ start, onUpdate, ...props }) {
   const [info, setInfo] = useState(start);
   const handleUpdate = (key, next) => {
      onUpdate(key, next);
      setInfo(next);
   };
   return <RateCalculatorView info={info} onUpdateData={handleUpdate} dollar={DOLLAR} isDisabled={false} {...props} />;
}

function setup({ info = buildInfo(), ...props } = {}) {
   const onUpdate = jest.fn();
   const wrapper = createContextWrapper({ general: { DOLLAR: String(DOLLAR) }, actions: createActions() });
   const utils = renderComponent(<Harness start={info} onUpdate={onUpdate} {...props} />, { wrapper });
   return { onUpdate, ...utils };
}

const lastInfo = (onUpdate) => onUpdate.mock.calls.at(-1)[1];
const banner = (text) => screen.getByText(text).parentElement;

describe('RateCalculatorView', () => {
   test('shows the exchange rate section and the credits to cover', () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Calculadora de Parámetros de Operación' })).toBeInTheDocument();
      expect(screen.getByText('Crédito(s) a cubrir')).toBeInTheDocument();
      expect(screen.getByText('Acreedor 1')).toBeInTheDocument();
   });

   test('warns about the pending fields only when the section was saved incomplete', () => {
      const { unmount } = setup({ isSave: true, isComplete: false });
      expect(screen.getByText(/campos obligatorios/)).toBeInTheDocument();
      unmount();

      setup({ isSave: true, isComplete: true });

      expect(screen.queryByText(/campos obligatorios/)).not.toBeInTheDocument();
   });

   describe('credit congruence', () => {
      test('shows no label while there is no congruence result', () => {
         setup({ info: buildInfo({ congruenceCreditors: 0, valueCongruence: 0 }) });

         expect(banner(/¿Congruencia con lo que se tiene de créditos\?/)).toHaveClass('bg-gray');
      });

      test('shows the congruence in green', () => {
         setup({ info: buildInfo({ congruenceCreditors: 1, valueCongruence: 3000 }) });

         const box = banner(/¿Congruencia con lo que se tiene de créditos\?/);
         expect(box).toHaveClass('bg-emerald-600');
         expect(box).toHaveTextContent('Congruencia: 3,000');
      });

      test('shows the incongruence in red', () => {
         setup({ info: buildInfo({ congruenceCreditors: 2, valueCongruence: 1500 }) });

         const box = banner(/¿Congruencia con lo que se tiene de créditos\?/);
         expect(box).toHaveClass('bg-red-500');
         expect(box).toHaveTextContent('Incongruencia: 1,500');
      });

      test('recalculates the congruence when a creditor changes', async () => {
         const creditor = {
            natureOfCredit: 'revolvente',
            lineAmount: '5000',
            balanceInNationalCurrency: '4000',
            amountCover: '1000',
         };
         const { onUpdate, user } = setup({ info: buildInfo({ creditors: [creditor] }) });

         await user.type(screen.getByLabelText('Acreedor'), 'B');

         expect(lastInfo(onUpdate)).toEqual(
            expect.objectContaining({ congruenceCreditors: 1, valueCongruence: 3000, balanceMxn: 4000 })
         );
         expect(banner(/¿Congruencia con lo que se tiene de créditos\?/)).toHaveTextContent('Congruencia: 3,000');
      });
   });

   describe('origin of the credit', () => {
      test('shows the selected origin', () => {
         setup();

         expect(screen.getByLabelText('Propio, de Banco Base')).toBeChecked();
         expect(screen.getByLabelText('De otro banco')).not.toBeChecked();
      });

      test('changes the origin without touching the calculator', async () => {
         const { onUpdate, user } = setup();

         await user.click(screen.getByLabelText('De otro banco'));

         expect(onUpdate).toHaveBeenCalledWith('calculatorRate', expect.objectContaining({ sourcerOfCredit: 'other' }));
         expect(screen.getByLabelText('De otro banco')).toBeChecked();
      });
   });

   describe('calculator', () => {
      test('shows the values captured', () => {
         setup({
            info: buildInfo(
               {},
               {
                  amountOfCredit: '5000000',
                  amountOfCreditUS: 250000,
                  creditTermValue: '24',
                  creditTermType: 'months',
                  coverageType: 'fija-variable',
                  amortizationStyle: 'bullet',
                  pointsToCover: '10',
                  tableDerivaties: '1.50',
                  swapRate: '9.50',
               }
            ),
         });

         expect(screen.getByLabelText('Monto del crédito a cubrir')).toHaveValue('$5,000,000');
         expect(screen.getByText('$250,000.00')).toBeInTheDocument();
         expect(screen.getByLabelText('Plazo del crédito')).toHaveValue('24');
         expect(screen.getByDisplayValue('Mes(es)')).toBeInTheDocument();
         expect(screen.getByLabelText('Tipo de cobertura')).toHaveDisplayValue('Fija a variable');
         expect(screen.getByLabelText('Estilo de amortización')).toHaveDisplayValue('Bullet');
         expect(screen.getByLabelText('Puntos PV01 a cubrir')).toHaveValue('10');
         expect(screen.getByLabelText('PV01 (DV01) mesa derivados')).toHaveValue('1.50');
         expect(screen.getByLabelText('Tasa SWAP cotizada')).toHaveValue('9.50');
      });

      test('converts the amount of the credit to dollars with the exchange rate', async () => {
         const { onUpdate, user } = setup();

         await user.type(screen.getByLabelText('Monto del crédito a cubrir'), '4000');

         expect(lastInfo(onUpdate).rateCalculator.amountOfCredit).toBe('4000');
         expect(lastInfo(onUpdate).rateCalculator.amountOfCreditUS).toBe(200);
         expect(screen.getByText('$200.00')).toBeInTheDocument();
      });

      test('formats the PV01 and the swap rate with two decimals', () => {
         const { onUpdate } = setup();

         fireEvent.change(screen.getByLabelText('PV01 (DV01) mesa derivados'), { target: { value: '150' } });
         fireEvent.change(screen.getByLabelText('Tasa SWAP cotizada'), { target: { value: '950' } });

         expect(lastInfo(onUpdate).rateCalculator.swapRate).toBe('9.50');
         expect(onUpdate.mock.calls.at(-2)[1].rateCalculator.tableDerivaties).toBe('1.50');
      });

      test('captures the term, the coverage type and the amortization style', async () => {
         const { onUpdate, user } = setup();

         await user.selectOptions(screen.getByLabelText('Tipo de cobertura'), 'variable-fija');
         await user.selectOptions(screen.getByLabelText('Estilo de amortización'), 'amortizable lineal');
         await user.selectOptions(screen.getByDisplayValue('- Seleccionar -'), 'years');
         await user.type(screen.getByLabelText('Plazo del crédito'), '5');

         expect(lastInfo(onUpdate).rateCalculator).toEqual(
            expect.objectContaining({
               coverageType: 'variable-fija',
               amortizationStyle: 'amortizable lineal',
               creditTermType: 'years',
               creditTermValue: '5',
            })
         );
      });

      test('captures the points to cover', async () => {
         const { onUpdate, user } = setup();

         await user.type(screen.getByLabelText('Puntos PV01 a cubrir'), '12');

         expect(lastInfo(onUpdate).rateCalculator.pointsToCover).toBe('12');
      });
   });

   describe('sufficiency and annual congruence', () => {
      const withLine = (requestedLineAmount) =>
         buildInfo(
            {},
            { pointsToCover: '10', tableDerivaties: '1.00', requestedLineAmount, creditTermType: 'months' }
         );

      test.each([
         ['5', 'Línea insuficiente, revisar', 'bg-yellow-500', '50.00'],
         ['10', 'Línea suficiente', 'bg-emerald-600', '100.00'],
         ['100', 'Línea excedida', 'bg-red-500', '1000.00'],
      ])('with a requested line of %s shows "%s"', async (requestedLineAmount, label, color, sufficiency) => {
         const { user } = setup({ info: withLine(requestedLineAmount) });

         await user.selectOptions(screen.getByDisplayValue('Mes(es)'), 'years');

         const box = banner(/Validación de congruencia anual:/);
         expect(box).toHaveTextContent(label);
         expect(box).toHaveClass(color);
         expect(screen.getByText(sufficiency)).toBeInTheDocument();
      });

      test('shows the theoretical line and the requested line in thousands', () => {
         setup({
            info: buildInfo({}, { theoreticalLine: 2500000, requestedLineAmount: 1500000 }),
         });

         expect(screen.getByText('Línea teórica').nextElementSibling).toHaveTextContent('$2,500');
         expect(screen.getByText('Monto de línea solicitado').nextElementSibling).toHaveTextContent('$1,500');
      });

      test('shows a gray bar without result while nothing was calculated', () => {
         setup();

         expect(banner(/Validación de congruencia anual:/)).toHaveClass('bg-gray');
      });
   });

   test('locks every field when disabled', () => {
      setup({ isDisabled: true });

      expect(screen.getByLabelText('Monto del crédito a cubrir')).toBeDisabled();
      expect(screen.getByLabelText('Tipo de cobertura')).toBeDisabled();
      expect(screen.getByLabelText('De otro banco')).toBeDisabled();
      expect(screen.getByLabelText('Acreedor')).toBeDisabled();
   });

   test('marks the empty fields as mandatory once the section was saved', () => {
      setup({ isSave: true });

      expect(screen.getByLabelText('Tipo de cobertura')).toHaveClass('mandatory');
      expect(screen.getByLabelText('Plazo del crédito')).toHaveClass('mandatory');
   });
});
