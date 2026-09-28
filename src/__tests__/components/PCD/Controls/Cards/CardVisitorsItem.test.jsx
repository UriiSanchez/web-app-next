import { CardVisitorsItem } from '../../../../../components/PCD';

import { formatId, getClassInput } from '../../../../../helpers';

jest.mock('../../../../../helpers', () => ({
   formatId: jest.fn((id, pad) => `ID_${id.toString().padStart(pad, '0')}`),
   getClassInput: jest.fn(),
}));

describe('Card Visitors component', () => {
   const mockData = {
      idx: 0,
      data: [],
      isDisabled: false,
      isSave: false,
   };
   const mockFnVirtual = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      getClassInput.mockReturnValue('');
   });

   test('renders correctly with default props ', async () => {
      const {
         queries: { getByRole, getByLabelText, getByTestId },
      } = await renderPage(CardVisitorsItem, { ...mockData, fnVirtual: mockFnVirtual });

      //Verificamos que el título se renderice correctamente
      expect(formatId).toHaveBeenCalledWith(1, 2);
      expect(getByRole('heading', { level: 3 })).toHaveTextContent('Visitante');

      expect(getByLabelText('Nombre')).toBeInTheDocument();
      expect(getByLabelText('Puesto')).toBeInTheDocument();

      expect(getByTestId('visitorName-0')).toBeInTheDocument();
      expect(getByTestId('visitorPosition-0')).toBeInTheDocument();
   });

   test('renders correctly with provided data', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(CardVisitorsItem, {
         ...mockData,
         data: [{ visitorName: 'visitor test', visitorPosition: 'SEO' }],
         fnVirtual: mockFnVirtual,
      });

      expect(getByTestId('visitorName-0')).toHaveValue('visitor test');
      expect(getByTestId('visitorPosition-0')).toHaveValue('SEO');
   });

   test('If the field is empty and a save has already been made, it must contain the "mandatory" class.', async () => {
      getClassInput.mockReturnValue('mandatory');
      const {
         queries: { getByTestId },
      } = await renderPage(CardVisitorsItem, {
         ...mockData,
         data: [{ visitorName: '', visitorPosition: '' }],
         fnVirtual: mockFnVirtual,
         isSave: true,
      });

      expect(getByTestId('visitorName-0')).toHaveClass('mandatory');
      expect(getByTestId('visitorPosition-0')).toHaveClass('mandatory');
   });

   test('If the field is filled it must contain the "input-form" class', async () => {
      getClassInput.mockReturnValue('');
      const {
         queries: { getByTestId },
      } = await renderPage(CardVisitorsItem, {
         ...mockData,
         data: [{ visitorName: 'visitor test', visitorPosition: 'SEO' }],
         fnVirtual: mockFnVirtual,
         isSave: true,
      });
      expect(getByTestId('visitorName-0')).toHaveClass('input-form');
      expect(getByTestId('visitorPosition-0')).toHaveClass('input-form');
   });

   test('If the field is locked it must contain the "disabled" class.', async () => {
      getClassInput.mockReturnValue('disabled');
      const {
         queries: { getByTestId },
      } = await renderPage(CardVisitorsItem, {
         ...mockData,
         data: [{ visitorName: 'visitor test', visitorPosition: 'SEO' }],
         fnVirtual: mockFnVirtual,
         isDisabled: true,
         isSave: true,
      });

      expect(getByTestId('visitorName-0')).toHaveClass('disabled');
      expect(getByTestId('visitorPosition-0')).toHaveClass('disabled');
   });
});
