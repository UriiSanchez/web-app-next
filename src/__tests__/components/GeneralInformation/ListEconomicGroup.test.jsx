import { useState } from 'react';
import { screen } from '@testing-library/react';

import { ListEconomicGroup } from '../../../components/GeneralInformation/ListEconomicGroup';
import { renderComponent } from '../../utils/render';

const group = [
   { idClient: 1, fullName: 'Ana Pérez', email: 'ana@correo.com', isInProgress: false },
   { idClient: 2, fullName: 'Luis Gómez', email: 'luis@correo.com', isInProgress: true },
];

// Contenedor con estado real: el componente delega en el padre la lista de solicitantes.
function Harness({ initial = [] }) {
   const [applicants, setApplicants] = useState(initial);
   return (
      <>
         <ListEconomicGroup group={group} applicants={applicants} onSetData={setApplicants} />
         <output data-testid='applicants'>{JSON.stringify(applicants)}</output>
      </>
   );
}

const current = () => JSON.parse(screen.getByTestId('applicants').textContent);
const setup = (initial) => renderComponent(<Harness initial={initial} />);

describe('ListEconomicGroup', () => {
   test('lists every member with id, name, email and request status', () => {
      setup();

      expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
      expect(screen.getByText('ana@correo.com')).toBeInTheDocument();
      expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
      expect(screen.getByText('En proceso')).toBeInTheDocument();
      expect(screen.getByText('Sin solicitud')).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(2);
   });

   test('renders nothing when the group is empty', () => {
      renderComponent(<ListEconomicGroup group={[]} applicants={[]} onSetData={jest.fn()} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
   });

   test('checks the members that are already applicants', () => {
      setup([group[1]]);

      const [first, second] = screen.getAllByRole('checkbox');
      expect(first).not.toBeChecked();
      expect(second).toBeChecked();
   });

   test('adds a member to the applicants when checked and removes it when unchecked', async () => {
      const { user } = setup();
      const [first] = screen.getAllByRole('checkbox');

      await user.click(first);
      expect(current()).toEqual([group[0]]);
      expect(first).toBeChecked();

      await user.click(first);
      expect(current()).toEqual([]);
      expect(first).not.toBeChecked();
   });

   test('does not offer to edit the email of a member who is not an applicant', async () => {
      const { user } = setup();

      await user.click(screen.getByTestId('edit-alternative-1'));

      expect(screen.queryByPlaceholderText('Correo alternativo')).not.toBeInTheDocument();
      expect(current()).toEqual([]);
   });

   test('toggles the alternative email input for an applicant', async () => {
      const { user } = setup([group[0]]);

      await user.click(screen.getByTestId('edit-alternative-1'));
      expect(screen.getByPlaceholderText('Correo alternativo')).toBeInTheDocument();
      expect(screen.queryByText('ana@correo.com')).not.toBeInTheDocument();
      expect(screen.getByTestId('edit-alternative-1')).toHaveTextContent('Cancelar');

      await user.click(screen.getByTestId('edit-alternative-1'));
      expect(screen.queryByPlaceholderText('Correo alternativo')).not.toBeInTheDocument();
      expect(screen.getByText('ana@correo.com')).toBeInTheDocument();
   });

   test('stores the typed alternative email on the applicant', async () => {
      const { user } = setup([{ ...group[0], edit: true }]);

      await user.type(screen.getByTestId('input-alternative-1'), 'otra@correo.com');

      expect(screen.getByPlaceholderText('Correo alternativo')).toHaveValue('otra@correo.com');
      expect(current()[0].alternativeMail).toBe('otra@correo.com');
   });

   test('flags an invalid alternative email and accepts an empty or valid one', async () => {
      const { user } = setup([{ ...group[0], edit: true, alternativeMail: '' }]);
      const input = screen.getByTestId('input-alternative-1');
      // JSDOM no aplica estilos; la validez solo se expresa mediante clases de color.
      expect(input).not.toHaveClass('text-red-500');

      await user.type(input, 'no-es-correo');
      expect(input).toHaveClass('text-red-500');

      await user.clear(input);
      await user.type(input, 'ok@correo.com');
      expect(input).not.toHaveClass('text-red-500');
   });
});
