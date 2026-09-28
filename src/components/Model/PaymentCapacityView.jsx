'use client';
import _ from 'lodash';
import React, { useMemo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

import { configPaymenCapacity, formatMiles, getUUIDArray } from '../../helpers';

const HORIZONTE_DEUDA_KEY = 'Horizonte de deuda';
const ALERT_L32 = 'AL32';

export const PaymentCapacityView = ({ data, dateElaboration, fnContext }) => {
   let existAlertL32 = useMemo(() => {
      return data?.alertsPayment?.some((ap) => ap.id === ALERT_L32);
   }, [data?.alertsPayment]);

   const keysPassiveRows = getUUIDArray(data?.tablePassive?.length, 'passive-row-');

   const calibrationModel = (key, value, isPorcentage) => {
      if (key === HORIZONTE_DEUDA_KEY && !_.isNaN(value) && value < 0) {
         return 'Negativo';
      }

      return isPorcentage ? value + '%' : formatMiles({ monto: value });
   };

   return (
      <section className='flex flex-col h-auto gap-4 px-8 mb-4'>
         <div className='flex flex-wrap gap-1'>
            <h2 className='flex-auto text-xl font-semibold text-black-900'>Capacidad de Pago</h2>
            <div className='flex items-center justify-end gap-2 text-sm basis-1/3'>
               <p className='text-right basis-2/3'>Fecha elaboración: </p>
               <div className='w-32 h-8 py-0.5 flex items-center justify-center border border-gray rounded bg-gray-200 text-gray-600'>
                  {dateElaboration || ''}
               </div>
            </div>
            <h4 className='w-full text-sm text-gray-400'>Cifras en miles de pesos </h4>
         </div>
         <h4 className='w-full text-center'>Escenarios de capacidad de pago</h4>
         <div className='flex w-full text-sm'>
            <div className='w-9/12'>
               <div className='grid grid-cols-6'>
                  <div className='col-span-2' />
                  <div className='col-span-4 grid grid-cols-4 items-center text-center text-white font-semibold  bg-black h-8 rounded-t-md'>
                     <div className='col-span-1'>Escenario Base</div>
                     <div className='col-span-1'>Escenario 1</div>
                     <div className='col-span-1'>Escenario 2</div>
                     <div className='col-span-1'>Escenario 3</div>
                  </div>
               </div>
               {configPaymenCapacity.rows.map((row) => (
                  <div key={row.key} className={`grid grid-cols-6 ${row.sx || ''}`}>
                     <div
                        className={clsx('col-span-2 px-4 py-2 text-sm  border-x border-gray', {
                           'text-red-500': row.key === '(=) Monto gravable' && existAlertL32,
                        })}>
                        {row.label}
                     </div>
                     {configPaymenCapacity.stages.map(({ stage, key }) => {
                        let value = data?.paymentStages[stage][row.key] || '';
                        let parseValue = calibrationModel(row.key, value, row.porcentage);
                        return (
                           <div
                              key={key + '-' + value?.replace(/ /g, '-')}
                              className={`col-span-1 px-4 py-2 text-center text-sm border-r border-gray ${
                                 row.sxChild || ''
                              }`}>
                              {parseValue}
                           </div>
                        );
                     })}
                  </div>
               ))}
            </div>
            <div className='flex flex-col justify-end w-3/12 gap-4 pl-4 '>
               <p>
                  <b>Escenario 1:</b> Neutral: Ventas del último cierre, Margen de operación promedio de los ejercicios
                  y de tabla de pasivos*: <br />
                  intereses, pago de capital anual de créditos amortizables y saldo.
               </p>
               <p>
                  <b>Escenario 2:</b> Conservador: Mínimo de ventas en los cierres, Margen de operación de los
                  ejercicios y de tabla de pasivos*: <br />
                  intereses.
               </p>
               <p>
                  <b>Escenario 3:</b> Ventas del último cierre, Margen de operación mínimo de los cierres y de tabla de
                  pasivos*: <br /> intereses.
               </p>
            </div>
         </div>
         <h4 className='w-full my-2'>Alertas</h4>
         <div className='flex items-center w-1/4 gap-2 p-2 px-4 mb-2 text-xs bg-orange-400 rounded-md'>
            <Image alt='Icono de bandera para alertas' src='/icons/ico_flag.svg' width='12' height='10' />
            <span className='flex-auto'>Alertas</span>
            <button
               disabled={_.isEmpty(data?.alertsPayment)}
               onClick={() => fnContext?.setConfig({ alertsModel: { show: true, alerts: data?.alertsPayment } })}
               className={clsx('flex items-center justify-center flex-none rounded-full py-1 px-2', {
                  'hover:bg-white cursor-pointer': data?.alertsResume?.length > 0,
               })}>
               {data?.alertsPayment?.length || 0}
            </button>
         </div>
         <h4 className='w-full text-center'>Tabla de pasivos*</h4>
         <div className='relative text-sm container-overflow max-h-[500px!important]'>
            <table className='rounded-md w-full overflow-clip'>
               <thead className='sticky top-0'>
                  <tr className='h-8 text-center text-white bg-black'>
                     <td className='px-3 py-1'>Acreedores financieros</td>
                     <td className='px-3 py-1'>Tipo de crédito</td>
                     <td className='px-3 py-1'>Naturaleza del crédito</td>
                     <td className='px-3 py-1'>Situación</td>
                     <td className='px-3 py-1'>Monto de línea máx. a disponer</td>
                     <td className='px-3 py-1'>Años</td>
                     <td className='px-3 py-1'>Moneda</td>
                     <td className='px-3 py-1'>Saldo</td>
                     <td className='px-3 py-1'>Tasa de interés</td>
                     <td className='px-3 py-1'>Intereses</td>
                     <td className='px-3 py-1'>Pago de capital anual de créditos amortizables</td>
                  </tr>
               </thead>
               <tbody className='text-right'>
                  {_.isEmpty(data?.tablePassive) ? (
                     <tr>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                        <td className='px-4 py-2 border border-gray'>-</td>
                     </tr>
                  ) : (
                     data?.tablePassive.map((item, idx) => {
                        return (
                           <tr key={keysPassiveRows[idx]}>
                              <td className='px-4 py-2 text-left border border-gray'>
                                 {item?.financialCreditors || '-'}
                              </td>
                              <td className='px-4 py-2 text-left border border-gray'>{item?.creditType || '-'}</td>
                              <td className='px-4 py-2 text-left border border-gray'>{item?.natureOfCredit || '-'}</td>
                              <td className='px-4 py-2 text-center border border-gray'>{item?.situation || 'n/a'}</td>
                              <td className='px-4 py-2 border border-gray'>
                                 {formatMiles({ monto: item?.maxAmountOfLine })}
                              </td>
                              <td className='px-4 py-2 text-center border border-gray'>{item?.year || '-'}</td>
                              <td className='px-4 py-2 text-center border border-gray'>{item?.currency || '-'}</td>
                              <td className='px-4 py-2 border border-gray'>
                                 {formatMiles({ monto: item?.balanceAt })}
                              </td>
                              <td className='px-4 py-2 border border-gray'>{item?.interestRate}%</td>
                              <td className='px-4 py-2 border border-gray'>{formatMiles({ monto: item?.taxes })}</td>
                              <td className='px-4 py-2 border border-gray'>
                                 {formatMiles({ monto: item?.annualPrincipalPaymentOfAmortizableLoans })}
                              </td>
                           </tr>
                        );
                     })
                  )}
                  <tr>
                     <td colSpan='2'></td>
                     <td colSpan='2' className='px-4 py-2 bg-gray-100'>
                        Total Revolvente MN
                     </td>
                     <td className='px-4'>{formatMiles({ monto: data?.totalRevolvingMn })}</td>
                     <td></td>
                     <td colSpan='3' className='px-4 py-2 bg-gray-100'>
                        Intereses créditos Revolventes MN
                     </td>
                     <td className='px-4'>{formatMiles({ monto: data?.revolvingCreditInterestMn })}</td>
                  </tr>
                  <tr>
                     <td colSpan='2'></td>
                     <td colSpan='2' className='px-4 py-2 bg-gray-light'>
                        Total Saldo Amortizable MN
                     </td>
                     <td className='px-4'>{formatMiles({ monto: data?.totalAmortizableBalanceMn })}</td>
                     <td></td>
                     <td colSpan='3' className='px-4 py-2 bg-gray-light'>
                        Intereses créditos Aevolventes MN
                     </td>
                     <td className='px-4'>{formatMiles({ monto: data?.amortizableCreditInterestMn })}</td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div className='w-full text-sm'>*Tabla calculada con la información del reporte de Buró de Crédito</div>
      </section>
   );
};
