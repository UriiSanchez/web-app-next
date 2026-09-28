import GeneralBalance from '../../../../pages/Shared/GeneralBalance/[request]';

import { getBalanceSheet, statusGeneralBalance, saveBalanceSheet } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getBalanceSheet: jest.fn(),
   statusGeneralBalance: jest.fn(),
   saveBalanceSheet: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));

describe('GeneralBalance page', () => {
   const props = {
      idClient: '1',
      idGroup: '1',
      idRequest: '1',
      rfc: 'ABCDE12345',
   };

   const conceptsInitial = [
      {
         idItem: 117,
         label: 'Otros',
         idItemChild: 97,
         description: 'Pasivo Financiero',
      },
      {
         idItem: 117,
         label: 'Otros',
         idItemChild: 100,
         description: 'Pasivo Buró de Crédito',
      },
      {
         idItem: 117,
         label: 'Otros',
         idItemChild: 101,
         description: 'Dif. Pasivo Financiero vs. BC',
      },
      {
         idItem: 53,
         label: 'Activos diferidos',
         idItemChild: 59,
         description: 'ACTIVO TOTAL',
      },
      {
         idItem: 60,
         label: 'Pasivos circulantes',
         idItemChild: 62,
         description: 'Préstamos bancarios a C.P.',
      },
      {
         idItem: 60,
         label: 'Pasivos circulantes',
         idItemChild: 66,
         description: 'Parte circulante la deuda a L.P.',
         toolTip: true,
      },
      {
         idItem: 60,
         label: 'Pasivos circulantes',
         idItemChild: 73,
         description: 'Pasivo circulante',
      },
      {
         idItem: 83,
         label: 'CAPITAL CONTABLE',
         idItemChild: 85,
         description: 'Capital social',
      },
      {
         idItem: 83,
         label: 'CAPITAL CONTABLE',
         idItemChild: 94,
         description: 'CAPITAL CONTABLE',
      },
      {
         idItem: 74,
         label: 'Pasivos largo plazo',
         idItemChild: 75,
         description: 'Pasivo financiero L.P.',
      },
      {
         idItem: 74,
         label: 'Pasivos largo plazo',
         idItemChild: 81,
         description: 'Total pasivos largo plazo',
      },
      {
         idItem: 74,
         label: 'Pasivos largo plazo',
         idItemChild: 82,
         description: 'PASIVO',
      },
      {
         idItem: 26,
         label: 'Activos circulantes',
         idItemChild: 30,
         description: 'Inventarios',
      },
      {
         idItem: 26,
         label: 'Activos circulantes',
         idItemChild: 43,
         description: 'Activo circulante',
      },
   ];

   let globalContextMock;

   beforeEach(() => {
      globalContextMock = {
         user: { idProfile: 1, path: 'ADC', userAD: 'testuser', isReloading: false },
         actions: { toggleLoading: jest.fn(), toggleReloading: jest.fn() },
      };

      useGlobalContext.mockReturnValue(globalContextMock);

      getBalanceSheet.mockResolvedValue({
         status: 200,
         data: {
            idRequest: 1,
            idClient: '1',
            idCatTypePerson: 1,
            fullName: 'Test Full Name',
            status: '21',
            dateElaboration: '2024-04-01T13:53:21',
            periods: [
               {
                  periodType: 'ANNUAL',
                  year: '2021',
                  month: 'diciembre',
                  status: 21,
                  officeOrAccountant: 'test office',
                  monthIncludes: null,
                  sourceInformation: 'test source',
                  concepts: conceptsInitial,
               },
               {
                  periodType: 'ANNUAL',
                  year: '2022',
                  month: 'diciembre',
                  status: 21,
                  officeOrAccountant: 'test office 2',
                  monthIncludes: null,
                  sourceInformation: 'test source 2',
                  concepts: conceptsInitial,
               },
               {
                  periodType: 'PARTIAL',
                  year: '2023',
                  month: 'octubre',
                  status: 21,
                  officeOrAccountant: null,
                  monthIncludes: 10,
                  sourceInformation: 'test source 3',
                  concepts: conceptsInitial,
               },
            ],
         },
      });

      statusGeneralBalance.mockReturnValue(false);
      saveBalanceSheet.mockResolvedValue({ status: 204 });
   });

   test('it enables save button when a change is made', async () => {
      const {
         user,
         queries: { getAllByLabelText, getByRole },
      } = await renderPage(GeneralBalance, props);

      const officeInputs = getAllByLabelText('Despacho, contador o interno');
      await user.type(officeInputs[0], 'new office');

      expect(getByRole('button', { name: 'Guardar' })).toBeEnabled();
   });

   test('it should calculate "Inventarios" percentage based on "ACTIVO TOTAL"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [inventoryInput] = inputs.filter(({ id }) => id.includes('value-30'));
      const [totalInput] = inputs.filter(({ id }) => id.includes('value-59'));

      await user.type(inventoryInput, '480');
      await user.type(totalInput, '1000');

      expect(getByDisplayValue('48.00')).toBeVisible();
   });

   test('it should calculate "Activo circulante" percentage based on "ACTIVO TOTAL"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [activoInput] = inputs.filter(({ id }) => id.includes('value-43'));
      const [totalInput] = inputs.filter(({ id }) => id.includes('value-59'));

      await user.type(activoInput, '742');
      await user.type(totalInput, '1000');

      expect(getByDisplayValue('74.20')).toBeVisible();
   });

   test('it should calculate "Préstamos bancarios a C.P." percentage based on the sum of "PASIVO" + "CAPITAL CONTABLE"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [loanInput] = inputs.filter(({ id }) => id.includes('value-62'));
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-82'));
      const [capitalInput] = inputs.filter(({ id }) => id.includes('value-94'));

      await user.type(loanInput, '432');
      await user.type(passiveInput, '300');
      await user.type(capitalInput, '700');

      expect(getByDisplayValue('43.20')).toBeVisible();
   });

   test('it should calculate "Parte circulante la deuda a L.P." percentage based on the sum of "PASIVO" + "CAPITAL CONTABLE"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [partInput] = inputs.filter(({ id }) => id.includes('value-66'));
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-82'));
      const [capitalInput] = inputs.filter(({ id }) => id.includes('value-94'));

      await user.type(partInput, '5');
      await user.type(passiveInput, '200');
      await user.type(capitalInput, '300');

      expect(getByDisplayValue('1.00')).toBeVisible();
   });

   test('it should calculate "Pasivo circulante" percentage based on the sum of "PASIVO" + "CAPITAL CONTABLE"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [circPassiveInput] = inputs.filter(({ id }) => id.includes('value-73'));
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-82'));
      const [capitalInput] = inputs.filter(({ id }) => id.includes('value-94'));
      const [longTermPassiveInput] = inputs.filter(({ id }) => id.includes('value-81'));

      await user.type(circPassiveInput, '44');
      await user.type(passiveInput, '450');
      await user.type(capitalInput, '550');
      await user.type(longTermPassiveInput, '200');

      expect(getByDisplayValue('4.40')).toBeVisible();
   });

   test('it should calculate "Pasivo financiero L.P." percentage based on the sum of "PASIVO" + "CAPITAL CONTABLE"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [financialPassiveInput] = inputs.filter(({ id }) => id.includes('value-75'));
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-82'));
      const [capitalInput] = inputs.filter(({ id }) => id.includes('value-94'));

      await user.type(financialPassiveInput, '321');
      await user.type(passiveInput, '450');
      await user.type(capitalInput, '550');

      expect(getByDisplayValue('32.10')).toBeVisible();
   });

   test('it should calculate "Total pasivos largo plazo" percentage based on the sum of "PASIVO" + "CAPITAL CONTABLE"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [longTermPassive] = inputs.filter(({ id }) => id.includes('value-81'));
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-82'));
      const [capitalInput] = inputs.filter(({ id }) => id.includes('value-94'));
      const [circPassiveInput] = inputs.filter(({ id }) => id.includes('value-73'));

      await user.type(longTermPassive, '766');
      await user.type(passiveInput, '450');
      await user.type(capitalInput, '550');
      await user.type(circPassiveInput, '100');

      expect(getByDisplayValue('76.60')).toBeVisible();
   });

   test('it should calculate "PASIVO" percentage as the sum of "Total pasivos largo plazo" percentage and "Pasivo circulante" percentage', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [circPassiveInput] = inputs.filter(({ id }) => id.includes('value-73'));
      const [longTermPassive] = inputs.filter(({ id }) => id.includes('value-81'));
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-82'));
      const [capitalInput] = inputs.filter(({ id }) => id.includes('value-94'));

      await user.type(circPassiveInput, '100');
      await user.type(longTermPassive, '766');
      await user.type(passiveInput, '450');
      await user.type(capitalInput, '550');

      expect(getByDisplayValue('86.60')).toBeVisible();
   });

   test('it should calculate "Capital social" percentage based on the sum of "PASIVO" + "CAPITAL CONTABLE"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [socialCapital] = inputs.filter(({ id }) => id.includes('value-85'));
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-82'));
      const [capitalInput] = inputs.filter(({ id }) => id.includes('value-94'));

      await user.type(socialCapital, '299');
      await user.type(passiveInput, '450');
      await user.type(capitalInput, '550');

      expect(getByDisplayValue('29.90')).toBeVisible();
   });

   test('it should calculate "CAPITAL CONTABLE" percentage as the amount divided by the sum of "PASIVO" + "CAPITAL CONTABLE"', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-82'));
      const [capitalInput] = inputs.filter(({ id }) => id.includes('value-94'));

      await user.type(passiveInput, '200');
      await user.type(capitalInput, '1000');

      expect(getByDisplayValue('83.33')).toBeVisible();
   });

   test('it should calculate "Pasivo financiero" as the sum of "Prestamos bancarios a C.P." + "Parte circulante la deuda a L.P." + "Pasivo financiero L.P."', async () => {
      const {
         user,
         queries: { getAllByRole, getByDisplayValue },
      } = await renderPage(GeneralBalance, props);

      const inputs = getAllByRole('textbox');
      const [loanInput] = inputs.filter(({ id }) => id.includes('value-62'));
      const [partInput] = inputs.filter(({ id }) => id.includes('value-66'));
      const [passiveInput] = inputs.filter(({ id }) => id.includes('value-75'));

      await user.type(loanInput, '300');
      await user.type(partInput, '400');
      await user.type(passiveInput, '200');

      expect(getByDisplayValue('900')).toBeVisible();
   });

   test('it should enable finish button when all input fields are filled', async () => {
      const {
         user,
         queries: { getAllByLabelText, getAllByRole, getByRole },
      } = await renderPage(GeneralBalance, props);

      const sourceInputs = getAllByLabelText('Fuente de información');
      const inputs = getAllByRole('textbox');

      for (const sourceInput of sourceInputs) {
         await user.selectOptions(sourceInput, ['Dictamen fiscal']);
      }

      for (const input of inputs) {
         await user.type(input, '100');
      }

      expect(getByRole('button', { name: 'Finalizar' })).toBeEnabled();
   });

   test('it should display a message when clicking the tooltip icon', async () => {
      const {
         user,
         queries: { getAllByRole, getByText },
      } = await renderPage(GeneralBalance, props);

      const [tooltipIconBtn] = getAllByRole('button', { name: 'info' });
      await user.click(tooltipIconBtn);

      expect(getByText('Suma de Pago de Capital anual de créditos Amortizables')).toBeVisible();
   });

   test('it saves the data with save status type when clicking save button', async () => {
      const {
         user,
         queries: { getAllByLabelText, getByRole },
      } = await renderPage(GeneralBalance, props);

      const [sourceInput] = getAllByLabelText('Despacho, contador o interno');
      await user.type(sourceInput, 'test office');

      const saveButton = getByRole('button', { name: 'Guardar' });
      await user.click(saveButton);

      expect(saveBalanceSheet.mock.calls[0][0]?.status).toBe(20);
   });

   describe('when profile is LDC', () => {
      test('it should have no editable input', async () => {
         globalContextMock.user.idProfile = 4;
         globalContextMock.user.path = 'LDC';

         const {
            queries: { queryAllByRole },
         } = await renderPage(GeneralBalance, props);

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
