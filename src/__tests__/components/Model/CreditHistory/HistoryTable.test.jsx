import { screen, within } from '@testing-library/react';

import HistoryTable from '../../../../components/Model/CreditHistory/HistoryTable';
import { renderComponent } from '../../../utils/render';

const month = (n, overrides = {}) => ({
   Fecha: `mes-${n}`,
   Vigente: n * 1000,
   'Vencido 1 a 29 días': n * 10,
   'Vencido 30 a 59 días': n * 20,
   'Vencido 89 días': n * 30,
   'Vencido a más de 89 días': n * 40,
   'Calificación de cartera': `A${n}`,
   ...overrides,
});

const months = (count) => Array.from({ length: count }, (_v, i) => month(i + 1));

describe('HistoryTable', () => {
   test.each([[[]], [undefined]])('shows an empty table when the report is %p', (report) => {
      renderComponent(<HistoryTable historyReport={report} />);

      expect(screen.getByRole('heading', { name: 'Historia' })).toBeInTheDocument();
      expect(screen.getByText('Calificación de cartera')).toBeInTheDocument();
      expect(screen.getAllByText('-')).toHaveLength(6 + 6 * 6);
   });

   test('lists the concepts of the history', () => {
      renderComponent(<HistoryTable historyReport={months(2)} />);

      ['Vigencia', 'Vencido 1 a 29 días', 'Vencido 30 a 59 días', 'Vencido 89 días', 'Vencido a más de 89 días'].forEach(
         (label) => expect(screen.getByText(label)).toBeInTheDocument()
      );
   });

   test('shows one column per month with its amounts', () => {
      renderComponent(<HistoryTable historyReport={months(2)} />);

      const column = screen.getByText('mes-2').parentElement.nextElementSibling.lastElementChild;
      expect(screen.getByText('mes-1')).toBeInTheDocument();
      expect(screen.getByText('mes-2')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('2,000')).toBeInTheDocument();
      expect(within(column).getByText('A2')).toBeInTheDocument();
   });

   test('uses a single period for up to six months', () => {
      renderComponent(<HistoryTable historyReport={months(6)} />);

      expect(screen.getAllByText('Vigencia')).toHaveLength(1);
      expect(screen.getByText('mes-6')).toBeInTheDocument();
   });

   test('splits the months in two periods when there are more than six', () => {
      renderComponent(<HistoryTable historyReport={months(9)} />);

      expect(screen.getAllByText('Vigencia')).toHaveLength(2);
      const periods = screen.getAllByText('Vigencia').map((label) => label.parentElement.parentElement);
      expect(within(periods[0]).getByText('A6')).toBeInTheDocument();
      expect(within(periods[0]).queryByText('A7')).not.toBeInTheDocument();
      expect(within(periods[1]).getByText('A7')).toBeInTheDocument();
      expect(within(periods[1]).getByText('A9')).toBeInTheDocument();
   });

   test('shows zero for missing amounts and a dash for a missing rating', () => {
      renderComponent(<HistoryTable historyReport={[{ Fecha: 'ene' }]} />);

      expect(screen.getAllByText('0')).toHaveLength(5);
      expect(screen.getByText('-')).toBeInTheDocument();
   });
});
