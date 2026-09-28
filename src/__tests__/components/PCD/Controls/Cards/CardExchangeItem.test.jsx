import { CardExchangeItem } from '../../../../../components/PCD';

import { formatId, getClassInput } from '../../../../../helpers';

jest.mock('../../../../../helpers', () => ({
   formatId: jest.fn((id, pad) => `ID_${id.toString().padStart(pad, '0')}`),
   getClassInput: jest.fn(),
   crossingsListCP: ['BRLJPY', 'BRLMXN', 'CADBRL'],
}));

describe('Card Exchange component', () => {
   const mockData = {
      idx: 0,
      data: [],
      isDisabled: false,
      isSave: false,
   };
   const mockFnVirtual = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      getClassInput.mockReturnValue('');
   });

   test('renders correctly with default props (idx=0, empty data)', async () => {
      const {
         queries: { getByRole, getByLabelText, getByPlaceholderText, getByTestId },
      } = await renderPage(CardExchangeItem, {
         ...mockData,
         fnVirtual: mockFnVirtual,
      });

      //Verificamos que el título se renderice correctamente
      expect(formatId).toHaveBeenCalledWith(1, 2);
      expect(getByRole('heading', { level: 3 })).toHaveTextContent('Cruce ID_01');

      expect(getByLabelText('Cruce')).toBeInTheDocument();
      expect(getByTestId('cross-0')).toBeInTheDocument();

      //Verificar la lista de opciones del select
      expect(getByTestId('listCross-0')).toBeInTheDocument();

      //Verificar el input de porcentaje
      const inputPercentage = getByPlaceholderText('0');
      expect(inputPercentage).toBeInTheDocument();
      expect(inputPercentage).toHaveAttribute('type', 'number');
      expect(inputPercentage).toHaveAttribute('min', '0');
      expect(inputPercentage).toHaveAttribute('max', '100');
      expect(inputPercentage).toHaveValue(null);
   });

   test('renders correctly with provided data', async () => {
      const {
         queries: { getByTestId, getByPlaceholderText },
      } = await renderPage(CardExchangeItem, {
         ...mockData,
         data: [{ cross: 'BRLJPY', porcentage: '75' }],
         fnVirtual: mockFnVirtual,
      });

      expect(getByTestId('listCross-0')).toBeInTheDocument();
      expect(getByPlaceholderText('Ej. BRLJPY')).toHaveValue('BRLJPY');
      expect(getByPlaceholderText('0')).toHaveValue(75);
   });

   test('If the field is empty and a save has already been made, it must contain the "mandatory" class.', async () => {
      getClassInput.mockReturnValue('mandatory');
      const {
         queries: { getByTestId },
      } = await renderPage(CardExchangeItem, {
         ...mockData,
         data: [{ cross: '', porcentage: '' }],
         fnVirtual: mockFnVirtual,
         isSave: true,
      });

      expect(getByTestId('cross-0')).toHaveClass('mandatory');
   });

   test('If the field is filled it must contain the "input-form" class', async () => {
      getClassInput.mockReturnValue('');
      const {
         queries: { getByTestId },
      } = await renderPage(CardExchangeItem, {
         ...mockData,
         data: [{ cross: 'BRLJPY', porcentage: '75' }],
         fnVirtual: mockFnVirtual,
         isSave: true,
      });

      expect(getByTestId('cross-0')).toHaveClass('input-form');
   });

   test('If the field is locked it must contain the "disabled" class.', async () => {
      getClassInput.mockReturnValue('disabled');
      const {
         queries: { getByTestId },
      } = await renderPage(CardExchangeItem, {
         ...mockData,
         data: [{ cross: 'BRLJPY', porcentage: '75' }],
         fnVirtual: mockFnVirtual,
         isDisabled: true,
         isSave: true,
      });

      expect(getByTestId('cross-0')).toHaveClass('disabled');
   });
});
