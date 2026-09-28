import { PersonOptionItem } from '../../../../components/PropertyVerification/ModalVerification/PersonOptionItem';

const mockData = {
   catTypePerson: 1,
   check: false,
   ownerName: 'COMPANY APPLICANT S.A. DE C.V.',
   otherName1: '',
   otherName2: '',
   otherName3: '',
   otherName4: '',
   otherName5: '',
};

describe('PersonOptionItem component', () => {
   let mockOnDeleteCoOwner = jest.fn();
   let mockOnChangeState = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
   });

   test('debe renderizar correctamente para ownerType "APPLICANT"', async () => {
      const {
         queries: { getByText },
      } = await renderPage(PersonOptionItem, { data: { ...mockData, ownerType: 'APPLICANT' } });

      expect(getByText(mockData.ownerName)).toBeInTheDocument();
   });

   test('debe renderizar correctamente para ownerType "CO_OBLIGED" con datos', async () => {
      const {
         queries: { getByText },
      } = await renderPage(PersonOptionItem, {
         data: { ...mockData, ownerType: 'CO_OBLIGED', otherName1: 'TEST USER PF', otherName2: 'TEST COMPANY PM' },
         onDeleteCoOwner: mockOnDeleteCoOwner,
      });

      expect(getByText(mockData.ownerName)).toBeInTheDocument();
      expect(getByText('TEST USER PF')).toBeInTheDocument();
      expect(getByText('TEST COMPANY PM')).toBeInTheDocument();
   });

   test('debe renderizar el check y la leyenda "más de los mencionados" para ownerType "CO_OTHERS"', async () => {
      const {
         queries: { getByTestId, getByRole },
      } = await renderPage(PersonOptionItem, {
         data: {
            ...mockData,
            ownerType: 'CO_OTHERS',
            otherName1: 'TEST USER PF',
            otherName2: 'TEST COMPANY PM',
            otherName3: 'TEST USER 3',
            otherName4: 'TEST USER 4',
         },
         onDeleteCoOwner: mockOnDeleteCoOwner,
         onChangeState: mockOnChangeState,
         countOtherOwners: 4,
      });

      expect(getByTestId('deleted-otherName4')).toBeInTheDocument();
      expect(getByRole('checkbox', { name: 'más de los mencionados' })).toBeInTheDocument();
      expect(getByRole('checkbox', { name: 'más de los mencionados' })).toBeEnabled();
   });
});
