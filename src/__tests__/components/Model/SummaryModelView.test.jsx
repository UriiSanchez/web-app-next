import { screen, within } from '@testing-library/react';

import { SummaryModelView } from '../../../components/Model/SummaryModelView';
import { renderComponent } from '../../utils/render';

const APPLICANT = 'Solicitante';
const OBLIGOR = 'Obligado Solidario';

const buildData = (overrides = {}) => ({
   modelStatus: 'Solicitud aprobada',
   amountOfLineRequested: 2500000,
   suggestedLineAmount: 1800000,
   requiredParameters: { 'Antigüedad mínima': true, 'Sin embargos': false },
   globalRating: {
      'Calificacion Global': {
         'Informacion Financiera': 3.5,
         'Buro de Crédito': 2,
         'Razonabilidad de Cobertura': 1.5,
         Total: 7,
      },
      'Calificacion Ponderada': { 'Informacion Financiera': 1.2 },
   },
   alertsResume: [{ id: 'AL01' }, { id: 'AL02' }, { id: 'AL03' }],
   security: {
      properties: [
         {
            typeSecurity: 'Hipoteca',
            granteeSecurity: 'Banco Uno',
            descriptionSecurity: 'Nave industrial',
            valueSecurity: 5000000,
            creditsToCoverSecurity: 3000000,
            authorizedCoverageSecurity: 2500000,
            currentCoverageSecurity: '83%',
         },
      ],
      'Total actual': '83%',
      'Cobertura Recomendada': '100%',
   },
   ...overrides,
});

const alertsButton = () => screen.getByText('Alertas', { selector: 'span' }).nextElementSibling;

describe('SummaryModelView', () => {
   test.each([[undefined], [{}]])('shows the skeleton while the data is %p', (data) => {
      renderComponent(<SummaryModelView data={data} participantType={APPLICANT} />);

      expect(screen.getByRole('heading', { name: 'Análisis de modelo experto' })).toBeInTheDocument();
      expect(screen.queryByText('Aprobado')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
   });

   test('shows the title and the elaboration date', () => {
      renderComponent(<SummaryModelView data={buildData()} dateElaboration='12-03-2025' participantType={APPLICANT} />);

      expect(screen.getByRole('heading', { name: 'Análisis de modelo experto' })).toBeInTheDocument();
      expect(screen.getByText('12-03-2025')).toBeInTheDocument();
   });

   describe('for the applicant', () => {
      test('shows the requested and suggested lines', () => {
         renderComponent(<SummaryModelView data={buildData()} participantType={APPLICANT} />);

         expect(screen.getByText(/Monto de línea solicitado:/)).toHaveTextContent('$2,500,000 MN');
         expect(screen.getByText(/Monto de línea sugerido:/)).toHaveTextContent('$1,800,000 MN');
      });

      test('shows the request as approved when the model approved it', () => {
         renderComponent(<SummaryModelView data={buildData()} participantType={APPLICANT} />);

         expect(screen.getByText('Aprobado')).toHaveClass('bg-emerald-600');
         expect(screen.queryByText('Rechazado')).not.toBeInTheDocument();
      });

      test('shows the request as rejected otherwise', () => {
         renderComponent(
            <SummaryModelView data={buildData({ modelStatus: 'Solicitud rechazada' })} participantType={APPLICANT} />
         );

         expect(screen.getByText('Rechazado')).toHaveClass('bg-red-500');
         expect(screen.queryByText('Aprobado')).not.toBeInTheDocument();
      });

      test('shows the coverage reasonability in the global rating', () => {
         renderComponent(<SummaryModelView data={buildData()} participantType={APPLICANT} />);

         expect(screen.getByText('Razonabilidad de Cobertura')).toBeInTheDocument();
         const column = screen.getByText('Calificacion Global').parentElement;
         expect(Array.from(column.children).map((c) => c.textContent)).toEqual([
            'Calificacion Global',
            '3.50',
            '2.00',
            '1.50',
            '7.00',
         ]);
      });

      test('shows the security of the credit', () => {
         renderComponent(<SummaryModelView data={buildData()} participantType={APPLICANT} />);

         const row = screen.getByText('Hipoteca').closest('tr');
         expect(within(row).getAllByRole('cell').map((c) => c.textContent)).toEqual([
            'Hipoteca',
            'Banco Uno',
            'Nave industrial',
            '$5,000',
            '$3,000',
            '$2,500',
            '83%',
         ]);
         expect(screen.getByText('Total Actual').nextElementSibling).toHaveTextContent('83%');
         expect(screen.getByText('Cobertura Recomendada').nextElementSibling).toHaveTextContent('100%');
      });

      test('shows a placeholder row and dashes when there is no security', () => {
         renderComponent(<SummaryModelView data={buildData({ security: {} })} participantType={APPLICANT} />);

         expect(screen.queryByText('Hipoteca')).not.toBeInTheDocument();
         expect(screen.getByText('Total Actual').nextElementSibling).toHaveTextContent('-');
         expect(screen.getByText('Cobertura Recomendada').nextElementSibling).toHaveTextContent('-');
      });

      test('shows empty cells for the security data that is missing', () => {
         renderComponent(
            <SummaryModelView data={buildData({ security: { properties: [{}] } })} participantType={APPLICANT} />
         );

         const row = screen.getAllByRole('row')[1];
         expect(within(row).getAllByRole('cell').map((c) => c.textContent)).toEqual(['', '', '', '0', '0', '0', '']);
      });
   });

   describe('for an obligor', () => {
      test('hides the lines, the status and the security', () => {
         renderComponent(<SummaryModelView data={buildData()} participantType={OBLIGOR} />);

         expect(screen.queryByText(/Monto de línea/)).not.toBeInTheDocument();
         expect(screen.queryByText('Aprobado')).not.toBeInTheDocument();
         expect(screen.queryByText('Rechazado')).not.toBeInTheDocument();
         expect(screen.queryByRole('heading', { name: 'Seguridad' })).not.toBeInTheDocument();
      });

      test('hides the coverage reasonability from the global rating', () => {
         renderComponent(<SummaryModelView data={buildData()} participantType={OBLIGOR} />);

         expect(screen.queryByText('Razonabilidad de Cobertura')).not.toBeInTheDocument();
         const column = screen.getByText('Calificacion Global').parentElement;
         expect(Array.from(column.children).map((c) => c.textContent)).toEqual([
            'Calificacion Global',
            '3.50',
            '2.00',
            '7.00',
         ]);
      });
   });

   describe('parameters and ratings', () => {
      test('marks each required parameter as met or not', () => {
         renderComponent(<SummaryModelView data={buildData()} participantType={APPLICANT} />);

         expect(screen.getByText('Antigüedad mínima')).toHaveTextContent('check_circle');
         expect(screen.getByText('Sin embargos')).toHaveTextContent('cancel');
      });

      test('shows dashes for the ratings the model did not return', () => {
         renderComponent(
            <SummaryModelView data={buildData()} participantType={APPLICANT} />
         );

         const column = screen.getByText('Calificacion Ponderada').parentElement;
         expect(Array.from(column.children).map((c) => c.textContent)).toEqual([
            'Calificacion Ponderada',
            '1.20',
            '-',
            '-',
            '-',
         ]);
      });

      test('renders no parameters nor ratings when the model returned none', () => {
         renderComponent(
            <SummaryModelView
               data={buildData({ requiredParameters: {}, globalRating: {} })}
               participantType={OBLIGOR}
            />
         );

         expect(screen.getByText('Parámetros obligatorios')).toBeInTheDocument();
         expect(screen.queryByText('check_circle')).not.toBeInTheDocument();
         expect(screen.queryByText('Calificacion Global')).not.toBeInTheDocument();
      });
   });

   describe('alerts', () => {
      test('shows the number of alerts and sends them to the context', async () => {
         const setConfig = jest.fn();
         const data = buildData();
         const { user } = renderComponent(
            <SummaryModelView data={data} participantType={APPLICANT} fnContext={{ setConfig }} />
         );

         expect(alertsButton()).toHaveTextContent('3');
         await user.click(alertsButton());

         expect(setConfig).toHaveBeenCalledWith({ alertsModel: { show: true, alerts: data.alertsResume } });
      });

      test('disables the button when there are no alerts', () => {
         renderComponent(<SummaryModelView data={buildData({ alertsResume: [] })} participantType={APPLICANT} />);

         expect(alertsButton()).toBeDisabled();
         expect(alertsButton()).toHaveTextContent('0');
      });
   });
});
