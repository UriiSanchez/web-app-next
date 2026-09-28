import Cover from '../../../../pages/Shared/Cover/[group]';

import { useRouter } from 'next/router';
import { getCoverInfo } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   validateCoverCompleted: jest.fn(),
   getCoverInfo: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');
   return { ...originalModule, useGlobalContext: jest.fn() };
});

describe('Cover page', () => {
   const props = { idGroup: '1' };

   let routerMock;
   let serviceMock;

   beforeEach(() => {
      routerMock = { push: jest.fn() };
      serviceMock = {
         status: 200,
         data: [
            {
               idRequest: 1,
               coverComplete: false,
               generalDataCifResponse: {
                  checkBase: true,
                  checkLessor: false,
                  relationshipCredit: 'SI',
                  typeExchange: '18.8208',
                  presentationDate: '2024-04-02',
                  applicant: 'Test applicant 1',
                  idClient: '10',
                  address: 'Test address 1',
                  requestDate: '2024-04-01',
                  economicGroup: 'Test Group',
                  antiquity: '104',
                  city: 'MONTERREY',
                  analyst: 'Test analyst',
                  rfc: 'ABCDEFG12345',
                  branchOffice: 'CORPORATIVO',
                  state: 'Nuevo León',
                  commercialAddress: 'Test commercial address',
                  personType: 'PM',
               },
               infoFinancialResponse: {
                  lastAnnualDate: '2023',
                  partialDate: '2023',
                  customerClassification: null,
                  shareholding: [
                     {
                        name: '',
                        rfc: '',
                        directParticipation: '',
                        indirectParticipation: '',
                        id: 0,
                     },
                     {
                        name: 'Otros',
                        rfc: '',
                        directParticipation: '',
                        indirectParticipation: '',
                        id: 4,
                     },
                  ],
               },
               termsAndConditionsResponse: {
                  company: 'Test company 1',
                  presentationDate: '2024-04-02',
                  lineNumber: '1',
                  creditType: 'Derivados',
                  amountAuth: '0.001',
                  destination: 'Capital de Trabajo (Liquidación de Operaciones de Derivados)',
                  municipality: ' MONTERREY',
                  state: 'Nuevo León',
                  lineTerm: '12',
                  contractTerm: 'Indefinido',
                  resources: 'Propios y/o Fondos',
                  provision:
                     'Mediante los abonos que realice Banco Base en la cuenta digital del cliente a un plazo máximo de 2 días hábiles',
                  principalPayment: 'Al vencimiento',
                  interestPayment: 'Al vencimiento',
                  solidaryObliged: 'Test Obligaded',
                  warranty: 'Test Garantia',
                  precedentCondition: 'Test precedent condition',
                  followingCondition: 'Test following',
                  contractCondition: '',
                  cumulativeAmount: '6044.29',
                  coverageIndex: '78.99620964579793',
                  notional: '700',
                  operatingCondition: 'Test conditions of operation',
               },
               resolutionLinesResponse: {
                  modelAuthorization: {
                     termEm: '1 año',
                     amountEm: '120000',
                     currencyEm: 'MXP',
                     warrantyEm: 'OS',
                     riskGroupAmountEm: '0',
                     riskApplicantAmountEm: '120000',
                     riskPotentialAmountEm: 120000,
                  },
               },
               sectorInformationResponse: {
                  targetMarket: 'SI',
                  strategicMarket: 'SI',
                  specificDescriptionActivity: 'Prueba de desarrollo',
               },
            },
         ],
      };

      useRouter.mockReturnValue(routerMock);
      useGlobalContext.mockReturnValue({
         actions: { toggleLoading: jest.fn(), togglePDF: jest.fn() },
         user: { userAD: 'testuser', path: 'ADC' },
      });

      getCoverInfo.mockResolvedValue(serviceMock);
   });

   test('it changes displayed data when a different requester is selected from the list', async () => {
      serviceMock.data.push({
         idRequest: 2,
         coverComplete: false,
         generalDataCifResponse: { applicant: 'Test applicant 2', idClient: '20' },
         infoFinancialResponse: {
            lastAnnualDate: '2023',
            partialDate: '2023',
            customerClassification: null,
            shareholding: [
               {
                  name: '',
                  rfc: '',
                  directParticipation: '',
                  indirectParticipation: '',
                  id: 0,
               },
               {
                  name: 'Otros',
                  rfc: '',
                  directParticipation: '',
                  indirectParticipation: '',
                  id: 4,
               },
            ],
         },
      });

      const {
         user,
         queries: { getByAltText, getByText, getByLabelText },
      } = await renderPage(Cover, props);

      expect(getByLabelText('Número de cliente').value).toBe('10');

      await user.click(getByAltText('Icono menú'));
      await user.click(getByText('Test applicant 2'));

      expect(getByLabelText('Número de cliente').value).toBe('20');
   });

   test('it enables save button when a change is made', async () => {
      const {
         user,
         queries: { getByLabelText, getByRole },
      } = await renderPage(Cover, props);

      await user.selectOptions(getByLabelText('Crédito relacionado Art. 73'), ['NO']);

      expect(getByRole('button', { name: 'Guardar' })).toBeEnabled();
   });
});
