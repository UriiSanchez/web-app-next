import VerificationForm from '../../../../components/PropertyVerification/ModalVerification/VerificationForm';
import { useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
}));

const mockProperty = {
   applicant: {
      idClient: '785300',
      idCatTypePerson: 1,
      fullName: 'TEST S.A. DE C.V.',
      properties: [
         {
            idRelOwnership: 253,
            formFoil: '212345',
            numberOwnership: 1,
            currency: null,
            customerValue: 1200000,
            landUnit: 'hectare',
            propertyType: 'roomHouse',
            buildArea: '235.60',
            areaDimension: '129.90',
            location: 'prueba de desarrollo',
            idCheckOwnership: null,
            validation: false,
            comments: null,
         },
      ],
      resumeInd: {
         idResume: 538,
         totalAreaDimension: 129,
         totalBuildArea: 235,
         totalCustomerValue: 1200000,
         resumeEnum: 'INDIVIDUAL_A',
         resume: {
            libres: {
               valor: 0,
               numero: 0,
            },
            gravados: {
               valor: 0,
               numero: 0,
            },
            inmuebles: {
               valor: 1200000,
               numero: 1,
            },
            embargados: {
               valor: 0,
               numero: 0,
            },
            pendientes: {
               valor: 1200000,
               numero: 1,
            },
            escrituracion: {
               valor: 0,
               numero: 0,
            },
         },
         creditRisk: null,
         coverageRatio: null,
      },
   },
   obligedList: [
      {
         idClient: '578',
         idCatTypePerson: 2,
         fullName: 'USER MERCADO ARCINIEGA',
         properties: [
            {
               idRelOwnership: 249,
               formFoil: '212345',
               numberOwnership: 1,
               currency: null,
               customerValue: 4780000,
               landUnit: 'squareMeter',
               propertyType: 'Commercial',
               buildArea: '235.60',
               areaDimension: '129.90',
               location: 'dsdadadadasds',
               idCheckOwnership: {
                  idCheckOwnership: 22,
                  checkNumber: 1,
                  checkDate: '2025-08-01',
                  ownerName: 'JULIO CESAR MERCADO ARCINIEGA',
                  otherName1: '',
                  otherName2: '',
                  otherName3: '',
                  otherName4: '',
                  otherName5: '',
                  ownershipStatus: 'gravado',
                  description: 'Esto es otra prueba de desarrollo',
                  typeValue: 'appraisal',
                  currency: 'MXN',
                  ownershipValue: 3500000,
                  check: false,
                  ownerType: 'APPLICANT',
                  countable: false,
               },
               validation: false,
               comments: null,
            },
         ],
         resumeInd: {
            idResume: 544,
            totalAreaDimension: 129,
            totalBuildArea: 235,
            totalCustomerValue: 4780000,
            resumeEnum: 'INDIVIDUAL_O',
            resume: {
               libres: {
                  valor: 0,
                  numero: 0,
               },
               gravados: {
                  valor: 3500000,
                  numero: 1,
               },
               inmuebles: {
                  valor: 3500000,
                  numero: 1,
               },
               embargados: {
                  valor: 0,
                  numero: 0,
               },
               pendientes: {
                  valor: 0,
                  numero: 0,
               },
               escrituracion: {
                  valor: 0,
                  numero: 0,
               },
            },
            creditRisk: null,
            coverageRatio: null,
         },
      },
      {
         idClient: '300000',
         idCatTypePerson: 2,
         fullName: 'COMPANY TEST S.A. DE C.V.',
         properties: [],
         resumeInd: {
            idResume: null,
            totalAreaDimension: null,
            totalBuildArea: null,
            totalCustomerValue: null,
            resumeEnum: 'INDIVIDUAL_O',
            resume: {
               libres: {
                  valor: 0,
                  numero: 0,
               },
               gravados: {
                  valor: 0,
                  numero: 0,
               },
               inmuebles: {
                  valor: 0,
                  numero: 0,
               },
               embargados: {
                  valor: 0,
                  numero: 0,
               },
               pendientes: {
                  valor: 0,
                  numero: 0,
               },
               escrituracion: {
                  valor: 0,
                  numero: 0,
               },
            },
            creditRisk: null,
            coverageRatio: null,
         },
      },
   ],
   resumeGeneral: {
      idResume: 539,
      totalAreaDimension: null,
      totalBuildArea: null,
      totalCustomerValue: null,
      resumeEnum: 'GENERAL_EMG',
      resume: {
         inmueblesApplicant: {
            verify: {
               valor: 0,
               numero: 0,
            },
            pending: {
               valor: 1200000,
               numero: 1,
            },
         },
         inmueblesObligated: {
            verify: {
               valor: 3500000,
               numero: 1,
            },
            pending: {
               valor: 4780000,
               numero: 1,
            },
         },
         copropiedadWithOS: {
            valor: 0,
            numero: 0,
         },
         copropiedadOthers: {
            valor: 0,
            numero: 0,
         },
         embargados: {
            valor: 0,
            numero: 0,
         },
         escrituracion: {
            valor: 0,
            numero: 0,
         },
         gravados: {
            valor: 3500000,
            numero: 1,
         },
         libres: {
            valor: 0,
            numero: 0,
         },
         pendientes: {
            verify: {
               valor: 0,
               numero: 0,
            },
            pending: {
               valor: 1200000,
               numero: 1,
            },
         },
         coverageRatioClient: 2.6,
      },
      creditRisk: 2300000,
      coverageRatio: 0,
   },
   propertiesFormat: {
      idPropertiesFormat: 519,
      idCatStatus: 17,
      idRequest: 519,
      uniqueFolio: null,
      result: null,
      verificationDate: null,
      description: null,
      genericFolio: null,
      createDate: '2025-08-20T11:45:55',
      modifyDate: '26-08-2025',
      hasVerification: true,
      typeVerification: 'PROPERTY',
      pendingVerification: true,
      freezeTitle: 'Cumple seguridad y sociedad',
   },
   idCatStatusGroup: 1,
   hasProperty: true,
   hasPropertyOS: true,
};

const mockContextVerification = {
   catTypePerson: 1,
   check: false,
   checkDate: '',
   checkNumber: 1,
   currency: 'MXN',
   description: '',
   idCheckOwnership: null,
   idRelOwnership: 253,
   otherName1: '',
   otherName2: '',
   otherName3: '',
   otherName4: '',
   ownerName: '',
   ownershipStatus: '',
   ownershipValue: '',
   ownerType: '',
   typeValue: '',
   idx: 0,
   idClient: '785300',
   userCreate: 'uceron',
};

describe('VerificationForm', () => {
   const props = { isShow: true, propertyInfo: mockProperty };
   const toggleVerificationMock = jest.fn();
   const mockActions = {
      toggleLoading: jest.fn(),
      toggleReloading: jest.fn(),
      toggleVerification: toggleVerificationMock,
   };
   let globalContextMock;

   beforeEach(() => {
      jest.clearAllMocks();

      globalContextMock = {
         user: mockUsers.EF,
         verifyProperty: { open: false, item: mockContextVerification },
         isReloading: false,
         actions: mockActions,
      };
      useGlobalContext.mockReturnValue(globalContextMock);
   });

   test('it should render initial show all inputs and button', async () => {
      const {
         queries: { getByText, getByRole, getByLabelText },
      } = await renderPage(VerificationForm, props);

      expect(getByText('Verificación 01')).toBeVisible();
      expect(getByRole('button', { name: 'Guardar y salir' })).toBeInTheDocument();
      expect(getByRole('button', { name: 'Guardar y salir' })).toBeEnabled();

      expect(getByLabelText('Nombre del propietario')).toBeInTheDocument();
      expect(getByLabelText('Nombre del propietario').value.trim()).toBe('');

      expect(getByLabelText('Estatus de propiedad')).toBeInTheDocument();
      expect(getByLabelText('Estatus de propiedad').value.trim()).toBe('');

      expect(getByLabelText('Valor propiedad')).toBeInTheDocument();
      expect(getByLabelText('Valor propiedad').value.trim()).toBe('');
      expect(getByLabelText('Valor')).toBeInTheDocument();
   });

   test('It should display the applicant name when selecting "Solicitante".', async () => {
      const {
         user,
         queries: { getByLabelText, getByText },
      } = await renderPage(VerificationForm, props);

      const selectInputs = getByLabelText('Nombre del propietario');
      await user.selectOptions(selectInputs, ['APPLICANT']);

      expect(getByText('TEST S.A. DE C.V.')).toBeVisible();
   });

   test('It should display the applicant name and textbox when selecting "Co-propietario (Solicitante y otros)".', async () => {
      const {
         user,
         queries: { getByLabelText, getByText, getByPlaceholderText, getByRole },
      } = await renderPage(VerificationForm, props);

      const selectInputs = getByLabelText('Nombre del propietario');
      await user.selectOptions(selectInputs, ['CO_OTHERS']);

      expect(getByText('TEST S.A. DE C.V.')).toBeVisible();
      expect(getByPlaceholderText('Nombre del propietario')).toBeVisible();
      expect(getByRole('button', { name: 'add_circle' })).toBeInTheDocument();
      expect(getByRole('button', { name: 'add_circle' })).toBeDisabled();
   });

   test('It should display the applicant and obligateds when selecting "Co-propietario (Solicitante y Obligado Solidario)".', async () => {
      const {
         user,
         queries: { getByLabelText, getByText, getAllByRole },
      } = await renderPage(VerificationForm, props);

      const selectInputs = getByLabelText('Nombre del propietario');
      await user.selectOptions(selectInputs, ['CO_OBLIGED']);
      const allCloseButtons = getAllByRole('button', { name: 'close' });

      expect(getByText(mockProperty.applicant.fullName)).toBeVisible();
      expect(getByText(mockProperty.obligedList[0].fullName)).toBeVisible();
      expect(getByText(mockProperty.obligedList[1].fullName)).toBeVisible();

      expect(allCloseButtons.length).toBe(3);
   });

   test('it should add more owner input fields when clicking add (+) button when co-owner is selected in verification modal', async () => {
      const {
         user,
         queries: { getByRole, getAllByPlaceholderText, getByLabelText },
      } = await renderPage(VerificationForm, props);

      const selectInputs = getByLabelText('Nombre del propietario');
      await user.selectOptions(selectInputs, ['CO_OTHERS']);

      const addButton = getByRole('button', { name: 'add_circle' });
      const allInputsOthers = getAllByPlaceholderText('Nombre del propietario');
      await user.type(allInputsOthers[0], 'Pedro');

      expect(addButton).toBeEnabled();
      await user.click(addButton);
   });

   test('it shows an additional textbox when selecting "Gravado" for property status input in verification modal', async () => {
      const {
         user,
         queries: { getByRole, getByPlaceholderText },
      } = await renderPage(VerificationForm, props);

      const statusInput = getByRole('combobox', { name: 'Estatus de propiedad' });
      await user.selectOptions(statusInput, ['gravado']);

      let holderTextarea = 'Completar con el nombre de la institución, la fecha, el monto y el plazo';

      expect(getByPlaceholderText(holderTextarea)).toBeInTheDocument();
      expect(getByPlaceholderText(holderTextarea)).toBeEnabled();
   });
});
