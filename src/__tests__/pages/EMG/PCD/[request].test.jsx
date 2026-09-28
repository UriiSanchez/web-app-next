import PCDPage from '../../../../pages/EMG/PCD/[request]';

import { useRouter } from 'next/router';
import {
   checkCompletePCD,
   getCustomerProfile,
   saveCustomerProfile,
   validationIfCompleted,
   validationIfSaved,
} from '../../../../services';
import { useLocalStorage, useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getCustomerProfile: jest.fn(),
   handleVerifyCalculators: jest.fn(),
   checkCompletePCD: jest.fn(),
   checkDataVerification: jest.fn(),
   saveCustomerProfile: jest.fn(),
   validationIfSaved: jest.fn(),
   validationIfCompleted: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');

   return {
      ...originalModule,
      useGlobalContext: jest.fn(),
      useLocalStorage: jest.fn(),
   };
});

const mockCustomerProfile = {
   idClient: '1',
   clientName: 'Test Name',
   coverageProfile: {
      calculatorType: {
         isType: '',
         data: [],
      },
      customerImports: {
         isType: '',
         whatPercentage: '',
         fromWhere: '',
         currencyHedgingPolicy: '',
         foreignCurrencyInputs: '',
      },
      customerExports: {
         isType: '',
         whatPercentage: '',
         toWhere: '',
         currencyHedgingPolicy: '',
         foreignCurrencyDomesticSales: '',
      },
      descriptionOfStrategy: '',
      customerHasExperience: {
         isType: '',
         data: [],
      },
   },
   calculatorRate: {
      creditors: [],
      balanceMxn: '',
      valueCongruence: 0,
      congruenceCreditors: 0,
      sourcerOfCredit: 'base',
      rateCalculator: {
         amountOfCredit: '',
         amountOfCreditUS: '',
         creditTermValue: '',
         creditTermType: '',
         coverageType: '',
         amortizationStyle: '',
         tableDerivaties: '',
         pointsToCover: '',
         swapRate: '',
         theoreticalLine: '',
         requestedLineAmount: '',
         sufficiency: '',
         congruenceCalculator: 0,
      },
   },
   calculatorRateExchange: {
      customerPosition: '',
      salesForLastFiscalYear: '',
      percentageInForeignCurrency: '',
      foreignCurrencyFlow: '',
      coveragePolicy: '',
      estimatedCumulativePosition: '',
      coverageIndex: '',
      averageTransactionAmount: '',
      estimatedRevolving: '',
      maximumCoverageTermInMonths: '',
      mpa: '',
      spread: '',
      estimatedLine: '',
      annualConsistencyValidation: {
         value: '',
         color: 'bg-gray',
         title: '',
      },
   },
   profileResume: {
      mainBusinessActivity: '',
      whoTargetYouServicesOrProducts: '',
      presence: '',
      productsAndServicesSold: '',
      brands: '',
      mainCustomers: '',
      mainSuppliers: '',
      bussinesCyclicality: '',
      strategicAlliancesOrPartners: '',
      whoMadeTheVisit: [],
      whoVisitedName: '',
      whoVisitedPosition: '',
      numberOfEmployees: '',
      physicalConditionOfTheFacilities: '',
      physicalContionOfInventoriesAndObsolescences: '',
      news: {
         positives: [],
         negatives: [],
         noNewsWereFound: false,
      },
      industryRisksDetected: '',
      competitiveAdvantageOrDifferentiator: '',
      additionalCommentsOrProjectsInThePipeline: '',
      perceptionOfTheCompanysManagement: '',
      whosePerceptionIsCollected: '',
      whyYouDOrecommendTheCompany: '',
   },
   idStatus: 13,
   requestAmount: null,
   approvedAmount: null,
   idGroupStatus: '1',
   veracity: false,
   selectedCalculator: '',
   isCompleted: false,
};

const mockCoverageFull = {
   calculatorType: {
      data: [
         {
            cross: 'USDMXN',
            porcentage: '100',
         },
      ],
      isType: 'typechange',
   },
   customerExports: {
      isType: 'No',
      toWhere: '',
      whatPercentage: '',
      currencyHedgingPolicy: '0',
      foreignCurrencyDomesticSales: '0',
   },
   customerImports: {
      isType: 'No',
      fromWhere: '',
      whatPercentage: '',
      currencyHedgingPolicy: '40',
      foreignCurrencyInputs: '60',
   },
   customerHasExperience: {
      data: [],
      isType: 'No',
   },
   descriptionOfStrategy: 'NIKKEN LATINOAMERICA S. DE R.L. DE C.V.',
};

describe('PCD page', () => {
   const props = {
      idRequest: '1',
      idGroup: '2',
   };

   let getCustomerMock;
   let globalContextMock;
   let pushMock = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         user: mockUsers.EF,
         isReloading: false,
         general: { DOLLAR: '18.0712' },
         actions: { setStepper: jest.fn(), toggleReloading: jest.fn(), toggleLoading: jest.fn() },
      };

      getCustomerMock = { status: 200, data: mockCustomerProfile };

      useRouter.mockReturnValue({ push: pushMock });
      getCustomerProfile.mockResolvedValue(getCustomerMock);
      useGlobalContext.mockReturnValue(globalContextMock);
      saveCustomerProfile.mockReturnValue({ status: 204 });
      checkCompletePCD.mockReturnValue({
         coverageProfile: false,
         calculator: false,
         profileSummary: false,
         allPCD: false,
      });
      validationIfSaved.mockReturnValue(true);
      validationIfCompleted.mockReturnValue(false);
      localStorage.setItem('PCD_Page', JSON.stringify(getCustomerMock.data));
      useLocalStorage.mockReturnValue([1, jest.fn()]);
   });

   test('it should be save button disabled and the continue button should be disabled when no data is captured', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(PCDPage, props);

      expect(getByRole('button', { name: 'Guardar' })).toBeDisabled();
      expect(getByRole('button', { name: 'Continuar' })).toBeDisabled();
   });

   test('should navigate to home page when "Regresar" button is clicked', async () => {
      const {
         user,
         queries: { getByRole },
         waitFor,
      } = await renderPage(PCDPage, props);

      await waitFor(() => expect(getCustomerProfile).toHaveBeenCalled());
      const backButton = getByRole('button', { name: 'Regresar' });
      await user.click(backButton);
      expect(pushMock).toHaveBeenCalledWith('/EMG/Documentation/' + props.idGroup);
   });

   test('it should you must activate the "Save" button when making any change', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(PCDPage, props);

      const btnSave = getByRole('button', { name: 'Guardar' });
      const radioRate = getByRole('radio', { name: 'Tasa' });
      await user.click(radioRate);
      expect(btnSave).toBeEnabled();
   });

   test('it should you must activate the "Continuar" button when choose rate or type exchange', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(PCDPage, props);
      const btnNext = getByRole('button', { name: 'Continuar' });
      const radioRate = getByRole('radio', { name: 'Tasa' });
      const radioExchange = getByRole('radio', { name: 'Tipo de cambio' });

      // Se valida que el botón siguiente esté deshabilitado si no se ha elegido una opción
      expect(btnNext).toBeDisabled();
      // Se selecciona la opción Tasa
      await user.click(radioRate);
      expect(btnNext).toBeEnabled();

      // Se selecciona la opción Tipo de cambio
      await user.click(radioExchange);
      expect(btnNext).toBeEnabled();
   });

   test('calls saveCustomerProfile on "Guardar" button click', async () => {
      const cloneMock = { ...mockCustomerProfile };
      cloneMock.coverageProfile.calculatorType.isType = 'rate';
      const {
         user,
         queries: { getByRole },
         waitFor,
      } = await renderPage(PCDPage, props);

      const btnSave = getByRole('button', { name: 'Guardar' });
      const radioRate = getByRole('radio', { name: 'Tasa' });
      // Seleccionamos la calculadora Tasa
      await user.click(radioRate);
      // Después guardamos la información
      await user.click(btnSave);

      await waitFor(() => {
         expect(saveCustomerProfile).toHaveBeenCalledTimes(1);
      });
   });

   test('if the status is different from the EF status, all inputs should be blocked', async () => {
      mockCustomerProfile.coverageProfile = mockCoverageFull;
      mockCustomerProfile.idGroupStatus = 2;
      getCustomerProfile.mockResolvedValueOnce({ status: 200, data: mockCustomerProfile });
      const {
         queries: { getByRole, getByTestId },
      } = await renderPage(PCDPage, props);

      expect(getByRole('radio', { name: 'Tipo de cambio' })).toBeDisabled();
      expect(getByRole('radio', { name: 'Tasa' })).toBeDisabled();
      expect(getByTestId('imports-0')).toBeDisabled();
      expect(getByTestId('imports-1')).toBeDisabled();
      expect(getByTestId('exports-0')).toBeDisabled();
      expect(getByTestId('exports-1')).toBeDisabled();
      expect(getByTestId('experience-0')).toBeDisabled();
      expect(getByTestId('experience-1')).toBeDisabled();
   });

   test('if a calculator is selected, when loading the display the “continue” button should be enabled', async () => {
      mockCustomerProfile.coverageProfile = mockCoverageFull;
      mockCustomerProfile.selectedCalculator = 'typechange';
      getCustomerProfile.mockResolvedValueOnce({ status: 200, data: mockCustomerProfile });
      const {
         queries: { getByRole },
      } = await renderPage(PCDPage, props);
      const btnNext = getByRole('button', { name: 'Continuar' });

      // Si hay una elección de calculadora se habilita el botón.
      expect(btnNext).toBeEnabled();
   });

   // test('If the information is incomplete, a message will appear indicating that fields are missing', async () => {
   //    mockCustomerProfile.coverageProfile = mockCoverageFull;
   //    mockCustomerProfile.selectedCalculator = 'typechange';
   //    useLocalStorage.mockReturnValue([3, jest.fn()]);
   //    getCustomerProfile.mockResolvedValueOnce({ status: 200, data: mockCustomerProfile });
   //    const {
   //       user,
   //       queries: { getByRole, getByText, getByAltText, getAllByText },
   //    } = await renderPage(PCDPage, { ...props });

   //    const btnNext = getByRole('button', { name: 'Finalizar' });

   //    expect(btnNext).toBeEnabled();

   //    await user.click(btnNext);

   //    expect(getByText('Información incompleta')).toBeInTheDocument();
   //    expect(getByText('Tienes información obligatoria pendiente por completar en:')).toBeInTheDocument();
   //    expect(getByText('Sección 1:')).toBeInTheDocument();
   //    expect(getByText('Perfil de Cobertura')).toBeInTheDocument();
   //    expect(getByText('Sección 2:')).toBeInTheDocument();
   //    expect(getByText('Calculadora de Parámetros de Operación')).toBeInTheDocument();
   //    expect(getByText('Sección 3:')).toBeInTheDocument();
   //    expect(getAllByText('Perfil del Cliente').length).toBe(2);
   // });
});
