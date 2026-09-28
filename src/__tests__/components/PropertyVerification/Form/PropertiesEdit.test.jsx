import { useState } from 'react';
import { act, fireEvent, screen, within } from '@testing-library/react';

import PropertiesEdit from '../../../../components/PropertyVerification/Form/PropertiesEdit';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';

const savedProperty = {
   idRelOwnership: 501,
   numberOwnership: 1,
   formFoil: '1234',
   customerValue: '2500000',
   landUnit: 'hectare',
   propertyType: 'land',
   buildArea: '80',
   areaDimension: '120',
   location: 'Calle Uno 12',
};

const verifiedProperty = {
   ...savedProperty,
   idRelOwnership: 502,
   numberOwnership: 2,
   formFoil: '5678',
   landUnit: 'squareMeter',
   idCheckOwnership: {
      idCheckOwnership: 77,
      ownerType: 'APPLICANT',
      ownershipStatus: 'libre',
      ownershipValue: 1000,
      countable: true,
   },
};

const buildInfo = (properties) => ({
   idClient: 30,
   idCatTypePerson: 1,
   properties,
   resumeInd: { totalCustomerValue: 0 },
});

// El componente es controlado: entrega el info completo y el padre lo devuelve por props.
function Harness({ start, onUpdate, width }) {
   const [info, setInfo] = useState(start);
   const handleUpdate = (key, next) => {
      onUpdate(key, next);
      setInfo(next);
   };
   return <PropertiesEdit info={info} onUpdateData={handleUpdate} width={width} />;
}

function setup(properties, { width = '600px' } = {}) {
   const onUpdate = jest.fn();
   const actions = createActions({ toggleVerification: jest.fn() });
   const wrapper = createContextWrapper({ actions });
   const utils = renderComponent(<Harness start={buildInfo(properties)} onUpdate={onUpdate} width={width} />, {
      wrapper,
      userOptions: { advanceTimers: jest.advanceTimersByTime },
    });
   return { onUpdate, actions, ...utils };
}

const lastInfo = (onUpdate) => onUpdate.mock.calls.at(-1)[1];
const cards = () => screen.getAllByText(/^Propiedad/).map((p) => p.closest('.grid'));
const verificationButtons = () => screen.getAllByRole('button', { name: /verificación/ });

beforeEach(() => {
   jest.useFakeTimers();
});

describe('PropertiesEdit', () => {
   test('shows one empty card when there are no properties', () => {
      setup([]);

      expect(cards()).toHaveLength(1);
      expect(screen.getByText(/Propiedad\s*01/)).toBeInTheDocument();
      expect(screen.getByLabelText('Folio del formulario')).toHaveValue('');
      expect(screen.getByLabelText('Ubicación')).toHaveValue('');
      expect(screen.queryByTestId('btn-deleted')).not.toBeInTheDocument();
   });

   test('disables the verification and the add buttons of an empty card', () => {
      setup([]);

      expect(verificationButtons()[0]).toBeDisabled();
      expect(screen.getByRole('button', { name: 'add_circle' })).toBeDisabled();
   });

   test('applies the width received to the container', () => {
      setup([], { width: '480px' });

      expect(cards()[0].parentElement).toHaveStyle({ width: '480px' });
   });

   test('shows a card per saved property with its data', () => {
      setup([savedProperty, verifiedProperty]);

      expect(cards()).toHaveLength(2);
      expect(screen.getByDisplayValue('1234')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5678')).toBeInTheDocument();
      expect(screen.getAllByLabelText('Valor s/cliente (MXP)')[0]).toHaveValue('$2,500,000');
      expect(screen.getAllByLabelText('Unidad de terreno').map((s) => s.value)).toEqual(['hectare', 'squareMeter']);
      expect(screen.getAllByLabelText('Tipo de inmueble')[0]).toHaveValue('land');
      expect(screen.getAllByLabelText('Dimensiones de terreno')[0]).toHaveValue('120');
      expect(screen.getAllByLabelText(/de construcción/)[0]).toHaveValue('80');
      expect(screen.getAllByLabelText('Ubicación')[0]).toHaveValue('Calle Uno 12');
   });

   test('shows the land unit of the dimensions', () => {
      setup([savedProperty, verifiedProperty]);

      const [hectare, squareMeter] = cards();
      expect(within(hectare).getByText('ha')).toBeInTheDocument();
      expect(within(squareMeter).queryByText('ha')).not.toBeInTheDocument();
   });

   test('does not show the deleted properties', () => {
      setup([{ ...savedProperty, deleted: true }, verifiedProperty]);

      expect(cards()).toHaveLength(1);
      expect(screen.getByDisplayValue('5678')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('1234')).not.toBeInTheDocument();
   });

   test('enables the verification of saved properties only', () => {
      setup([savedProperty]);

      expect(verificationButtons()[0]).toBeEnabled();
   });

   test('offers a card at a time and stops at the limit of properties', () => {
      const many = Array.from({ length: 20 }, (_v, i) => ({ ...savedProperty, idRelOwnership: 1000 + i }));
      setup(many);

      expect(cards()).toHaveLength(20);
      expect(screen.queryByRole('button', { name: 'add_circle' })).not.toBeInTheDocument();
   });

   describe('editing', () => {
      test('creates a new property with the first value typed', async () => {
         const { onUpdate, user } = setup([]);

         await user.type(screen.getByLabelText('Folio del formulario'), '12');

         expect(onUpdate).toHaveBeenCalledWith(
            'applicant',
            expect.objectContaining({ properties: [{ formFoil: '1', numberOwnership: 1, newProperty: true }] })
         );
         expect(screen.getByLabelText('Folio del formulario')).toHaveValue('12');
         expect(lastInfo(onUpdate).properties).toEqual([{ formFoil: '12', numberOwnership: 1, newProperty: true }]);
      });

      test('removes the currency symbol and separators from the value', async () => {
         const { onUpdate, user } = setup([savedProperty]);
         const value = screen.getByLabelText('Valor s/cliente (MXP)');

         await user.clear(value);
         await user.type(value, '3500');

         expect(lastInfo(onUpdate).properties[0].customerValue).toBe('3500');
         expect(value).toHaveValue('$3,500');
      });

      test('updates the selects of an existing property', async () => {
         const { onUpdate, user } = setup([savedProperty]);

         await user.selectOptions(screen.getByLabelText('Unidad de terreno'), 'squareMeter');
         await user.selectOptions(screen.getByLabelText('Tipo de inmueble'), 'building');

         expect(lastInfo(onUpdate).properties[0]).toEqual({
            ...savedProperty,
            landUnit: 'squareMeter',
            propertyType: 'building',
         });
      });

      test('updates the location', async () => {
         const { onUpdate } = setup([savedProperty]);

         fireEvent.change(screen.getByLabelText('Ubicación'), { target: { name: 'location-0', value: 'Av. Sur 5' } });

         expect(lastInfo(onUpdate).properties[0].location).toBe('Av. Sur 5');
      });

      test('recalculates the individual summary with every change', async () => {
         const { onUpdate, user } = setup([savedProperty]);

         await user.selectOptions(screen.getByLabelText('Tipo de inmueble'), 'building');

         expect(lastInfo(onUpdate).resumeInd).toEqual(
            expect.objectContaining({
               totalCustomerValue: 2500000,
               totalBuildArea: 80,
               totalAreaDimension: 120,
               resume: expect.objectContaining({ pendientes: { numero: 1, valor: 2500000 } }),
            })
         );
      });

      test('edits the right property when there are deleted ones before it', async () => {
         const { onUpdate, user } = setup([{ ...savedProperty, deleted: true }, verifiedProperty]);

         await user.selectOptions(screen.getByLabelText('Tipo de inmueble'), 'building');

         const { properties } = lastInfo(onUpdate);
         expect(properties[0]).toEqual({ ...savedProperty, deleted: true });
         expect(properties[1].propertyType).toBe('building');
      });
   });

   describe('adding', () => {
      test('adds an empty card and scrolls to it', async () => {
         const { user } = setup([savedProperty]);

         await user.click(screen.getByRole('button', { name: 'add_circle' }));

         expect(cards()).toHaveLength(2);
         expect(window.HTMLElement.prototype.scrollTo).not.toHaveBeenCalled();
         act(() => jest.advanceTimersByTime(500));
         expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
      });

      test('appends the value typed in the new card as a new property', async () => {
         const { onUpdate, user } = setup([savedProperty]);
         await user.click(screen.getByRole('button', { name: 'add_circle' }));

         await user.type(screen.getAllByLabelText('Folio del formulario')[1], '9');

         const { properties } = lastInfo(onUpdate);
         expect(properties).toHaveLength(2);
         expect(properties[0]).toEqual(savedProperty);
         expect(properties[1]).toEqual({ formFoil: '9', numberOwnership: 2, newProperty: true });
      });

      test('edits a new property after a deleted one using the deleted count as offset', async () => {
         const { onUpdate } = setup([{ ...savedProperty, deleted: true }, { formFoil: '7', newProperty: true }]);

         fireEvent.change(screen.getByLabelText('Ubicación'), { target: { name: 'location-0', value: 'Nueva' } });

         expect(lastInfo(onUpdate).properties[1]).toEqual({ formFoil: '7', newProperty: true, location: 'Nueva' });
      });
   });

   describe('deleting', () => {
      test('marks a saved property as deleted and recalculates the summary', async () => {
         const { onUpdate, user } = setup([savedProperty, verifiedProperty]);

         await user.click(screen.getAllByTestId('btn-deleted')[0]);

         const info = lastInfo(onUpdate);
         expect(info.properties).toEqual([{ ...savedProperty, deleted: true }, verifiedProperty]);
         expect(info.resumeInd.totalCustomerValue).toBe(2500000);
         expect(cards()).toHaveLength(1);
      });

      test('removes an unsaved property from the list', async () => {
         const { onUpdate, user } = setup([savedProperty]);
         await user.click(screen.getByRole('button', { name: 'add_circle' }));
         await user.type(screen.getAllByLabelText('Folio del formulario')[1], '9');

         await user.click(screen.getAllByTestId('btn-deleted')[1]);

         expect(lastInfo(onUpdate).properties).toEqual([savedProperty]);
         expect(cards()).toHaveLength(1);
      });

      test('removes an empty extra card without notifying the parent', async () => {
         const { onUpdate, user } = setup([savedProperty]);
         await user.click(screen.getByRole('button', { name: 'add_circle' }));
         expect(cards()).toHaveLength(2);

         await user.click(screen.getAllByTestId('btn-deleted')[1]);

         expect(onUpdate).not.toHaveBeenCalled();
         expect(cards()).toHaveLength(1);
      });

      test('keeps an empty card when the only property is deleted', async () => {
         const { onUpdate, user } = setup([savedProperty]);

         await user.click(screen.getByTestId('btn-deleted'));

         expect(lastInfo(onUpdate).properties).toEqual([{ ...savedProperty, deleted: true }]);
         expect(cards()).toHaveLength(1);
         expect(screen.getByLabelText('Folio del formulario')).toHaveValue('');
      });
   });

   describe('verification', () => {
      test('opens the verification of a property that was already verified', async () => {
         const { actions, user } = setup([savedProperty, verifiedProperty]);

         await user.click(verificationButtons()[1]);

         expect(actions.toggleVerification).toHaveBeenCalledWith({
            idx: 1,
            catTypePerson: 1,
            idCheckOwnership: 77,
            ownerType: 'APPLICANT',
            ownershipStatus: 'libre',
            ownershipValue: 1000,
            countable: true,
            idRelOwnership: 502,
            idClient: 30,
         });
      });

      test('opens a new verification for a property without one', async () => {
         const { actions, user } = setup([savedProperty, verifiedProperty]);

         await user.click(verificationButtons()[0]);

         expect(actions.toggleVerification).toHaveBeenCalledWith(
            expect.objectContaining({
               idx: 0,
               checkNumber: 1,
               catTypePerson: 1,
               idRelOwnership: 501,
               idClient: 30,
               idCheckOwnership: null,
               ownerType: '',
            })
         );
      });
   });
});
