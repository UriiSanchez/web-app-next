import { screen, within } from '@testing-library/react';

import { ResultItem } from '../../../components/History/ResultItem';
import { renderComponent } from '../../utils/render';

// Los iconos de resultado no llevan texto alternativo: se distinguen por su origen.
const iconSources = () => screen.queryAllByRole('presentation').map((img) => img.getAttribute('src'));

describe('ResultItem', () => {
   describe('config all', () => {
      const item = { id: 'recommendation', display: 'Recomendación contraparte', config: 'all' };

      test('shows the analyst and leader recommendations', () => {
         renderComponent(<ResultItem item={item} source={{ idRequest: 1, recommendationAc: true, recommendationLc: false }} />);

         expect(screen.getByText('Recomendación contraparte')).toBeInTheDocument();
         expect(screen.getByText('Analista:')).toBeInTheDocument();
         expect(screen.getByText('Líder:')).toBeInTheDocument();
         const [analyst, leader] = iconSources();
         expect(analyst).toContain('ico_like');
         expect(leader).toContain('ico_dislike');
      });

      test('shows a dash for recommendations that were not given', () => {
         renderComponent(<ResultItem item={item} source={{ idRequest: 1, recommendationAc: null, recommendationLc: null }} />);

         expect(screen.getAllByText('-')).toHaveLength(2);
         expect(iconSources()).toHaveLength(0);
      });
   });

   describe('single result', () => {
      const item = { id: 'resultExecEm', display: 'Recomendación modelo' };

      test('shows the status icon for the source attribute', () => {
         renderComponent(<ResultItem item={item} source={{ idRequest: 1, resultExecEm: true }} />);

         expect(screen.getByText('Recomendación modelo')).toBeInTheDocument();
         expect(screen.getByText(/Estatus:/)).toBeInTheDocument();
         expect(iconSources()[0]).toContain('ico_like');
      });

      test('does not show comments when the item has none', () => {
         renderComponent(<ResultItem item={item} source={{ idRequest: 1, resultExecEm: false }} />);

         expect(iconSources()[0]).toContain('ico_dislike');
         expect(screen.queryByRole('button', { name: 'Comentarios' })).not.toBeInTheDocument();
      });

      test('shows the comments with the title adapted from the display', async () => {
         const withComments = {
            id: 'recommendationAc',
            display: 'Recomendación analista',
            comments: true,
            attrComment: 'commentAc',
         };
         const { user } = renderComponent(
            <ResultItem item={withComments} source={{ idRequest: 1, recommendationAc: true, commentAc: 'Perfil sólido' }} />
         );

         await user.click(screen.getByRole('button', { name: 'Comentarios' }));

         expect(screen.getByText('comentarios analista')).toBeInTheDocument();
         expect(screen.getByText('Perfil sólido')).toBeInTheDocument();
      });

      test('reports that there are no comments when the source has none', () => {
         const withComments = { id: 'recommendationLc', display: 'Recomendación líder', comments: true, attrComment: 'commentLc' };
         renderComponent(<ResultItem item={withComments} source={{ idRequest: 1, recommendationLc: true }} />);

         const button = screen.getByRole('button', { name: 'Comentarios' });
         expect(within(button.parentElement).getByText('No hay comentarios')).toBeInTheDocument();
      });
   });
});
