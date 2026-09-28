import { useState } from 'react';
import { screen } from '@testing-library/react';

import ObligatedsView from '../../../components/PropertyVerification/ObligatedsView';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const ADC = 1;

const buildObligated = (idClient, fullName, formFoil) => ({
   idClient,
   fullName,
   idCatTypePerson: 2,
   properties: [
      {
         idRelOwnership: idClient * 10,
         numberOwnership: 1,
         formFoil,
         customerValue: 1000000,
         landUnit: 'squareMeter',
         propertyType: 'building',
         location: `Domicilio de ${fullName}`,
      },
   ],
   resumeInd: { totalCustomerValue: 1000000, resume: {} },
});

const carlos = buildObligated(10, 'Carlos Vega', '1111');
const laura = buildObligated(11, 'Laura Mena', '2222');
const wrapper = createContextWrapper({ user: { idProfile: ADC }, actions: createActions() });

// El componente es controlado: recibe la lista de obligados y el padre la devuelve por props.
function Harness({ start, onUpdate, isNotEditable }) {
   const [list, setList] = useState(start);
   const handleUpdate = (key, next) => {
      onUpdate(key, next);
      setList(next);
   };
   return <ObligatedsView info={list} onUpdateData={handleUpdate} isNotEditable={isNotEditable} />;
}

describe('ObligatedsView', () => {
   beforeEach(() => {
      jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(500);
   });

   test.each([[[]], [undefined], [null]])('tells there are no obligors when the list is %p', (list) => {
      renderComponent(<ObligatedsView info={list} onUpdateData={jest.fn()} />, { wrapper });

      expect(
         screen.getByRole('heading', { name: 'Esta solicitud no tiene obligados solidarios que mostrar' })
      ).toBeInTheDocument();
      expect(screen.queryByText('Resumen individual')).not.toBeInTheDocument();
   });

   describe('with one obligor', () => {
      test('shows the name of the obligor instead of a selector', () => {
         renderComponent(<ObligatedsView info={[carlos]} onUpdateData={jest.fn()} />, { wrapper });

         expect(screen.getByTestId('Obligated-10')).toHaveTextContent('Carlos Vega');
         expect(screen.queryByTestId('obligateds-select')).not.toBeInTheDocument();
      });

      test('shows the editable properties and the individual summary', () => {
         renderComponent(<ObligatedsView info={[carlos]} onUpdateData={jest.fn()} />, { wrapper });

         expect(screen.getByLabelText('Folio del formulario')).toHaveValue('1111');
         expect(screen.getByText('Resumen individual')).toBeInTheDocument();
         expect(screen.getByText(/Valor s\/cliente:/)).toHaveTextContent('$1,000,000.00');
      });

      test('limits the width of the editable properties to the space left by the selector', () => {
         renderComponent(<ObligatedsView info={[carlos]} onUpdateData={jest.fn()} />, { wrapper });

         // Ambos contenedores miden lo mismo en JSDOM, por lo que no queda espacio para las propiedades.
         expect(screen.getByLabelText('Folio del formulario').closest('.overflow-x-auto')).toHaveStyle({
            width: '0px',
         });
      });
   });

   describe('with several obligors', () => {
      test('lists every obligor in a selector starting with the first', () => {
         renderComponent(<ObligatedsView info={[carlos, laura]} onUpdateData={jest.fn()} />, { wrapper });

         const select = screen.getByTestId('obligateds-select');
         expect(Array.from(select.options).map((o) => o.textContent)).toEqual(['Carlos Vega', 'Laura Mena']);
         expect(select).toHaveDisplayValue('Carlos Vega');
         expect(screen.getByLabelText('Folio del formulario')).toHaveValue('1111');
      });

      test('shows the properties of the selected obligor', async () => {
         const { user } = renderComponent(<ObligatedsView info={[carlos, laura]} onUpdateData={jest.fn()} />, {
            wrapper,
         });

         await user.selectOptions(screen.getByTestId('obligateds-select'), 'Laura Mena');

         expect(screen.getByLabelText('Folio del formulario')).toHaveValue('2222');
         expect(screen.getByLabelText('Ubicación')).toHaveValue('Domicilio de Laura Mena');
      });

      test('shows the properties as read-only text when it cannot be edited', async () => {
         const { user } = renderComponent(
            <ObligatedsView info={[carlos, laura]} onUpdateData={jest.fn()} isNotEditable />,
            { wrapper }
         );
         expect(screen.getByText('1111')).toBeInTheDocument();

         await user.selectOptions(screen.getByTestId('obligateds-select'), 'Laura Mena');

         expect(screen.getByText('2222')).toBeInTheDocument();
         expect(screen.queryByLabelText('Folio del formulario')).not.toBeInTheDocument();
      });

      test('replaces only the edited obligor in the list sent to the parent', async () => {
         const onUpdate = jest.fn();
         const { user } = renderComponent(<Harness start={[carlos, laura]} onUpdate={onUpdate} />, { wrapper });
         await user.selectOptions(screen.getByTestId('obligateds-select'), 'Laura Mena');

         await user.type(screen.getByLabelText('Folio del formulario'), '9');

         const [key, list] = onUpdate.mock.calls.at(-1);
         expect(key).toBe('obligedList');
         expect(list).toHaveLength(2);
         expect(list[0]).toBe(carlos);
         expect(list[1]).toEqual(
            expect.objectContaining({
               idClient: 11,
               properties: [expect.objectContaining({ idRelOwnership: 110, formFoil: '22229' })],
            })
         );
      });

      test('shows the summary of the selected obligor', async () => {
         const other = { ...laura, resumeInd: { totalCustomerValue: 7000000, resume: {} } };
         const { user } = renderComponent(<ObligatedsView info={[carlos, other]} onUpdateData={jest.fn()} />, {
            wrapper,
         });

         await user.selectOptions(screen.getByTestId('obligateds-select'), 'Laura Mena');

         expect(screen.getByText(/Valor s\/cliente:/)).toHaveTextContent('$7,000,000.00');
      });
   });
});
