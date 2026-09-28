import { screen } from '@testing-library/react';

import { TypeOfChange } from '../../../../components/PCD/Controls/TypeOfChange';
import { renderComponent } from '../../../utils/render';
import { createContextWrapper } from '../../../utils/context';

const setup = (general) => renderComponent(<TypeOfChange />, { wrapper: createContextWrapper({ general }) });
const exchangeBox = () => screen.getByText('Tipo de cambio').nextElementSibling;

describe('TypeOfChange', () => {
   test('shows the title, the description and the figures unit', () => {
      setup({ DOLLAR: '18.5' });

      expect(screen.getByRole('heading', { name: 'Calculadora de Parámetros de Operación' })).toBeInTheDocument();
      expect(screen.getByText('Calcula según el tipo de subyacente ya seleccionado')).toBeInTheDocument();
      expect(screen.getByText('Cifras').nextElementSibling).toHaveTextContent('Miles');
   });

   test('shows the exchange rate of the dollar formatted with its flag', () => {
      setup({ DOLLAR: '18.5' });

      expect(exchangeBox()).toHaveTextContent('$18.50');
      expect(screen.getByRole('img', { name: 'Bandera de México' })).toBeInTheDocument();
      expect(screen.queryByText('Valor del tipo de cambio, no valido')).not.toBeInTheDocument();
   });

   test('does not mark the exchange rate as wrong when it is valid', () => {
      setup({ DOLLAR: '18.5' });

      // JSDOM no aplica estilos; el estado solo se expresa mediante clases.
      expect(exchangeBox()).toHaveClass('border-gray-400');
      expect(exchangeBox()).not.toHaveClass('border-red-500');
   });

   test.each([['0'], [''], [undefined]])('warns that the exchange rate is not valid when it is %p', (dollar) => {
      setup({ DOLLAR: dollar });

      expect(screen.getByText('Valor del tipo de cambio, no valido')).toBeInTheDocument();
      expect(exchangeBox()).toHaveClass('border-red-500');
      expect(exchangeBox()).toHaveTextContent('$0.00');
   });

   test('warns when there is no general information at all', () => {
      setup(undefined);

      expect(screen.getByText('Valor del tipo de cambio, no valido')).toBeInTheDocument();
   });
});
