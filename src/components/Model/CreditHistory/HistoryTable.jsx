import _ from 'lodash';
import React, { Fragment, useMemo } from 'react';

import { formatMiles, getUUIDArray } from '../../../helpers';
import clsx from 'clsx';

const EMPTY_HISTORY_CELLS = ['empty-one', 'empty-two', 'empty-three', 'empty-four', 'empty-five', 'empty-six'];

export default function HistoryTable({ historyReport }) {
   const history = useMemo(() => {
      if (_.isEmpty(historyReport)) {
         return null;
      }

      let periods = [1];
      let keys = getUUIDArray(6, 'month-history-');
      if (historyReport?.length > 6) {
         periods.push(2);
         keys = getUUIDArray(12, 'month-history-');
      }

      return {
         titles: historyReport?.map((hr) => hr.Fecha),
         periods,
         keys,
         data: historyReport,
      };
   }, [historyReport]);

   if (_.isEmpty(historyReport)) {
      return (
         <>
            <h4 className='w-full mt-4 mb-2 text-center'>Historia</h4>
            <div className='flex flex-col text-sm'>
               <div className='grid items-center w-full grid-cols-8 text-white bg-black rounded-t h-9'>
                  <div className='col-span-2'></div>
                  <div className='text-center capitalize'>-</div>
                  <div className='text-center capitalize'>-</div>
                  <div className='text-center capitalize'>-</div>
                  <div className='text-center capitalize'>-</div>
                  <div className='text-center capitalize'>-</div>
                  <div className='text-center capitalize'>-</div>
               </div>
               <div className='grid grid-cols-8 border border-gray'>
                  <div className='grid col-span-2 gap-2 py-2'>
                     <div className='px-2'>Vigencia</div>
                     <div className='px-2'>Vencido 1 a 29 días</div>
                     <div className='px-2'>Vencido 30 a 59 días</div>
                     <div className='px-2'>Vencido 89 días</div>
                     <div className='px-2'>Vencido a más de 89 días</div>
                     <div className='px-2'>Calificación de cartera</div>
                  </div>
                  {EMPTY_HISTORY_CELLS.map((item) => (
                     <div key={item} className='grid gap-2 py-2 text-center'>
                        <div className='px-2'>-</div>
                        <div className='px-2'>-</div>
                        <div className='px-2'>-</div>
                        <div className='px-2'>-</div>
                        <div className='px-2'>-</div>
                        <div className='px-2 text-xs'>-</div>
                     </div>
                  ))}
               </div>
            </div>
         </>
      );
   }

   return (
      <>
         <h4 className='w-full mt-4 mb-2 text-center'>Historia</h4>
         <div className='flex flex-col text-sm'>
            {history?.periods.map((hv, idx) => {
               let start = idx === 0 ? 0 : 6;
               let end = idx === 0 ? 6 : 12;
               let keysGridsForPeriod = [];
               return (
                  <Fragment key={'segment-' + hv}>
                     <div className={clsx('grid items-center w-full grid-cols-8 text-white bg-black h-9', {
                        'rounded-t': hv === 1
                     })}>
                        <div className='col-span-2' />
                        {history?.titles?.slice(start, end).map((title, idxT) => {
                           keysGridsForPeriod.push(title);
                           return (
                              <div key={history.keys[idxT]} className='text-center capitalize'>
                                 {title}
                              </div>
                           );
                        })}
                     </div>
                     <div className='grid grid-cols-8 border border-gray'>
                        <div className='grid col-span-2 gap-2 py-2'>
                           <div className='px-2'>Vigencia</div>
                           <div className='px-2'>Vencido 1 a 29 días</div>
                           <div className='px-2'>Vencido 30 a 59 días</div>
                           <div className='px-2'>Vencido 89 días</div>
                           <div className='px-2'>Vencido a más de 89 días</div>
                           <div className='px-2'>Calificación de cartera</div>
                        </div>
                        {history?.data?.slice(start, end).map((item, idx) => (
                           <div key={keysGridsForPeriod[idx]} className='grid gap-2 py-2 text-center'>
                              <div className='px-2'>{formatMiles({ monto: item['Vigente'] })}</div>
                              <div className='px-2'>{formatMiles({ monto: item['Vencido 1 a 29 días'] })}</div>
                              <div className='px-2'>{formatMiles({ monto: item['Vencido 30 a 59 días'] })}</div>
                              <div className='px-2'>{formatMiles({ monto: item['Vencido 89 días'] })}</div>
                              <div className='px-2'>{formatMiles({ monto: item['Vencido a más de 89 días'] })}</div>
                              <div className='px-2 text-xs'>{item['Calificación de cartera'] || '-'}</div>
                           </div>
                        ))}
                     </div>
                  </Fragment>
               );
            })}
         </div>
      </>
   );
}
