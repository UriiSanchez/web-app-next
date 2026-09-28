import { RequestsIsiloans } from '../../../components';

import { formatMoney } from '../../../helpers';

jest.mock('next/image', () => ({
   __esModule: true,
   default: ({ src, alt }) => <img src={src} alt={alt} data-testid='next-image' />,
}));

jest.mock('../../../helpers', () => ({
   __esModule: true,
   formatMoney: jest.fn((amount) => `$${amount.toLocaleString('en-US')}`),
}));

const mockRequestsEmpty = [];
const mockRequestsWithData = [
   {
      idClient: '1',
      nameClient: 'Client 1',
      lineNumber: '110201',
      typeActiveProduct: 'LDC',
      authorizedAmount: '3000000.0',
      startDate: '14/06/2024',
      endDate: '14/06/2025',
      currency: 'USD',
      typeCredit: 'ISILOANS',
   },
   {
      idClient: '2',
      nameClient: 'Client 2',
      lineNumber: '68306',
      typeActiveProduct: 'CC',
      authorizedAmount: '4000000.0',
      startDate: '20/04/2021',
      endDate: '20/04/2022',
      currency: 'MXP',
      typeCredit: 'EASYCREDIT',
   },
];

describe('Requests Isiloans component', () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   test('should display "Sin productos activos" message when requests are empty', async () => {
      const {
         queries: { getByText },
      } = await renderPage(RequestsIsiloans, { requests: mockRequestsEmpty });
      expect(getByText('Sin productos activos')).toBeInTheDocument();
   });

   test('should display requests data in a table', async () => {
      const {
         queries: { getByRole },
      } = await renderPage(RequestsIsiloans, { requests: mockRequestsWithData });

      // Verificar la primera fila de datos '110201'
      expect(getByRole('cell', { name: '110201' })).toBeInTheDocument();
      expect(getByRole('cell', { name: 'CC' })).toBeInTheDocument();
      expect(getByRole('cell', { name: '14/06/2024' })).toBeInTheDocument();
      expect(getByRole('cell', { name: '14/06/2025' })).toBeInTheDocument();
      expect(getByRole('cell', { name: '$3000000.0' })).toBeInTheDocument();

      // Verificar la segunda fila de datos '110201'
      expect(getByRole('cell', { name: '68306' })).toBeInTheDocument();
      expect(getByRole('cell', { name: 'LDC' })).toBeInTheDocument();
      expect(getByRole('cell', { name: '20/04/2021' })).toBeInTheDocument();
      expect(getByRole('cell', { name: '20/04/2022' })).toBeInTheDocument();
      expect(getByRole('cell', { name: '$4000000.0' })).toBeInTheDocument();

      // Verificamos que formatMoney fue llamado con los montos correctos
      expect(formatMoney).toHaveBeenCalledWith('3000000.0');
      expect(formatMoney).toHaveBeenCalledWith('4000000.0');
   });
});
