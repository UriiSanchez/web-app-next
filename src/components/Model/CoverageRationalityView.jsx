'use client';
import _ from 'lodash';
import React, { useMemo } from 'react';

import { formatMiles, formatNumber, termsSwap } from '../../helpers';

const typeSourceCredit = {
   base: 'Propio, de Banco Base',
   other: 'De otro banco',
};

export const CoverageRationalityView = ({ data, dateElaboration, resume }) => {
   const congruenceValues = useMemo(() => {
      if (!_.isEmpty(data)) {
         let congruenceLine = termsSwap?.congrounceLine[data?.rateCalculator?.congruenceCalculator];
         let validationCongruence = termsSwap?.congruenceValidation[data?.congruenceCreditors];
         return { congruenceLine, validationCongruence };
      }
   }, [data]);

   return (
      <section className='flex flex-col h-auto px-8'>
         <div className='flex flex-wrap gap-1'>
            <h2 className='flex-auto text-xl font-semibold text-black-900'>Razonabilidad de cobertura</h2>
            <div className='flex items-center justify-end gap-2 text-sm basis-1/3'>
               <p className='text-right basis-2/3'>Fecha elaboración: </p>
               <div className='w-32 h-8 py-0.5 flex items-center justify-center border border-gray rounded bg-gray-200 text-gray-600'>
                  {dateElaboration || ''}
               </div>
            </div>
            <h4 className='w-full text-sm text-gray-400'>Cifras en miles de pesos </h4>
         </div>
         <h4 className='w-full text-center'>Tipo de Tasa</h4>
         <div className='flex w-full gap-4 my-4'>
            <div className='flex flex-col w-full text-sm gap-x-4'>
               <div className='border rounded-r rounded-tl border-gray'>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>
                        El crédito a cubrir ¿Qué origen tiene?
                     </div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {typeSourceCredit[data?.sourcerOfCredit] || '-'}
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Monto del crédito a cubrir?</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {formatMiles({ monto: data?.rateCalculator?.amountOfCredit, withSign: true })}
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Saldo en MN</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>${data?.balanceMxn || '-'}</div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Plazo del crédito</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.rateCalculator?.creditTermValue || '0'}
                     </div>
                     <div className='pl-1'>{termsSwap[data?.rateCalculator?.creditTermType] || '-'}</div>
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>
                        Estilo de amortización del crédito
                     </div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {termsSwap[data?.rateCalculator?.amortizationStyle] || '-'}
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Dirección de la cobertura</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {termsSwap[data?.rateCalculator?.coverageType] || '-'}
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>
                        PV01 (DV01) proporcionado por la MESA
                     </div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {formatMiles({ monto: data?.rateCalculator?.tableDerivaties, withSign: true })}
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Puntos (PV01) a cubrir</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.rateCalculator?.pointsToCover || '-'}
                     </div>
                     <div className='pl-1'>Puntos básicos</div>
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Tasa SWAP cotizada</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {data?.rateCalculator?.swapRate || '-'}%
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Línea teórica</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {formatMiles({ monto: data?.rateCalculator?.theoreticalLine, withSign: true })}
                     </div>
                     <div />
                  </div>
                  <div className='grid items-center justify-center grid-cols-6 border-b border-gray'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Monto de línea solicitado</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {formatMiles({ monto: data?.rateCalculator?.requestedLineAmount, withSign: true })}
                     </div>
                     <div className='pl-1'>Pesos</div>
                  </div>
                  <div className='grid items-center justify-center grid-cols-6'>
                     <div className='col-span-3 p-2 text-left border-r border-gray'>Suficiencia</div>
                     <div className='col-span-2 p-2 text-center border-r border-gray'>
                        {formatNumber(data?.rateCalculator.sufficiency, 2)}
                     </div>
                     <div />
                  </div>
               </div>
               <div className='grid items-center justify-center grid-cols-6 mt-4'>
                  <div className='col-span-3 p-2 text-left border border-gray'>Validación de congruencia</div>
                  <div
                     className={`col-span-2 p-2 text-center bg-${
                        congruenceValues?.congruenceLine?.color || 'gray border-b border-gray'
                     }`}>
                     {congruenceValues?.congruenceLine?.title || '-'}
                  </div>
                  <div />
               </div>
               <div className='grid items-center justify-center grid-cols-6 '>
                  <div className='col-span-3 p-2 text-left border-b rounded-bl border-x border-gray'>
                     Congruencia de línea
                  </div>
                  <div
                     className={`col-span-2 p-2 text-center bg-${
                        congruenceValues?.validationCongruence?.color || 'gray border-t border-gray'
                     }`}>
                     {congruenceValues?.validationCongruence?.title || '-'}
                  </div>
                  <div />
               </div>
            </div>
            <div className='items-center justify-between w-4/6 text-center border rounded-md h-fit border-gray'>
               <div className='p-2 pt-4 text-base text-center bg-gray-light'>
                  Calificación Razonabilidad de Cobertura
               </div>
               <div className='p-2 pb-4 text-xl text-center bg-gray-light'>
                  {congruenceValues?.validationCongruence?.title || '-'}
               </div>
               <div className='p-2 text-base '>Calificación Ponderada</div>
               <div className='text-3xl'>{resume?.weightedRating || '-/10'}</div>
               <div className='p-2 pb-4text-base '>{resume?.compositeWeightedRating || '-/3.5'}</div>
            </div>
         </div>
      </section>
   );
};
