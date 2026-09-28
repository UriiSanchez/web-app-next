import { useState } from 'react';
import { screen } from '@testing-library/react';

import { ApplicantContainer } from '../../../../components/Requests/ValidateRequest/ApplicantContainer';
import { renderComponent } from '../../../utils/render';

const data = [
   {
      idRequest: 1,
      relatedPersonResponseList: [
         { idCatTypePerson: 1, idClient: 10, fullName: 'Empresa Alfa' },
         { idCatTypePerson: 2, idClient: 11, fullName: 'Carlos Vega' },
         { idCatTypePerson: 3, idClient: 12, fullName: 'Representante Legal' },
      ],
   },
   {
      idRequest: 2,
      relatedPersonResponseList: [{ idCatTypePerson: 2, idClient: 21, fullName: 'Solo Obligado' }],
   },
];

const buildComments = () => [
   { idRequest: 1, comment: 'Nota uno' },
   { idRequest: 2, comment: '' },
];

// El componente es controlado: notifica la lista completa y el padre la devuelve como comments.
function Harness({ onSet, start }) {
   const [comments, setComments] = useState(start);
   const handleSet = (next) => {
      onSet(next);
      setComments([...next]);
   };
   return <ApplicantContainer data={data} comments={comments} onSet={handleSet} />;
}

describe('ApplicantContainer', () => {
   test.each([[[]], [undefined]])('shows the skeleton when data is %p', (value) => {
      renderComponent(<ApplicantContainer data={value} comments={[]} onSet={jest.fn()} />);

      expect(screen.getByTestId('applicant-skeleton-container')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
   });

   test('renders one card per request with the applicant and its solidary obligors only', () => {
      renderComponent(<ApplicantContainer data={data} comments={buildComments()} onSet={jest.fn()} />);

      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent.replace(/\s/g, ' '))).toEqual([
         'Solicitud 0000000001',
         'Solicitud 0000000002',
      ]);
      expect(screen.getByText('Empresa Alfa')).toBeInTheDocument();
      expect(screen.getByText('Carlos Vega')).toBeInTheDocument();
      expect(screen.getByText('Solo Obligado')).toBeInTheDocument();
      expect(screen.queryByText('Representante Legal')).not.toBeInTheDocument();
   });

   test('shows a dash when a request has no applicant', () => {
      renderComponent(<ApplicantContainer data={data} comments={buildComments()} onSet={jest.fn()} />);

      expect(screen.getByText('-')).toBeInTheDocument();
   });

   test('shows the comment of each request', () => {
      renderComponent(<ApplicantContainer data={data} comments={buildComments()} onSet={jest.fn()} />);

      expect(screen.getByTestId('text-comment-1')).toHaveValue('Nota uno');
      expect(screen.getByTestId('text-comment-2')).toHaveValue('');
   });

   test('updates only the comment of the edited request', async () => {
      const onSet = jest.fn();
      const { user } = renderComponent(<Harness onSet={onSet} start={buildComments()} />);

      await user.type(screen.getByTestId('text-comment-2'), 'Falta aval');

      expect(onSet).toHaveBeenLastCalledWith([
         { idRequest: 1, comment: 'Nota uno' },
         { idRequest: 2, comment: 'Falta aval' },
      ]);
      expect(screen.getByTestId('text-comment-2')).toHaveValue('Falta aval');
      expect(screen.getByTestId('text-comment-1')).toHaveValue('Nota uno');
   });
});
