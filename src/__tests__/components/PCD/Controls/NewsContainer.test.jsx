import { useState } from 'react';
import { screen, within } from '@testing-library/react';

import { NewsContainer } from '../../../../components/PCD/Controls/NewsContainer';
import { renderComponent } from '../../../utils/render';

const news = {
   noNewsWereFound: false,
   positives: [{ description: 'Crece', url: 'https://a.mx' }],
   negatives: [{ description: 'Cae', url: 'https://b.mx' }, { description: 'Demanda', url: 'https://c.mx' }],
};

// El contenedor es controlado: entrega el objeto completo y el padre lo devuelve como item.
function Harness({ start, onSet, ...props }) {
   const [item, setItem] = useState(start);
   const handleSet = (next, attribute) => {
      onSet(next, attribute);
      setItem(next);
   };
   return <NewsContainer item={item} onSetData={handleSet} {...props} />;
}

function setup(start = news, props = {}) {
   const onSet = jest.fn();
   const utils = renderComponent(<Harness start={start} onSet={onSet} {...props} />);
   return { onSet, ...utils };
}

const positives = () => screen.getAllByTestId(/^description-positives-/);
const negatives = () => screen.getAllByTestId(/^description-negatives-/);
const noNews = () => screen.getByRole('checkbox', { name: 'No se encontraron noticias' });

describe('NewsContainer', () => {
   test('explains what to capture', () => {
      setup();

      expect(screen.getByText('Pregunta 6.')).toBeInTheDocument();
      expect(screen.getByText(/Resultado de Google It/)).toBeInTheDocument();
      expect(screen.getByText('Noticias Positivas')).toBeInTheDocument();
      expect(screen.getByText('Noticias Negativas')).toBeInTheDocument();
   });

   test('shows the positive and negative news', () => {
      setup();

      expect(positives().map((p) => p.value)).toEqual(['Crece']);
      expect(negatives().map((p) => p.value)).toEqual(['Cae', 'Demanda']);
   });

   test.each([[null], [{}]])('shows one empty entry per type when the news are %p', (item) => {
      setup(item);

      expect(positives()).toHaveLength(1);
      expect(negatives()).toHaveLength(1);
      expect(positives()[0]).toHaveValue('');
   });

   test('locks the fields when disabled', () => {
      setup(news, { disabled: true });

      expect(noNews()).toBeDisabled();
      positives().concat(negatives()).forEach((field) => expect(field).toBeDisabled());
   });

   describe('no news found', () => {
      test('hides the news and clears them when it is checked', async () => {
         const { onSet, user } = setup();

         await user.click(noNews());

         expect(onSet).toHaveBeenCalledWith({ noNewsWereFound: true, negatives: [], positives: [] }, 'news');
         expect(screen.queryByText('Noticias Positivas')).not.toBeInTheDocument();
         expect(screen.queryAllByTestId(/^description-/)).toHaveLength(0);
         expect(noNews()).toBeChecked();
      });

      test('shows the entries again when it is unchecked', async () => {
         const { user } = setup({ noNewsWereFound: true, positives: [], negatives: [] });

         await user.click(noNews());

         expect(screen.getByText('Noticias Positivas')).toBeInTheDocument();
         expect(positives()).toHaveLength(1);
         expect(negatives()).toHaveLength(1);
      });
   });

   describe('editing', () => {
      test('updates the description of the edited news only', async () => {
         const { onSet, user } = setup();

         await user.type(screen.getByTestId('description-negatives-1'), '!');

         expect(onSet).toHaveBeenLastCalledWith(
            { ...news, negatives: [news.negatives[0], { description: 'Demanda!', url: 'https://c.mx' }] },
            'news'
         );
      });

      test('updates the link of a news', async () => {
         const { onSet, user } = setup();

         await user.type(screen.getByTestId('url-positives-0'), '/x');

         expect(onSet.mock.calls.at(-1)[0].positives).toEqual([{ description: 'Crece', url: 'https://a.mx/x' }]);
      });

      test('creates the first news of an empty type', async () => {
         const { onSet, user } = setup({ positives: [], negatives: [] });

         await user.type(screen.getByTestId('description-positives-0'), 'A');

         expect(onSet).toHaveBeenCalledWith({ positives: [{ description: 'A' }], negatives: [] }, 'news');
      });

      test('appends a news typed in a new entry', async () => {
         const { onSet, user } = setup();
         await user.click(within(positives()[0].closest('.grid > div')).getByRole('button', { name: 'add_circle' }));

         await user.type(screen.getByTestId('description-positives-1'), 'N');

         expect(onSet.mock.calls.at(-1)[0].positives).toEqual([news.positives[0], { description: 'N' }]);
      });
   });

   describe('adding and removing', () => {
      test('adds an entry to the selected type only', async () => {
         const { user } = setup();

         await user.click(within(positives()[0].closest('.grid > div')).getByRole('button', { name: 'add_circle' }));

         expect(positives()).toHaveLength(2);
         expect(negatives()).toHaveLength(2);
      });

      test('removes a news and notifies the remaining ones', async () => {
         const { onSet, user } = setup();

         await user.click(within(negatives()[0].closest('.relative')).getByTestId('btn-deleted'));

         expect(onSet).toHaveBeenCalledWith({ ...news, negatives: [news.negatives[1]] }, 'news');
         expect(negatives().map((n) => n.value)).toEqual(['Demanda']);
      });

      test('keeps one empty entry when the only news is removed', async () => {
         const { onSet, user } = setup();

         await user.click(within(positives()[0].closest('.relative')).getByTestId('btn-deleted'));

         expect(onSet).toHaveBeenCalledWith({ ...news, positives: [] }, 'news');
         expect(positives()).toHaveLength(1);
         expect(positives()[0]).toHaveValue('');
      });

      test('drops an empty extra entry without notifying the parent', async () => {
         const { onSet, user } = setup();
         await user.click(within(positives()[0].closest('.grid > div')).getByRole('button', { name: 'add_circle' }));
         expect(positives()).toHaveLength(2);

         await user.click(within(positives()[1].closest('.relative')).getByTestId('btn-deleted'));

         expect(onSet).not.toHaveBeenCalled();
         expect(positives()).toHaveLength(1);
      });
   });
});
