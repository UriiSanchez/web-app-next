import { screen } from '@testing-library/react';
import Swal from 'sweetalert2';

import { MainModal } from '../../../components/Modal/MainModal';
import { renderComponent } from '../../utils/render';

jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const renderModal = (props = {}) =>
   renderComponent(
      <MainModal isOpened onClose={jest.fn()} {...props}>
         <p>Contenido del modal</p>
      </MainModal>
   );

describe('MainModal', () => {
   test('renders its children inside an open dialog', () => {
      const { container } = renderModal();

      expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
      expect(container.querySelector('dialog')).toHaveAttribute('open');
   });

   test('keeps the dialog closed when isOpened is false', () => {
      const { container } = renderModal({ isOpened: false });

      expect(container.querySelector('dialog')).not.toHaveAttribute('open');
   });

   test('renders no close button without onClose', () => {
      renderModal({ onClose: undefined });

      expect(screen.queryByTitle('Cerrar modal')).not.toBeInTheDocument();
   });

   test('closes directly when the modal is not locked', async () => {
      const onClose = jest.fn();
      const { user } = renderModal({ onClose });

      await user.click(screen.getByTitle('Cerrar modal'));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(Swal.fire).not.toHaveBeenCalled();
   });

   test('asks for confirmation when locked and closes once confirmed', async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });
      const onClose = jest.fn();
      const { user } = renderModal({ onClose, isLocked: true });

      await user.click(screen.getByTitle('Cerrar modal'));

      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: '¿Seguro que quieres salir?' }));
      await Promise.resolve();
      expect(onClose).toHaveBeenCalledTimes(1);
   });

   test('keeps the modal open when the confirmation is cancelled', async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });
      const onClose = jest.fn();
      const { user } = renderModal({ onClose, isLocked: true });

      await user.click(screen.getByTitle('Cerrar modal'));
      await Promise.resolve();

      expect(Swal.fire).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
   });

   test('applies a custom width class instead of the default', () => {
      const { container, rerender } = renderModal();
      expect(container.querySelector('.modal-container')).toHaveClass('max-w-3xl');

      rerender(
         <MainModal isOpened onClose={jest.fn()} xs='max-w-xl'>
            <p>Contenido del modal</p>
         </MainModal>
      );
      expect(container.querySelector('.modal-container')).toHaveClass('max-w-xl');
      expect(container.querySelector('.modal-container')).not.toHaveClass('max-w-3xl');
   });

   test('locks page scroll while open and restores it on unmount', () => {
      const { unmount } = renderModal();
      expect(document.documentElement.style.overflow).toBe('hidden');

      unmount();
      expect(document.documentElement.style.overflow).toBe('auto');
   });
});
