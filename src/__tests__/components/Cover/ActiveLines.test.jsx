import { ActiveLines } from '../../../components';

describe('ActiveLines component', () => {
   const props = {
      data: {
         previousLines: {
            linesActives: [
               {
                  type: '',
                  amountIsi: '',
                  balanceIsi: '',
                  lineNumber: 1,
                  authDateIsi: '',
                  currencyIsi: '',
                  warrantyIsi: '',
                  issueDateIsi: '',
               },
               {
                  type: '',
                  amountIsi: '',
                  balanceIsi: '',
                  lineNumber: 2,
                  authDateIsi: '',
                  currencyIsi: '',
                  warrantyIsi: '',
                  issueDateIsi: '',
               },
               {
                  type: '',
                  amountIsi: '',
                  balanceIsi: '',
                  lineNumber: 3,
                  authDateIsi: '',
                  currencyIsi: '',
                  warrantyIsi: '',
                  issueDateIsi: '',
               },
               {
                  type: '',
                  amountIsi: '',
                  balanceIsi: '',
                  lineNumber: 4,
                  authDateIsi: '',
                  currencyIsi: '',
                  warrantyIsi: '',
                  issueDateIsi: '',
               },
               {
                  type: '',
                  amountIsi: '',
                  balanceIsi: '',
                  lineNumber: 5,
                  authDateIsi: '',
                  currencyIsi: '',
                  warrantyIsi: '',
                  issueDateIsi: '',
               },
               {
                  type: '',
                  amountIsi: '',
                  balanceIsi: '',
                  lineNumber: 6,
                  authDateIsi: '',
                  currencyIsi: '',
                  warrantyIsi: '',
                  issueDateIsi: '',
               },
               {
                  type: '',
                  amountIsi: '',
                  balanceIsi: '',
                  lineNumber: 7,
                  authDateIsi: '',
                  currencyIsi: '',
                  warrantyIsi: '',
                  issueDateIsi: '',
               },
               {
                  type: '',
                  amountIsi: '',
                  balanceIsi: '',
                  lineNumber: 8,
                  authDateIsi: '',
                  currencyIsi: '',
                  warrantyIsi: '',
                  issueDateIsi: '',
               },
            ],
            riskGroupAmountIsi: '900',
            riskGroupBalanceIsi: '1000',
            riskApplicantAmountIsi: '700',
            riskPotentialAmountIsi: '1100',
            riskApplicantBalanceIsi: '800',
            riskPotentialBalanceIsi: '1200',
         },
         modelAuthorization: {
            termEm: ' 1 año',
            amountEm: '1000',
            currencyEm: 'MXP',
            warrantyEm: 'OS',
            riskGroupAmountEm: 2001,
            riskApplicantAmountEm: '1000',
            riskPotentialAmountEm: 3001,
         },
         requestLinesResponse: {
            amountEc: '1000',
            warrantyEc: 'OS',
            riskPotentialAmountEc: '2000',
            riskApplicantAmountEc: '1000',
            riskGroupAmountEc: '1000',
            termEc: '12',
            situation: 'Nuevo Tramite',
            currencyEc: 'MXP',
         },
      },
   };
   beforeEach(() => {});

   test('should be tipo de lineas ', async () => {
      const {
         queries: { getAllByText, getByText, getByTestId },
      } = await renderPage(ActiveLines, props);

      expect(getByText('Resolución de líneas')).toBeVisible();
      expect(getByText('No.')).toBeVisible();
      expect(getByText('Tipo')).toBeVisible();

      expect(getByTestId('type-0')).toBeInTheDocument();
      expect(getByTestId('type-1')).toBeInTheDocument();
      expect(getByTestId('type-2')).toBeInTheDocument();
      expect(getByTestId('type-3')).toBeInTheDocument();
      expect(getByTestId('type-4')).toBeInTheDocument();
      expect(getByTestId('type-5')).toBeInTheDocument();
      expect(getByTestId('type-6')).toBeInTheDocument();
      expect(getByTestId('type-7')).toBeInTheDocument();
      expect(getByText('No. 1')).toBeVisible();
      expect(getByText('No. 2')).toBeVisible();
      expect(getByText('No. 3')).toBeVisible();
      expect(getByText('No. 4')).toBeVisible();
      expect(getByText('No. 5')).toBeVisible();
      expect(getByText('No. 6')).toBeVisible();
      expect(getByText('No. 7')).toBeVisible();
      expect(getByText('No. 8')).toBeVisible();

      expect(getAllByText('- Seleccionar -').length).toBe(8);
      expect(getAllByText('ACCC').length).toBe(8);
      expect(getAllByText('ACS').length).toBe(8);
      expect(getAllByText('FX LOAN').length).toBe(8);
      expect(getAllByText('FACT. CLIENTES').length).toBe(8);
      expect(getAllByText('FACT. PROV').length).toBe(8);
      expect(getAllByText('DERIVADOS').length).toBe(8);
      expect(getAllByText('PQ').length).toBe(8);
      expect(getAllByText('CCI/ACCC').length).toBe(8);
      expect(getAllByText('ARREND. PURO').length).toBe(8);
      expect(getAllByText('ARREND. FIN').length).toBe(8);
      expect(getAllByText('ARRENDAMIENTO').length).toBe(8);
   });

   test('should be Líneas anteriores', async () => {
      const {
         queries: { getAllByText, getByText, getByTestId },
      } = await renderPage(ActiveLines, props);

      expect(getByText('Líneas anteriores')).toBeVisible();
      expect(getByText('Autoriza')).toBeVisible();
      expect(getAllByText('(dd-mm-aaaa)').length).toBe(2);
      expect(getByText('Vencimiento')).toBeVisible();
      expect(getAllByText('Monto').length).toBe(3);
      expect(getAllByText('Moneda').length).toBe(3);
      expect(getByText('Saldo')).toBeVisible();
      expect(getAllByText('Garantía').length).toBe(3);

      expect(getByTestId('authDateIsi-0')).toBeInTheDocument();
      expect(getByTestId('authDateIsi-1')).toBeInTheDocument();
      expect(getByTestId('authDateIsi-2')).toBeInTheDocument();
      expect(getByTestId('authDateIsi-3')).toBeInTheDocument();
      expect(getByTestId('authDateIsi-4')).toBeInTheDocument();
      expect(getByTestId('authDateIsi-5')).toBeInTheDocument();
      expect(getByTestId('authDateIsi-6')).toBeInTheDocument();
      expect(getByTestId('authDateIsi-7')).toBeInTheDocument();

      expect(getByTestId('issueDateIsi-0')).toBeInTheDocument();
      expect(getByTestId('issueDateIsi-1')).toBeInTheDocument();
      expect(getByTestId('issueDateIsi-2')).toBeInTheDocument();
      expect(getByTestId('issueDateIsi-3')).toBeInTheDocument();
      expect(getByTestId('issueDateIsi-4')).toBeInTheDocument();
      expect(getByTestId('issueDateIsi-5')).toBeInTheDocument();
      expect(getByTestId('issueDateIsi-6')).toBeInTheDocument();
      expect(getByTestId('issueDateIsi-7')).toBeInTheDocument();

      expect(getByTestId('amountIsi-0')).toBeInTheDocument();
      expect(getByTestId('amountIsi-1')).toBeInTheDocument();
      expect(getByTestId('amountIsi-2')).toBeInTheDocument();
      expect(getByTestId('amountIsi-3')).toBeInTheDocument();
      expect(getByTestId('amountIsi-4')).toBeInTheDocument();
      expect(getByTestId('amountIsi-5')).toBeInTheDocument();
      expect(getByTestId('amountIsi-6')).toBeInTheDocument();
      expect(getByTestId('amountIsi-7')).toBeInTheDocument();

      expect(getByTestId('currencyIsi-0')).toBeInTheDocument();
      expect(getByTestId('currencyIsi-1')).toBeInTheDocument();
      expect(getByTestId('currencyIsi-2')).toBeInTheDocument();
      expect(getByTestId('currencyIsi-3')).toBeInTheDocument();
      expect(getByTestId('currencyIsi-4')).toBeInTheDocument();
      expect(getByTestId('currencyIsi-5')).toBeInTheDocument();
      expect(getByTestId('currencyIsi-6')).toBeInTheDocument();
      expect(getByTestId('currencyIsi-7')).toBeInTheDocument();

      expect(getByTestId('balanceIsi-0')).toBeInTheDocument();
      expect(getByTestId('balanceIsi-1')).toBeInTheDocument();
      expect(getByTestId('balanceIsi-2')).toBeInTheDocument();
      expect(getByTestId('balanceIsi-3')).toBeInTheDocument();
      expect(getByTestId('balanceIsi-4')).toBeInTheDocument();
      expect(getByTestId('balanceIsi-5')).toBeInTheDocument();
      expect(getByTestId('balanceIsi-6')).toBeInTheDocument();
      expect(getByTestId('balanceIsi-7')).toBeInTheDocument();

      expect(getByTestId('warrantyIsi-0')).toBeInTheDocument();
      expect(getByTestId('warrantyIsi-1')).toBeInTheDocument();
      expect(getByTestId('warrantyIsi-2')).toBeInTheDocument();
      expect(getByTestId('warrantyIsi-3')).toBeInTheDocument();
      expect(getByTestId('warrantyIsi-4')).toBeInTheDocument();
      expect(getByTestId('warrantyIsi-5')).toBeInTheDocument();
      expect(getByTestId('warrantyIsi-6')).toBeInTheDocument();
      expect(getByTestId('warrantyIsi-7')).toBeInTheDocument();

      expect(getAllByText('USD').length).toBe(9);
      expect(getAllByText('MXP').length).toBe(10);
      expect(getAllByText('O.S.').length).toBe(9);
      expect(getAllByText('Sin O.S.').length).toBe(9);

      expect(getByTestId('riskApplicantAmountIsi')).toBeInTheDocument();
      expect(getByTestId('riskApplicantBalanceIsi')).toBeInTheDocument();
      expect(getByTestId('riskGroupAmountIsi')).toBeInTheDocument();
      expect(getByTestId('riskGroupBalanceIsi')).toBeInTheDocument();
      expect(getByTestId('riskPotentialAmountIsi')).toBeInTheDocument();
      expect(getByTestId('riskPotentialBalanceIsi')).toBeInTheDocument();
   });

   test('should be solicitada', async () => {
      const {
         queries: { getAllByText, getByText },
      } = await renderPage(ActiveLines, props);

      expect(getByText('Solicitud')).toBeVisible();
      expect(getByText('Situación')).toBeVisible();
      expect(getAllByText('Monto').length).toBe(3);
      expect(getAllByText('Moneda').length).toBe(3);
      expect(getAllByText('Plazo').length).toBe(2);
      expect(getAllByText('Garantía').length).toBe(3);
   });

   test('should be autorizada', async () => {
      const {
         queries: { getAllByText, getByText, getByTestId },
      } = await renderPage(ActiveLines, props);

      expect(getByText('Autorizado*')).toBeVisible();
      expect(getAllByText('Monto').length).toBe(3);
      expect(getAllByText('Moneda').length).toBe(3);
      expect(getAllByText('Plazo').length).toBe(2);
      expect(getAllByText('Garantía').length).toBe(3);
      expect(getByTestId('amountEm')).toBeInTheDocument();
      expect(getByTestId('currencyEm')).toBeInTheDocument();
      expect(getByTestId('warrantyEm')).toBeInTheDocument();
   });
});
