import { screen } from '@testing-library/react';

import { PersonOptionItem } from '../../../../components/PropertyVerification/ModalVerification/PersonOptionItem';
import { renderComponent } from '../../../utils/render';

const APPLICANT_TYPE = 1;
const OBLIGATED_TYPE = 2;

function setup({ data, countOtherOwners = 1 }) {
   const handlers = { onDeleteCoOwner: jest.fn(), onChangeState: jest.fn() };
   const utils = renderComponent(<PersonOptionItem data={data} countOtherOwners={countOtherOwners} {...handlers} />);
   return { ...handlers, ...utils };
}

const ownerInput = (n) => ownerInputs().find((input) => input.id === `otherName${n}`);
const ownerInputs = () => screen.queryAllByPlaceholderText('Nombre del propietario');
const addButton = () => screen.getByRole('button', { name: 'add_circle' });

describe('PersonOptionItem', () => {
   describe('when the owner is the applicant', () => {
      test('shows only the name of the owner', () => {
         setup({ data: { ownerType: 'APPLICANT', ownerName: 'Empresa Alfa' } });

         expect(screen.getByTitle('Empresa Alfa')).toHaveTextContent('Empresa Alfa');
         expect(ownerInputs()).toHaveLength(0);
         expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      test('shows an empty box when the owner has no name', () => {
         setup({ data: { ownerType: 'APPLICANT' } });

         expect(screen.getByTitle('')).toHaveTextContent('');
      });
   });

   describe('when the owner is the applicant and the obligors', () => {
      const data = {
         ownerType: 'CO_OBLIGED',
         ownerName: 'Empresa Alfa',
         catTypePerson: APPLICANT_TYPE,
         otherName1: 'Carlos Vega',
         otherName2: '',
         otherName3: 'Laura Mena',
      };

      test('lists the owner name and the filled co-owners', () => {
         setup({ data });

         expect(screen.getByTitle('Empresa Alfa')).toBeInTheDocument();
         expect(screen.getByTitle('Carlos Vega')).toBeInTheDocument();
         expect(screen.getByTitle('Laura Mena')).toBeInTheDocument();
         expect(screen.getAllByRole('button')).toHaveLength(2);
      });

      test('does not let an applicant remove the owner name', () => {
         setup({ data });

         expect(screen.queryByTestId('deleted-owner')).not.toBeInTheDocument();
      });

      test('lets an obligor remove the owner name', async () => {
         const { onDeleteCoOwner, user } = setup({ data: { ...data, catTypePerson: OBLIGATED_TYPE } });

         await user.click(screen.getByTestId('deleted-owner'));

         expect(onDeleteCoOwner).toHaveBeenCalledWith('ownerName');
      });

      test('removes the selected co-owner', async () => {
         const { onDeleteCoOwner, user } = setup({ data });

         await user.click(screen.getByTestId('deleted-otherName3'));

         expect(onDeleteCoOwner).toHaveBeenCalledWith('otherName3');
      });

      test('does not show the owner name when it is empty', () => {
         setup({ data: { ...data, ownerName: '' } });

         expect(screen.queryByTitle('Empresa Alfa')).not.toBeInTheDocument();
         expect(screen.getByTitle('Carlos Vega')).toBeInTheDocument();
      });
   });

   describe('when the owner is the applicant and others', () => {
      const data = { ownerType: 'CO_OTHERS', ownerName: 'Empresa Alfa', otherName1: 'Ana Ruiz', otherName2: 'Luis Paz' };

      test('shows the owner name and one input per counted co-owner', () => {
         setup({ data, countOtherOwners: 2 });

         expect(screen.getByTitle('Empresa Alfa')).toBeInTheDocument();
         expect(ownerInputs()).toHaveLength(2);
         expect(ownerInput(1)).toHaveValue('Ana Ruiz');
         expect(ownerInput(2)).toHaveValue('Luis Paz');
      });

      test('shows the add button only in the last input and deletes only from the second one', () => {
         setup({ data, countOtherOwners: 2 });

         expect(screen.getAllByRole('button', { name: 'add_circle' })).toHaveLength(1);
         expect(screen.getAllByTestId(/^deleted-/)).toHaveLength(1);
         expect(screen.getByTestId('deleted-otherName2')).toBeInTheDocument();
      });

      test('adds a new input when the last owner has a name', async () => {
         const { user } = setup({ data: { ...data, otherName2: '' }, countOtherOwners: 1 });

         await user.click(addButton());

         expect(ownerInputs()).toHaveLength(2);
         expect(ownerInput(2)).toHaveValue('');
      });

      test('blocks adding an input while the last owner is empty', () => {
         setup({ data: { ...data, otherName1: '' }, countOtherOwners: 1 });

         expect(addButton()).toBeDisabled();
      });

      test('clears the removed co-owner and drops its input', async () => {
         const { onDeleteCoOwner, user } = setup({ data, countOtherOwners: 2 });

         await user.click(screen.getByTestId('deleted-otherName2'));

         expect(onDeleteCoOwner).toHaveBeenCalledWith('otherName2');
         expect(ownerInputs()).toHaveLength(1);
      });

      test('notifies the changes of the typed name', async () => {
         const { onChangeState, user } = setup({ data: { ...data, otherName1: '' } });

         await user.type(ownerInput(1), 'A');

         expect(onChangeState).toHaveBeenCalledTimes(1);
      });

      test('offers the "more owners" check when the four inputs are shown', async () => {
         const { onChangeState, user } = setup({ data: { ...data, check: true }, countOtherOwners: 4 });

         expect(ownerInputs()).toHaveLength(4);
         expect(screen.queryByRole('button', { name: 'add_circle' })).not.toBeInTheDocument();
         const check = screen.getByRole('checkbox', { name: 'más de los mencionados' });
         expect(check).toBeChecked();

         await user.click(check);

         expect(onChangeState).toHaveBeenCalledTimes(1);
      });

      test('does not offer the "more owners" check before the fourth input', () => {
         setup({ data, countOtherOwners: 3 });

         expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      });

      test('follows the count of co-owners when it changes', () => {
         const { rerender, onDeleteCoOwner, onChangeState } = setup({ data, countOtherOwners: 1 });
         expect(ownerInputs()).toHaveLength(1);

         rerender(
            <PersonOptionItem
               data={data}
               countOtherOwners={3}
               onDeleteCoOwner={onDeleteCoOwner}
               onChangeState={onChangeState}
            />
         );

         expect(ownerInputs()).toHaveLength(3);
      });
   });

   describe('when the owner is someone else', () => {
      const data = { ownerType: 'OTHERS', otherName1: 'Ana Ruiz' };

      test('shows one input per counted owner with the values of the data', () => {
         setup({ data: { ...data, otherName2: 'Luis Paz' }, countOtherOwners: 2 });

         expect(ownerInputs()).toHaveLength(2);
         expect(ownerInput(1)).toHaveValue('Ana Ruiz');
         expect(ownerInput(2)).toHaveValue('Luis Paz');
      });

      test('adds inputs up to five and then offers the "more owners" check', async () => {
         const full = { ...data, otherName2: 'B', otherName3: 'C', otherName4: 'D', otherName5: '' };
         const { user } = setup({ data: full, countOtherOwners: 4 });
         expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

         await user.click(addButton());

         expect(ownerInputs()).toHaveLength(5);
         expect(screen.getByRole('checkbox', { name: 'más de los mencionados' })).not.toBeChecked();
         expect(screen.queryByRole('button', { name: 'add_circle' })).not.toBeInTheDocument();
      });

      test('notifies the check of more owners', async () => {
         const { onChangeState, user } = setup({ data, countOtherOwners: 5 });

         await user.click(screen.getByRole('checkbox', { name: 'más de los mencionados' }));

         expect(onChangeState).toHaveBeenCalledTimes(1);
      });

      test('removes the last owner and never goes below one input', async () => {
         const { onDeleteCoOwner, user } = setup({ data: { ...data, otherName2: 'Luis Paz' }, countOtherOwners: 2 });

         await user.click(screen.getByTestId('deleted-otherName2'));

         expect(onDeleteCoOwner).toHaveBeenCalledWith('otherName2');
         expect(ownerInputs()).toHaveLength(1);
         expect(screen.queryByTestId(/^deleted-/)).not.toBeInTheDocument();
      });
   });

   test('falls back to the generic owners list when the type is not set', () => {
      setup({ data: {}, countOtherOwners: 1 });

      expect(ownerInputs()).toHaveLength(1);
      expect(ownerInput(1)).toHaveValue('');
   });
});
