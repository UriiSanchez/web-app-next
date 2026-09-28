'use client';
import _ from 'lodash';
import React, { Fragment, useMemo } from 'react';
import { formatMiles, formatNumber } from '../../helpers';

export const FinancialReasonsView = ({ data, dateElaboration }) => {
   const info = useMemo(() => {
      if (!_.isEmpty(data)) {
         let calculationValue = Object.entries(data['Valor del Calculo']) || [];
         let rating = Object.entries(data?.Calificacion) || [];
         let weightedRating = Object.entries(data['Calificacion Ponderada']) || [];
         let overallRating = data['Calificaciones globales'] || {};
         return { calculationValue, rating, weightedRating, overallRating };
      }
   }, [data]);

   return (
      <section className='flex flex-col h-auto gap-4 px-8'>
         <div className='flex flex-wrap gap-1'>
            <h2 className='flex-auto text-xl font-semibold text-black-900'>Razones financieras</h2>
            <div className='flex items-center justify-end gap-2 text-sm basis-1/3'>
               <p className='text-right basis-2/3'>Fecha elaboración: </p>
               <div className='w-32 h-8 py-0.5 flex items-center justify-center border border-gray rounded bg-gray-200 text-gray-600'>
                  {dateElaboration || ''}
               </div>
            </div>
            <h4 className='w-full text-sm text-gray-400'>Cifras en miles de pesos </h4>
         </div>
         <div className='flex flex-col my-4'>
            <div className='grid items-center w-full grid-cols-11 text-center text-white bg-black rounded-t h-9'>
               <div className='col-span-5'></div>
               <div className='col-span-2'>Valor de cálculo</div>
               <div className='col-span-2'>Calificación</div>
               <div className='col-span-2'>Calificación Ponderada</div>
            </div>
            <div className='grid w-full grid-cols-11'>
               <div className='flex flex-col col-span-4'>
                  <div className='w-full h-9'></div>
                  <div className='flex items-center px-2 border-t border-b border-l rounded-tl h-9 border-gray'>
                     <p className='w-1/2'>Liquidez</p>
                     <p className='w-1/2'>Ácido</p>
                  </div>
                  <div className='flex px-2 border-l border-gray'>
                     <div className='w-1/2 h-9'>Deuda</div>
                     <div className='flex flex-col w-1/2'>
                        <p className='h-9'>Apalancamiento</p>
                        <p className='h-9'>Cobertura de Intereses</p>
                        <p className='h-9'>Horizonte de deudas</p>
                     </div>
                  </div>
                  <div className='flex items-center px-2 border-l rounded-bl border-y h-9 border-gray'>
                     <p className='w-1/2'>Capacidad de pago</p>
                     <p className='w-1/2'>Capacidad de pago</p>
                  </div>
               </div>
               <div className='flex flex-col col-span-1 text-sm border-x border-gray'>
                  <div className='flex items-center justify-center w-full bg-gray-200 h-9'>Pond</div>
                  <div className='flex items-center justify-center px-2 h-9 border-y border-gray'>35%</div>
                  <div className='flex items-center justify-center px-2 h-9'>10%</div>
                  <div className='flex items-center justify-center px-2 h-9 border-y border-gray'>10%</div>
                  <div className='flex items-center justify-center px-2 h-9'>10%</div>
                  <div className='flex items-center justify-center px-2 border-y h-9 border-gray'>35%</div>
               </div>
               <div className='flex col-span-2 text-sm'>
                  {info?.calculationValue?.map(([title, item]) => {
                     return (
                        <Fragment key={'valor-' + title}>
                           <div className='flex flex-col w-1/3'>
                              <div className='flex items-center justify-center w-full capitalize bg-gray-200 h-9 border-gray'>
                                 {title || '-'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {item?.acido || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 h-9 '>
                                 {item?.apalancamiento || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {item['cobertura intereses'] || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 h-9 '>
                                 {item['horizonte deuda'] || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {formatMiles({ monto: item['capacidad pago'] })}
                              </div>
                           </div>
                        </Fragment>
                     );
                  })}
               </div>
               <div className='flex col-span-2 text-sm border-x border-gray'>
                  {info?.rating?.map(([title, item]) => {
                     return (
                        <Fragment key={'valor-' + title}>
                           <div className='flex flex-col w-1/3'>
                              <div className='flex items-center justify-center w-full capitalize bg-gray-200 h-9 border-gray'>
                                 {title || '-'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {item?.acido || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 h-9 '>
                                 {item?.apalancamiento || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {item['cobertura intereses'] || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 h-9'>
                                 {item['horizonte deuda'] || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {item['capacidad pago'] || '0'}
                              </div>
                           </div>
                        </Fragment>
                     );
                  })}
               </div>
               <div className='flex col-span-2 text-sm border-r border-gray'>
                  {info?.weightedRating?.map(([title, item]) => {
                     return (
                        <Fragment key={'valor-' + title}>
                           <div className='flex flex-col w-1/3'>
                              <div className='flex items-center justify-center w-full capitalize bg-gray-200 h-9 border-gray'>
                                 {title || '-'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {item?.acido || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 h-9 '>
                                 {item?.apalancamiento || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {item['cobertura intereses'] || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 h-9'>
                                 {item['horizonte deuda'] || '0'}
                              </div>
                              <div className='flex items-center justify-end w-full px-2 border-y h-9 border-gray'>
                                 {item['capacidad pago'] || '0'}
                              </div>
                           </div>
                        </Fragment>
                     );
                  })}
               </div>
            </div>
            <div className='grid w-full grid-cols-11'>
               <div className='flex flex-col w-full col-span-4'>
                  <div className='flex items-center w-full h-9'>
                     <div className='w-1/2'></div>
                     <div className='flex items-center justify-center w-1/2 bg-gray-200 h-9'>Total/Calificación</div>
                  </div>
                  <div className='w-full h-9'></div>
               </div>
               <div className='flex flex-col items-center col-span-1 text-sm'>
                  <div className='flex items-center h-9'>100%</div>
                  <div className='h-9'></div>
               </div>
               <div className='flex col-span-2 text-sm'></div>
               <div className='flex flex-col col-span-2 text-sm'>
                  <div className='h-9'></div>
                  <div className='flex items-center justify-end w-full px-2 bg-gray-200 h-9'>
                     Calificación global (40%)
                  </div>
               </div>
               <div className='flex flex-col col-span-2 text-sm'>
                  <div className='flex items-center w-full px-2 h-9 border-gray'>
                     <div className='flex justify-end w-1/3 px-2'>
                        {info?.overallRating['Calificación Total UNO']
                           ? formatNumber(info?.overallRating['Calificación Total UNO'])
                           : '-'}
                     </div>
                     <div className='flex justify-end w-1/3 px-2'>
                        {info?.overallRating['Calificación Total DOS']
                           ? formatNumber(info?.overallRating['Calificación Total DOS'])
                           : '-'}
                     </div>
                     <div className='flex justify-end w-1/3 px-2'>
                        {info?.overallRating['Calificación Total PARCIAL']
                           ? formatNumber(info?.overallRating['Calificación Total PARCIAL'])
                           : '-'}
                     </div>
                  </div>
                  <div className='flex items-center w-full px-2 h-9 border-gray'>
                     <div className='flex justify-end w-1/3 px-2'>
                        {info?.overallRating['Calificación global UNO']
                           ? formatNumber(info?.overallRating['Calificación global UNO'])
                           : '-'}
                     </div>
                     <div className='flex justify-end w-1/3 px-2'>
                        {info?.overallRating['Calificación global DOS']
                           ? formatNumber(info?.overallRating['Calificación global DOS'])
                           : '-'}
                     </div>
                     <div className='flex justify-end w-1/3 px-2'>
                        {info?.overallRating['Calificación global PARCIAL']
                           ? formatNumber(info?.overallRating['Calificación global PARCIAL'])
                           : '-'}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
}
