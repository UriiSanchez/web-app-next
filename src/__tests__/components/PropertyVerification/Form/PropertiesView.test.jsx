import { useState } from 'react';
import { screen, within } from '@testing-library/react';

import PropertiesView from '../../../../components/PropertyVerification/Form/PropertiesView';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';

const ADC = 1;
const MRC = 2;
const EMG = 3;
const LDC = 4;

const pendingProperty = {
   idRelOwnership: 501,
   numberOwnership: 1,
   formFoil: '1234',
   customerValue: 2500000,
   landUnit: 'hectare',
   propertyType: 'land',
   buildArea: '80',
   areaDimension: '120',
   location: 'Calle Uno 12',
   validation: false,
   comments: '',
};

const verifiedProperty = {
   ...pendingProperty,
   idRelOwnership: 502,
   numberOwnership: 2,
   formFoil: '5678',
   landUnit: 'squareMeter',
   propertyType: 'building',
   idCheckOwnership: { idCheckOwnership: 77, ownerType: 'APPLICANT', ownershipStatus: 'libre' },
};

const buildInfo = (properties) => ({ idClient: 30, idCatTypePerson: 1, properties });

// El componente es controlado: entrega el info completo y el padre lo devuelve por props.
function Harness({ start, onUpdate }) {
   const [info, setInfo] = useState(start);
   const handleUpdate = (key, next) => {
      onUpdate(key, next);
      setInfo(next);
   };
   return <PropertiesView info={info} onUpdateData={handleUpdate} />;
}

function setup(properties, { idProfile = ADC } = {}) {
   const onUpdate = jest.fn();
   const actions = createActions({ toggleVerification: jest.fn() });
   const wrapper = createContextWrapper({ user: { idProfile }, actions });
   const utils = renderComponent(<Harness start={buildInfo(properties)} onUpdate={onUpdate} />, { wrapper });
   return { onUpdate, actions, ...utils };
}

const cards = () => screen.getAllByText(/^Propiedad/).map((p) => p.closest('.flex-row'));
const verificationButtons = () => screen.getAllByRole('button', { name: 'verificación' });
const arrows = () => screen.queryAllByText(/keyboard_double_arrow_(left|right)/);
const lastInfo = (onUpdate) => onUpdate.mock.calls.at(-1)[1];

describe('PropertiesView', () => {
   describe('without properties', () => {
      test.each([[[]], [undefined]])('shows an empty card when properties is %p', (properties) => {
         setup(properties);

         expect(screen.getByText('Folio del formulario')).toBeInTheDocument();
         expect(screen.getByText('Ubicación')).toBeInTheDocument();
         expect(screen.queryByRole('button')).not.toBeInTheDocument();
         expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
   });

   describe('with properties', () => {
      test('shows the data of each property as read-only text', () => {
         setup([pendingProperty, verifiedProperty]);

         expect(cards()).toHaveLength(2);
         const [first] = cards();
         expect(screen.getByText(/Propiedad\s*01/)).toBeInTheDocument();
         expect(screen.getByText(/Propiedad\s*02/)).toBeInTheDocument();
         expect(within(first).getByText('1234')).toBeInTheDocument();
         expect(within(first).getByText('$2,500,000')).toBeInTheDocument();
         expect(within(first).getByText('Hectárea')).toBeInTheDocument();
         expect(within(first).getByText('Terreno')).toBeInTheDocument();
         expect(within(first).getByText('80')).toBeInTheDocument();
         expect(within(first).getByText('120')).toBeInTheDocument();
         expect(within(first).getByText('Calle Uno 12')).toBeInTheDocument();
         expect(screen.getByText('Metro cuadrado')).toBeInTheDocument();
         expect(screen.getByText('Edificio')).toBeInTheDocument();
         expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });

      test('shows the land unit of the dimensions', () => {
         setup([pendingProperty, verifiedProperty]);

         const [hectare, squareMeter] = cards();
         expect(within(hectare).getByText('ha')).toBeInTheDocument();
         expect(within(squareMeter).queryByText('ha')).not.toBeInTheDocument();
      });

      test('shows empty boxes for the data that was not captured', () => {
         setup([{ idRelOwnership: 9, numberOwnership: 3 }]);

         const [card] = cards();
         expect(within(card).queryByText('Hectárea')).not.toBeInTheDocument();
         expect(within(card).queryByText('$0')).not.toBeInTheDocument();
         expect(within(card).getByText('Folio del formulario').nextSibling).toHaveTextContent('');
      });
   });

   describe('verification', () => {
      test('opens a new verification for a property without one', async () => {
         const { actions, user } = setup([pendingProperty, verifiedProperty]);

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

      test('opens the existing verification of a verified property', async () => {
         const { actions, user } = setup([pendingProperty, verifiedProperty]);

         await user.click(verificationButtons()[1]);

         expect(actions.toggleVerification).toHaveBeenCalledWith({
            idx: 1,
            catTypePerson: 1,
            idCheckOwnership: 77,
            ownerType: 'APPLICANT',
            ownershipStatus: 'libre',
            idRelOwnership: 502,
            idClient: 30,
         });
      });

      test('blocks the verification for the reception desk profile', () => {
         setup([pendingProperty], { idProfile: MRC });

         expect(verificationButtons()[0]).toBeDisabled();
      });

      test('blocks the verification of a property that is not saved yet', () => {
         setup([{ ...pendingProperty, idRelOwnership: undefined }]);

         expect(verificationButtons()[0]).toBeDisabled();
      });
   });

   describe('validation panel', () => {
      test.each([[ADC], [LDC]])('shows the validation arrows for profile %i', (idProfile) => {
         setup([pendingProperty, verifiedProperty], { idProfile });

         expect(arrows()).toHaveLength(2);
      });

      test.each([[MRC], [EMG]])('hides the validation arrows for profile %i', (idProfile) => {
         setup([pendingProperty, verifiedProperty], { idProfile });

         expect(arrows()).toHaveLength(0);
      });

      test('keeps the panel closed and ignores the arrow of an unverified property', async () => {
         const { user } = setup([pendingProperty]);

         await user.click(arrows()[0]);

         expect(screen.queryByText('Validación')).not.toBeInTheDocument();
         expect(arrows()[0]).toHaveTextContent('keyboard_double_arrow_right');
      });

      test('opens and closes the panel of a verified property', async () => {
         const { user } = setup([pendingProperty, verifiedProperty]);

         await user.click(arrows()[1]);

         expect(screen.getByText('Validación')).toBeInTheDocument();
         expect(screen.getByLabelText('Comentarios')).toBeInTheDocument();
         expect(arrows()[1]).toHaveTextContent('keyboard_double_arrow_left');

         await user.click(arrows()[1]);

         expect(screen.queryByText('Validación')).not.toBeInTheDocument();
         expect(arrows()[1]).toHaveTextContent('keyboard_double_arrow_right');
      });

      test('keeps several panels open at once', async () => {
         const second = { ...verifiedProperty, idRelOwnership: 503, numberOwnership: 3 };
         const { user } = setup([verifiedProperty, second]);

         await user.click(arrows()[0]);
         await user.click(arrows()[1]);

         expect(screen.getAllByText('Validación')).toHaveLength(2);
      });

      test('updates the validation check of the property', async () => {
         const { onUpdate, user } = setup([pendingProperty, verifiedProperty]);
         await user.click(arrows()[1]);

         await user.click(screen.getByRole('checkbox'));

         expect(lastInfo(onUpdate).properties).toEqual([pendingProperty, { ...verifiedProperty, validation: true }]);
         expect(screen.getByRole('checkbox')).toBeChecked();
      });

      test('updates the comments of the property', async () => {
         const { onUpdate, user } = setup([pendingProperty, verifiedProperty]);
         await user.click(arrows()[1]);

         await user.type(screen.getByLabelText('Comentarios'), 'Ok');

         expect(lastInfo(onUpdate)).toEqual(
            expect.objectContaining({ properties: [pendingProperty, { ...verifiedProperty, comments: 'Ok' }] })
         );
         expect(screen.getByLabelText('Comentarios')).toHaveValue('Ok');
      });

      test('shows the comments already captured', async () => {
         const { user } = setup([{ ...verifiedProperty, comments: 'Revisado' }]);

         await user.click(arrows()[0]);

         expect(screen.getByLabelText('Comentarios')).toHaveValue('Revisado');
      });
   });
});
