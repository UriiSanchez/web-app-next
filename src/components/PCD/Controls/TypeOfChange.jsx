import _ from 'lodash';
import { useMemo } from 'react';
import Image from 'next/image';

import { useGlobalContext } from '../../../hooks';
import { formatMoney } from '../../../helpers';

import flag_combine from '../../../../public/flags/flag_combine.png';

export const TypeOfChange = () => {
   const { general } = useGlobalContext();
   const showMessage = useMemo(() => general?.DOLLAR == '0' || _.isEmpty(general?.DOLLAR), [general?.DOLLAR]);

   return (
      <div className='flex flex-wrap gap-y-1 gap-x-4'>
         <h2 className='flex-auto text-xl font-semibold text-black-light'>Calculadora de Parámetros de Operación</h2>
         <h4 className='w-full text-sm text-gray-500'>Calcula según el tipo de subyacente ya seleccionado </h4>
         <div className='w-3/12 mt-6'>
            <p className='text-gray-500'>Cifras </p>
            <div className='flex items-center justify-start w-full px-4 text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
               Miles
            </div>
         </div>
         <div className='w-3/12 mt-6'>
            <p className='text-gray-500 '>Tipo de cambio</p>
            <div
               className={`w-full h-9 flex items-center justify-center border border-${
                  showMessage ? 'red-500' : 'gray-400'
               } rounded bg-gray-100 text-gray-600`}>
               <span className='flex-auto px-4'>{formatMoney(general?.DOLLAR || 0, 2)}</span>
               <div className='flex flex-col items-center justify-center flex-none w-10 h-8 border-l border-gray-400'>
                  <Image className='w-2/3' src={flag_combine} alt='Bandera de México' />
               </div>
            </div>
            {showMessage && <span className='text-xs text-red-500'>Valor del tipo de cambio, no valido</span>}
         </div>
      </div>
   );
};
