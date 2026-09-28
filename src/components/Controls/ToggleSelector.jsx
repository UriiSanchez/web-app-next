import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente toggle con solo dos opciones Sí o No
 * @param {string} name - Nombre del campo en el state
 * @param {('SI'|'NO')} value - Valor del campo
 * @param {Function} fnSet - Funcion para actualizar
 * @return  {JSX.Element} Elemento html con función de un toggle.
 */
export const ToggleSelector = ({ name, value, fnSet }) => {
   const handleToggle = useCallback(() => {
      fnSet('sectorInformationResponse', name, value != 'SI' ? 'SI' : 'NO');
   }, [value, name, fnSet]);

   return (
      <div className='flex items-center w-full h-8 px-2 border rounded group border-gray hover:ring-1 hover:ring-blue-800 hover:border-blue-800'>
         <button
            type='button'
            onClick={handleToggle}
            className='flex text-lg select-none hover:text-blue-800 hover:cursor-pointer'>
            <span className='material-symbols-outlined icon-size-20'>arrow_back_ios</span>
         </button>
         <div className='w-full px-4 text-center bg-opacity-0 pointer-events-none select-none group-hover:text-blue-800'>
            {value == 'SI' ? 'Sí' : 'No'}
         </div>
         <button
            type='button'
            onClick={handleToggle}
            className='flex text-lg select-none hover:text-blue-800 hover:cursor-pointer'>
            <span className='material-symbols-outlined icon-size-20'>arrow_forward_ios</span>
         </button>
      </div>
   );
};

ToggleSelector.prototypes = {
   name: PropTypes.string.isRequired,
   value: PropTypes.oneOf(['SI', 'NO']),
   fnSet: PropTypes.func.isRequired,
};
