import { screen, waitFor } from '@testing-library/react';

import DerivativesClientProfile, { getServerSideProps } from '../../../../pages/Shared/PCD/[request]';
import { getCustomerProfile } from '../../../../services';
import { templateDerivatives } from '../../../../helpers';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getCustomerProfile: jest.fn(),
}));

const analyst = { userAD: 'ana.ad', path: 'ADC', idProfile: 1, status: [] };

const buildProfile = (calculatorType = 'rate') => {
   const coverageProfile = structuredClone(templateDerivatives.coverageProfile);
   coverageProfile.calculatorType = { ...coverageProfile.calculatorType, isType: calculatorType };
   return {
      clientName: 'Empresa Alfa',
      coverageProfile,
      calculatorRate: structuredClone(templateDerivatives.calculatorRate),
      calculatorRateExchange: structuredClone(templateDerivatives.calculatorRateExchange),
      profileResume: structuredClone(templateDerivatives.profileResume),
   };
};

const setup = async ({ profile = buildProfile() } = {}) => {
   getCustomerProfile.mockResolvedValue({ status: 200, data: profile });
   const utils = renderPage(<DerivativesClientProfile idGroup='7' idRequest='9' />, {
      context: { user: analyst, general: { alertsModel: { show: false, alerts: [] }, DOLLAR: '20' } },
   });
   await screen.findByRole('heading', { name: 'Solicitante: Empresa Alfa' });
   return utils;
};

describe('getServerSideProps (Shared PCD)', () => {
   test('maps the query to the props of the page', async () => {
      expect(await getServerSideProps({ query: { request: '9', idGroup: '7' } })).toEqual({
         props: { idRequest: '9', idGroup: '7' },
      });
   });

   test('defaults the values to 0', async () => {
      expect(await getServerSideProps({ query: {} })).toEqual({ props: { idRequest: 0, idGroup: 0 } });
   });
});

describe('Shared PCD page', () => {
   describe('loading', () => {
      test('requests the customer profile and shows the client name and the three sections', async () => {
         await setup();

         expect(getCustomerProfile).toHaveBeenCalledWith('9');
         expect(screen.getByRole('heading', { name: 'Perfil de cobertura' })).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: 'Perfil del Cliente' })).toBeInTheDocument();
      });

      test('shows the page without client name while the profile is loading', () => {
         getCustomerProfile.mockReturnValue(new Promise(() => {}));

         renderPage(<DerivativesClientProfile idGroup='7' idRequest='9' />, { context: { user: analyst } });

         expect(screen.getByRole('heading', { name: 'Solicitante:' })).toBeInTheDocument();
      });

      test('keeps the empty profile when the service answers with another status', async () => {
         getCustomerProfile.mockResolvedValue({ status: 404, data: null });

         renderPage(<DerivativesClientProfile idGroup='7' idRequest='9' />, { context: { user: analyst } });

         await waitFor(() => expect(getCustomerProfile).toHaveBeenCalledTimes(1));
         expect(screen.getByRole('heading', { name: 'Solicitante:' })).toBeInTheDocument();
      });
   });

   describe('calculator', () => {
      test('shows the rate calculator when the coverage is of type rate', async () => {
         await setup({ profile: buildProfile('rate') });

         expect(screen.getByText('Crédito(s) a cubrir')).toBeInTheDocument();
         expect(screen.queryByText('Estimación de cobertura anual')).not.toBeInTheDocument();
      });

      test('shows the exchange rate calculator when the coverage is of type exchange', async () => {
         await setup({ profile: buildProfile('typechange') });

         expect(screen.getByRole('heading', { name: 'Estimación de cobertura anual' })).toBeInTheDocument();
         expect(screen.queryByText('Crédito(s) a cubrir')).not.toBeInTheDocument();
      });

      test('shows the exchange rate calculator while the type is not defined', async () => {
         await setup({ profile: buildProfile('') });

         expect(screen.getByRole('heading', { name: 'Estimación de cobertura anual' })).toBeInTheDocument();
      });
   });

   describe('read only', () => {
      test('locks every answer of the profile', async () => {
         await setup();

         screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
         expect(screen.getByTestId('descriptionOfStrategy')).toBeDisabled();
      });
   });

   describe('navigation', () => {
      test('goes back to the checklist of the profile', async () => {
         const { user, router } = await setup();

         await user.click(screen.getByRole('button', { name: 'Regresar' }));

         expect(router.push).toHaveBeenCalledWith('/ADC/Documentation/7');
      });
   });
});
