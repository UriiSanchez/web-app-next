import { formatId, getClassInput } from '../../../../helpers';

export function CardVisitorsItem({ idx = 0, data = [], fnVirtual, isDisabled, isSave }) {
   return (
      <div className='px-4 pt-2 pb-5 border rounded border-gray fadeIn'>
         <h3 className='font-bold'>Visitante&nbsp;{formatId(idx + 1, 2)}</h3>
         <div className='flex flex-col gap-4 mt-4'>
            <div className='flex flex-col gap-2'>
               <label htmlFor={'visitorName-' + idx} className='text-sm'>
                  Nombre
               </label>
               <input
                  id={'visitorName-' + idx}
                  name={'visitorName-' + idx}
                  data-testid={'visitorName-' + idx}
                  type='text'
                  maxLength={100}
                  value={data[idx]?.visitorName || ''}
                  disabled={isDisabled}
                  onChange={(e) => fnVirtual(e, idx)}
                  className={`flex-auto w-full px-2 text-sm h-9 input-form ${getClassInput(
                     data[idx]?.visitorName,
                     isDisabled,
                     isSave
                  )}`}
                  placeholder='Escribe aquí...'
               />
            </div>
            <div className='flex flex-col gap-2'>
               <label htmlFor={'visitorPosition-' + idx} className='text-sm'>
                  Puesto
               </label>
               <input
                  id={'visitorPosition-' + idx}
                  name={'visitorPosition-' + idx}
                  data-testid={'visitorPosition-' + idx}
                  type='text'
                  maxLength={100}
                  disabled={isDisabled}
                  value={data[idx]?.visitorPosition || ''}
                  onChange={(e) => fnVirtual(e, idx)}
                  className={`flex-auto w-full px-2 text-sm h-9 input-form ${getClassInput(
                     data[idx]?.visitorPosition,
                     isDisabled,
                     isSave
                  )}`}
                  placeholder='Escribe aquí...'
               />
            </div>
         </div>
      </div>
   );
}
