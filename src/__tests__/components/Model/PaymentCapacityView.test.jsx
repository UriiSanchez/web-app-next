import { screen, within } from '@testing-library/react';

import { PaymentCapacityView } from '../../../components/Model/PaymentCapacityView';
import { renderComponent } from '../../utils/render';

const stage = (sales, horizon = '3') => ({
   Ventas: sales,
   'Margen de Operación (%)': '12',
   'Horizonte de deuda': horizon,
   '(=) Monto gravable': '400',
});

const buildData = (overrides = {}) => ({
   paymentStages: {
      'Escenario Base': stage('1500000'),
      'Escenario 1': stage('1600000'),
      'Escenario 2': stage('1700000', '-2'),
      'Escenario 3': stage('1800000'),
   },
   alertsPayment: [],
   tablePassive: [],
   ...overrides,
});

const passive = {
   financialCreditors: 'Banco Uno',
   creditType: 'Simple',
   natureOfCredit: 'Revolvente',
   situation: 'Vigente',
   maxAmountOfLine: 5000000,
   year: 3,
   currency: 'MXN',
   balanceAt: 2500000,
   interestRate: 11.5,
   taxes: 30000,
   annualPrincipalPaymentOfAmortizableLoans: 120000,
};

const rowOf = (label) => screen.getByText(label).parentElement;
const rowValues = (label) => Array.from(rowOf(label).children).slice(1).map((c) => c.textContent);
const alertsButton = () => screen.getByText('Alertas', { selector: 'span' }).nextElementSibling;

describe('PaymentCapacityView', () => {
   test('shows the title, the elaboration date and the scenarios', () => {
      renderComponent(<PaymentCapacityView data={buildData()} dateElaboration='12-03-2025' />);

      expect(screen.getByRole('heading', { name: 'Capacidad de Pago' })).toBeInTheDocument();
      expect(screen.getByText('12-03-2025')).toBeInTheDocument();
      ['Escenario Base', 'Escenario 1', 'Escenario 2', 'Escenario 3'].forEach((title) =>
         expect(screen.getAllByText(title).length).toBeGreaterThan(0)
      );
   });

   test('shows the amounts of each scenario in thousands format', () => {
      renderComponent(<PaymentCapacityView data={buildData()} />);

      expect(rowValues('Ventas')).toEqual(['1,500,000', '1,600,000', '1,700,000', '1,800,000']);
   });

   test('shows the percentage rows with a percent sign', () => {
      renderComponent(<PaymentCapacityView data={buildData()} />);

      expect(rowValues('Margen de Operación (%)')).toEqual(['12%', '12%', '12%', '12%']);
   });

   test('shows a negative debt horizon as "Negativo"', () => {
      renderComponent(<PaymentCapacityView data={buildData()} />);

      expect(rowValues('Horizonte de deuda')).toEqual(['3', '3', 'Negativo', '3']);
   });

   test('shows zero for the rows the model did not return', () => {
      renderComponent(<PaymentCapacityView data={buildData()} />);

      expect(rowValues('(+) Depreciación')).toEqual(['0', '0', '0', '0']);
   });

   test('marks the taxable amount in red only when the alert AL32 exists', () => {
      const { rerender } = renderComponent(<PaymentCapacityView data={buildData()} />);
      // JSDOM no aplica estilos; el color solo se expresa mediante clases.
      expect(screen.getByText('(=) Monto gravable')).not.toHaveClass('text-red-500');

      rerender(<PaymentCapacityView data={buildData({ alertsPayment: [{ id: 'AL32' }] })} />);
      expect(screen.getByText('(=) Monto gravable')).toHaveClass('text-red-500');

      rerender(<PaymentCapacityView data={buildData({ alertsPayment: [{ id: 'AL01' }] })} />);
      expect(screen.getByText('(=) Monto gravable')).not.toHaveClass('text-red-500');
   });

   test('explains the scenarios', () => {
      renderComponent(<PaymentCapacityView data={buildData()} />);

      expect(screen.getByText('Escenario 1:')).toBeInTheDocument();
      expect(screen.getByText('Escenario 2:')).toBeInTheDocument();
      expect(screen.getByText('Escenario 3:')).toBeInTheDocument();
   });

   describe('alerts', () => {
      test('shows the number of alerts and sends them to the context', async () => {
         const setConfig = jest.fn();
         const alerts = [{ id: 'AL32' }, { id: 'AL05' }];
         const { user } = renderComponent(
            <PaymentCapacityView data={buildData({ alertsPayment: alerts })} fnContext={{ setConfig }} />
         );

         expect(alertsButton()).toHaveTextContent('2');
         await user.click(alertsButton());

         expect(setConfig).toHaveBeenCalledWith({ alertsModel: { show: true, alerts } });
      });

      test('disables the button when there are no alerts', () => {
         renderComponent(<PaymentCapacityView data={buildData()} />);

         expect(alertsButton()).toBeDisabled();
         expect(alertsButton()).toHaveTextContent('0');
      });
   });

   describe('liabilities table', () => {
      test('shows a placeholder row when there are no liabilities', () => {
         renderComponent(<PaymentCapacityView data={buildData()} />);

         expect(screen.getAllByText('-')).toHaveLength(11);
      });

      test('shows a row per liability with its amounts formatted', () => {
         renderComponent(<PaymentCapacityView data={buildData({ tablePassive: [passive] })} />);

         const row = screen.getByText('Banco Uno').closest('tr');
         expect(within(row).getAllByRole('cell').map((c) => c.textContent)).toEqual([
            'Banco Uno',
            'Simple',
            'Revolvente',
            'Vigente',
            '5,000,000',
            '3',
            'MXN',
            '2,500,000',
            '11.5%',
            '30,000',
            '120,000',
         ]);
      });

      test('shows default values for the liability data that is missing', () => {
         renderComponent(<PaymentCapacityView data={buildData({ tablePassive: [{}] })} />);

         const row = screen.getAllByRole('row')[1];
         expect(within(row).getAllByRole('cell').map((c) => c.textContent)).toEqual([
            '-',
            '-',
            '-',
            'n/a',
            '0',
            '-',
            '-',
            '0',
            '%',
            '0',
            '0',
         ]);
      });

      test('shows the revolving and amortizable totals', () => {
         renderComponent(
            <PaymentCapacityView
               data={buildData({
                  totalRevolvingMn: 1000000,
                  revolvingCreditInterestMn: 20000,
                  totalAmortizableBalanceMn: 3000000,
                  amortizableCreditInterestMn: 45000,
               })}
            />
         );

         expect(screen.getByText('Total Revolvente MN').nextElementSibling).toHaveTextContent('1,000,000');
         expect(screen.getByText('Intereses créditos Revolventes MN').nextElementSibling).toHaveTextContent('20,000');
         expect(screen.getByText('Total Saldo Amortizable MN').nextElementSibling).toHaveTextContent('3,000,000');
         expect(screen.getByText('Intereses créditos Aevolventes MN').nextElementSibling).toHaveTextContent('45,000');
      });
   });
});
