'use client';
import React from 'react';
import { formatMoney, formatNumber } from '../../helpers';

export const RateExchangeView = ({ data, dateElaboration, resume }) => {
   return (
      <section className='flex flex-col h-auto gap-4 px-8'>
         <div className='flex flex-wrap gap-1'>
            <h2 className='flex-auto text-xl font-semibold text-black-900'>Tipo de Cambio</h2>
            <div className='flex items-center justify-end gap-2 text-sm basis-1/3'>
               <p className='text-right basis-2/3'>Fecha elaboración: </p>
               <div className='w-32 h-8 py-0.5 flex items-center justify-center border border-gray rounded bg-gray-200 text-gray-600'>
                  {dateElaboration || '-'}
               </div>
            </div>
            <h4 className='w-full text-sm text-gray-400'>Cifras en miles de pesos </h4>
         </div>
         <h4 className='w-full text-center'>Tipo de cambio</h4>
         <div className='flex w-full gap-4 mb-8'>
            <div className='flex flex-col w-full gap-2 text-sm'>
               <div className='border rounded-t border-gray'>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Posición del Cliente</div>
                     <div className='col-span-2 p-2 text-center bg-gray-200 border-r border-gray'>
                        {data?.customerPosition || '-'}
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>
                        Costo de Ventas Último Ejercicio Anual
                     </div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.salesForLastFiscalYear ? formatMoney(data?.salesForLastFiscalYear) : '-'}
                     </div>
                     <div className='pl-2'>MXN</div>
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>
                        Porcentaje en Moneda Extranjera (%)
                     </div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.percentageInForeignCurrency || '-'}%
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6'>
                     <div className='col-span-3 p-2 text-left bg-orange-100 border-r border-gray'>
                        Flujo de ME Actualizado
                     </div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.foreignCurrencyFlow ? formatMoney(data?.foreignCurrencyFlow) : '-'}
                     </div>
                     <div className='pl-2'>USD</div>
                  </div>
               </div>
               <div className='border border-gray'>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>
                        Política de cobertura (% máximo)
                     </div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.coveragePolicy || '-'}%
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6'>
                     <div className='col-span-3 p-2 text-left bg-orange-100 border-r border-gray'>
                        Posición acumulada estimada anual
                     </div>
                     <div className='col-span-2 p-2 text-center bg-gray-200 border-r border-gray'>
                        {data?.estimatedCumulativePosition ? formatMoney(data?.estimatedCumulativePosition) : '-'}
                     </div>
                     <div className='pl-2'>USD</div>
                  </div>
               </div>
               <div className='border border-gray'>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Monto promedio por operación</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.averageTransactionAmount ? formatMoney(data?.averageTransactionAmount) : '-'}
                     </div>
                     <div className='pl-2'>USD</div>
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Revolvencia estimada</div>
                     <div className='col-span-2 p-2 text-center capitalize border-r border-gray'>
                        {data?.estimatedRevolving || '-'}
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Plazo Máximo de cobertura</div>
                     <div className='col-span-2 p-2 text-center capitalize border-r border-gray'>
                        {data?.maximumCoverageTermInMonths || '-'}
                     </div>{' '}
                     <div className='pl-2'>Meses</div>
                  </div>
               </div>
               <div className='border border-gray'>
                  <div className='grid items-center justify-center grid-cols-6'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>
                        Nocional (Máxima Posición Anual)
                     </div>
                     <div className='col-span-2 p-2 text-center capitalize bg-gray-200 border-r border-gray'>
                        {data?.mpa ? formatMoney(data?.mpa) : '-'}
                     </div>
                     <div />
                  </div>
               </div>
               <div className='border border-gray'>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>
                        Validación de Congruencia Anual
                     </div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.annualConsistencyValidation.value
                           ? formatMoney(data?.annualConsistencyValidation.value)
                           : '-'}
                     </div>
                     <div className={`p-2 text-white text-sm ${data?.annualConsistencyValidation.color || ''}`}>
                        {data?.annualConsistencyValidation.title || ''}
                     </div>
                  </div>
                  <div className='grid items-center justify-center grid-cols-6'>
                     <div className='col-span-3 p-2 text-left bg-orange-100 border-r border-gray'>
                        Índice de Cobertura (%)
                     </div>
                     <div className='col-span-2 p-2 text-center bg-gray-200 border-r border-gray'>
                        {data?.coverageIndex ? formatNumber(data?.coverageIndex, 2) : '-'}
                     </div>
                     <div />
                  </div>
               </div>
               <div className='border rounded-b border-gray'>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Spread de línea solicitado</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.spread ? formatMoney(data?.spread, 2) : '-'}
                     </div>
                     <div className='pl-2'>Peso por dólar</div>
                  </div>
                  <div className='grid items-center justify-center grid-cols-6'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Monto equivalente</div>
                     <div className='col-span-2 p-2 text-center bg-gray-200 border-r border-gray'>
                        {data?.estimatedLine ? formatMoney(data?.estimatedLine, 2) : '-'}
                     </div>
                     <div />
                  </div>
               </div>
            </div>
            <div className='items-center justify-between w-4/6 text-center border rounded-md h-fit border-gray'>
               <div className='p-2 pt-4 text-base text-center bg-gray-light'>
                  Calificación Razonabilidad de Cobertura
               </div>
               <div className='p-2 pb-4 text-xl text-center bg-gray-light'>
                  {data?.annualConsistencyValidation.title || ''}
               </div>
               <div className='p-2 text-base '>Calificación Ponderada</div>
               <div className='text-3xl'>{resume?.weightedRating || '-/10'}</div>
               <div className='p-2 pb-4text-base '>{resume?.compositeWeightedRating || '-/3.5'}</div>
            </div>
         </div>
      </section>
   );
}
