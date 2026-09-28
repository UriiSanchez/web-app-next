import { useEffect } from 'react';
import { sweetConditional } from '../../helpers';

export const MainModal = ({ isOpened, isLocked, onClose, children, xs = '' }) => {
   useEffect(() => {
      if (isOpened) {
         document.documentElement.style.overflow = 'hidden';
         document.documentElement.scroll = 'no';
      }

      return () => {
         document.documentElement.style.overflow = 'auto';
         document.documentElement.scroll = 'yes';
      };
   }, [isOpened]);

   const closeModal = () => {
      if (isLocked) {
         sweetConditional({
            title: '¿Seguro que quieres salir?',
            text: 'Recuerda que se perderá el avance que llevas.',
            onFunc: onClose,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#059669',
         });
      } else {
         onClose();
      }
   };

   return (
      <dialog open={isOpened ? 'open' : false} className='main-modal'>
         <div className={`relative m-auto max-h-max rounded p-4 modal-container ${xs || 'max-w-3xl'}`}>
            {!onClose ? null : (
               <button
                  type='button'
                  className='absolute top-1.5 right-1.5'
                  title='Cerrar modal'
                  onClick={() => closeModal()}>
                  <span className='rounded-full material-symbols-outlined hover:bg-black-900 hover:text-white'>
                     close
                  </span>
               </button>
            )}
            {children}
         </div>
      </dialog>
   );
};
