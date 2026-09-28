import { SideCover } from '../../../components';

describe('SideCover component', () => {
   const props = {
      data: [
         {
            idRequest: 48,
            generalDataCifResponse: {
               checkBase: true,
               checkLessor: false,
               relationshipCredit: 'SI',
               typeExchange: '20.07',
               presentationDate: '22-04-2025',
               applicant: 'PRUEBAS S.A. DE C.V.',
               idClient: '0101',
               address: 'CALLE DE PRUEBA',
               requestDate: '14-03-2025',
               economicGroup: 'GRUPO DE PRUEBA',
               antiquity: '20 años',
               city: 'CIUDAD DE PRUEBA',
               analyst: 'ANALISTA DE PRUEBA',
               rfc: '222222222222',
               branchOffice: 'CORPORATIVO',
               state: 'ESTADO DE PRUEBA',
               commercialAddress: 'REGION DE PRUEBA',
               personType: 'PM',
            },
            infoFinancialResponse: {
               lastAnnualDate: '31-12-2023',
               partialDate: '31-dic-2024',
               customerClassification: null,
               shareholding: [
                  {
                     name: 'ACCIONISTA DE PRUEBA',
                     rfc: '111111111111',
                     directParticipation: '100.0',
                     indirectParticipation: '0.0',
                     id: 111,
                  },
               ],
               bureauReportApplicantDate: '10-03-2025',
               bureauReportObligedDate: '10-03-2025',
               qualificationApplicant: 'Malo',
               qualificationObliged: 'Malo Reservas',
               totalDirect: '100.0',
               totalIndirect: '100.0',
            },
            sectorInformationResponse: {
               codeBaseSector: '111',
               targetMarket: 'SI',
               strategicMarket: 'SI',
               sector: 'SECTOR DE PRUEBA',
               subSector: 'SUBSECTOR DE PRUEBA',
               specificActivity: 'ACTIVIDAD DE PRUEBA',
               specificDescriptionActivity: 'DESCRIPCION DE LA ACTIVIDAD DE PRUEBA',
            },
            resolutionLinesResponse: {
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
            signatureResponse: {
               exchangeVicePrincipal: 'DIEGO ELIUD GONZALEZ ALMAGUER',
               exchangeDirector: 'JEAN PAUL LOZANO GAMIZ',
               counterpartVicePrincipal: 'Sacnité Flores Oropeza',
               creditDirector: 'Luis Antonio Novelo Lazo',
               commercialDirector: 'Arturo Guerra Anzaldúa',
               exchangeDirectorMX: 'Luis Nicolás Eguiarte Corona',
               regionalDirector: 'José Antonio Sánchez Narro',
            },
            termsAndConditionsResponse: {
               company: 'TOYOTA',
               presentationDate: '22-04-2025',
               lineNumber: '1',
               creditType: 'Derivados',
               amountAuth: '1000',
               destination: 'Capital de Trabajo (Liquidación de Operaciones de Derivados)',
               municipality: ' SAN PEDRO GARZA GARCIA',
               state: 'Nuevo León',
               lineTerm: '12 meses',
               contractTerm: 'Indefinido',
               resources: 'Propios y/o Fondos',
               provision:
                  'Mediante los abonos que realice Banco Base en la cuenta digital del cliente a un plazo máximo de 2 días hábiles',
               principalPayment: 'Al vencimiento',
               interestPayment: 'Al vencimiento',
               solidaryObliged: 'RELEVANCIA MOTRIZ S.A. DE C.V.',
               warranty: 'N/A',
               precedentCondition:
                  'Proporcionar acta de matrimonio de los Obligados Solidarios con estado civil Casado, para confirmar el régimen matrimonial. En caso de estar casado por Sociedad Conyugal, la relación patrimonial deberá estar firmada por ambos cónyuges',
               followingCondition: 'N/A',
               contractCondition: 'N/A',
               cumulativeAmount: '3480.8',
               coverageIndex: '57.47126436781609',
               notional: '1999.9999999999975',
               operatingCondition:
                  'Proporcionar resultado de las verificaciones en un plazo no mayor a 90 días a partir de la autorización: - De sociedad: resultado deberá ser libre de embargo.- De propiedad: el resultado deberá cumplir con inmuebles libres en proporción (campo abierto) a 1 respecto al monto del LCD autorizado.',
            },
         },
      ],
   };
   beforeEach(() => {});

   test('should be displayed menu component', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(SideCover, props);

      expect(getByTestId('menuButton')).toBeInTheDocument();
   });

   test('should be displayed the applicant when user click in the menu componet ', async () => {
      const {
         user,
         queries: { getByTestId },
      } = await renderPage(SideCover, props);

      const button = getByTestId('menuButton');
      await user.click(button);
      expect(getByTestId('applicant')).toBeInTheDocument();
   });
});
