import { CardExperienceItem } from '../../../../../components/PCD';

import { formatId, getClassInput } from '../../../../../helpers';

jest.mock('../../../../../helpers', () => ({
   formatId: jest.fn((id, pad) => `ID_${id.toString().padStart(pad, '0')}`),
   getClassInput: jest.fn(),
}));

describe('Card Experience component', () => {
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

   test('renders correctly with default props ', async () => {
      const {
         queries: { getByRole, getByLabelText, getAllByText },
      } = await renderPage(CardExperienceItem, { ...mockData, fnVirtual: mockFnVirtual });

      //Verificamos que el título se renderice correctamente
      expect(formatId).toHaveBeenCalledWith(1, 2);
      expect(getByRole('heading', { level: 3 })).toHaveTextContent('Institución Financiera');

      expect(getByLabelText('Contraparte')).toBeInTheDocument();
      expect(getByLabelText('Condición')).toBeInTheDocument();

      const selectCounterparty = getByRole('combobox', { name: /Contraparte/i });
      expect(selectCounterparty).toBeInTheDocument();
      expect(selectCounterparty).toHaveValue('');

      //Verificar las opciones del select
      expect(getAllByText('Selecciona').length).toBe(2);
      expect(getByRole('option', { name: 'Monex' }).value).toBe('monex');
      expect(getByRole('option', { name: 'Intercam' }).value).toBe('intercam');
      expect(getByRole('option', { name: 'CI Banco' }).value).toBe('cibanco');
      expect(getByRole('option', { name: 'Invex' }).value).toBe('invex');
      expect(getByRole('option', { name: 'BBVA' }).value).toBe('bbva');
      expect(getByRole('option', { name: 'Banco BASE' }).value).toBe('banco Base');
      expect(getByRole('option', { name: 'Otros' }).value).toBe('otros');

      const selectCondition = getByRole('combobox', { name: /Condición/i });
      expect(selectCondition).toBeInTheDocument();
      expect(selectCondition).toHaveValue('');

      //Verificar las opciones del select
      expect(getByRole('option', { name: 'Línea' }).value).toBe('lane');
      expect(getByRole('option', { name: 'Colaterales' }).value).toBe('collateral');
   });

   test('renders correctly with provided data', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(CardExperienceItem, {
         ...mockData,
         data: [{ condition: 'collateral', counterpart: 'invex' }],
         fnVirtual: mockFnVirtual,
      });

      const selectCounterparty = getByRole('combobox', { name: /Contraparte/i });
      expect(selectCounterparty).toHaveValue('invex');

      const selectCondition = getByRole('combobox', { name: /Condición/i });
      expect(selectCondition).toHaveValue('collateral');
   });

   test('If the field is empty and a save has already been made, it must contain the "mandatory" class.', async () => {
      getClassInput.mockReturnValue('mandatory');
      const {
         queries: { getByRole },
      } = await renderPage(CardExperienceItem, {
         ...mockData,
         data: [{ condition: '', counterpart: '' }],
         fnVirtual: mockFnVirtual,
         isSave: true,
      });

      const selectCounterparty = getByRole('combobox', { name: /Contraparte/i });
      expect(selectCounterparty).toHaveClass('mandatory');

      const selectCondition = getByRole('combobox', { name: /Condición/i });
      expect(selectCondition).toHaveClass('mandatory');
   });

   test('If the field is filled it must contain the "input-form" class', async () => {
      getClassInput.mockReturnValue('');
      const {
         queries: { getByRole },
      } = await renderPage(CardExperienceItem, {
         ...mockData,
         data: [{ condition: 'collateral', counterpart: 'invex' }],
         fnVirtual: mockFnVirtual,
         isSave: true,
      });
      const selectCounterparty = getByRole('combobox', { name: /Contraparte/i });
      expect(selectCounterparty).toHaveClass('input-form');

      const selectCondition = getByRole('combobox', { name: /Condición/i });
      expect(selectCondition).toHaveClass('input-form');
   });

   test('If the field is locked it must contain the "disabled" class.', async () => {
      getClassInput.mockReturnValue('disabled');
      const {
         queries: { getByRole },
      } = await renderPage(CardExperienceItem, {
         ...mockData,
         data: [{ condition: 'collateral', counterpart: 'invex' }],
         fnVirtual: mockFnVirtual,
         isDisabled: true,
         isSave: true,
      });

      const selectCounterparty = getByRole('combobox', { name: /Contraparte/i });
      expect(selectCounterparty).toHaveClass('disabled');

      const selectCondition = getByRole('combobox', { name: /Condición/i });
      expect(selectCondition).toHaveClass('disabled');
   });
});
