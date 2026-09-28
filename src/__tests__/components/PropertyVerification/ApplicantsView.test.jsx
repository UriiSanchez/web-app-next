import { useState } from 'react';
import { screen } from '@testing-library/react';

import ApplicantsView from '../../../components/PropertyVerification/ApplicantsView';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const ADC = 1;

const info = {
   idClient: 30,
   idCatTypePerson: 1,
   properties: [
      {
         idRelOwnership: 501,
         numberOwnership: 1,
         formFoil: '1234',
         customerValue: 2500000,
         landUnit: 'hectare',
         propertyType: 'land',
         location: 'Calle Uno 12',
      },
   ],
   resumeInd: { totalCustomerValue: 2500000, totalBuildArea: 80, totalAreaDimension: 120, resume: {} },
};

const wrapper = createContextWrapper({ user: { idProfile: ADC }, actions: createActions() });

// El componente es controlado: entrega el info completo y el padre lo devuelve por props.
function Harness({ onUpdate, isNotEditable }) {
   const [current, setCurrent] = useState(info);
   const handleUpdate = (key, next) => {
      onUpdate(key, next);
      setCurrent(next);
   };
   return <ApplicantsView info={current} onUpdateData={handleUpdate} isNotEditable={isNotEditable} />;
}

describe('ApplicantsView', () => {
   let offsetWidth;

   beforeEach(() => {
      offsetWidth = jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(500);
   });

   test('shows editable inputs for the properties when it can be edited', () => {
      renderComponent(<ApplicantsView info={info} onUpdateData={jest.fn()} isNotEditable={false} />, { wrapper });

      expect(screen.getByLabelText('Folio del formulario')).toHaveValue('1234');
      expect(screen.getByLabelText('Ubicación')).toHaveValue('Calle Uno 12');
   });

   test('limits the width of the editable properties to the measured container', () => {
      renderComponent(<ApplicantsView info={info} onUpdateData={jest.fn()} />, { wrapper });

      expect(screen.getByLabelText('Folio del formulario').closest('.overflow-x-auto')).toHaveStyle({ width: '436px' });
      expect(offsetWidth).toHaveBeenCalled();
   });

   test('shows the properties as read-only text when it cannot be edited', () => {
      renderComponent(<ApplicantsView info={info} onUpdateData={jest.fn()} isNotEditable />, { wrapper });

      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('Calle Uno 12')).toBeInTheDocument();
      expect(screen.queryByLabelText('Folio del formulario')).not.toBeInTheDocument();
   });

   test('shows the individual summary of the applicant in both modes', () => {
      const { unmount } = renderComponent(<ApplicantsView info={info} onUpdateData={jest.fn()} />, { wrapper });
      expect(screen.getByText('Resumen individual')).toBeInTheDocument();
      expect(screen.getByText(/Valor s\/cliente:/)).toHaveTextContent('$2,500,000.00');
      unmount();

      renderComponent(<ApplicantsView info={info} onUpdateData={jest.fn()} isNotEditable />, { wrapper });

      expect(screen.getByText('Resumen individual')).toBeInTheDocument();
      expect(screen.getByText(/Valor s\/cliente:/)).toHaveTextContent('$2,500,000.00');
   });

   test('passes the changes of the properties to the parent as the applicant', async () => {
      const onUpdate = jest.fn();
      const { user } = renderComponent(<Harness onUpdate={onUpdate} />, { wrapper });

      await user.type(screen.getByLabelText('Folio del formulario'), '5');

      expect(onUpdate).toHaveBeenCalledWith(
         'applicant',
         expect.objectContaining({ properties: [expect.objectContaining({ idRelOwnership: 501, formFoil: '12345' })] })
      );
   });
});
