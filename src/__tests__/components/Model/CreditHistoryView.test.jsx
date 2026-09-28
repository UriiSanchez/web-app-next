import { screen } from '@testing-library/react';

import { CreditHistoryView } from '../../../components/Model/CreditHistoryView';
import { renderComponent } from '../../utils/render';

const data = {
   concepts: [
      { 'Histórico de Pagos': 'Bueno' },
      { 'Moral Actual': 'Sin atrasos' },
      { 'Clave de Observación': '' },
   ],
   creditBureauRating: 'A1',
   weightedRating: '8.5/10',
   buroGlobal: '3.1/3.5',
   historyReport: [{ Fecha: 'ene', Vigente: 1000, 'Calificación de cartera': 'B2' }],
   creditHistory: [{ 'Tipo Otorgante': 'Banco Uno', 'Tipo de Crédito': 'Simple', original: 5000 }],
   creditHistoryTotal: { original: 5000 },
   alertsHistoryReport: [{ id: 'AL01' }, { id: 'AL02' }],
};

const personalData = {
   ...data,
   creditHistory: [
      { CuentasAbiertas: [{ mop: '01', cuentasabiertas: 2 }], CuentasCerradas: [{ cuentascerradas: 4 }] },
   ],
};

const alertsButton = () => screen.getByText('Alertas', { selector: 'span' }).nextElementSibling;

describe('CreditHistoryView', () => {
   test('shows the title and the elaboration date', () => {
      renderComponent(<CreditHistoryView data={data} dateElaboration='12-03-2025' typePerson='PM' />);

      expect(screen.getByRole('heading', { name: 'Reporte del historial Crediticio' })).toBeInTheDocument();
      expect(screen.getByText('12-03-2025')).toBeInTheDocument();
   });

   test('shows the concepts with their values', () => {
      renderComponent(<CreditHistoryView data={data} typePerson='PM' />);

      expect(screen.getByText('Histórico de Pagos').nextSibling).toHaveTextContent('Bueno');
      expect(screen.getByText('Moral Actual').nextSibling).toHaveTextContent('Sin atrasos');
   });

   test('shows "Sin información" for a concept without value', () => {
      renderComponent(<CreditHistoryView data={data} typePerson='PM' />);

      expect(screen.getByText('Clave de Observación').nextSibling).toHaveTextContent('Sin información');
   });

   test('shows the default concepts when there are none', () => {
      renderComponent(<CreditHistoryView data={{}} typePerson='PM' />);

      expect(screen.getByText('Histórico de Pagos Solicitante')).toBeInTheDocument();
      expect(screen.getByText('Presenta Saldo Mora Comercial y Fiscal Solicitante')).toBeInTheDocument();
   });

   test('shows the ratings of the credit bureau', () => {
      renderComponent(<CreditHistoryView data={data} typePerson='PM' />);

      expect(screen.getByText('A1')).toBeInTheDocument();
      expect(screen.getByText('8.5/10')).toBeInTheDocument();
      expect(screen.getByText('3.1/3.5')).toBeInTheDocument();
   });

   test('shows default ratings when there is no data', () => {
      renderComponent(<CreditHistoryView typePerson='PM' />);

      expect(screen.getByText('-/10')).toBeInTheDocument();
      expect(screen.getByText('-/3.5')).toBeInTheDocument();
   });

   test('shows the history and the active credits for a company', () => {
      renderComponent(<CreditHistoryView data={data} typePerson='PM' />);

      expect(screen.getByRole('heading', { name: 'Historia' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Créditos Activos' })).toBeInTheDocument();
      expect(screen.getByText('Banco Uno')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Créditos' })).not.toBeInTheDocument();
   });

   test('shows the individual loans for a natural person', () => {
      renderComponent(<CreditHistoryView data={personalData} typePerson='PF' />);

      expect(screen.getByRole('heading', { name: 'Créditos' })).toBeInTheDocument();
      expect(screen.getByText('Cuentas Abiertas')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Historia' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Créditos Activos' })).not.toBeInTheDocument();
   });

   test('shows the empty individual loans for a natural person without credit history', () => {
      renderComponent(<CreditHistoryView data={{ ...personalData, creditHistory: [] }} typePerson='PF' />);

      expect(screen.getByRole('heading', { name: 'Créditos' })).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.queryByText('01')).not.toBeInTheDocument();
   });

   test('shows the number of alerts and opens them from the context', async () => {
      const setConfig = jest.fn();
      const { user } = renderComponent(<CreditHistoryView data={data} typePerson='PM' fnContext={{ setConfig }} />);

      expect(alertsButton()).toHaveTextContent('2');
      await user.click(alertsButton());

      expect(setConfig).toHaveBeenCalledWith({ alertsModel: { show: true, alerts: data.alertsHistoryReport } });
   });

   test('disables the alerts button when there are no alerts', async () => {
      const setConfig = jest.fn();
      const { user } = renderComponent(
         <CreditHistoryView data={{ ...data, alertsHistoryReport: [] }} typePerson='PM' fnContext={{ setConfig }} />
      );

      expect(alertsButton()).toHaveTextContent('0');
      expect(alertsButton()).toBeDisabled();
      await user.click(alertsButton());

      expect(setConfig).not.toHaveBeenCalled();
   });
});
