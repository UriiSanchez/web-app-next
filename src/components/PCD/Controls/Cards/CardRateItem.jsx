'use client';

import { formatId, getClassInput, onKeyNumbers, onPasteOnlyNumbers } from '../../../../helpers';
import { CustomPercentage } from '../../../Controls';

export function CardRateItem({ idx = 0, data = [], fnVirtual, isDisabled, isSave }) {
   return (
      <div className='px-4 pt-2 pb-5 border border-gray-400 rounded fadeIn'>
         <h3 className='font-bold'>Tasa&nbsp;{formatId(idx + 1, 2)}</h3>
         <div className='flex flex-wrap items-end mt-4 gap-x-4'>
            <label htmlFor={'rateType-' + idx} className='w-full mb-2 text-sm'>
               Fuente de información
            </label>
            <select
               id={'rateType-' + idx}
               data-testid={'rateType-' + idx}
               name={'rateType-' + idx}
               value={data?.[idx]?.rateType || ''}
               disabled={isDisabled}
               onChange={(e) => fnVirtual(e, idx)}
               className={`flex-auto p-1.5 h-9 text-sm input-form ${getClassInput(
                  data?.[idx]?.rateType,
                  isDisabled,
                  isSave
               )}`}>
               <option value=''>-Seleccionar-</option>
               <option value='variableRate'>Tasa variable</option>
               <option value='fixedRate'>Tasa fija</option>
            </select>
            <CustomPercentage
               id={'porcentage-' + idx}
               name={'porcentage-' + idx}
               type='number'
               min={0}
               max={100}
               placeholder='0'
               value={data?.[idx]?.porcentage || ''}
               disabled={isDisabled}
               onChange={(e) => fnVirtual(e, idx)}
               onPaste={onPasteOnlyNumbers}
               onKeyDown={onKeyNumbers}
               className='flex-auto w-full h-8 text-sm text-center rounded-l focus:outline-none focus:text-blue-800'
               sxContainer={getClassInput(data?.[idx]?.porcentage, isDisabled, isSave)}
            />
         </div>
      </div>
   );
}
