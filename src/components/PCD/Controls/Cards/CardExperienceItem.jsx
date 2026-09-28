'use client';
import { formatId, getClassInput } from '../../../../helpers';

export function CardExperienceItem({ idx = 0, data = [], fnVirtual, isDisabled, isSave }) {
   return (
      <div className='px-4 pt-2 pb-5 border rounded border-gray fadeIn'>
         <h3 className='font-bold'>Institución Financiera&nbsp;{formatId(idx + 1, 2)}</h3>
         <div className='flex flex-col items-end gap-4 mt-4'>
            <div className='flex flex-col w-full gap-2'>
               <label htmlFor={'counterpart-' + idx} className='text-sm'>
                  Contraparte
               </label>
               <select
                  id={'counterpart-' + idx}
                  name={'counterpart-' + idx}
                  value={data?.[idx]?.counterpart || ''}
                  disabled={isDisabled}
                  onChange={(e) => fnVirtual(e, idx)}
                  className={`w-full p-1.5 text-sm cursor-pointer input-form ${getClassInput(
                     data?.[idx]?.counterpart,
                     isDisabled,
                     isSave
                  )}`}>
                  <option value=''>Selecciona</option>
                  <option value='monex'>Monex</option>
                  <option value='intercam'>Intercam</option>
                  <option value='cibanco'>CI Banco</option>
                  <option value='invex'>Invex</option>
                  <option value='bbva'>BBVA</option>
                  <option value='banco Base'>Banco BASE</option>
                  <option value='otros'>Otros</option>
               </select>
            </div>
            <div className='flex flex-col w-full gap-2'>
               <label htmlFor={'condition-' + idx} className='text-sm'>
                  Condición
               </label>
               <select
                  id={'condition-' + idx}
                  name={'condition-' + idx}
                  value={data?.[idx]?.condition || ''}
                  disabled={isDisabled}
                  onChange={(e) => fnVirtual(e, idx)}
                  className={`w-full p-1.5 text-sm cursor-pointer input-form ${getClassInput(
                     data?.[idx]?.condition,
                     isDisabled,
                     isSave
                  )}`}>
                  <option value=''>Selecciona</option>
                  <option value='lane'>Línea</option>
                  <option value='collateral'>Colaterales</option>
               </select>
            </div>
         </div>
      </div>
   );
}
