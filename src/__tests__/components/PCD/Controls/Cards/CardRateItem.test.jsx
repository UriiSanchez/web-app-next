import { CardRateItem } from '../../../../../components/PCD';

import { formatId, getClassInput } from '../../../../../helpers';

jest.mock('../../../../../helpers', () => ({
   formatId: jest.fn((id, pad) => `ID_${id.toString().padStart(pad, '0')}`),
   getClassInput: jest.fn(),
}));

describe('Card Rate component', () => {
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
         queries: { getByRole, getByLabelText, getByPlaceholderText },
      } = await renderPage(CardRateItem, { ...mockData, fnVirtual: mockFnVirtual });

      //Verificamos que el título se renderice correctamente
      expect(formatId).toHaveBeenCalledWith(1, 2);
      expect(getByRole('heading', { level: 3 })).toHaveTextContent('Tasa ID_01');

      expect(getByLabelText('Fuente de información')).toBeInTheDocument();
      const selectSource = getByRole('combobox', { name: /Fuente de información/i });
      expect(selectSource).toBeInTheDocument();
      expect(selectSource).toHaveValue('');

      //Verificar las opciones del select
      expect(getByRole('option', { name: '-Seleccionar-' }).value).toBe('');
      expect(getByRole('option', { name: 'Tasa variable' }).value).toBe('variableRate');
      expect(getByRole('option', { name: 'Tasa fija' }).value).toBe('fixedRate');

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
         queries: { getByRole, getByPlaceholderText },
      } = await renderPage(CardRateItem, {
         ...mockData,
         data: [{ rateType: 'fixedRate', porcentage: '75' }],
         fnVirtual: mockFnVirtual,
      });

      const selectSource = getByRole('combobox', { name: /Fuente de información/i });
      expect(selectSource).toHaveValue('fixedRate');
      expect(getByPlaceholderText('0')).toHaveValue(75);
   });

   // test('calls fnVirtual when rateType select value changes', async () => {
   //    const {
   //       user,
   //       queries: { getByRole },
   //    } = await renderPage(CardRateItem, {
   //       ...mockData,
   //       fnVirtual: mockFnVirtual,
   //    });

   //    const selectSource = getByRole('combobox', { name: /Fuente de información/i });
   //    await user.selectOptions(selectSource, 'variableRate');

   //    expect(mockFnVirtual).toHaveBeenCalledTimes(1);
   //    const [eventArg, idxArg] = mockFnVirtual.mock.calls[0];
   //    expect(idxArg).toBe(0);

   //    expect(eventArg.target.name).toBe('rateType-0');
   //    expect(eventArg.target.value).toBe('variableRate');
   // });

   test('If the field is empty and a save has already been made, it must contain the "mandatory" class.', async () => {
      getClassInput.mockReturnValue('mandatory');
      const {
         queries: { getByTestId },
      } = await renderPage(CardRateItem, {
         ...mockData,
         data: [{ rateType: '', porcentage: '' }],
         fnVirtual: mockFnVirtual,
         isSave: true,
      });

      expect(getByTestId('rateType-0')).toHaveClass('mandatory');
   });

   test('If the field is filled it must contain the "input-form" class', async () => {
      getClassInput.mockReturnValue('');
      const {
         queries: { getByTestId },
      } = await renderPage(CardRateItem, {
         ...mockData,
         data: [{ rateType: 'fixedRate', porcentage: '75' }],
         fnVirtual: mockFnVirtual,
         isSave: true,
      });

      expect(getByTestId('rateType-0')).toHaveClass('input-form');
   });

   test('If the field is locked it must contain the "disabled" class.', async () => {
      getClassInput.mockReturnValue('disabled');
      const {
         queries: { getByTestId },
      } = await renderPage(CardRateItem, {
         ...mockData,
         data: [{ rateType: 'fixedRate', porcentage: '75' }],
         fnVirtual: mockFnVirtual,
         isDisabled: true,
         isSave: true,
      });

      expect(getByTestId('rateType-0')).toHaveClass('disabled');
   });
});
