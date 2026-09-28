import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useDetectClickOutside } from '../../hooks';

export const FilterTypeProcedure = ({ data, onSet }) => {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);

   const onHandleChange = (event) => {
      const { value, checked } = event.target;
      const newData = checked ? [...data, value] : data.filter((type) => type !== value);
      onSet('byApplicationTypes', newData);
   };

   return (
      <div className='relative' ref={refElement}>
         <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='bg-[#E8E8E8] flex items-center rounded-lg px-4 py-1.5 gap-1 text-sm 2xl:text-base'>
            Trámite
            <span className='material-symbols-outlined icon-size-20'>
               {isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
            </span>
         </button>
         {isOpen && (
            <div
               className={clsx(
                  'absolute p-2 left-0 top-10 rounded-md w-44 border border-[#BEBEBE] bg-white z-20 shadow-2xl fadeIn transform transition-all duration-300 drop-shadow-lg',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               <div className='flex flex-col text-sm 2xl:text-base'>
                  <label htmlFor='typeNew' className='cursor-pointer select-none'>
                     <input
                        id='typeNew'
                        name='typeNew'
                        type='checkbox'
                        className='check-input'
                        value='Nuevo Tramite'
                        checked={data.includes('Nuevo Tramite')}
                        onChange={onHandleChange}
                     />
                     Nuevo trámite
                  </label>
                  <label htmlFor='procedureSingle' className='cursor-pointer select-none'>
                     <input
                        id='procedureSingle'
                        name='procedureSingle'
                        type='checkbox'
                        className='check-input'
                        value='Recalificacion'
                        checked={data.includes('Recalificacion')}
                        onChange={onHandleChange}
                     />
                     Recalificación
                  </label>
                  <label htmlFor='procedureIncrease' className='cursor-pointer select-none'>
                     <input
                        id='procedureIncrease'
                        name='procedureIncrease'
                        type='checkbox'
                        className='check-input'
                        value='Incremento'
                        checked={data.includes('Incremento')}
                        onChange={onHandleChange}
                     />
                     Incremento
                  </label>
                  <label htmlFor='procedureDecrease' className='cursor-pointer select-none'>
                     <input
                        id='procedureDecrease'
                        name='procedureDecrease'
                        type='checkbox'
                        className='check-input'
                        value='Decremento'
                        checked={data.includes('Decremento')}
                        onChange={onHandleChange}
                     />
                     Decremento
                  </label>
               </div>
            </div>
         )}
      </div>
   );
};

FilterTypeProcedure.propTypes = {
   data: PropTypes.array,
   onSet: PropTypes.func,
};
