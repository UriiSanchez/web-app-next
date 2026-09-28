import { screen } from '@testing-library/react';

import { ParticipantsTable } from '../../../components/CheckList/ParticipantsTable';
import { renderComponent } from '../../utils/render';
import { createContextWrapper } from '../../utils/context';

const applycants = [
   {
      idRequest: 10,
      relatedPersonResponseList: [
         { idClient: 111, idCatTypePerson: 1, fullName: 'Ana Pérez' },
         { idClient: 222, idCatTypePerson: 2, fullName: 'Luis Gómez' },
      ],
   },
   {
      idRequest: 20,
      relatedPersonResponseList: [{ idClient: 333, idCatTypePerson: 1, fullName: 'Marta Ruiz' }],
   },
];

function setup({ profile = 4, props = {} } = {}) {
   const onSelect = jest.fn();
   const wrapper = createContextWrapper({ user: { idProfile: profile } });
   const utils = renderComponent(<ParticipantsTable applycants={applycants} onSelect={onSelect} {...props} />, {
      wrapper,
   });
   return { onSelect, ...utils };
}

describe('ParticipantsTable', () => {
   test('lists applicants and solidary obligors with their role prefix', () => {
      setup();

      expect(screen.getByText('Solicitante(s) & Obligado(s) Solidario(S)')).toBeInTheDocument();
      expect(screen.getByLabelText('Solicitante: Ana Pérez')).toBeInTheDocument();
      expect(screen.getByLabelText('Obligado Solidario: Luis Gómez')).toBeInTheDocument();
      expect(screen.getByLabelText('Solicitante: Marta Ruiz')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
   });

   test('reports the client and request of the selected participant', async () => {
      const { onSelect, user } = setup();

      await user.click(screen.getByLabelText('Obligado Solidario: Luis Gómez'));
      expect(onSelect).toHaveBeenLastCalledWith(222, 10);

      await user.click(screen.getByLabelText('Solicitante: Marta Ruiz'));
      expect(onSelect).toHaveBeenLastCalledWith(333, 20);
   });

   test('renders no participants when the list is empty or missing', () => {
      const { rerender } = setup({ props: { applycants: [] } });
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();

      rerender(<ParticipantsTable onSelect={jest.fn()} />);
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
   });

   test('shows the CIEC request column only for the EMG profile', () => {
      const { unmount } = setup({ profile: 3 });
      expect(screen.getAllByText('Solicitar CIEC')).toHaveLength(2);
      unmount();

      setup({ profile: 4 });
      expect(screen.queryByText('Solicitar CIEC')).not.toBeInTheDocument();
   });

   test('keeps the CIEC request button disabled', () => {
      setup({ profile: 3 });

      screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
   });
});
