import { fireEvent } from '@testing-library/react';

import { ApplicantContainer } from '../../../../components/Requests';

jest.mock('lodash', () => ({
   ...jest.requireActual('lodash'),
   isEmpty: jest.fn((value) => {
      if (Array.isArray(value)) {
         return value.length === 0;
      }

      if (typeof value === 'object' && value !== null) {
         return Object.keys(value).length == 0;
      }

      return !value;
   }),
}));

describe('ApplicantContainer', () => {
   const mockOnSet = jest.fn();
   const mockData = [
      {
         idRequest: 1,
         relatedPersonResponseList: [
            { idClient: 1, idCatTypePerson: 1, fullName: 'Solicitante Uno' },
            { idClient: 2, idCatTypePerson: 2, fullName: 'Obligado Uno A' },
            { idClient: 3, idCatTypePerson: 2, fullName: 'Obligado Uno B' },
         ],
      },
      {
         idRequest: 2,
         relatedPersonResponseList: [
            { idClient: 4, idCatTypePerson: 1, fullName: 'Solicitante Dos' },
            { idClient: 5, idCatTypePerson: 2, fullName: 'Obligado Dos C' },
         ],
      },
      {
         idRequest: 3,
         relatedPersonResponseList: [{ idClient: 6, idCatTypePerson: 1, fullName: 'Solicitante Tres' }],
      },
   ];

   const mockComments = [
      { idRequest: 1, comment: 'Comentario uno' },
      { idRequest: 2, comment: 'Comentario dos' },
   ];

   beforeEach(() => {
      jest.clearAllMocks();
   });

   test('it should render loading/empty state when data is empty', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ApplicantContainer, {
         data: [],
         comments: [],
         onSet: mockOnSet,
      });

      expect(getByTestId('applicant-skeleton-container')).toBeInTheDocument();
   });

   test('it should must render multiple Applicants with the correct data', async () => {
      const {
         queries: { getByText },
      } = await renderPage(ApplicantContainer, { data: mockData, comments: mockComments, onSet: mockOnSet });

      expect(getByText('Solicitante Uno')).toBeInTheDocument();
      expect(getByText('Obligado Uno A')).toBeInTheDocument();
      expect(getByText('Obligado Uno B')).toBeInTheDocument();
      expect(getByText('Solicitante Dos')).toBeInTheDocument();
      expect(getByText('Obligado Dos C')).toBeInTheDocument();
      expect(getByText('Solicitante Tres')).toBeInTheDocument();
   });

   test('it should must update the comments and call onSet when the comment is changed', async () => {
      const {
         queries: { getByTestId },
         waitFor,
      } = await renderPage(ApplicantContainer, { data: mockData, comments: mockComments, onSet: mockOnSet });
      const newComment = 'Nuevo comentario para solicitante 1';
      const textarea = getByTestId('text-comment-1');

      fireEvent.change(textarea, { target: { value: newComment } });

      await waitFor(() => {
         expect(mockOnSet).toHaveBeenCalledTimes(1);
         expect(mockOnSet).toHaveBeenCalledWith([
            { idRequest: 1, comment: newComment },
            { idRequest: 2, comment: 'Comentario dos' },
         ]);
      });

      const secondComment = 'Nuevo comentario para solicitante 2';
      const textareatwo = getByTestId('text-comment-2');

      fireEvent.change(textareatwo, { target: { value: secondComment } });

      await waitFor(() => {
         expect(mockOnSet).toHaveBeenCalledTimes(2);
         expect(mockOnSet).toHaveBeenCalledWith([
            { idRequest: 1, comment: newComment },
            { idRequest: 2, comment: secondComment },
         ]);
      });
   });
});
