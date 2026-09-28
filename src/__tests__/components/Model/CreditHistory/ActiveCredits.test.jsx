import { screen, within } from '@testing-library/react';

import ActiveCredits from '../../../../components/Model/CreditHistory/ActiveCredits';
import { renderComponent } from '../../../utils/render';

const credit = (overrides = {}) => ({
   'Tipo Otorgante': 'Banco',
   'Tipo de Crédito': 'Simple',
   original: 1500000,
   'Saldo Actual': 900000,
   Vigente: 800000,
   '1-29 dias': 100,
   '30-59dias': 200,
   '60-89dias': 300,
   '90-119dias': 400,
   '180+ dias ': 500,
   ...overrides,
});

const total = {
   original: 3000000,
   'Saldo Actual': 1800000,
   Vigente: 1600000,
   '1-29 dias': 1000,
   '30-59dias': 2000,
   '60-89dias': 3000,
   '90-119dias': 4000,
   '180+ dias ': 5000,
};

const totalRow = () => screen.getByText('Total').parentElement;
const texts = (row) => within(row).getAllByText(/./).map((n) => n.textContent);

describe('ActiveCredits', () => {
   test.each([[[]], [undefined]])('shows a placeholder row with zero totals when the history is %p', (history) => {
      renderComponent(<ActiveCredits creditHistory={history} creditHistoryTotal={undefined} />);

      expect(screen.getByRole('heading', { name: 'Créditos Activos' })).toBeInTheDocument();
      expect(within(screen.getByText('Total').parentElement).getAllByText('0')).toHaveLength(8);
      expect(screen.getAllByText('-')).toHaveLength(10);
   });

   test('shows the column titles', () => {
      renderComponent(<ActiveCredits creditHistory={[credit()]} creditHistoryTotal={total} />);

      ['Tipo de Otorgante', 'Tipo de Crédito', 'Original', 'Saldo Actual', 'Vigente', '1-29 días', '180+ días'].forEach(
         (title) => expect(screen.getByText(title)).toBeInTheDocument()
      );
   });

   test('shows one row per credit with the amounts formatted', () => {
      renderComponent(<ActiveCredits creditHistory={[credit(), credit({ 'Tipo Otorgante': 'Sofom' })]} creditHistoryTotal={total} />);

      expect(screen.getByText('Banco')).toBeInTheDocument();
      expect(screen.getByText('Sofom')).toBeInTheDocument();
      expect(screen.getAllByText('1,500,000')).toHaveLength(2);
      expect(screen.getAllByText('900,000')).toHaveLength(2);
      expect(screen.getAllByText('500')).toHaveLength(2);
   });

   test('shows a dash when the grantor or the credit type are missing', () => {
      renderComponent(
         <ActiveCredits
            creditHistory={[credit({ 'Tipo Otorgante': '', 'Tipo de Crédito': '' })]}
            creditHistoryTotal={total}
         />
      );

      expect(screen.getAllByText('-')).toHaveLength(2);
   });

   test('shows zero for the amounts that are missing', () => {
      renderComponent(<ActiveCredits creditHistory={[{ 'Tipo Otorgante': 'Banco', 'Tipo de Crédito': 'Simple' }]} creditHistoryTotal={{}} />);

      expect(screen.getAllByText('0')).toHaveLength(16);
   });

   test('shows the totals of every column', () => {
      renderComponent(<ActiveCredits creditHistory={[credit()]} creditHistoryTotal={total} />);

      expect(texts(totalRow())).toEqual([
         'Total',
         '3,000,000',
         '1,800,000',
         '1,600,000',
         '1,000',
         '2,000',
         '3,000',
         '4,000',
         '5,000',
      ]);
   });
});
