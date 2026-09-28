import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useDetectClickOutside } from '../../hooks';

import styles from './filters.module.css';

export const FilterBranchOffice = ({data, onSet}) => {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);

   const onHandleChange = (event) => {
      const { value, checked } = event.target;
      const newData = checked ? [...data, value] : data.filter((type) => type !== value);
      onSet('byBranches', newData);
   };

   return (
      <div className='relative 2xl:mr-5' ref={refElement}>
         <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='bg-[#E8E8E8] flex items-center rounded-lg px-4 py-1.5 gap-1 text-sm 2xl:text-base'>
            Sucursal
            <span className='material-symbols-outlined icon-size-20'>
               {isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
            </span>
         </button>
         {isOpen && (
            <div
               className={clsx(
                  'absolute py-2 px-3 left-0 top-10 rounded-md w-56 border border-[#BEBEBE] bg-white z-20 shadow-2xl fadeIn transform transition-all duration-300 drop-shadow-lg',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               <div className='text-sm 2xl:text-base pb-2'>
                  <label htmlFor='branchCDMX' className='cursor-pointer select-none'>
                     <input
                        id='branchCDMX'
                        name='branchCDMX'
                        type='checkbox'
                        className='check-input'
                        value='LOMAS'
                        checked={data.includes('LOMAS')}
                        onChange={onHandleChange}
                     />
                     Ciudad de México
                  </label>
               </div>
               <div className='text-sm 2xl:text-base'>
                  <label htmlFor='branchGuadalajara' className='cursor-pointer select-none'>
                     <input
                        id='branchGuadalajara'
                        name='branchGuadalajara'
                        type='checkbox'
                        className='check-input'
                        value='Guadalajara'
                        checked={data.includes('Guadalajara')}
                        onChange={onHandleChange}
                     />
                     Guadalajara
                  </label>
               </div>
               <details className={styles['details-custom']} open>
                  <summary>Bajío</summary>
                  <div className='text-sm 2xl:text-base'>
                     <label htmlFor='branchSLP' className='cursor-pointer select-none'>
                        <input
                           id='branchSLP'
                           name='branchSLP'
                           type='checkbox'
                           className='check-input'
                           value='SAN LUIS POTOSI'
                           checked={data.includes('SAN LUIS POTOSI')}
                           onChange={onHandleChange}
                        />
                        San Luis Potosí
                     </label>
                     <label htmlFor='branchAGU' className='cursor-pointer select-none'>
                        <input
                           id='branchAGU'
                           name='branchAGU'
                           type='checkbox'
                           className='check-input'
                           value='AGUASCALIENTES'
                           checked={data.includes('AGUASCALIENTES')}
                           onChange={onHandleChange}
                        />
                        Aguascalientes
                     </label>
                     <label htmlFor='branchQUE' className='cursor-pointer select-none'>
                        <input
                           id='branchQUE'
                           name='branchQUE'
                           type='checkbox'
                           className='check-input'
                           value='QUERETARO'
                           checked={data.includes('QUERETARO')}
                           onChange={onHandleChange}
                        />
                        Querétaro
                     </label>
                     <label htmlFor='branchLeon' className='cursor-pointer select-none'>
                        <input
                           id='branchLeon'
                           name='branchLeon'
                           type='checkbox'
                           className='check-input'
                           value='LEON'
                           checked={data.includes('LEON')}
                           onChange={onHandleChange}
                        />
                        León
                     </label>
                  </div>
               </details>
               <details className={styles['details-custom']} open>
                  <summary>Foráneas</summary>
                  <div className='text-sm 2xl:text-base'>
                     <label htmlFor='branchTijuana' className='cursor-pointer select-none'>
                        <input
                           id='branchTijuana'
                           name='branchTijuana'
                           type='checkbox'
                           className='check-input'
                           value='TIJUANA'
                           checked={data.includes('TIJUANA')}
                           onChange={onHandleChange}
                        />
                        Tijuana
                     </label>
                     <label htmlFor='branchCHH' className='cursor-pointer select-none'>
                        <input
                           id='branchCHH'
                           name='branchCHH'
                           type='checkbox'
                           className='check-input'
                           value='CHIHUAHUA'
                           checked={data.includes('CHIHUAHUA')}
                           onChange={onHandleChange}
                        />
                        Chihuahua
                     </label>
                     <label htmlFor='branchTorreo' className='cursor-pointer select-none'>
                        <input
                           id='branchTorreo'
                           name='branchTorreo'
                           type='checkbox'
                           className='check-input'
                           value='TORREON'
                           checked={data.includes('TORREON')}
                           onChange={onHandleChange}
                        />
                        Torreón
                     </label>
                     <label htmlFor='branchCancun' className='cursor-pointer select-none'>
                        <input
                           id='branchCancun'
                           name='branchCancun'
                           type='checkbox'
                           className='check-input'
                           value='CANCUN'
                           checked={data.includes('CANCUN')}
                           onChange={onHandleChange}
                        />
                        Cancún
                     </label>
                  </div>
               </details>
               <details className={styles['details-custom']} open>
                  <summary>Norte</summary>
                  <div className='text-sm 2xl:text-base'>
                     <label htmlFor='branchValle' className='cursor-pointer select-none'>
                        <input
                           id='branchValle'
                           name='branchValle'
                           type='checkbox'
                           className='check-input'
                           value='VALLE ORIENTE'
                           checked={data.includes('VALLE ORIENTE')}
                           onChange={onHandleChange}
                        />
                        Valle Oriente
                     </label>
                  </div>
               </details>
            </div>
         )}
      </div>
   );
};

FilterBranchOffice.propTypes = {
   data: PropTypes.array,
   onSet: PropTypes.func,
};
