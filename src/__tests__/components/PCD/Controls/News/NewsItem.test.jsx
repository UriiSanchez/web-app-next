import { NewsItem } from '../../../../../components/PCD/Controls/News/NewsItem';

import { getClassInput, getUUIDArray } from '../../../../../helpers';

jest.mock('../../../../../helpers', () => ({
   getUUIDArray: jest.fn(),
   getClassInput: jest.fn(),
}));

describe('News component', () => {
   const mockFnRemove = jest.fn();
   const mockFnAdd = jest.fn();
   const mockFnSet = jest.fn();
   const mockData = {
      numItems: 1,
      item: [],
      type: 'positives',
      fnRemove: mockFnRemove,
      fnAdd: mockFnAdd,
      fnSet: mockFnSet,
      limitItems: 5,
      isDisabled: false,
      isSave: false,
   };

   beforeEach(() => {
      jest.clearAllMocks();
      getClassInput.mockReturnValue('');
      getUUIDArray.mockReturnValue(['positives-1', 'positives-2', 'positives-3', 'positives-4', 'positives-5']);
   });

   test('renders correctly with default props ', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(NewsItem, { ...mockData });

      expect(getByTestId('description-positives-0')).toBeInTheDocument();
      expect(getByTestId('url-positives-0')).toBeInTheDocument();
   });

   test('renders correctly with provided data', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(NewsItem, {
         ...mockData,
         item: [{ description: 'descripcion de la noticia', url: 'url de la noticia' }],
      });

      expect(getByTestId('description-positives-0')).toHaveValue('descripcion de la noticia');
      expect(getByTestId('url-positives-0')).toHaveValue('url de la noticia');
   });

   test('If the field is empty and a save has already been made, it must contain the "mandatory" class.', async () => {
      getClassInput.mockReturnValue('mandatory');
      const {
         queries: { getByTestId },
      } = await renderPage(NewsItem, {
         ...mockData,
         item: [{ description: '', url: '' }],
         isSave: true,
      });

      expect(getByTestId('description-positives-0')).toHaveClass('mandatory');
      expect(getByTestId('url-positives-0')).toHaveClass('mandatory');
   });

   test('If the field is filled it must contain the "input-form" class', async () => {
      getClassInput.mockReturnValue('');
      const {
         queries: { getByTestId },
      } = await renderPage(NewsItem, {
         ...mockData,
         item: [{ description: 'descripcion de la noticia', url: 'url de la noticia' }],
         isSave: true,
      });
      expect(getByTestId('description-positives-0')).toHaveClass('input-form');
      expect(getByTestId('url-positives-0')).toHaveClass('input-form');
   });

   test('If the field is locked it must contain the "disabled" class.', async () => {
      getClassInput.mockReturnValue('disabled');
      const {
         queries: { getByTestId },
      } = await renderPage(NewsItem, {
         ...mockData,
         item: [{ description: 'descripcion de la noticia', url: 'url de la noticia' }],
         isDisabled: true,
         isSave: true,
      });

      expect(getByTestId('description-positives-0')).toHaveClass('disabled');
      expect(getByTestId('url-positives-0')).toHaveClass('disabled');
   });
});
