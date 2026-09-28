import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param {object} props - Propiedades del componente.
 * @param {string} props.id - ID o nombre que se asignará al textbox.
 * @param {string} props.value - Valor del textbox actual el cual se almacena en el state del componente padre.
 * @param {function} props.onSetValue - Necesaria para modificar el estado desde el componente padre, se devuelven dos parametros: `(nombre, valor)` del input.
 * @param {string} [props.sxForm='w-full'] - Clases de TailwindCss para modificar el tamaño del formulario, por default se indica que tome el ancho total.
 * */
export const FilterSearchByName = ({ id, value, onSetValue, sxForm = 'w-full' }) => {
   return (
      <form className={`flex gap-2 px-4 py-1 bg-gray-100 border-[1.5px] border-black rounded-3xl ${sxForm}`}>
         <span className='material-symbols-outlined opacity-20 icon-size-20'>search</span>
         <button type='submit' disabled hidden aria-hidden='true' />
         <input
            id={id}
            name={id}
            maxLength='70'
            type='search'
            required
            value={value}
            autoComplete='off'
            onChange={(e) => onSetValue(e.target.name, e.target.value)}
            placeholder='Busca por nombre o grupo'
            className='w-full px-2 text-sm bg-transparent outline-none focus:outline-none focus:text-blue-800 invalid:border-red-500'
         />
      </form>
   );
};

FilterSearchByName.propTypes = {
   id: PropTypes.string.isRequired,
   value: PropTypes.string,
   onSetValue: PropTypes.func.isRequired,
   sxForm: PropTypes.string,
};
