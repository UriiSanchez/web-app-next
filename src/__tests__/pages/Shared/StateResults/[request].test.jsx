import StateResults from '../../../../pages/Shared/StateResults/[request]';

import { useRouter } from 'next/router';
import { getStateResults, saveStateResults } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => {
   const originalModule = jest.requireActual('../../../../services');

   return {
      ...originalModule,
      getStateResults: jest.fn(),
      saveStateResults: jest.fn(),
   };
});
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));

describe('StateResults page', () => {
   const props = {
      idRequest: '1',
      idGroup: '1',
      idClient: '10',
   };

   const conceptsMock = [
      {
         description: 'Ventas Netas',
         id: '1',
         automatic: false,
         toolTip: true,
         focus: false,
      },
      {
         description: 'Costo de ventas y/o servicios',
         id: '2',
         automatic: false,
         toolTip: false,
         focus: false,
      },
      {
         description: 'Utilidad Bruta',
         id: '3',
         automatic: true,
         toolTip: false,
         focus: false,
      },
      {
         description: 'Gastos de Operación',
         id: '4',
         automatic: false,
         toolTip: false,
         focus: false,
      },
      {
         description: 'Utilidad de Operación',
         id: '5',
         automatic: true,
         toolTip: false,
         focus: false,
      },
      {
         description: 'Interés Pagado',
         id: '6',
         automatic: false,
         toolTip: true,
         focus: false,
      },
      {
         description: 'Impuestos',
         id: '14',
         automatic: false,
         toolTip: true,
         focus: false,
      },
   ];

   const depreciationMock = [
      {
         description: 'Depreciación y amortización',
         id: '21',
         automatic: false,
         toolTip: false,
         focus: false,
      },
   ];

   const analyzeMock = [
      {
         description: 'Ventas y/o servicios nacionales netas',
         id: '23',
         automatic: false,
         toolTip: false,
         focus: false,
      },
      {
         description: 'Ventas y/o servicios extranjeros netas',
         id: '24',
         automatic: false,
         toolTip: false,
         focus: false,
      },
      {
         description: 'Compras netas nacionales',
         id: '25',
         automatic: false,
         toolTip: false,
         focus: false,
      },
      {
         description: 'Compras netas de importación',
         id: '118',
         automatic: false,
         toolTip: false,
         focus: false,
      },
   ];

   let routerMock;
   let globalContextMock;

   beforeEach(() => {
      routerMock = {
         push: jest.fn(),
      };

      globalContextMock = {
         user: { idProfile: 1, path: 'ADC', userAD: 'testuser' },
         actions: { toggleLoading: jest.fn() },
      };

      useGlobalContext.mockReturnValue(globalContextMock);

      useRouter.mockReturnValue(routerMock);

      getStateResults.mockResolvedValue({
         status: 200,
         data: {
            rfc: 'ABCDEFG12345',
            idRequest: '1',
            idClient: '10',
            status: '20',
            fullName: 'Test Name',
            idCatTypePerson: '1',
            dateElaboration: '07-03-2024',
            periods: [
               {
                  periodType: 'ANNUAL',
                  year: 2022,
                  month: 'diciembre',
                  sourceInformation: 'Dictamen fiscal',
                  officeOrAccountant: 'Test Office 1',
                  monthIncludes: '0',
                  concepts: conceptsMock,
                  depreciationSchedule: depreciationMock,
                  analyseOperating: analyzeMock,
               },
               {
                  periodType: 'ANNUAL',
                  year: 2023,
                  month: 'diciembre',
                  sourceInformation: 'Dictamen fiscal',
                  officeOrAccountant: 'Test Office 2',
                  monthIncludes: '0',
                  concepts: conceptsMock,
                  depreciationSchedule: depreciationMock,
                  analyseOperating: analyzeMock,
               },
               {
                  periodType: 'PARTIAL',
                  year: 2024,
                  month: 'octubre',
                  sourceInformation: 'Interno',
                  officeOrAccountant: null,
                  monthIncludes: '10',
                  concepts: conceptsMock,
                  depreciationSchedule: depreciationMock,
                  analyseOperating: analyzeMock,
               },
            ],
         },
      });

      saveStateResults.mockResolvedValue({ status: 204 });
   });

   test('it enables save button when a change is made', async () => {
      const {
         user,
         queries: { getAllByRole, getByRole },
      } = await renderPage(StateResults, props);

      const enabledInputs = getAllByRole('textbox').filter((input) => !input.disabled);
      await user.type(enabledInputs[0], '100');

      expect(getByRole('button', { name: 'Guardar' })).toBeEnabled();
   });

   test('it enables finish button when all required inputs are filled', async () => {
      const {
         user,
         queries: { getAllByRole, getByRole },
      } = await renderPage(StateResults, props);

      const enabledInputs = getAllByRole('textbox').filter(
         (input) => !input.disabled && !(input.id.includes('Ventas') || input.id.includes('Compras'))
      );

      for (const enabledInput of enabledInputs) {
         await user.type(enabledInput, '100');
      }

      expect(getByRole('button', { name: 'Finalizar' })).toBeEnabled();
   });

   test('it redirects to Documentation page when clicking on back button', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(StateResults, props);

      await user.click(getByRole('button', { name: 'Regresar' }));

      expect(routerMock.push).toHaveBeenCalledWith('/ADC/Documentation/1');
   });

   test('it calculates "Ventas Netas" percentage as the sum of "Costo de ventas y/o servicios" + "Utilidad Bruta"', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const netSalesPercentage = inputs.find(({ id }) => id === 'percentage-period0-1');
      const salesCostInput = inputs.find(({ id }) => id === 'amount-period0-2');

      await user.type(netSalesInput, '100');
      await user.type(salesCostInput, '10');

      expect(netSalesPercentage.value).toBe('100.00');
   });

   test('it calculates "Costo de ventas y/o servicios" percentage based on "Ventas Netas" amount', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const salesCostInput = inputs.find(({ id }) => id === 'amount-period0-2');
      const salesCostPercentage = inputs.find(({ id }) => id === 'percentage-period0-2');

      await user.type(netSalesInput, '100');
      await user.type(salesCostInput, '10');

      expect(salesCostPercentage.value).toBe('10.00');
   });

   test('it calculates "Utilidad Bruta" amount from the subtraction of "Ventas Netas" - "Costo de ventas y/o servicios"', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const salesCostInput = inputs.find(({ id }) => id === 'amount-period0-2');
      const utilityInput = inputs.find(({ id }) => id === 'amount-period0-3');

      await user.type(netSalesInput, '100');
      await user.type(salesCostInput, '10');

      expect(utilityInput.value).toBe('90');
   });

   test('it calculates "Utilidad Bruta" percentage based on "Ventas Netas" amount', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const salesCostInput = inputs.find(({ id }) => id === 'amount-period0-2');
      const utilityPercentage = inputs.find(({ id }) => id === 'percentage-period0-3');

      await user.type(netSalesInput, '100');
      await user.type(salesCostInput, '20');

      expect(utilityPercentage.value).toBe('80.00');
   });

   test('it calculates "Gasto de Operación" percentage based on "Ventas Netas" amount', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const operationCostInput = inputs.find(({ id }) => id === 'amount-period0-4');
      const operationCostPercentage = inputs.find(({ id }) => id === 'percentage-period0-4');

      await user.type(netSalesInput, '100');
      await user.type(operationCostInput, '30');

      expect(operationCostPercentage.value).toBe('30.00');
   });

   test('it calculates "Utilidad de Operación" amount from "Utilidad Bruta" - "Gastos de Operación"', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const salesCostInput = inputs.find(({ id }) => id === 'amount-period0-2');
      const operationCostInput = inputs.find(({ id }) => id === 'amount-period0-4');
      const operationUtilityInput = inputs.find(({ id }) => id === 'amount-period0-5');

      await user.type(netSalesInput, '100');
      await user.type(salesCostInput, '10');
      await user.type(operationCostInput, '30');

      expect(operationUtilityInput.value).toBe('60');
   });

   test('it calculates "Utilidad de Operación" percentage based on "Ventas Netas" amount', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const operationCostInput = inputs.find(({ id }) => id === 'amount-period0-4');
      const operationUtilityPercentage = inputs.find(({ id }) => id === 'percentage-period0-5');

      await user.type(netSalesInput, '100');
      await user.type(operationCostInput, '35');

      expect(operationUtilityPercentage.value).toBe('65.00');
   });

   test('it calculates "Interés Pagado" percentage based on "Ventas Netas" amount', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const interestInput = inputs.find(({ id }) => id === 'amount-period0-6');
      const interestPercentage = inputs.find(({ id }) => id === 'percentage-period0-6');

      await user.type(netSalesInput, '200');
      await user.type(interestInput, '18');

      expect(interestPercentage.value).toBe('9.00');
   });

   test('it calculates "Impuestos" percentage based on "Ventas Netas" amount', async () => {
      const {
         user,
         queries: { getAllByRole },
      } = await renderPage(StateResults, props);

      const inputs = getAllByRole('textbox');
      const netSalesInput = inputs.find(({ id }) => id === 'amount-period0-1');
      const taxesInput = inputs.find(({ id }) => id === 'amount-period0-14');
      const taxesPercentage = inputs.find(({ id }) => id === 'percentage-period0-14');

      await user.type(netSalesInput, '200');
      await user.type(taxesInput, '27');

      expect(taxesPercentage.value).toBe('13.50');
   });

   test('it calls the save service with the correct status when clicking on save button', async () => {
      const {
         user,
         queries: { getAllByRole, getByRole },
      } = await renderPage(StateResults, props);

      const enabledInputs = getAllByRole('textbox').filter((input) => !input.disabled);
      await user.type(enabledInputs[0], '100');
      await user.click(getByRole('button', { name: 'Guardar' }));

      expect(saveStateResults.mock.calls[0][0].status).toBe('20');
   });

   test('it saves and redirects to Documentation page when clicking on finish button', async () => {
      const {
         user,
         queries: { getAllByRole, getByRole },
      } = await renderPage(StateResults, props);

      const enabledInputs = getAllByRole('textbox').filter((input) => !input.disabled);

      for (let i = 0; i < 18; i++) {
         await user.type(enabledInputs[i], '100');
      }

      await user.click(getByRole('button', { name: 'Finalizar' }));

      expect(saveStateResults.mock.calls[0][0].status).toBe('21');
      expect(routerMock.push).toHaveBeenCalledWith('/ADC/Documentation/1');
   });

   describe('when profile is LDC', () => {
      test('it should have no editable input', async () => {
         globalContextMock.user.idProfile = 4;
         globalContextMock.user.path = 'LDC';

         const {
            queries: { queryAllByRole },
         } = await renderPage(StateResults, props);

         const textInputs = queryAllByRole('textbox').filter(({ disabled }) => !disabled);
         const selectInputs = queryAllByRole('combobox').filter(({ disabled }) => !disabled);
         const numberInputs = queryAllByRole('spinbutton').filter(({ disabled }) => !disabled);
         const radioInputs = queryAllByRole('radio').filter(({ disabled }) => !disabled);
         const checkboxInputs = queryAllByRole('checkbox').filter(({ disabled }) => !disabled);

         expect(textInputs.length).toBe(0);
         expect(selectInputs.length).toBe(0);
         expect(numberInputs.length).toBe(0);
         expect(radioInputs.length).toBe(0);
         expect(checkboxInputs.length).toBe(0);
      });
   });
});
