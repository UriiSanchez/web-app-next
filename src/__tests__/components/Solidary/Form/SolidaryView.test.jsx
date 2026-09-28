import { SolidaryView } from '../../../../components/Solidary/Form/SolidaryView';
import { formatMoney } from '../../../../helpers';

jest.mock('../../../../helpers', () => ({
   __esModule: true,
   formatMoney: jest.fn((amount) => `$${amount.toLocaleString('en-US')}`),
}));

const mockData = {
   idCatStatus: 2,
   idCatTypeProcedure: 2,
   idGroupRequest: 1,
   idRequest: 10,
   kindProcedure: 'Nuevo Tramite',
   requestAmount: '1000000',
   relatedPersonResponseList: [
      {
         fullName: 'SOLICITANTE 01',
         idCatTypePerson: 1,
         idClient: '174800',
         deleted: false,
         idRequest: 10,
         mail: null,
         maritalStatus: null,
         userCreate: 'TESTUSER',
         personType: 'PM',
         rfc: 'RX0X0X0X0X0',
      },
   ],
};

const mockObligateds = [
   {
      fullName: 'OBLIGATED SOLIDARY 1',
      idCatTypePerson: 2,
      idClient: '300000',
      deleted: false,
      idRequest: 491,
      mail: 'nocorreo@bancobase.com',
      maritalStatus: null,
      userCreate: 'testef',
      personType: 'PM',
      rfc: null,
   },
   {
      fullName: 'OBLIGATED SOLIDARY 2',
      idCatTypePerson: 2,
      idClient: '400000',
      deleted: false,
      idRequest: 491,
      mail: 'nocorreo@bancobase.com',
      maritalStatus: 'Soltero',
      userCreate: 'testef',
      personType: 'PFAE',
      rfc: null,
   },
];

describe('SolidaryView component', () => {
   const props = {
      request: mockData,
      creditLimit: 16000000,
      isNotEditable: true,
   };

   const mockFnSet = jest.fn();

   afterEach(() => {
      jest.clearAllMocks();
   });

   test('the initial information is loaded with a single request and the status is different from those allowed by EF.', async () => {
      const {
         queries: { getByText },
      } = await renderPage(SolidaryView, { ...props, fnSet: mockFnSet });

      expect(getByText('SOLICITANTE 01')).toBeInTheDocument();
      expect(getByText('Nuevo Tramite')).toBeInTheDocument();

      expect(formatMoney).toHaveBeenCalledWith(mockData.requestAmount);
      expect(getByText('$1000000')).toBeInTheDocument();
   });

   test('The information is validated with a single request and several jointly liable parties', async () => {
      mockData.relatedPersonResponseList.push(mockObligateds[0]);
      mockData.relatedPersonResponseList.push(mockObligateds[1]);
      const {
         queries: { getByText },
      } = await renderPage(SolidaryView, { ...props, request: mockData, fnSet: mockFnSet });

      expect(getByText('SOLICITANTE 01')).toBeInTheDocument();
      expect(getByText('Nuevo Tramite')).toBeInTheDocument();

      expect(formatMoney).toHaveBeenCalledWith(mockData.requestAmount);
      expect(getByText('$1000000')).toBeInTheDocument();

      expect(getByText('OBLIGATED SOLIDARY 1')).toBeInTheDocument();
      expect(getByText('OBLIGATED SOLIDARY 2')).toBeInTheDocument();
      expect(getByText('Soltero')).toBeInTheDocument();
   });
});
