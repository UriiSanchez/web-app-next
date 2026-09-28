import { screen } from '@testing-library/react';

import { NewsItem } from '../../../../../components/PCD/Controls/News/NewsItem';
import { renderComponent } from '../../../../utils/render';

const items = [
   { description: 'Crece la empresa', url: 'https://noticias.mx/1' },
   { description: 'Nueva planta', url: 'https://noticias.mx/2' },
];

function setup(props = {}) {
   const handlers = { fnRemove: jest.fn(), fnAdd: jest.fn(), onSetData: jest.fn() };
   const utils = renderComponent(
      <NewsItem numItems={2} item={items} type='positives' {...handlers} {...props} />
   );
   return { ...handlers, ...utils };
}

const descriptions = () => screen.getAllByPlaceholderText('Copia aquí el link de la noticia');

describe('NewsItem', () => {
   test('shows a description and a link per news', () => {
      setup();

      expect(screen.getByTestId('description-positives-0')).toHaveValue('Crece la empresa');
      expect(screen.getByTestId('url-positives-0')).toHaveValue('https://noticias.mx/1');
      expect(screen.getByTestId('description-positives-1')).toHaveValue('Nueva planta');
      expect(screen.getByTestId('url-positives-1')).toHaveValue('https://noticias.mx/2');
   });

   test('renders as many entries as requested even when there is no data', () => {
      setup({ numItems: 3, item: undefined });

      expect(descriptions()).toHaveLength(3);
      descriptions().forEach((input) => expect(input).toHaveValue(''));
   });

   test('identifies the fields by the type of news', () => {
      setup({ type: 'negatives', numItems: 1, item: [] });

      expect(screen.getByTestId('description-negatives-0')).toBeInTheDocument();
      expect(screen.getByTestId('url-negatives-0')).toBeInTheDocument();
   });

   test('notifies the typed text with the index and the type', async () => {
      const { onSetData, user } = setup({ numItems: 1, item: [] });

      await user.type(screen.getByTestId('description-positives-0'), 'A');
      await user.type(screen.getByTestId('url-positives-0'), 'h');

      expect(onSetData).toHaveBeenCalledTimes(2);
      expect(onSetData.mock.calls[0][0].target.name).toBe('description-0');
      expect(onSetData.mock.calls[1][0].target.name).toBe('url-0');
      expect(onSetData.mock.calls[1].slice(1)).toEqual([0, 'positives']);
   });

   test('removes a news with its index and type', async () => {
      const { fnRemove, user } = setup();

      await user.click(screen.getAllByTestId('btn-deleted')[1]);

      expect(fnRemove).toHaveBeenCalledWith(expect.anything(), 1, 'positives');
   });

   test('hides the delete button of a single empty news', () => {
      setup({ numItems: 1, item: [] });

      expect(screen.queryByTestId('btn-deleted')).not.toBeInTheDocument();
   });

   test('shows the delete button of a single news with data', () => {
      setup({ numItems: 1, item: [items[0]] });

      expect(screen.getByTestId('btn-deleted')).toBeInTheDocument();
   });

   test('adds a news from the last entry only', async () => {
      const { fnAdd, user } = setup();

      expect(screen.getAllByRole('button', { name: 'add_circle' })).toHaveLength(1);
      await user.click(screen.getByRole('button', { name: 'add_circle' }));

      expect(fnAdd).toHaveBeenCalledWith(expect.anything(), 'positives');
   });

   test('blocks adding a news while the last one is empty', () => {
      setup({ numItems: 2, item: [items[0]] });

      expect(screen.getByRole('button', { name: 'add_circle' })).toBeDisabled();
   });

   test('stops adding news at the limit', () => {
      setup({ numItems: 2, limitItems: 2 });

      expect(screen.queryByRole('button', { name: 'add_circle' })).not.toBeInTheDocument();
   });

   test('locks the fields and the buttons when disabled', () => {
      setup({ isDisabled: true });

      expect(screen.getByTestId('description-positives-0')).toBeDisabled();
      expect(screen.getByTestId('url-positives-0')).toBeDisabled();
      expect(screen.queryByTestId('btn-deleted')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'add_circle' })).not.toBeInTheDocument();
   });

   test('marks the empty fields as mandatory once the section was saved', () => {
      setup({ numItems: 1, item: [{ description: 'Algo' }], isSave: true });

      expect(screen.getByTestId('description-positives-0')).not.toHaveClass('mandatory');
      expect(screen.getByTestId('url-positives-0')).toHaveClass('mandatory');
   });
});
