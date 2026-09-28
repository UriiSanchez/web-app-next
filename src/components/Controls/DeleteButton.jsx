import React from 'react';
import PropTypes from 'prop-types';

/**
 * Botón con icono eliminar que permite ejecutar una función
 * @param {Function} fn - Función que se ejecuta al hacer clic en el botón
 * @param {string} [sx] - Clases css adicionales para el botón.
 */
export const DeleteButton = ({ fn, sx, testId = 'btn-deleted' }) => {
   return (
      <button
         data-testid={testId}
         title='Haz click para eliminar'
         type='button'
         className={`flex rounded-full h-fit w-fit hover:bg-black-900 hover:text-white ${
            sx || 'z-10 absolute top-1 right-1'
         }`}
         onClick={fn}>
         <span className='material-symbols-outlined icon-size-20'>close</span>
      </button>
   );
};

DeleteButton.propTypes = {
   fn: PropTypes.func.isRequired,
   sx: PropTypes.string,
};
