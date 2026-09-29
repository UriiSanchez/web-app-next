import { screen } from '@testing-library/react';

import ItemRecomendation from '../../../../../pages/LDC/Recomendation/components/ItemRecomendation';
import { renderComponent } from '../../../../utils/render';

const buildItem = (idRequest, extra = {}) => ({
   idRequest,
   commentAc: 'Comentario del analista',
   recommendationAc: true,
   commentLc: '',
   recommendationLc: null,
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

const yesButtons = () => screen.getAllByRole('button', { name: 'done Recomiendo' });
const noButtons = () => screen.getAllByRole('button', { name: 'close No Recomiendo' });

describe('ItemRecomendation (LDC)', () => {
   describe('content', () => {
      test('shows the request, the applicant, the solidary obligors and the counterpart analyst comment', () => {
         renderItems([buildItem(5)]);

         expect(screen.getByRole('heading', { level: 3, name: /Solicitud\s+0000000005/ })).toBeInTheDocument();
         expect(screen.getByText('Solicitante 5')).toBeInTheDocument();
         expect(screen.getByText('Obligado A5')).toBeInTheDocument();
         expect(screen.getByText('Obligado B5')).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: 'Analista de Contraparte' })).toBeInTheDocument();
         expect(screen.getByText('Comentario del analista')).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: 'Líder de Contraparte' })).toBeInTheDocument();
      });

      test('does not list legal representatives as applicants or obligors', () => {
         renderItems([buildItem(5)]);

         expect(screen.queryByText('Representante 5')).not.toBeInTheDocument();
      });

      test('renders one row per request', () => {
         renderItems([buildItem(1), buildItem(2)]);

         expect(screen.getAllByRole('textbox')).toHaveLength(2);
         expect(screen.getByText('Solicitante 1')).toBeInTheDocument();
         expect(screen.getByText('Solicitante 2')).toBeInTheDocument();
      });

      test.each([
         ['an empty array', []],
         ['the default value', undefined],
      ])('renders the skeleton instead of the requests for %s', (_label, data) => {
         const { container } = renderItems(data);

         expect(container.firstChild).toHaveClass('fadeIn');
         expect(screen.queryByRole('heading')).not.toBeInTheDocument();
         expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
   });

   describe('analyst recommendation (read only)', () => {
      // Comportamiento actual: `disabled` recibe el valor de la recomendación, de modo que el botón
      // «Recomiendo» queda deshabilitado cuando el analista SÍ recomienda. Se documenta, no se corrige.
      test('disables the "Recomiendo" button when the analyst recommends', () => {
         renderItems([buildItem(5, { recommendationAc: true })]);

         expect(yesButtons()[0]).toBeDisabled();
         expect(noButtons()[0]).toBeEnabled();
      });

      test('disables the "No Recomiendo" button when the analyst does not recommend', () => {
         renderItems([buildItem(5, { recommendationAc: false })]);

         expect(yesButtons()[0]).toBeEnabled();
         expect(noButtons()[0]).toBeDisabled();
      });

      test('never reports changes from the analyst buttons', async () => {
         const { onSet, user } = renderItems([buildItem(5, { recommendationAc: false })]);

         // Con recommendationAc=false el botón «Recomiendo» del analista está habilitado, pero es solo visual.
         await user.click(yesButtons()[0]);

         expect(onSet).not.toHaveBeenCalled();
      });
   });

   describe('leader comment', () => {
      test('shows the current comment, limits it to 2000 characters and counts them', () => {
         renderItems([buildItem(5, { commentLc: 'Aprobado' })]);
         const comment = screen.getByPlaceholderText('Ingresa aquí los comentarios');

         expect(comment).toHaveValue('Aprobado');
         expect(comment).toHaveAttribute('maxLength', '2000');
         expect(screen.getByText('8/2000')).toBeInTheDocument();
      });

      test('shows an empty comment and a zero counter when the request has none', () => {
         renderItems([buildItem(5, { commentLc: undefined })]);

         expect(screen.getByPlaceholderText('Ingresa aquí los comentarios')).toHaveValue('');
         expect(screen.getByText('0/2000')).toBeInTheDocument();
      });

      test('reports the new comment with the request id and the field name', async () => {
         const { onSet, user } = renderItems([buildItem(5, { commentLc: 'Aprobado' })]);

         await user.type(screen.getByPlaceholderText('Ingresa aquí los comentarios'), '!');

         expect(onSet).toHaveBeenCalledWith('Aprobado!', 5, 'commentLc');
      });
   });

   describe('leader recommendation', () => {
      test('reports a positive recommendation with the request id', async () => {
         const { onSet, user } = renderItems([buildItem(5)]);

         await user.click(yesButtons()[1]);

         expect(onSet).toHaveBeenCalledWith(true, 5, 'recommendationLc');
      });

      test('reports a negative recommendation with the request id', async () => {
         const { onSet, user } = renderItems([buildItem(5)]);

         await user.click(noButtons()[1]);

         expect(onSet).toHaveBeenCalledWith(false, 5, 'recommendationLc');
      });

      test('reports the recommendation of the row that was clicked', async () => {
         const { onSet, user } = renderItems([buildItem(1), buildItem(2)]);

         await user.click(yesButtons()[3]);

         expect(onSet).toHaveBeenCalledWith(true, 2, 'recommendationLc');
      });

      test('highlights the positive button and leaves the negative one with hover style when recommended', () => {
         renderItems([buildItem(5, { recommendationLc: true })]);

         expect(yesButtons()[1]).toHaveClass('bg-black', 'text-white');
         expect(yesButtons()[1]).not.toHaveClass('hover:bg-black-900');
         expect(noButtons()[1]).not.toHaveClass('bg-black');
         expect(noButtons()[1]).toHaveClass('hover:bg-black-900');
      });

      test('highlights the negative button when not recommended', () => {
         renderItems([buildItem(5, { recommendationLc: false })]);

         expect(noButtons()[1]).toHaveClass('bg-black', 'text-white');
         expect(yesButtons()[1]).not.toHaveClass('bg-black');
         expect(yesButtons()[1]).toHaveClass('hover:bg-black-900');
      });

      // Comportamiento actual: sin decisión (null) el botón «No Recomiendo» se ve seleccionado.
      // Se documenta como hallazgo; no se corrige en esta spec.
      test('highlights the negative button while there is no decision (current behavior)', () => {
         renderItems([buildItem(5, { recommendationLc: null })]);

         expect(noButtons()[1]).toHaveClass('bg-black', 'text-white');
         expect(yesButtons()[1]).not.toHaveClass('bg-black');
      });
   });
});
