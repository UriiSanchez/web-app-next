import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { CoverageProfileView } from '../../../components/PCD/CoverageProfileView';
import { templateDerivatives } from '../../../helpers';
import { renderComponent } from '../../utils/render';

const buildInfo = (overrides = {}) => ({ ...structuredClone(templateDerivatives.coverageProfile), ...overrides });

// El componente es controlado: entrega el perfil completo y el padre lo devuelve como info.
function Harness({ start, onUpdate, ...props }) {
   const [info, setInfo] = useState(start);
   const handleUpdate = (key, next) => {
      onUpdate(key, next);
      setInfo(next);
   };
   return <CoverageProfileView info={info} onUpdateData={handleUpdate} isDisabled={false} {...props} />;
}

function setup({ info = buildInfo(), ...props } = {}) {
   const onUpdate = jest.fn();
   const utils = renderComponent(<Harness start={info} onUpdate={onUpdate} {...props} />);
   return { onUpdate, ...utils };
}

const lastInfo = (onUpdate) => onUpdate.mock.calls.at(-1)[1];

describe('CoverageProfileView', () => {
   test('shows the title, the instructions and the five questions', () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Perfil de cobertura' })).toBeInTheDocument();
      expect(screen.getByText('Completa y responde las preguntas para completar esta sección')).toBeInTheDocument();
      ['Pregunta 1.', 'Pregunta 2.', 'Pregunta 3.', 'Pregunta 4.', 'Pregunta 5.'].forEach((q) =>
         expect(screen.getByText(q)).toBeInTheDocument()
      );
   });

   describe('incomplete section alert', () => {
      test('is shown when the section was saved with pending fields', () => {
         setup({ isSave: true, isComplete: false });

         expect(screen.getByText(/campos obligatorios/)).toBeInTheDocument();
      });

      test.each([
         [{ isSave: false, isComplete: false }],
         [{ isSave: true, isComplete: true }],
      ])('is hidden for %j', (props) => {
         setup(props);

         expect(screen.queryByText(/campos obligatorios/)).not.toBeInTheDocument();
      });
   });

   test('locks every answer by default', () => {
      const onUpdate = jest.fn();
      renderComponent(<CoverageProfileView info={buildInfo()} onUpdateData={onUpdate} />);

      screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
      expect(screen.getByTestId('descriptionOfStrategy')).toBeDisabled();
   });

   describe('question 1: underlying to cover', () => {
      test('shows no cards until a type is selected', () => {
         setup();

         expect(screen.getByLabelText('Tasa')).not.toBeChecked();
         expect(screen.queryByText(/Modalidad de cobertura de tasa/)).not.toBeInTheDocument();
         expect(screen.queryByText(/Cruces de divisas a operar/)).not.toBeInTheDocument();
      });

      test('selecting a rate shows the rate cards', async () => {
         const { onUpdate, user } = setup();

         await user.click(screen.getByLabelText('Tasa'));

         expect(lastInfo(onUpdate).calculatorType).toEqual({ isType: 'rate', data: [] });
         expect(screen.getByText(/Modalidad de cobertura de tasa/)).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: /Tasa\s*01/ })).toBeInTheDocument();
      });

      test('selecting a type of change shows the crossing cards', async () => {
         const { user } = setup();

         await user.click(screen.getByLabelText('Tipo de cambio'));

         expect(screen.getByText('Tipo de subyacente: Cruces de divisas a operar')).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: /Cruce\s*01/ })).toBeInTheDocument();
      });

      test('changing the type discards the cards captured before', async () => {
         const { onUpdate, user } = setup({
            info: buildInfo({ calculatorType: { isType: 'rate', data: [{ rateType: 'fixedRate', porcentage: '50' }] } }),
         });

         await user.click(screen.getByLabelText('Tipo de cambio'));

         expect(lastInfo(onUpdate).calculatorType).toEqual({ isType: 'typechange', data: [] });
      });

      test('stores the cards captured in the calculator type', async () => {
         const { onUpdate, user } = setup({ info: buildInfo({ calculatorType: { isType: 'rate', data: [] } }) });

         await user.selectOptions(screen.getByLabelText('Fuente de información'), 'fixedRate');

         expect(lastInfo(onUpdate).calculatorType).toEqual({ isType: 'rate', data: [{ rateType: 'fixedRate' }] });
      });

      test('shows the selected type checked', () => {
         setup({ info: buildInfo({ calculatorType: { isType: 'typechange', data: [] } }) });

         expect(screen.getByLabelText('Tipo de cambio')).toBeChecked();
         expect(screen.getByLabelText('Tasa')).not.toBeChecked();
      });
   });

   describe.each([
      ['imports', 'customerImports', 'import', 'De dónde:', 'fromWhere', 'Insumos en moneda extranjera:', 'foreignCurrencyInputs'],
      ['exports', 'customerExports', 'export', 'A dónde:', 'toWhere', 'Ventas nacionales en moneda extranjera:', 'foreignCurrencyDomesticSales'],
   ])('%s question', (prefix, attribute, testPrefix, whereLabel, whereField, foreignLabel, foreignField) => {
      // El testid del porcentaje de exportaciones lleva 's' a diferencia del de importaciones.
      const percentageId = attribute === 'customerImports' ? 'import-whatPercentage' : 'exports-whatPercentage';
      const yes = () => screen.getByTestId(`${prefix}-0`);
      const no = () => screen.getByTestId(`${prefix}-1`);

      test('shows no details until an answer is selected', () => {
         setup();

         expect(yes()).not.toBeChecked();
         expect(screen.queryByText(whereLabel)).not.toBeInTheDocument();
      });

      test('answering yes asks for the percentage, the place and the hedging policy', async () => {
         const { onUpdate, user } = setup();

         await user.click(yes());

         expect(lastInfo(onUpdate)[attribute].isType).toBe('Si');
         expect(screen.getAllByText('¿Qué porcentaje?')).toHaveLength(1);
         expect(screen.getByText(whereLabel)).toBeInTheDocument();
         expect(screen.getByTestId(whereField)).toBeInTheDocument();
         expect(screen.getByTestId(`${testPrefix}-currencyHedgingPolicy`)).toBeInTheDocument();
         expect(screen.queryByText(foreignLabel)).not.toBeInTheDocument();
      });

      test('answering no asks for the foreign currency and the hedging policy', async () => {
         const { onUpdate, user } = setup();

         await user.click(no());

         expect(lastInfo(onUpdate)[attribute].isType).toBe('No');
         expect(screen.getByText(foreignLabel)).toBeInTheDocument();
         expect(screen.getByTestId(`${testPrefix}-foreignCurrency`)).toBeInTheDocument();
         expect(screen.queryByText(whereLabel)).not.toBeInTheDocument();
      });

      test('changing the answer clears the details captured before', async () => {
         const captured = { isType: 'Si', whatPercentage: '40', [whereField]: 'China', currencyHedgingPolicy: '20' };
         const { onUpdate, user } = setup({ info: buildInfo({ [attribute]: { ...buildInfo()[attribute], ...captured } }) });

         await user.click(no());

         expect(lastInfo(onUpdate)[attribute]).toEqual(
            expect.objectContaining({ isType: 'No', whatPercentage: '', [whereField]: '', currencyHedgingPolicy: '' })
         );
      });

      test('captures the place typed', async () => {
         const { onUpdate, user } = setup({ info: buildInfo({ [attribute]: { ...buildInfo()[attribute], isType: 'Si' } }) });

         await user.type(screen.getByTestId(whereField), 'C');

         expect(lastInfo(onUpdate)[attribute]).toEqual(expect.objectContaining({ isType: 'Si', [whereField]: 'C' }));
      });

      test('captures the percentages typed', () => {
         const { onUpdate } = setup({ info: buildInfo({ [attribute]: { ...buildInfo()[attribute], isType: 'Si' } }) });

         // El campo bloquea el tecleo con `keyCode` (user-event no lo reporta), por lo que se dispara el cambio.
         fireEvent.change(screen.getByTestId(percentageId), { target: { value: '35' } });
         fireEvent.change(screen.getByTestId(`${testPrefix}-currencyHedgingPolicy`), { target: { value: '60' } });

         expect(lastInfo(onUpdate)[attribute]).toEqual(
            expect.objectContaining({ isType: 'Si', whatPercentage: '35', currencyHedgingPolicy: '60' })
         );
      });

      test('captures the foreign currency percentage', () => {
         const { onUpdate } = setup({ info: buildInfo({ [attribute]: { ...buildInfo()[attribute], isType: 'No' } }) });

         fireEvent.change(screen.getByTestId(`${testPrefix}-foreignCurrency`), { target: { value: '15' } });

         expect(lastInfo(onUpdate)[attribute][foreignField]).toBe('15');
      });

      test.each([['150'], ['1000']])('ignores the percentage "%s" out of range', (value) => {
         const { onUpdate } = setup({ info: buildInfo({ [attribute]: { ...buildInfo()[attribute], isType: 'Si' } }) });

         fireEvent.change(screen.getByTestId(percentageId), { target: { value } });

         expect(onUpdate).not.toHaveBeenCalled();
      });
   });

   describe('question 4: strategy description', () => {
      test('shows the description captured', () => {
         setup({ info: buildInfo({ descriptionOfStrategy: 'Cubrir el 70%' }) });

         expect(screen.getByTestId('descriptionOfStrategy')).toHaveValue('Cubrir el 70%');
      });

      test('captures the description typed', async () => {
         const { onUpdate, user } = setup();

         await user.type(screen.getByTestId('descriptionOfStrategy'), 'Hola');

         expect(lastInfo(onUpdate).descriptionOfStrategy).toBe('Hola');
      });
   });

   describe('question 5: experience with derivatives', () => {
      test('shows no institutions until the answer is yes', () => {
         setup();

         expect(screen.queryByText(/Instituciones financieras con las que opera/)).not.toBeInTheDocument();
      });

      test('answering yes shows the financial institution cards', async () => {
         const { onUpdate, user } = setup();

         await user.click(screen.getByTestId('experience-0'));

         expect(lastInfo(onUpdate).customerHasExperience.isType).toBe('Si');
         expect(screen.getByText(/máx. 5 instituciones/)).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: /Institución Financiera\s*01/ })).toBeInTheDocument();
      });

      test('answering no hides the institutions', async () => {
         const { user } = setup({ info: buildInfo({ customerHasExperience: { isType: 'Si', data: [] } }) });

         await user.click(screen.getByTestId('experience-1'));

         expect(screen.queryByText(/máx. 5 instituciones/)).not.toBeInTheDocument();
      });

      test('stores the institutions captured', async () => {
         const { onUpdate, user } = setup({ info: buildInfo({ customerHasExperience: { isType: 'Si', data: [] } }) });

         await user.selectOptions(screen.getByLabelText('Contraparte'), 'bbva');

         expect(lastInfo(onUpdate).customerHasExperience).toEqual({ isType: 'Si', data: [{ counterpart: 'bbva' }] });
      });
   });

   test('marks the unanswered questions as mandatory once the section was saved', () => {
      setup({ isSave: true });

      expect(screen.getByTestId('rate')).toHaveClass('mandatory');
      expect(screen.getByTestId('imports-0')).toHaveClass('mandatory');
      expect(screen.getByTestId('descriptionOfStrategy')).toHaveClass('mandatory');
   });
});
