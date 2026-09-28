import _ from 'lodash';
import React, { Fragment } from 'react';

import { formatMiles } from '../../../helpers';

export default function ActiveCredits({ creditHistory, creditHistoryTotal }) {
   if (_.isEmpty(creditHistory)) {
      return (
         <>
            <h4 className='w-full mt-6 mb-2 text-center'>Créditos Activos</h4>
            <div className='flex flex-col text-sm'>
               <div className='grid items-center w-full grid-cols-12 text-center text-white bg-black rounded-t h-9'>
                  <div className='col-span-2 px-2 text-left'>Tipo de Otorgante</div>
                  <div className='col-span-2 px-2 text-left'>Tipo de Crédito</div>
                  <div>Original</div>
                  <div>Saldo Actual</div>
                  <div>Vigente</div>
                  <div>1-29 días</div>
                  <div>30-59 días</div>
                  <div>60-89 días</div>
                  <div>90-119 días</div>
                  <div>180+ días</div>
               </div>
               <div className='grid grid-cols-12 p-2 text-center border border-gray rounded-b'>
                  <div className='col-span-2 text-left'>-</div>
                  <div className='col-span-2 text-left'>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
                  <div>-</div>
               </div>
            </div>
            <div className="grid grid-cols-12 px-2 text-sm text-center">
               <div className="col-span-2"></div>
               <div className="col-span-2 px-2 py-1 text-right bg-gray-200">Total</div>
               <div>0</div>
               <div>0</div>
               <div>0</div>
               <div>0</div>
               <div>0</div>
               <div>0</div>
               <div>0</div>
               <div>0</div>
            </div>
         </>
      );
   }

   return (
      <>
         <h4 className='w-full mt-6 mb-2 text-center'>Créditos Activos</h4>
         <div className='flex flex-col text-sm'>
            <div className='grid items-center w-full grid-cols-12 text-center text-white bg-black rounded-t h-9'>
               <div className='col-span-2 px-2 text-left'>Tipo de Otorgante</div>
               <div className='col-span-2 px-2 text-left'>Tipo de Crédito</div>
               <div>Original</div>
               <div>Saldo Actual</div>
               <div>Vigente</div>
               <div>1-29 días</div>
               <div>30-59 días</div>
               <div>60-89 días</div>
               <div>90-119 días</div>
               <div>180+ días</div>
            </div>
            <div className='grid grid-cols-12 p-2 text-center border border-gray rounded-b'>
               {creditHistory?.map((ch) => {
                  let keyItem = ch['Tipo Otorgante'] + ch['Tipo de Crédito'];
                  return (
                     <Fragment key={'credit-' + keyItem}>
                        <div className='col-span-2 text-left'>{ch['Tipo Otorgante'] || '-'}</div>
                        <div className='col-span-2 text-left'>{ch['Tipo de Crédito'] || '-'}</div>
                        <div>{formatMiles({ monto: ch['original'] })}</div>
                        <div>{formatMiles({ monto: ch['Saldo Actual'] })}</div>
                        <div>{formatMiles({ monto: ch['Vigente'] })}</div>
                        <div>{formatMiles({ monto: ch['1-29 dias'] })}</div>
                        <div>{formatMiles({ monto: ch['30-59dias'] })}</div>
                        <div>{formatMiles({ monto: ch['60-89dias'] })}</div>
                        <div>{formatMiles({ monto: ch['90-119dias'] })}</div>
                        <div>{formatMiles({ monto: ch['180+ dias '] })}</div>
                     </Fragment>
                  );
               })}
            </div>
         </div>
         <div className='grid grid-cols-12 px-2 text-sm text-center'>
            <div className='col-span-2'></div>
            <div className='col-span-2 px-2 py-1 text-right bg-gray-200'>Total</div>
            <div>{formatMiles({ monto: creditHistoryTotal['original'] })}</div>
            <div>{formatMiles({ monto: creditHistoryTotal['Saldo Actual'] })}</div>
            <div>{formatMiles({ monto: creditHistoryTotal['Vigente'] })}</div>
            <div>{formatMiles({ monto: creditHistoryTotal['1-29 dias'] })}</div>
            <div>{formatMiles({ monto: creditHistoryTotal['30-59dias'] })}</div>
            <div>{formatMiles({ monto: creditHistoryTotal['60-89dias'] })}</div>
            <div>{formatMiles({ monto: creditHistoryTotal['90-119dias'] })}</div>
            <div>{formatMiles({ monto: creditHistoryTotal['180+ dias '] })}</div>
         </div>
      </>
   );
}
