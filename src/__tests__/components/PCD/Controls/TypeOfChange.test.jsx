import { TypeOfChange } from '../../../../components/PCD/Controls/TypeOfChange';

import { useGlobalContext } from '../../../../hooks';
import { formatMoney } from '../../../../helpers';

jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));
jest.mock('../../../../helpers', () => ({
   formatMoney: jest.fn((value, decimals) => `${parseFloat(value).toFixed(decimals)} mocked`),
}));

describe('Type of exchange component', () => {
   let globalContextMock;
   beforeEach(() => {
      jest.clearAllMocks();

      globalContextMock = { general: { DOLLAR: '18.07' } };
      useGlobalContext.mockReturnValue(globalContextMock);
   });

   test('renders correctyle with a valid DOLLAR value', async () => {
      const {
         queries: { getByText },
      } = await renderPage(TypeOfChange);

      expect(getByText('Calculadora de Parámetros de Operación')).toBeInTheDocument();
      expect(getByText('Calcula según el tipo de subyacente ya seleccionado')).toBeInTheDocument();
      expect(getByText('Cifras')).toBeInTheDocument();
      expect(getByText('Miles')).toBeInTheDocument();

      //Validamos que formatMoney sea llamado
      expect(formatMoney).toHaveBeenCalledWith('18.07', 2);
      expect(getByText('18.07 mocked')).toBeInTheDocument();

      //Validamos que tenga el estilo correcto
      const typeOfChange = getByText('Tipo de cambio').nextElementSibling;
      expect(typeOfChange).toHaveClass('border-gray-400');
   });

   test('display error message and add red border when DOLLAR is "0"', async () => {
      globalContextMock.general.DOLLAR = '0';
      useGlobalContext.mockReturnValue(globalContextMock);
      const {
         queries: { getByText },
      } = await renderPage(TypeOfChange);

      expect(formatMoney).toHaveBeenCalledWith('0', 2);
      expect(getByText('0.00 mocked')).toBeInTheDocument();

      //Verificamos el estilo del borde
      const typeOfChange = getByText('Tipo de cambio').nextElementSibling;
      expect(typeOfChange).toHaveClass('border-red-500');

      //Validar que se muestra el mensaje de error
      expect(getByText('Valor del tipo de cambio, no valido')).toBeInTheDocument();
   });
});
