'use client';
import React from 'react';

import { CustomPercentage } from '../../../Controls';
import { crossingsListCP, formatId, getClassInput, onKeyNumbers, onPasteOnlyNumbers } from '../../../../helpers';

export function CardExchangeItem({ idx = 0, data = [], fnVirtual, isDisabled, isSave }) {
   return (
      <div className='px-4 pt-2 pb-5 border border-gray-400 rounded fadeIn'>
         <h3 className='font-bold'>Cruce&nbsp;{formatId(idx + 1, 2)}</h3>
         <div className='flex items-end gap-4 mt-4'>
            <div className='flex flex-col gap-2'>
               <label htmlFor={'cross-' + idx} className='text-sm'>
                  Cruce
               </label>
               <input
                  id={'cross-' + idx}
                  data-testid={'cross-' + idx}
                  name={'cross-' + idx}
                  type='search'
                  list={'listCross-' + idx}
                  placeholder='Ej. BRLJPY'
                  disabled={isDisabled}
                  value={data?.[idx]?.cross || ''}
                  onChange={(e) => fnVirtual(e, idx)}
                  className={`flex-auto w-full text-sm text-center h-9 input-form ${getClassInput(
                     data?.[idx]?.cross,
                     isDisabled,
                     isSave
                  )}`}
               />
               <datalist id={'listCross-' + idx} data-testid={'listCross-' + idx}>
                  {crossingsListCP.map((cros) => (
                     <option key={cros} name={cros} value={cros} />
                  ))}
               </datalist>
            </div>
            <CustomPercentage
               id={'porcentage-' + idx}
               name={'porcentage-' + idx}
               type='number'
               min={0}
               max={100}
               placeholder='0'
               maxLength={3}
               disabled={isDisabled}
               value={data?.[idx]?.porcentage || ''}
               onChange={(e) => fnVirtual(e, idx)}
               onPaste={onPasteOnlyNumbers}
               onKeyDown={onKeyNumbers}
               className='flex-auto w-full h-8 text-sm text-center outline-none focus:outline-none focus:text-blue-800'
               sxContainer={getClassInput(data?.[idx]?.porcentage, isDisabled, isSave)}
            />
         </div>
      </div>
   );
}
