'use client';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { AddButton, DeleteButton } from '../../Controls';

/**
 * Permite añadir, editar y/o eliminar a otros propietarios de una propiedad registrada.
 * @param {string} name - Nombre o ID para identificar el input a generar.
 * @param {string} value - Valor que debe tener el input a generar.
 * @param {function} onState - Función para actualizar el estado principal.
 * @param {function} onDelete - Función para eliminar el valor y el input creado.
 * @param {function} onAdded - Función añadir un nuevo input.
 * @param {Object} showButtons - Objeto con los atributos `showBtnAdded` y `showBtnDeleted` para mostrar y ocultar
 * los botones correspondientes.
 * @returns Un input con botones de añadir y eliminar.
 */
export function OtherOwnersItem({ name, value, onState, onDelete, onAdded, showButtons }) {
   return (
      <div className='relative p-0.5'>
         {showButtons.showBtnDeleted && (
            <DeleteButton testId={`deleted-${name}`} fn={onDelete} sx='absolute top-2 right-1 z-10' />
         )}
         <input
            id={name}
            name={name}
            type='text'
            maxLength='100'
            value={value || ''}
            onChange={onState}
            placeholder='Nombre del propietario'
            className='w-full py-0.5 px-2 text-xs h-8 input-form fadeIn'
         />
         {showButtons.showBtnAdded && (
            <AddButton fn={onAdded} isDisabled={_.isEmpty(value)} sx='absolute bottom-[-2rem] left-[50%]' />
         )}
      </div>
   );
}

OtherOwnersItem.propType = {
   name: PropTypes.string,
   value: PropTypes.string,
   onState: PropTypes.func,
   onDelete: PropTypes.func,
   onAdded: PropTypes.func,
   showButtons: PropTypes.shape({
      showBtnDeleted: PropTypes.bool,
      showBtnAdded: PropTypes.bool,
   }),
};
