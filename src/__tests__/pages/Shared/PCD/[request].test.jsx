import DerivativesClientProfile from '../../../../pages/Shared/PCD/[request]';

import { getCustomerProfile } from '../../../../services';

jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../services', () => ({ __esModule: true, getCustomerProfile: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: () => ({ user: {} }) }));

describe('DerivativesClientProfile page', () => {
   const props = {
      idGroup: '1',
      idRequest: '1',
   };

   let customerProfileMock;

   beforeEach(() => {
      customerProfileMock = {
         status: 200,
         data: { coverageProfile: { calculatorType: { isType: 'rate' } } },
      };

      getCustomerProfile.mockResolvedValue(customerProfileMock);
   });

   test('it should render all PCD sections', async () => {
      const {
         queries: { getByText },
      } = await renderPage(DerivativesClientProfile, props);

      expect(getByText('Perfil de cobertura')).toBeVisible();
      expect(getByText('Calculadora de Parámetros de Operación')).toBeVisible();
      expect(getByText('Perfil del Cliente')).toBeVisible();
   });

   test('it should render RateExchange section when calculator is typechange', async () => {
      customerProfileMock.data.coverageProfile.calculatorType.isType = 'typechange';

      const {
         queries: { getByText },
      } = await renderPage(DerivativesClientProfile, props);

      expect(getByText('Estimación de cobertura anual')).toBeVisible();
   });

   test('it should have no editable input', async () => {
      const {
         queries: { queryAllByRole },
      } = await renderPage(DerivativesClientProfile, props);

      const textInputs = queryAllByRole('textbox');
      const numberInputs = queryAllByRole('spinbutton');
      const radioInputs = queryAllByRole('radio');
      const checkboxInputs = queryAllByRole('checkbox');

      expect(textInputs.length).toBe(34);
      expect(numberInputs.length).toBe(0);
      expect(radioInputs.length).toBe(17);
      expect(checkboxInputs.length).toBe(1);
   });
});
