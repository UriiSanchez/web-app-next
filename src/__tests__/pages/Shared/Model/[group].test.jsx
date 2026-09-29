import { screen, waitFor, within } from '@testing-library/react';
import Swal from 'sweetalert2';

import ModelAnalysis, { getServerSideProps } from '../../../../pages/Shared/Model/[group]';
import { getResultModel } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getResultModel: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const analyst = { userAD: 'ana.ad', path: 'ADC', idProfile: 1, status: [] };

const stage = (sales, horizon = '3') => ({
   Ventas: sales,
   'Margen de Operación (%)': '12',
   'Horizonte de deuda': horizon,
   '(=) Monto gravable': '400',
});
const scenario = (base) => ({
   acido: base + 1,
   apalancamiento: base + 2,
   'cobertura intereses': base + 3,
   'horizonte deuda': base + 4,
   'capacidad pago': base + 5000,
});

const resumeResponse = {
   modelStatus: 'Solicitud aprobada',
   amountOfLineRequested: 2500000,
   suggestedLineAmount: 1800000,
   requiredParameters: { 'Antigüedad mínima': true },
   globalRating: {
      'Calificacion Global': { 'Informacion Financiera': 3.5, Total: 7 },
      'Calificacion Ponderada': { 'Informacion Financiera': 1.2 },
   },
   alertsResume: [{ id: 'AL01' }],
   security: { properties: [], 'Total actual': '83%', 'Cobertura Recomendada': '100%' },
};

const buildParticipant = (idClient, fullName, participantType, pages) => ({
   idClient,
   fullName,
   participantType,
   typePerson: 'PM',
   pages,
   docs: ['INE'],
   resumeResponse,
   paymentCapacity: {
      paymentStages: {
         'Escenario Base': stage('1500000'),
         'Escenario 1': stage('1600000'),
         'Escenario 2': stage('1700000'),
         'Escenario 3': stage('1800000'),
      },
      alertsPayment: [],
      tablePassive: [],
   },
   creditHistoryReport: {
      concepts: [{ 'Histórico de Pagos': 'Bueno' }],
      creditBureauRating: 'A1',
      weightedRating: '8.5/10',
      buroGlobal: '3.1/3.5',
      historyReport: [{ Fecha: 'ene', Vigente: 1000, 'Calificación de cartera': 'B2' }],
      creditHistory: [{ 'Tipo Otorgante': 'Banco Uno', 'Tipo de Crédito': 'Simple', original: 5000 }],
      creditHistoryTotal: { original: 5000 },
      alertsHistoryReport: [],
   },
   financialReasons: {
      'Valor del Calculo': { uno: scenario(10), dos: scenario(20) },
      Calificacion: { uno: scenario(30), dos: scenario(40) },
      'Calificacion Ponderada': { uno: scenario(50), dos: scenario(60) },
      'Calificaciones globales': { 'Calificación Total UNO': 7.5, 'Calificación global UNO': 3 },
   },
   swapRate: {
      sourcerOfCredit: 'base',
      balanceMxn: '2,500',
      congruenceCreditors: 1,
      rateCalculator: {
         amountOfCredit: 1500000,
         creditTermValue: 24,
         creditTermType: 'months',
         amortizationStyle: 'bullet',
         coverageType: 'variable-fija',
         tableDerivaties: 3000,
         pointsToCover: 15,
         swapRate: 9.5,
         theoreticalLine: 2000000,
         requestedLineAmount: 2500000,
         sufficiency: 1.256,
         congruenceCalculator: 2,
      },
   },
   exchangeRate: {
      customerPosition: 'Exportador',
      salesForLastFiscalYear: 12000000,
      percentageInForeignCurrency: 35,
      foreignCurrencyFlow: 450000,
      coveragePolicy: 80,
      estimatedCumulativePosition: 360000,
      averageTransactionAmount: 25000,
      estimatedRevolving: 'mensual',
      maximumCoverageTermInMonths: 12,
      mpa: 1250000,
      annualConsistencyValidation: { value: 500000, title: 'Congruente', color: 'bg-emerald-600' },
      coverageIndex: 0.756,
      spread: 1.5,
      estimatedLine: 3000000,
   },
});
const allPages = [1, 2, 3, 4, 5, 6];
const buildResponse = ({ pages = allPages, obligated = [] } = {}) => ({
   status: 200,
   data: [
      {
         idRequest: 10,
         dateElaboration: '12-03-2025',
         applicant: buildParticipant(1, 'Ana Solicitante', 'Solicitante', pages),
         obligated,
      },
   ],
});
const views = [
   'Análisis de modelo experto',
   'Capacidad de Pago',
   'Reporte del historial Crediticio',
   'Razones financieras',
   'Razonabilidad de cobertura',
   'Tipo de Cambio',
];

const setup = async ({ response = buildResponse(), context = {} } = {}) => {
   getResultModel.mockResolvedValue(response);
   const utils = renderPage(<ModelAnalysis idGroup='7' />, { context: { user: analyst, ...context } });
   if (response.status === 200) await screen.findByRole('heading', { name: 'Solicitante: Ana Solicitante' });
   return utils;
};
const button = (name) => screen.getByRole('button', { name });
const view = (title) => screen.findByRole('heading', { name: title });

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (Shared Model)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('Shared Model page', () => {
   describe('loading', () => {
      test('requests the model result of the group and shows the first view of the applicant', async () => {
         await setup();

         expect(getResultModel).toHaveBeenCalledWith('7');
         expect(await view('Análisis de modelo experto')).toBeInTheDocument();
         expect(screen.getByText('12-03-2025')).toBeInTheDocument();
      });

      test('shows the error and keeps the participant title empty when the service answers with another status', async () => {
         getResultModel.mockResolvedValue({ status: 500, data: { message: 'Fallo' } });

         renderPage(<ModelAnalysis idGroup='7' />, { context: { user: analyst } });

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(screen.queryByRole('heading', { name: /Solicitante:/ })).not.toBeInTheDocument();
         expect(button('Siguiente')).toBeDisabled();
         expect(button('Anterior')).toBeDisabled();
      });

      test('goes back to the application evaluation of the group', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/ADC/ApplicationEvaluation/7');
      });
   });

   describe('views', () => {
      test('walks through every view forwards and backwards', async () => {
         const { user } = await setup();
         expect(button('Anterior')).toBeDisabled();

         for (const title of views.slice(1)) {
            await user.click(button('Siguiente'));
            expect(await view(title)).toBeInTheDocument();
         }
         expect(button('Siguiente')).toBeDisabled();

         for (const title of views.slice(0, -1).reverse()) {
            await user.click(button('Anterior'));
            expect(await view(title)).toBeInTheDocument();
         }
         expect(button('Anterior')).toBeDisabled();
      });

      test('follows the pages available for the participant', async () => {
         const { user } = await setup({ response: buildResponse({ pages: [1, 4] }) });

         await user.click(button('Siguiente'));

         expect(await view('Razones financieras')).toBeInTheDocument();
         expect(button('Siguiente')).toBeDisabled();
      });

      test('shows an error message for a page without a configured view', async () => {
         getResultModel.mockResolvedValue(buildResponse({ pages: [9] }));

         renderPage(<ModelAnalysis idGroup='7' />, { context: { user: analyst } });

         expect(await screen.findByText('Ocurrió un error al procesar la información.')).toBeInTheDocument();
      });
   });

   describe('participants', () => {
      test('lists the participants in the side menu and switches to the selected one', async () => {
         const obligated = [buildParticipant(2, 'Beto Obligado', 'Obligado Solidario', [1, 2])];
         const { user } = await setup({ response: buildResponse({ obligated }) });
         await user.click(screen.getByRole('button', { name: 'Icono menú' }));

         await user.click(screen.getByText('Beto Obligado'));

         expect(await screen.findByRole('heading', { name: 'Obligado Solidario: Beto Obligado' })).toBeInTheDocument();
         expect(await view('Análisis de modelo experto')).toBeInTheDocument();
      });

      test('starts at the first page of the selected participant', async () => {
         const obligated = [buildParticipant(2, 'Beto Obligado', 'Obligado Solidario', [2, 3])];
         const { user } = await setup({ response: buildResponse({ obligated }) });
         await user.click(screen.getByRole('button', { name: 'Icono menú' }));

         await user.click(screen.getByText('Beto Obligado'));

         expect(await view('Capacidad de Pago')).toBeInTheDocument();
         expect(button('Anterior')).toBeDisabled();
      });
   });

   describe('alerts', () => {
      test('shows the alerts modal from the context and closes it through the context', async () => {
         const { user, context } = await setup({
            context: { general: { alertsModel: { show: true, alerts: [{ id: 'A1', descripcion: 'Alerta uno' }] } } },
         });

         expect(within(screen.getByRole('dialog')).getByRole('heading', { name: 'Alertas' })).toBeInTheDocument();
         expect(screen.getByText('Alerta uno.')).toBeInTheDocument();

         await user.click(screen.getByRole('button', { name: 'Cerrar' }));

         expect(context.actions.setConfig).toHaveBeenCalledWith({ alertsModel: { show: false, alerts: [] } });
      });

      test('does not show the alerts modal by default', async () => {
         await setup();

         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      test('opens the alerts of the summary through the context', async () => {
         const { user, context } = await setup();
         await view('Análisis de modelo experto');

         await user.click(screen.getByText('Alertas', { selector: 'span' }).nextElementSibling);

         expect(context.actions.setConfig).toHaveBeenCalledTimes(1);
      });
   });
});
