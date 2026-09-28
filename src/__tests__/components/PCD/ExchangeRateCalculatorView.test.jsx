import { ExchangeRateCalculatorView } from '../../../components/PCD';

import { useGlobalContext } from '../../../hooks';

jest.mock('../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));

const mockCustomerProfile = {
   coverageProfile: {
      calculatorType: { data: [{ cross: 'EURBRL', porcentage: '10' }], isType: 'typechange' },
      customerExports: {
         isType: 'No',
         toWhere: '',
         whatPercentage: '',
         currencyHedgingPolicy: '20',
         foreignCurrencyDomesticSales: '100',
      },
      customerImports: {
         isType: 'Si',
         fromWhere: 'México',
         whatPercentage: '100',
         currencyHedgingPolicy: '100',
         foreignCurrencyInputs: '',
      },
      customerHasExperience: { data: [], isType: 'No' },
      descriptionOfStrategy: 'Esto es solo una prueba',
   },
   calculatorRateExchange: {
      mpa: '',
      spread: '',
      coverageIndex: '',
      estimatedLine: '',
      coveragePolicy: '60',
      customerPosition: 'Compra moneda extranjera',
      estimatedRevolving: '',
      foreignCurrencyFlow: '',
      salesForLastFiscalYear: '',
      averageTransactionAmount: '',
      annualConsistencyValidation: { color: 'bg-gray', title: '', value: '' },
      estimatedCumulativePosition: '',
      maximumCoverageTermInMonths: '',
      percentageInForeignCurrency: '47',
   },
};

// TODO falta añadir Unit Testing
describe('ExchangeRateCalculatorView component', () => {
   const props = {
      info: mockCustomerProfile.calculatorRateExchange,
      dollar: 18,
      isDisabled: false,
      isSave: false,
      isComplete: false,
   };
   let mockOnUpdateData;
   let globalContextMock;

   beforeEach(() => {
      jest.clearAllMocks();
      mockOnUpdateData = jest.fn();
      globalContextMock = { general: { DOLLAR: '18.0712' } };
      useGlobalContext.mockReturnValue(globalContextMock);
   });

   test('renders correctly with initial state and controls', async () => {
      const {
         queries: { getByLabelText, getByText },
      } = await renderPage(ExchangeRateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
      });

      expect(getByText('Estimación de cobertura anual')).toBeInTheDocument();
      expect(getByText('Posición del cliente')).toBeInTheDocument();
      expect(getByText('% en moneda extranjera')).toBeInTheDocument();
      expect(getByText('Flujo de moneda extranjera*')).toBeInTheDocument();
      expect(getByText('Politica de cobertura')).toBeInTheDocument();
      expect(getByText('Posición acumulada estimada*')).toBeInTheDocument();
      expect(getByText('Índice de cobertura')).toBeInTheDocument();
      expect(getByText('*Todos los datos mostrados son anuales')).toBeInTheDocument();
      expect(getByText('Parámetros de operación')).toBeInTheDocument();
      expect(getByText('¿Cuál es el monto promedio por operación?')).toBeInTheDocument();
      expect(getByLabelText('Revolvencia estimada')).toBeInTheDocument();
      expect(getByLabelText('Plazo máximo de cobertura en meses')).toBeInTheDocument();
      expect(getByText('MPA (máxima posición abierta)')).toBeInTheDocument();
      expect(getByText('Validación de congruencia anual:')).toBeInTheDocument();
      expect(getByText('Congruencia de la línea')).toBeInTheDocument();
      expect(getByText('Spread')).toBeInTheDocument();
      expect(getByText('Línea estimada')).toBeInTheDocument();
   });

   test('If the calculator is incomplete but no saving has been done, the input class must be "input-form"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ExchangeRateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
      });

      expect(getByTestId('maximumCoverageTermInMonths')).toHaveClass('input-form');
      expect(getByTestId('estimatedRevolving')).toHaveClass('input-form');
   });

   test('If the calculator is incomplete but a save has already been made, the input class must be "mandatory"', async () => {
      const {
         queries: { getByTestId, getByAltText, getByText },
      } = await renderPage(ExchangeRateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isSave: true,
      });

      expect(getByAltText('Información del completado de los campos de la sección')).toBeInTheDocument();
      expect(getByText('campos obligatorios')).toBeInTheDocument();

      expect(getByTestId('maximumCoverageTermInMonths')).toHaveClass('mandatory');
      expect(getByTestId('estimatedRevolving')).toHaveClass('mandatory');
   });

   test('If the calculator is complete the input class must be "input-form"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ExchangeRateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isComplete: true,
      });

      expect(getByTestId('maximumCoverageTermInMonths')).toHaveClass('input-form');
      expect(getByTestId('estimatedRevolving')).toHaveClass('input-form');
   });

   test('If the page is disabled the input class must be "disabled"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ExchangeRateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isDisabled: true,
      });

      expect(getByTestId('maximumCoverageTermInMonths')).toHaveClass('disabled');
      expect(getByTestId('estimatedRevolving')).toHaveClass('disabled');
   });
});
