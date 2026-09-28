import { screen } from '@testing-library/react';

import { CustomStepper } from '../../../components/Controls/CustomStepper';
import { renderComponent } from '../../utils/render';
import { createContextWrapper } from '../../utils/context';

const config = {
   bgColorContainer: 'bg-container',
   bgOption: 'bg-idle',
   bgOptionActive: 'bg-active',
   color: 'text-line',
   txtColorActive: 'text-active',
   txtOption: 'text-idle',
};
const options = [
   { step: 1, title: 'Datos' },
   { step: 2, title: 'Modelo' },
   { step: 3, title: 'Resumen' },
];

const renderStepper = (stepper) => renderComponent(<CustomStepper />, { wrapper: createContextWrapper({ stepper }) });

describe('CustomStepper', () => {
   test('renders every step number and title', () => {
      renderStepper({ step: 1, options, config });

      options.forEach(({ step, title }) => {
         expect(screen.getByText(String(step))).toBeInTheDocument();
         expect(screen.getByText(title)).toBeInTheDocument();
      });
   });

   test('highlights only the current step', () => {
      renderStepper({ step: 2, options, config });

      // JSDOM no evalúa estilos: el estado activo solo se distingue por sus clases.
      expect(screen.getByText('2')).toHaveClass('bg-active', 'text-active');
      expect(screen.getByText('1')).toHaveClass('bg-idle', 'text-idle');
      expect(screen.getByText('3')).toHaveClass('bg-idle', 'text-idle');
   });

   test('renders no steps when there are no options', () => {
      renderStepper({ step: 1, options: [], config });

      expect(screen.queryByText('1')).not.toBeInTheDocument();
   });
});
