import { SolidaryEdit } from '../../../../components/Solidary/Form/SolidaryEdit';
import { useGlobalContext } from '../../../../hooks';

jest.mock('../../../../helpers', () => ({
   __esModule: true,
   formatMoney: jest.fn((amount) => `$${amount.toLocaleString('en-US')}`),
}));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
}));

let mockData = {
   idCatStatus: 1,
   idCatTypeProcedure: 2,
   idGroupRequest: 1,
   idRequest: 1,
   kindProcedure: 'Nuevo Tramite',
   requestAmount: 100000,
   relatedPersonResponseList: [
      {
         fullName: 'TEST USER NAME',
         idCatTypePerson: 1,
         idClient: '11111111',
         deleted: false,
         idRequest: 1,
         mail: null,
         maritalStatus: null,
         userCreate: 'test',
         personType: 'PM',
         rfc: 'RX0X0X0X0X0',
      },
   ],
   validate: {
      valid: true,
      procedure: 'Nuevo Tramite',
   },
};

let mockDataRequalification = {
   idCatStatus: 1,
   idCatTypeProcedure: 2,
   idGroupRequest: 1,
   idRequest: 1,
   kindProcedure: 'Recalificacion',
   requestAmount: 100000,
   relatedPersonResponseList: [
      {
         fullName: 'TEST USER NAME',
         idCatTypePerson: 1,
         idClient: '11111111111',
         deleted: false,
         idRequest: 1,
         mail: null,
         maritalStatus: null,
         userCreate: 'test',
         personType: 'PM',
         rfc: null,
      },
   ],
   activeCredit: true,
   oldAmount: 100000,
   validate: {
      valid: true,
      procedure: null,
   },
};

const mockUserEF = {
   path: 'EMG',
   status: [1, 7, 8, 9],
   idProfile: 3,
   userAD: 'UserEF',
};

describe('SolidaryEdit component', () => {
   const props = {
      request: mockData,
      onSet: jest.fn(),
      creditLimit: 16000000,
      isNotEditable: false,
   };
   let globalContextMock;

   beforeEach(() => {
      globalContextMock = {
         user: mockUserEF,
         actions: {
            toggleLoading: jest.fn(),
         },
      };

      useGlobalContext.mockReturnValue(globalContextMock);
   });

   const mockFnSet = jest.fn();

   afterEach(() => {
      jest.clearAllMocks();
   });

   test('It renders correctly with the initial state and controls, showing the options that correspond to the type of procedure identified', async () => {
      const {
         queries: { getByText, getByRole },
      } = await renderPage(SolidaryEdit, { ...props, fnSet: mockFnSet });

      const applicantName = getByRole('heading', { level: 3 });
      expect(applicantName).toBeInTheDocument();
      expect(applicantName).toHaveTextContent('TEST USER NAME');

      const comboKind = getByRole('combobox', { name: 'Tipo de trámite' });
      expect(comboKind).toBeInTheDocument();
      expect(comboKind).toBeEnabled();

      const optionNewProcedure = getByRole('option', { name: 'Nuevo trámite' });
      expect(optionNewProcedure).toBeInTheDocument();

      const inputAmount = getByRole('textbox', { name: 'Monto de línea solicitado' });
      expect(inputAmount).toBeInTheDocument();
      expect(inputAmount).toBeEnabled();

      const obligatedInitial = getByText('Obligado Solidario 01');
      expect(obligatedInitial).toBeInTheDocument();
      expect(obligatedInitial).toHaveTextContent('Obligado Solidario 01');

      const btnObligatedSearchType = getByRole('button', { name: 'arrow_downward' });
      expect(btnObligatedSearchType).toBeInTheDocument();
      expect(btnObligatedSearchType).toBeEnabled();

      const btnObligatedName = getByRole('button', { name: 'Nombre de persona' });
      expect(btnObligatedName).toBeInTheDocument();
      expect(btnObligatedName).toBeEnabled();

      const btnObligatedNumber = getByRole('button', { name: 'Número de persona' });
      expect(btnObligatedNumber).toBeInTheDocument();
      expect(btnObligatedNumber).toBeEnabled();

      const inputSearch = getByRole('searchbox');
      expect(inputSearch).toBeInTheDocument();
      expect(inputSearch).toBeEnabled();

      const btnAddObligated = getByRole('button', { name: 'Agregar obligado solidario +' });
      expect(btnAddObligated).toBeInTheDocument();
      expect(btnAddObligated).toBeDisabled();
   });

   test('It show the options that correspond to the type of procedure when the client has a previous LCD credit line', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(SolidaryEdit, { ...props, fnSet: mockFnSet, request: mockDataRequalification });

      const applicantName = getByRole('heading', { level: 3 });
      expect(applicantName).toBeInTheDocument();
      expect(applicantName).toHaveTextContent('TEST USER NAME');

      const comboKind = getByRole('combobox', { name: 'Tipo de trámite' });
      expect(comboKind).toBeInTheDocument();
      expect(comboKind).toBeEnabled();
      expect(comboKind).toHaveValue('Recalificacion');

      const optionRequalification = getByRole('option', { name: 'Recalificación' });
      expect(optionRequalification).toBeInTheDocument();

      const optionIncrease = getByRole('option', { name: 'Incremento' });
      expect(optionIncrease).toBeInTheDocument();

      const optionDecrement = getByRole('option', { name: 'Decremento' });
      expect(optionDecrement).toBeInTheDocument();

      const optionModification = getByRole('option', { name: 'Modificación' });
      expect(optionModification).toBeInTheDocument();

      const inputAmount = getByRole('textbox', { name: 'Monto de línea solicitado' });
      expect(inputAmount).toBeInTheDocument();
      expect(inputAmount).toBeDisabled();
      expect(inputAmount).toHaveValue('$100,000');
   });
});
