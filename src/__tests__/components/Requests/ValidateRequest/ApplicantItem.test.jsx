import { screen } from '@testing-library/react';

import { ApplicantItem } from '../../../../components/Requests/ValidateRequest/ApplicantItem';
import { renderComponent } from '../../../utils/render';

const obligated = [
   { idClient: 1, fullName: 'Carlos Vega' },
   { idClient: 2, fullName: 'Diana Solís' },
];

function setup(props = {}) {
   const onVirtual = jest.fn();
   const utils = renderComponent(
      <ApplicantItem
         idRequest={42}
         fullName='Empresa Alfa'
         listObligated={obligated}
         comment='Nota previa'
         onVirtual={onVirtual}
         {...props}
      />
   );
   return { onVirtual, ...utils };
}

describe('ApplicantItem', () => {
   test('shows the formatted request number and the applicant', () => {
      setup();

      expect(screen.getByRole('heading', { name: /Solicitud\s0000000042/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Solicitante' })).toBeInTheDocument();
      expect(screen.getByText('Empresa Alfa')).toBeInTheDocument();
   });

   test('lists the solidary obligors', () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Obligados solidarios' })).toBeInTheDocument();
      expect(screen.getByText('Carlos Vega')).toBeInTheDocument();
      expect(screen.getByText('Diana Solís')).toBeInTheDocument();
   });

   test('renders without obligors', () => {
      setup({ listObligated: undefined });

      expect(screen.getByRole('heading', { name: 'Obligados solidarios' })).toBeInTheDocument();
      expect(screen.queryByText('Carlos Vega')).not.toBeInTheDocument();
   });

   test('shows the stored comment', () => {
      setup();

      expect(screen.getByTestId('text-comment-42')).toHaveValue('Nota previa');
      expect(screen.getByTestId('text-comment-42')).toHaveAttribute('placeholder', 'Ingresa aquí los comentarios');
   });

   test('reports the request id and the new text when the comment changes', async () => {
      const { onVirtual, user } = setup({ comment: '' });

      await user.type(screen.getByTestId('text-comment-42'), 'Ok');

      expect(onVirtual).toHaveBeenNthCalledWith(1, 42, 'O');
      expect(onVirtual).toHaveBeenNthCalledWith(2, 42, 'k');
   });
});
