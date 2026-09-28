import { useEffect, useRef, useState } from 'react';

export const useDetectClickOutside = (initOpen = false) => {
   const [isOpen, setIsOpen] = useState(initOpen);
   const refElement = useRef(null);

   useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
         document.removeEventListener('touchstart', handleClickOutside);
      };
   }, []);

   const handleClickOutside = (event) => {
      if (refElement.current && !refElement.current.contains(event.target)) {
         setIsOpen(false);
      }
   };

   return { isOpen, setIsOpen, refElement };
};
