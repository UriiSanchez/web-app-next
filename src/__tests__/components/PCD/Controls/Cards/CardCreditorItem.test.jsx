import { CardCreditorItem } from '../../../../../components/PCD';

import { generateLastTwoDigitsYears, generateListYears, getClassInput, getCurrentDate } from '../../../../../helpers';

jest.mock('../../../../../helpers', () => ({
   getClassInput: jest.fn(),
   getCurrentDate: jest.fn(),
   generateLastTwoDigitsYears: jest.fn(),
   generateListYears: jest.fn(),
   formatMoney: jest.fn((value, decimals) => `${parseFloat(value).toFixed(decimals)} mocked`),
}));

describe('Card Creditor component', () => {
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
      getCurrentDate.mockReturnValue('2000');
      generateLastTwoDigitsYears.mockReturnValue('00');
      generateListYears.mockReturnValue({
         expirationDate: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
         hiringDate: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      });
   });

   test('renders correctly with default props', async () => {
      const {
         queries: { getByTestId, getByLabelText, getByRole, getAllByText },
      } = await renderPage(CardCreditorItem, { ...mockData, fnVirtual: mockFnVirtual });

      expect(getByLabelText('Acreedor')).toBeInTheDocument();

      expect(getByTestId('creditor-0')).toBeInTheDocument();

      const selectNatureCredit = getByRole('combobox', { name: /Naturaleza del crédito/i });
      expect(selectNatureCredit).toBeInTheDocument();
      expect(selectNatureCredit).toHaveValue('');

      //Verificar las opciones del select
      expect(getAllByText('Seleccionar').length).toBe(3);
      expect(getByRole('option', { name: 'Revolvente' }).value).toBe('revolvente');
      expect(getByRole('option', { name: 'Amortizable' }).value).toBe('amortizable');

      const selectTypeCredit = getByRole('combobox', { name: /Tipo de crédito/i });
      expect(selectTypeCredit).toBeInTheDocument();
      expect(selectTypeCredit).toHaveValue('');

      const selectGrantDate = getByRole('combobox', { name: /Fecha de contratación/i });
      expect(selectGrantDate).toBeInTheDocument();
      expect(selectGrantDate).toHaveValue('');

      expect(getByRole('option', { name: '21' }).value).toBe('21');
      expect(getByRole('option', { name: '22' }).value).toBe('22');
      expect(getByRole('option', { name: '23' }).value).toBe('23');
      expect(getByRole('option', { name: '24' }).value).toBe('24');
      expect(getByRole('option', { name: '25' }).value).toBe('25');
      expect(getByRole('option', { name: '26' }).value).toBe('26');
      expect(getByRole('option', { name: '27' }).value).toBe('27');
      expect(getByRole('option', { name: '28' }).value).toBe('28');
      expect(getByRole('option', { name: '29' }).value).toBe('29');

      expect(getAllByText('Enero').length).toBe(2);
      expect(getAllByText('Febrero').length).toBe(2);
      expect(getAllByText('Marzo').length).toBe(2);
      expect(getAllByText('Abril').length).toBe(2);
      expect(getAllByText('Mayo').length).toBe(2);
      expect(getAllByText('Junio').length).toBe(2);
      expect(getAllByText('Julio').length).toBe(2);
      expect(getAllByText('Agosto').length).toBe(2);
      expect(getAllByText('Septiembre').length).toBe(2);
      expect(getAllByText('Octubre').length).toBe(2);
      expect(getAllByText('Noviembre').length).toBe(2);
      expect(getAllByText('Diciembre').length).toBe(2);

      const selectExpirationYear = getByRole('combobox', { name: /Fecha de vencimiento/i });
      expect(selectExpirationYear).toBeInTheDocument();
      expect(selectExpirationYear).toHaveValue('');

      expect(getByRole('option', { name: '19' }).value).toBe('19');
      expect(getByRole('option', { name: '18' }).value).toBe('18');
      expect(getByRole('option', { name: '17' }).value).toBe('17');
      expect(getByRole('option', { name: '16' }).value).toBe('16');
      expect(getByRole('option', { name: '15' }).value).toBe('15');
      expect(getByRole('option', { name: '14' }).value).toBe('14');
      expect(getByRole('option', { name: '13' }).value).toBe('13');
      expect(getByRole('option', { name: '12' }).value).toBe('12');
      expect(getByRole('option', { name: '11' }).value).toBe('11');

      const selectCurrency = getByRole('combobox', { name: /Moneda/i });
      expect(selectCurrency).toBeInTheDocument();
      expect(selectCurrency).toHaveValue('MXN');

      expect(getByRole('option', { name: 'MXN' }).value).toBe('MXN');
      expect(getByRole('option', { name: 'USD' }).value).toBe('USD');
      expect(getByRole('option', { name: 'EUR' }).value).toBe('EUR');
   });

   test('If the field is empty and a save has already been made, it must contain the "mandatory" class.', async () => {
      getClassInput.mockReturnValue('mandatory');
      const {
         queries: { getByTestId },
      } = await renderPage(CardCreditorItem, {
         ...mockData,
         fnVirtual: mockFnVirtual,
         isSave: true,
      });

      expect(getByTestId('creditor-0')).toHaveClass('mandatory');
      expect(getByTestId('natureOfCredit-0')).toHaveClass('mandatory');
      expect(getByTestId('typeOfCredit-0')).toHaveClass('mandatory');
      expect(getByTestId('grantMonth-0')).toHaveClass('mandatory');
      expect(getByTestId('expirationMonth-0')).toHaveClass('mandatory');
      expect(getByTestId('termToCover-0')).toHaveClass('mandatory');
   });

   test('If the field is filled it must contain the "input-form" class', async () => {
      getClassInput.mockReturnValue('');
      const {
         queries: { getByTestId },
      } = await renderPage(CardCreditorItem, {
         ...mockData,
         fnVirtual: mockFnVirtual,
         isSave: true,
         isComplete: true,
      });

      expect(getByTestId('creditor-0')).toHaveClass('input-form');
      expect(getByTestId('natureOfCredit-0')).toHaveClass('input-form');
      expect(getByTestId('typeOfCredit-0')).toHaveClass('input-form');
      expect(getByTestId('grantMonth-0')).toHaveClass('input-form');
      expect(getByTestId('expirationMonth-0')).toHaveClass('input-form');
      expect(getByTestId('termToCover-0')).toHaveClass('input-form');
   });

   test('If the field is locked it must contain the "disabled" class.', async () => {
      getClassInput.mockReturnValue('disabled');
      const {
         queries: { getByTestId },
      } = await renderPage(CardCreditorItem, {
         ...mockData,
         fnVirtual: mockFnVirtual,
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
