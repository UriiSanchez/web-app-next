import { useEffect, useRef, useState } from 'react';

export const useDivMeasure = () => {
   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
   const refElement = useRef(null);

   const updateDimensions = () => {
      if (refElement.current) {
         setDimensions({
            width: refElement.current.offsetWidth,
            height: refElement.current.offsetHeight,
         });
      }
   };

   useEffect(() => {
      updateDimensions();

      window.addEventListener('resize', updateDimensions);

      return () => {
         window.removeEventListener('resize', updateDimensions);
      };
   }, []);

   return [refElement, dimensions];
};
