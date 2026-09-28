import React from 'react';
import PropTypes from 'prop-types';

/**
 * Botón con icono agregar que permite ejecutar una función
 * @param {Function} fn - Función que se ejecuta al hacer clic en el botón
 * @param {string} [sx] - Clases css adicionales para el botón.
 * @param {boolean} [isDisabled=false] - Atributo para habilitar o deshabilitar el botón.
 */
export const AddButton = ({ fn, sx = '', isDisabled = false }) => {
   return (
      <button
         type='button'
         onClick={fn}
         disabled={isDisabled}
         className={`flex items-center h-fit w-fit ${sx || 'absolute top-[45%] right-[-2rem]'} ${
            isDisabled ? 'clean' : ''
         }`}>
         <span className='material-symbols-outlined filled icon-size-24'>add_circle</span>
      </button>
   );
};

AddButton.propTypes = {
   fn: PropTypes.func.isRequired,
   isDisabled: PropTypes.bool,
   sx: PropTypes.string,
};
