import _ from 'lodash';
import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useDetectClickOutside } from '../../hooks';

/**
 *
 * @param {object} props - Props de componente
 * @param {array} props.listItems - Arreglo de objetos para mostrar los checks.
 * @param {string} props.title - Título para mostrar en el componente.
 * @param {function} props.onSetCheckFilter - Función que permite cambiar el state del padre, se devuelve un listado con las opciones seleccionadas.
 * @param {array} props.selectedItems - Arreglo de los items seleccionados.
 * @param {string} props.keyFilter - Atributo el cual se asignará el valor en el input y el ID del control.
 * @param {string} props.valueFilter - Atributo el cual mostrará.
 * */
export const FilterCustomCheck = ({ listItems, title, onSetCheckFilter, selectedItems, keyFilter, valueFilter }) => {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);

   const onHandleChange = (event) => {
      const { value, checked } = event.target;
      const newData = checked ? [...selectedItems, value] : selectedItems.filter((type) => type !== value);
      onSetCheckFilter(newData);
   };

   return (
      <div className='relative' ref={refElement}>
         <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='bg-[#E8E8E8] flex items-center rounded-lg px-4 py-1.5 gap-1 text-sm 2xl:text-base relative'>
            {title}
            <span className={`material-symbols-outlined icon-size-20 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
               keyboard_arrow_down
            </span>
            <span
               data-testid=""
               className={clsx(
                  'absolute -top-3 -right-2 bg-cyan-500 shadow-lg shadow-cyan-500/50 flex rounded-full text-xs justify-center items-center text-white w-5 h-5 transition-all ease-in-out duration-300',
                  {
                     'opacity-100': selectedItems?.length > 0,
                     'opacity-0': _.isEmpty(selectedItems),
                  }
               )}>
               {selectedItems?.length || ''}
            </span>
         </button>
         {isOpen && (
            <div
               className={clsx(
                  'absolute p-2 left-0 top-10 rounded-md min-w-56 max-w-72 2xl:max-w-80 border border-[#BEBEBE] bg-white z-20 shadow-2xl fadeIn transform transition-all duration-300 drop-shadow-lg',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               <div className='flex flex-col text-sm 2xl:text-base gap-1'>
                  {listItems?.map((item) => (
                     <label
                        key={item[keyFilter]}
                        htmlFor={item[keyFilter]}
                        className='cursor-pointer select-none truncate capitalize'>
                        <input
                           id={item[keyFilter]}
                           name={item[keyFilter]}
                           type='checkbox'
                           className='check-input'
                           value={item[keyFilter]}
                           checked={selectedItems?.includes(item[keyFilter])}
                           onChange={onHandleChange}
                        />
                        {item[valueFilter] || '-'}
                     </label>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};

FilterCustomCheck.propTypes = {
   title: PropTypes.string.isRequired,
   listItems: PropTypes.array.isRequired,
   selectedLeaders: PropTypes.array,
   onSetCheckFilter: PropTypes.func.isRequired,
   keyFilter: PropTypes.string.isRequired,
   valueFilter: PropTypes.string.isRequired,
};
