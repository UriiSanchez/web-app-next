import { fireEvent, screen } from '@testing-library/react';

import CoverDatePicker from '../../../components/Controls/CoverDatePicker';
import { renderComponent } from '../../utils/render';

// JSDOM no implementa showPicker.
beforeEach(() => {
   window.HTMLInputElement.prototype.showPicker = jest.fn();
});

const getDetails = (container) => container.querySelector('details');

describe('CoverDatePicker', () => {
   test('shows the placeholder when there is no term and the stored term otherwise', () => {
      const { rerender } = renderComponent(<CoverDatePicker data={{}} onChangeVirtual={jest.fn()} />);
      expect(screen.getByText('dd/mm/aaaa')).toBeInTheDocument();

      rerender(
         <CoverDatePicker data={{ modelAuthorization: { termEm: '10/05/2030' } }} onChangeVirtual={jest.fn()} />
      );
      expect(screen.getByText('10/05/2030')).toBeInTheDocument();
   });

   test('selecting "1 año" reports the text value and closes the details', async () => {
      const onChangeVirtual = jest.fn();
      const { user, container } = renderComponent(<CoverDatePicker data={{}} onChangeVirtual={onChangeVirtual} />);
      await user.click(screen.getByText('dd/mm/aaaa'));
      expect(getDetails(container)).toHaveAttribute('open');

      await user.click(screen.getByText('1 año'));

      expect(onChangeVirtual).toHaveBeenCalledWith(
         { value: '1 año', name: 'termEm', type: 'text' },
         'modelAuthorization'
      );
      expect(getDetails(container)).not.toHaveAttribute('open');
   });

   test('picking a date reports it formatted as DD/MM/YYYY', () => {
      const onChangeVirtual = jest.fn();
      const { container } = renderComponent(<CoverDatePicker data={{}} onChangeVirtual={onChangeVirtual} />);

      // El input de fecha no tiene rol ni etiqueta accesible; se ubica por id.
      fireEvent.change(container.querySelector('#termEm-date'), { target: { value: '2030-05-10' } });

      expect(onChangeVirtual).toHaveBeenCalledWith(
         { value: '10/05/2030', name: 'termEm', type: 'text' },
         'modelAuthorization'
      );
   });

   test('typing in the date input shows the hint and clicking the details hides it', async () => {
      const { user, container } = renderComponent(<CoverDatePicker data={{}} onChangeVirtual={jest.fn()} />);
      await user.click(screen.getByText('dd/mm/aaaa'));
      // La visibilidad del aviso depende de la clase "hidden" (JSDOM no aplica CSS).
      const hint = screen.getByText('Haz clic para seleccionar una fecha').parentElement;
      expect(hint).toHaveClass('hidden');

      await user.type(container.querySelector('#termEm-date'), 'a');
      expect(hint).not.toHaveClass('hidden');

      await user.click(screen.getByText('1 año'));
      expect(hint).toHaveClass('hidden');
   });

   test('closes when clicking outside', async () => {
      const { user, container } = renderComponent(<CoverDatePicker data={{}} onChangeVirtual={jest.fn()} />);
      await user.click(screen.getByText('dd/mm/aaaa'));
      expect(getDetails(container)).toHaveAttribute('open');

      await user.click(document.body);

      expect(getDetails(container)).not.toHaveAttribute('open');
   });
});
