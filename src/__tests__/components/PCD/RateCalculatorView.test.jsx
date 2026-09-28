import { RateCalculatorView } from '../../../components/PCD';

import { useGlobalContext } from '../../../hooks';

jest.mock('../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));

const mockCustomerProfile = {
   creditors: [],
   balanceMxn: '',
   valueCongruence: 0,
   congruenceCreditors: 0,
   sourcerOfCredit: 'base',
   rateCalculator: {
      amountOfCredit: '',
      amountOfCreditUS: '',
      creditTermValue: '',
      creditTermType: '',
      coverageType: '',
      amortizationStyle: '',
      tableDerivaties: '',
      pointsToCover: '',
      swapRate: '',
      theoreticalLine: '',
      requestedLineAmount: '',
      sufficiency: '',
      congruenceCalculator: 0,
   },
};

// TODO falta añadir Unit Testing
describe('RateCalculatorView component', () => {
   const props = { info: mockCustomerProfile, dollar: 18, isSave: false, isComplete: false };
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
         queries: { getByText, getByLabelText },
      } = await renderPage(RateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
      });
      const radioBase = getByLabelText('Propio, de Banco Base', { selector: '#base' });
      const radioOther = getByLabelText('De otro banco', { selector: '#other' });

      expect(getByText('Crédito(s) a cubrir')).toBeInTheDocument();
      expect(getByText('Acreedor 1')).toBeInTheDocument();
      expect(getByText('Pregunta 1. ¿Qué origen tiene el crédito a cubrir?')).toBeInTheDocument();
      expect(radioBase).toBeInTheDocument();
      expect(radioBase.checked).toBe(true);
      expect(radioOther).toBeInTheDocument();
      expect(radioOther).not.toBeChecked();

      expect(getByLabelText('Monto del crédito a cubrir')).toBeInTheDocument();
      expect(getByLabelText('Tipo de cobertura')).toBeInTheDocument();
      expect(getByLabelText('Estilo de amortización')).toBeInTheDocument();
      expect(getByLabelText('PV01 (DV01) mesa derivados')).toBeInTheDocument();
      expect(getByLabelText('Puntos PV01 a cubrir')).toBeInTheDocument();
      expect(getByLabelText('Tasa SWAP cotizada')).toBeInTheDocument();
   });

   test('When there are missing fields to complete on the screen but nothing has been saved yet, the input class should be "input-form"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(RateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
      });

      expect(getByTestId('creditor-0')).toHaveClass('input-form');
      expect(getByTestId('natureOfCredit-0')).toHaveClass('input-form');
      expect(getByTestId('typeOfCredit-0')).toHaveClass('input-form');
      expect(getByTestId('grantMonth-0')).toHaveClass('input-form');
      expect(getByTestId('expirationMonth-0')).toHaveClass('input-form');
      expect(getByTestId('termToCover-0')).toHaveClass('input-form');
   });

   test('When there are missing fields to complete on the screen and something has already been saved, the input class should be "mandatory"  and the alert should be displayed. ', async () => {
      const {
         queries: { getByTestId, getByAltText, getByText },
      } = await renderPage(RateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isSave: true,
      });
      expect(getByAltText('Información del completado de los campos de la sección')).toBeInTheDocument();
      expect(getByText('campos obligatorios')).toBeInTheDocument();

      expect(getByTestId('creditor-0')).toHaveClass('mandatory');
      expect(getByTestId('natureOfCredit-0')).toHaveClass('mandatory');
      expect(getByTestId('typeOfCredit-0')).toHaveClass('mandatory');
      expect(getByTestId('grantMonth-0')).toHaveClass('mandatory');
      expect(getByTestId('expirationMonth-0')).toHaveClass('mandatory');
      expect(getByTestId('termToCover-0')).toHaveClass('mandatory');
   });

   test('When the fields on the screen are already complete the input class must be "input-form"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(RateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isComplete: true,
      });

      expect(getByTestId('creditor-0')).toHaveClass('input-form');
      expect(getByTestId('natureOfCredit-0')).toHaveClass('input-form');
      expect(getByTestId('typeOfCredit-0')).toHaveClass('input-form');
      expect(getByTestId('grantMonth-0')).toHaveClass('input-form');
      expect(getByTestId('expirationMonth-0')).toHaveClass('input-form');
      expect(getByTestId('termToCover-0')).toHaveClass('input-form');
   });

   test('If the page is disabled the input class must be "disabled"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(RateCalculatorView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isDisabled: true,
      });

      expect(getByTestId('creditor-0')).toHaveClass('disabled');
      expect(getByTestId('natureOfCredit-0')).toHaveClass('disabled');
      expect(getByTestId('typeOfCredit-0')).toHaveClass('disabled');
      expect(getByTestId('grantMonth-0')).toHaveClass('disabled');
      expect(getByTestId('expirationMonth-0')).toHaveClass('disabled');
      expect(getByTestId('termToCover-0')).toHaveClass('disabled');
   });
});
