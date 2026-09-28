import { screen } from '@testing-library/react';

import IndividualLoans from '../../../../components/Model/CreditHistory/IndividualLoans';
import { renderComponent } from '../../../utils/render';

const creditHistory = [
   {
      CuentasAbiertas: [
         {
            mop: '01',
            cuentasabiertas: 5,
            limiteabiertas: 1500000,
            maximoabiertos: 2500000,
            saldoactualabiertas: 350000,
            saldovencidoabiertas: 1200,
            pagoarealizar: 999,
         },
         { mop: '02' },
      ],
      CuentasCerradas: [
         {
            cuentascerradas: 3,
            limitescerradas: 4500000,
            maximocerradas: 3500000,
            saldoactualcerradas: 5000,
            montocerradas: 800,
         },
         {},
      ],
   },
];

describe('IndividualLoans', () => {
   test.each([[[]], [undefined]])('shows an empty table when the history is %p', (history) => {
      renderComponent(<IndividualLoans creditHistory={history} />);

      expect(screen.getByRole('heading', { name: 'Créditos' })).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getAllByText('-')).toHaveLength(1 + 12 + 10);
   });

   test('shows the headers of the open and closed accounts', () => {
      renderComponent(<IndividualLoans creditHistory={creditHistory} />);

      expect(screen.getByText('Cuentas Abiertas')).toBeInTheDocument();
      expect(screen.getAllByText('Cuentas Cerradas')).toHaveLength(2);
      ['MOP', 'Límite Abiertas', 'Pago a Realizar', 'Monto Cerradas'].forEach(
         (title) => expect(screen.getByText(title)).toBeInTheDocument()
      );
   });

   test('shows the open accounts, dividing the large amounts by one thousand', () => {
      renderComponent(<IndividualLoans creditHistory={creditHistory} />);

      const mop = screen.getByText('01').parentElement;
      expect(mop).toHaveTextContent('015');
      expect(mop).toHaveTextContent('1,500');
      expect(mop).toHaveTextContent('2,500');
      expect(mop).toHaveTextContent('350');
      expect(mop).toHaveTextContent('1,200');
      expect(mop).toHaveTextContent('999');
   });

   test('shows the closed accounts', () => {
      renderComponent(<IndividualLoans creditHistory={creditHistory} />);

      const row = screen.getByText('4,500').parentElement;
      expect(row).toHaveTextContent('34,5003,5005,000800');
   });

   test('shows zeros and dashes for the accounts without data', () => {
      renderComponent(<IndividualLoans creditHistory={creditHistory} />);

      const emptyOpen = screen.getByText('02').parentElement;
      expect(emptyOpen).toHaveTextContent('02000000');
      expect(screen.getAllByText('-')).toHaveLength(1);
   });
});
