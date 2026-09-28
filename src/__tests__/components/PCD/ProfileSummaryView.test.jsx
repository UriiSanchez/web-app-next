import { ProfileSummaryView } from '../../../components/PCD';

const mockCustomerProfile = {
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
};

// TODO falta añadir Unit Testing
describe('ProfileSummaryView component', () => {
   const props = { info: mockCustomerProfile, isDisabled: false, isSave: false, isComplete: false };
   let mockOnUpdateData;

   beforeEach(() => {
      jest.clearAllMocks();
      mockOnUpdateData = jest.fn();
   });

   test('renders correctly with initial state and controls', async () => {
      const {
         queries: { getByLabelText, getByText },
      } = await renderPage(ProfileSummaryView, {
         ...props,
         onUpdateData: mockOnUpdateData,
      });

      expect(getByLabelText('Actividad principal del negocio')).toBeInTheDocument();
      expect(getByLabelText('¿A quién va dirigidos sus productos o servicios?')).toBeInTheDocument();
      expect(getByLabelText('Productos y servicios que vende')).toBeInTheDocument();
      expect(getByLabelText('Marcas')).toBeInTheDocument();
      expect(getByLabelText('Principales clientes')).toBeInTheDocument();
      expect(getByLabelText('Principales proveedores')).toBeInTheDocument();
      expect(getByLabelText('Ciclicidad del negocio')).toBeInTheDocument();
      expect(getByLabelText('Alianzas o socios estratégicos')).toBeInTheDocument();
      expect(getByText('Visitante 01')).toBeInTheDocument();
   });

   test('If all fields are incomplete on the screen but nothing has been saved yet, the input class must be "input-form" or "option-input"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ProfileSummaryView, {
         ...props,
         onUpdateData: mockOnUpdateData,
      });

      expect(getByTestId('local')).toHaveClass('option-input');
      expect(getByTestId('regional')).toHaveClass('option-input');
      expect(getByTestId('national')).toHaveClass('option-input');
      expect(getByTestId('international')).toHaveClass('option-input');
      expect(getByTestId('small')).toHaveClass('option-input');
      expect(getByTestId('middle')).toHaveClass('option-input');
      expect(getByTestId('big')).toHaveClass('option-input');

      expect(getByTestId('mainBusinessActivity')).toHaveClass('input-form');
      expect(getByTestId('whoTargetYouServicesOrProducts')).toHaveClass('input-form');
      expect(getByTestId('productsAndServicesSold')).toHaveClass('input-form');
      expect(getByTestId('brands')).toHaveClass('input-form');
      expect(getByTestId('mainCustomers')).toHaveClass('input-form');
      expect(getByTestId('mainSuppliers')).toHaveClass('input-form');
      expect(getByTestId('bussinesCyclicality')).toHaveClass('input-form');
      expect(getByTestId('strategicAlliancesOrPartners')).toHaveClass('input-form');
      expect(getByTestId('whoVisitedName')).toHaveClass('input-form');
      expect(getByTestId('whoVisitedPosition')).toHaveClass('input-form');

      expect(getByTestId('physicalConditionOfTheFacilities')).toHaveClass('input-form');
      expect(getByTestId('physicalContionOfInventoriesAndObsolescences')).toHaveClass('input-form');
      expect(getByTestId('industryRisksDetected')).toHaveClass('input-form');
      expect(getByTestId('competitiveAdvantageOrDifferentiator')).toHaveClass('input-form');
      expect(getByTestId('additionalCommentsOrProjectsInThePipeline')).toHaveClass('input-form');
      expect(getByTestId('perceptionOfTheCompanysManagement')).toHaveClass('input-form');
      expect(getByTestId('whosePerceptionIsCollected')).toHaveClass('input-form');
      expect(getByTestId('whyYouDOrecommendTheCompany')).toHaveClass('input-form');
   });

   test('If all fields are incomplete on the screen and something has already been saved, the input class should be "mandatory"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ProfileSummaryView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isSave: true,
      });

      expect(getByTestId('local')).toHaveClass('mandatory');
      expect(getByTestId('regional')).toHaveClass('mandatory');
      expect(getByTestId('national')).toHaveClass('mandatory');
      expect(getByTestId('international')).toHaveClass('mandatory');
      expect(getByTestId('small')).toHaveClass('mandatory');
      expect(getByTestId('middle')).toHaveClass('mandatory');
      expect(getByTestId('big')).toHaveClass('mandatory');

      expect(getByTestId('mainBusinessActivity')).toHaveClass('mandatory');
      expect(getByTestId('whoTargetYouServicesOrProducts')).toHaveClass('mandatory');
      expect(getByTestId('productsAndServicesSold')).toHaveClass('mandatory');
      expect(getByTestId('brands')).toHaveClass('mandatory');
      expect(getByTestId('mainCustomers')).toHaveClass('mandatory');
      expect(getByTestId('mainSuppliers')).toHaveClass('mandatory');
      expect(getByTestId('bussinesCyclicality')).toHaveClass('mandatory');
      expect(getByTestId('strategicAlliancesOrPartners')).toHaveClass('mandatory');
      expect(getByTestId('whoVisitedName')).toHaveClass('mandatory');
      expect(getByTestId('whoVisitedPosition')).toHaveClass('mandatory');

      expect(getByTestId('physicalConditionOfTheFacilities')).toHaveClass('mandatory');
      expect(getByTestId('physicalContionOfInventoriesAndObsolescences')).toHaveClass('mandatory');
      expect(getByTestId('industryRisksDetected')).toHaveClass('mandatory');
      expect(getByTestId('competitiveAdvantageOrDifferentiator')).toHaveClass('mandatory');
      expect(getByTestId('additionalCommentsOrProjectsInThePipeline')).toHaveClass('mandatory');
      expect(getByTestId('perceptionOfTheCompanysManagement')).toHaveClass('mandatory');
      expect(getByTestId('whosePerceptionIsCollected')).toHaveClass('mandatory');
      expect(getByTestId('whyYouDOrecommendTheCompany')).toHaveClass('mandatory');
   });

   test('If all the fields on the screen have already been filled out, the input class must be "input-form" or "option-input"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ProfileSummaryView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isComplete: true,
      });

      expect(getByTestId('local')).toHaveClass('option-input');
      expect(getByTestId('regional')).toHaveClass('option-input');
      expect(getByTestId('national')).toHaveClass('option-input');
      expect(getByTestId('international')).toHaveClass('option-input');
      expect(getByTestId('small')).toHaveClass('option-input');
      expect(getByTestId('middle')).toHaveClass('option-input');
      expect(getByTestId('big')).toHaveClass('option-input');

      expect(getByTestId('mainBusinessActivity')).toHaveClass('input-form');
      expect(getByTestId('whoTargetYouServicesOrProducts')).toHaveClass('input-form');
      expect(getByTestId('productsAndServicesSold')).toHaveClass('input-form');
      expect(getByTestId('brands')).toHaveClass('input-form');
      expect(getByTestId('mainCustomers')).toHaveClass('input-form');
      expect(getByTestId('mainSuppliers')).toHaveClass('input-form');
      expect(getByTestId('bussinesCyclicality')).toHaveClass('input-form');
      expect(getByTestId('strategicAlliancesOrPartners')).toHaveClass('input-form');
      expect(getByTestId('whoVisitedName')).toHaveClass('input-form');
      expect(getByTestId('whoVisitedPosition')).toHaveClass('input-form');

      expect(getByTestId('physicalConditionOfTheFacilities')).toHaveClass('input-form');
      expect(getByTestId('physicalContionOfInventoriesAndObsolescences')).toHaveClass('input-form');
      expect(getByTestId('industryRisksDetected')).toHaveClass('input-form');
      expect(getByTestId('competitiveAdvantageOrDifferentiator')).toHaveClass('input-form');
      expect(getByTestId('additionalCommentsOrProjectsInThePipeline')).toHaveClass('input-form');
      expect(getByTestId('perceptionOfTheCompanysManagement')).toHaveClass('input-form');
      expect(getByTestId('whosePerceptionIsCollected')).toHaveClass('input-form');
      expect(getByTestId('whyYouDOrecommendTheCompany')).toHaveClass('input-form');
   });

   test('If the screen is locked the input class must be "disabled"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ProfileSummaryView, {
         ...props,
         onUpdateData: mockOnUpdateData,
         isDisabled: true,
      });

      expect(getByTestId('mainBusinessActivity')).toHaveClass('disabled');
      expect(getByTestId('whoTargetYouServicesOrProducts')).toHaveClass('disabled');
      expect(getByTestId('productsAndServicesSold')).toHaveClass('disabled');
      expect(getByTestId('brands')).toHaveClass('disabled');
      expect(getByTestId('mainCustomers')).toHaveClass('disabled');
      expect(getByTestId('mainSuppliers')).toHaveClass('disabled');
      expect(getByTestId('bussinesCyclicality')).toHaveClass('disabled');
      expect(getByTestId('strategicAlliancesOrPartners')).toHaveClass('disabled');
      expect(getByTestId('whoVisitedName')).toHaveClass('disabled');
      expect(getByTestId('whoVisitedPosition')).toHaveClass('disabled');

      expect(getByTestId('physicalConditionOfTheFacilities')).toHaveClass('disabled');
      expect(getByTestId('physicalContionOfInventoriesAndObsolescences')).toHaveClass('disabled');
      expect(getByTestId('industryRisksDetected')).toHaveClass('disabled');
      expect(getByTestId('competitiveAdvantageOrDifferentiator')).toHaveClass('disabled');
      expect(getByTestId('additionalCommentsOrProjectsInThePipeline')).toHaveClass('disabled');
      expect(getByTestId('perceptionOfTheCompanysManagement')).toHaveClass('disabled');
      expect(getByTestId('whosePerceptionIsCollected')).toHaveClass('disabled');
      expect(getByTestId('whyYouDOrecommendTheCompany')).toHaveClass('disabled');
   });
});
