import { screen, within } from '@testing-library/react';

import ItemRecomendation from '../../../../../pages/ADC/Recomendation/components/ItemRecomendation';
import { renderComponent } from '../../../../utils/render';

const buildItem = (idRequest, extra = {}) => ({
   idRequest,
   commentAc: '',
   recommendationAc: null,
   relatedPersonResponseList: [
      { idCatTypePerson: 1, idClient: 1, fullName: `Solicitante ${idRequest}` },
      { idCatTypePerson: 2, idClient: 10, fullName: `Obligado A${idRequest}` },
      { idCatTypePerson: 2, idClient: 20, fullName: `Obligado B${idRequest}` },
      { idCatTypePerson: 3, idClient: 30, fullName: `Representante ${idRequest}` },
   ],
   ...extra,
});

const renderItems = (data) => {
   const onSet = jest.fn();
   return { onSet, ...renderComponent(<ItemRecomendation data={data} onSet={onSet} />) };
};

describe('ItemRecomendation (ADC)', () => {
   describe('content', () => {
      test('shows the padded request number, the applicant and the solidary obligors', () => {
         renderItems([buildItem(5)]);

         expect(screen.getByRole('heading', { level: 3, name: /Solicitud\s+0000000005/ })).toBeInTheDocument();
         expect(screen.getByText('Solicitante 5')).toBeInTheDocument();
         expect(screen.getByText('Obligado A5')).toBeInTheDocument();
         expect(screen.getByText('Obligado B5')).toBeInTheDocument();
      });

      test('does not list legal representatives as applicants or obligors', () => {
         renderItems([buildItem(5)]);

         expect(screen.queryByText('Representante 5')).not.toBeInTheDocument();
      });

      test('shows an empty applicant when the request has none', () => {
         renderItems([buildItem(5, { relatedPersonResponseList: [] })]);

         expect(screen.getByRole('heading', { name: 'Solicitante' }).nextElementSibling).toHaveTextContent('');
         expect(screen.queryByText('Obligado A5')).not.toBeInTheDocument();
      });

      test('renders one card per request', () => {
         renderItems([buildItem(1), buildItem(2)]);

         expect(screen.getAllByRole('textbox')).toHaveLength(2);
         expect(screen.getByText('Solicitante 1')).toBeInTheDocument();
         expect(screen.getByText('Solicitante 2')).toBeInTheDocument();
      });

      test.each([
         ['an empty array', []],
         ['the default value', undefined],
      ])('renders an empty placeholder without comments or buttons for %s', (_label, data) => {
         const { container } = renderItems(data);

         expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
         expect(screen.queryByRole('button')).not.toBeInTheDocument();
         expect(container.querySelector('.box')).toBeInTheDocument();
      });
   });

   describe('comment', () => {
      test('shows the current comment and limits it to 500 characters', () => {
         renderItems([buildItem(5, { commentAc: 'Buen perfil' })]);
         const comment = screen.getByPlaceholderText('Ingresa aquí los comentarios');

         expect(comment).toHaveValue('Buen perfil');
         expect(comment).toHaveAttribute('maxLength', '500');
      });

      test('shows an empty comment when the request has none', () => {
         renderItems([buildItem(5, { commentAc: undefined })]);

         expect(screen.getByPlaceholderText('Ingresa aquí los comentarios')).toHaveValue('');
      });

      test('reports the new comment with the request id and the field name', async () => {
         const { onSet, user } = renderItems([buildItem(5, { commentAc: 'Buen perfil' })]);

         await user.type(screen.getByPlaceholderText('Ingresa aquí los comentarios'), '!');

         expect(onSet).toHaveBeenCalledWith('Buen perfil!', 5, 'commentAc');
      });
   });

   describe('recommendation', () => {
      test('reports a positive recommendation with the request id', async () => {
         const { onSet, user } = renderItems([buildItem(5)]);

         await user.click(screen.getByRole('button', { name: 'done Recomiendo' }));

         expect(onSet).toHaveBeenCalledWith(true, 5, 'recommendationAc');
      });

      test('reports a negative recommendation with the request id', async () => {
         const { onSet, user } = renderItems([buildItem(5)]);

         await user.click(screen.getByRole('button', { name: 'close No Recomiendo' }));

         expect(onSet).toHaveBeenCalledWith(false, 5, 'recommendationAc');
      });

      test('reports the recommendation of the card that was clicked', async () => {
         const { onSet, user } = renderItems([buildItem(1), buildItem(2)]);

         await user.click(screen.getAllByRole('button', { name: 'done Recomiendo' })[1]);

         expect(onSet).toHaveBeenCalledWith(true, 2, 'recommendationAc');
      });

      test('highlights only the positive button when the request is recommended', () => {
         renderItems([buildItem(5, { recommendationAc: true })]);

         expect(screen.getByRole('button', { name: 'done Recomiendo' })).toHaveClass('bg-black-900', 'text-white');
         expect(screen.getByRole('button', { name: 'close No Recomiendo' })).not.toHaveClass('bg-black-900');
      });

      test('highlights only the negative button when the request is not recommended', () => {
         renderItems([buildItem(5, { recommendationAc: false })]);

         expect(screen.getByRole('button', { name: 'close No Recomiendo' })).toHaveClass('bg-black-900', 'text-white');
         expect(screen.getByRole('button', { name: 'done Recomiendo' })).not.toHaveClass('bg-black-900');
      });

      test('highlights neither button while there is no decision', () => {
         renderItems([buildItem(5, { recommendationAc: null })]);
         const card = screen.getByRole('button', { name: 'done Recomiendo' }).parentElement;

         within(card)
            .getAllByRole('button')
            .forEach((button) => expect(button).not.toHaveClass('bg-black-900'));
      });
   });
});
