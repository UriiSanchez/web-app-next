'use client';
import _ from 'lodash';
import React from 'react';

import { formatMiles, getUUIDArray } from '../../../helpers';

export default function IndividualLoans({ creditHistory }) {
   if (_.isEmpty(creditHistory)) {
      return (
         <>
            <h4 className='w-full mt-6 mb-4 text-center'>Créditos</h4>
            <div className='flex flex-col text-sm'>
               <div className='flex w-full'>
                  <div className='flex-none w-14'></div>
                  <div className='flex items-center justify-center flex-1 text-white bg-black rounded-tl h-9'>
                     Cuentas Abiertas
                  </div>
                  <div className='flex items-center justify-center flex-1 text-white bg-black rounded-tr h-9'>
                     Cuentas Cerradas
                  </div>
               </div>
               <div className='flex items-center justify-center text-center text-white bg-black rounded-tl w-ful h-9'>
                  <div className='flex items-center flex-auto text-xs'>
                     <div className='flex-none w-14'>MOP</div>
                     <div className='w-1/6'>Cuentas Abierta</div>
                     <div className='w-1/6'>Límite Abiertas</div>
                     <div className='w-1/6'>Máximo Abiertas</div>
                     <div className='w-1/6'>Saldo Actual Abiertas</div>
                     <div className='w-1/6'>Saldo Vencido Abiertas</div>
                     <div className='w-1/6'>Pago a Realizar</div>
                  </div>
                  <div className='flex items-center flex-none w-5/12 text-xs'>
                     <div className='w-2/6'>Cuentas Cerradas</div>
                     <div className='w-1/6'>Límite Cerradas</div>
                     <div className='w-1/6'>Máximo Cerradas</div>
                     <div className='w-1/6'>Saldo Actual Cerradas</div>
                     <div className='w-1/6'>Monto Cerradas</div>
                  </div>
               </div>

               <div className='flex items-center justify-center border rounded-b border-gray'>
                  <div className='flex flex-col flex-none gap-4 py-2 text-center border-r w-14 border-gray'>
                     <div>-</div>
                     <div>Total</div>
                  </div>
                  <div className='flex flex-col flex-1 gap-4 py-2 text-center border-r border-gray'>
                     <div className='flex w-full'>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                     </div>
                     <div className='flex w-full'>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                     </div>
                  </div>
                  <div className='flex flex-col flex-1 gap-4 py-2 text-center'>
                     <div className='flex w-full'>
                        <div className='w-2/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                     </div>
                     <div className='flex w-full'>
                        <div className='w-2/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                        <div className='w-1/6'>-</div>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }

   let keyOpenAccounts = getUUIDArray(creditHistory[0]?.CuentasAbiertas.length, 'OpenAccount-');
   let keyCloseAccounts = getUUIDArray(creditHistory[0]?.CuentasCerradas.length, 'CloseAccount-');
   return (
      <>
         <h4 className='w-full mt-6 mb-4 text-center'>Créditos</h4>
         <div className='flex flex-col text-sm'>
            <div className='flex w-full'>
               <div className='flex-none w-14'></div>
               <div className='flex items-center justify-center flex-1 text-white bg-black rounded-tl h-9'>
                  Cuentas Abiertas
               </div>
               <div className='flex items-center justify-center flex-1 text-white bg-black rounded-tr h-9'>
                  Cuentas Cerradas
               </div>
            </div>
            <div className='flex items-center justify-center text-center text-white bg-black rounded-tl w-ful h-9'>
               <div className='flex items-center flex-auto text-xs'>
                  <div className='flex-none w-14'>MOP</div>
                  <div className='w-1/6'>Cuentas Abierta</div>
                  <div className='w-1/6'>Límite Abiertas</div>
                  <div className='w-1/6'>Máximo Abiertas</div>
                  <div className='w-1/6'>Saldo Actual Abiertas</div>
                  <div className='w-1/6'>Saldo Vencido Abiertas</div>
                  <div className='w-1/6'>Pago a Realizar</div>
               </div>
               <div className='flex items-center flex-none w-5/12 text-xs'>
                  <div className='w-2/6'>Cuentas Cerradas</div>
                  <div className='w-1/6'>Límite Cerradas</div>
                  <div className='w-1/6'>Máximo Cerradas</div>
                  <div className='w-1/6'>Saldo Actual Cerradas</div>
                  <div className='w-1/6'>Monto Cerradas</div>
               </div>
            </div>

            <div className='flex items-center justify-center border rounded-b border-gray'>
               <div className='flex flex-col flex-auto'>
                  {creditHistory[0]?.CuentasAbiertas?.map((ca, idxCA) => {
                     return (
                        <div key={keyOpenAccounts[idxCA]} className='flex text-center'>
                           <div className='flex-none py-2 border-r w-14 border-gray'>{ca.mop || ''}</div>
                           <div className='flex flex-1 py-2 border-r border-gray'>
                              <div className='w-1/6'>
                                 {formatMiles({ monto: ca?.cuentasabiertas, inThousands: true })}
                              </div>
                              <div className='w-1/6'>
                                 {formatMiles({ monto: ca?.limiteabiertas, inThousands: true })}
                              </div>
                              <div className='w-1/6'>
                                 {formatMiles({ monto: ca?.maximoabiertos, inThousands: true })}
                              </div>
                              <div className='w-1/6'>
                                 {formatMiles({ monto: ca?.saldoactualabiertas, inThousands: true })}
                              </div>
                              <div className='w-1/6'>
                                 {formatMiles({ monto: ca?.saldovencidoabiertas, inThousands: true })}
                              </div>
                              <div className='w-1/6'>
                                 {formatMiles({ monto: ca?.pagoarealizar, inThousands: true })}
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
               <div className='flex flex-col flex-none w-5/12'>
                  {creditHistory[0]?.CuentasCerradas?.map((cc, idxCC) => {
                     return (
                        <div key={keyCloseAccounts[idxCC]} className='flex w-full py-2 text-center'>
                           <div className='w-2/6'>{cc?.cuentascerradas || '-'}</div>
                           <div className='w-1/6'>{formatMiles({ monto: cc?.limitescerradas, inThousands: true })}</div>
                           <div className='w-1/6'>{formatMiles({ monto: cc?.maximocerradas, inThousands: true })}</div>
                           <div className='w-1/6'>
                              {formatMiles({ monto: cc?.saldoactualcerradas, inThousands: true })}
                           </div>
                           <div className='w-1/6'>{formatMiles({ monto: cc?.montocerradas, inThousands: true })}</div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </>
   );
}
