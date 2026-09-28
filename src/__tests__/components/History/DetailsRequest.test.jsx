import { screen, within } from '@testing-library/react';

import { DetailsRequest } from '../../../components/History/DetailsRequest';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const ADC = 1;
const EMG = 3;
const SOLICITUD_AUTORIZADA = 10;
const SOLICITUD_RECHAZADA = 11;
const SOLICITUD_CANCELADA = 23;

const info = {
   idRequest: 9,
   idCatStatus: SOLICITUD_AUTORIZADA,
   branchOffice: 'Lomas',
   authorizationAmount: 2500000,
   authorizationNotional: 'no numérico',
   authorizationDate: '2024-02-01T10:00:00',
   finalizeDate: null,
   amountSuggestC: 1200000,
   recommendationAc: true,
   recommendationLc: false,
   commentAc: 'Perfil sólido',
   alerts: { 100: [[{ id: 1, descripcion: 'Alerta uno' }], [{ id: 2, descripcion: 'Alerta dos' }]] },
   relatedPersonResponseList: [
      {
         idCatTypePerson: 1,
         idClient: 100,
         folioBureau: 'F-77',
         lastDateBureau: '2024-01-10T09:00:00',
      },
      { idCatTypePerson: 2, idClient: 200, fullName: 'Carlos Vega' },
   ],
};

function setup({ profile = EMG, row = info, alertsModel = { show: false, alerts: [] } } = {}) {
   const actions = createActions();
   const wrapper = createContextWrapper({ user: { idProfile: profile }, general: { alertsModel }, actions });
   const utils = renderComponent(<DetailsRequest info={row} />, { wrapper });
   return { actions, ...utils };
}

// Cada campo es un <p> con la etiqueta seguido de otro <p> con el valor.
const valueOf = (label) => screen.getByText(label).nextElementSibling.textContent;

describe('DetailsRequest', () => {
   describe('approved request', () => {
      test('formats money, dates and plain values for the EMG profile', () => {
         setup();

         expect(valueOf('Sucursal')).toBe('Lomas');
         expect(valueOf('Monto otorgado')).toBe('$2,500,000');
         expect(valueOf('Nocional autorizado')).toBe('0');
         expect(valueOf('Fecha de resolución')).toBe('01/02/2024 10:00:00 AM');
         expect(valueOf('Plazo de vigencia')).toBe('-');
      });

      test('takes the applicant fields from the applicant person', () => {
         setup();

         expect(valueOf('No. de Cliente')).toBe('100');
         expect(valueOf('Folio de consulta de buró')).toBe('F-77');
         expect(valueOf('Fecha de consulta de buró')).toBe('10/01/2024 09:00:00 AM');
      });

      test('shows the solidary obligor of the request', () => {
         setup();

         expect(screen.getByText('Carlos Vega')).toBeInTheDocument();
         expect(screen.getByText('200')).toBeInTheDocument();
      });

      test('shows the counterpart recommendations of analyst and leader for the EMG profile', () => {
         setup();

         expect(screen.getByText('Recomendación contraparte')).toBeInTheDocument();
         expect(screen.getByText('Analista:')).toBeInTheDocument();
         expect(screen.getByText('Líder:')).toBeInTheDocument();
         expect(screen.queryByText('Alertas')).not.toBeInTheDocument();
      });

      test('adds counterpart details with comments for the analyst profile', async () => {
         const { user } = setup({ profile: ADC });

         expect(valueOf('Monto contraparte')).toBe('$1,200,000');
         expect(screen.getByText('Recomendación analista')).toBeInTheDocument();
         expect(screen.getByText('Recomendación modelo')).toBeInTheDocument();

         const analystResult = screen.getByText('Recomendación analista').parentElement;
         await user.click(within(analystResult).getByRole('button', { name: 'Comentarios' }));
         expect(screen.getByText('Perfil sólido')).toBeInTheDocument();
      });
   });

   describe('alerts', () => {
      const alertsButton = () => within(screen.getByText('Alertas').parentElement).getByRole('button');

      test('opens the alerts model with all alerts of the applicant', async () => {
         const { actions, user } = setup({ profile: ADC });

         await user.click(alertsButton());

         expect(actions.setConfig).toHaveBeenCalledWith({
            alertsModel: {
               show: true,
               alerts: [
                  { id: 1, descripcion: 'Alerta uno' },
                  { id: 2, descripcion: 'Alerta dos' },
               ],
            },
         });
      });

      test('disables the button when the applicant has no alerts', () => {
         setup({ profile: ADC, row: { ...info, alerts: { 100: [] } } });

         expect(alertsButton()).toBeDisabled();
      });

      test('disables the button when the request has no alerts attribute', () => {
         setup({ profile: ADC, row: { ...info, alerts: undefined } });

         expect(alertsButton()).toBeDisabled();
      });

      test('renders the alerts model when the context asks for it', () => {
         setup({
            profile: ADC,
            alertsModel: { show: true, alerts: [{ id: 1, descripcion: 'Alerta uno' }] },
         });

         expect(screen.getByRole('heading', { name: 'Alertas' })).toBeInTheDocument();
         expect(screen.getByText('Alerta uno.')).toBeInTheDocument();
      });
   });

   describe('declined request', () => {
      test.each([SOLICITUD_RECHAZADA, SOLICITUD_CANCELADA])(
         'shows only the recommendations for the EMG profile when the status is %p',
         (idCatStatus) => {
            setup({ row: { ...info, idCatStatus } });

            expect(screen.getByText('Recomendación contraparte')).toBeInTheDocument();
            expect(screen.queryByText('Monto otorgado')).not.toBeInTheDocument();
            expect(screen.queryByText('Recomendación modelo')).not.toBeInTheDocument();
         }
      );

      test('adds the model recommendation for the analyst profile', () => {
         setup({ profile: ADC, row: { ...info, idCatStatus: SOLICITUD_RECHAZADA, resultExecEm: false } });

         expect(screen.getByText('Recomendación modelo')).toBeInTheDocument();
         expect(screen.queryByText('Monto otorgado')).not.toBeInTheDocument();
      });
   });
});
