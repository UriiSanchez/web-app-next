import { useEffect } from 'react';

/**
 * Hook personalizado para bloquear el scroll del cuerpo del documento.
 * Se usa comúnmente en modales o pop-ups.
 * El scroll se bloquea al montar el componente y se restablece al desmontarlo.
 * */
export const useLockBodyScroll = () => {
   useEffect(() => {
      const originalStyle = window.getComputedStyle(document.documentElement).overflow;
      document.documentElement.style.overflow = 'hidden';

      return () => {
         document.documentElement.style.overflow = originalStyle;
      };
   }, []);
};
