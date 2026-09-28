'use client';
import _ from 'lodash';
import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';

import IndividualLoans from './CreditHistory/IndividualLoans';
import HistoryTable from './CreditHistory/HistoryTable';
import ActiveCredits from './CreditHistory/ActiveCredits';

export const CreditHistoryView = ({ data, dateElaboration, typePerson, fnContext }) => {
   return (
      <section className='flex flex-col h-auto gap-4 px-8 mb-4'>
         <div className='flex flex-wrap gap-1'>
            <h2 className='flex-auto text-xl font-semibold text-black-900'>Reporte del historial Crediticio</h2>
            <div className='flex items-center justify-end gap-2 text-sm basis-1/3'>
               <p className='text-right basis-2/3'>Fecha elaboración: </p>
               <div className='w-32 h-8 py-0.5 flex items-center justify-center border border-gray rounded bg-gray-200 text-gray-600'>
                  {dateElaboration || ''}
               </div>
            </div>
            <h4 className='w-full text-sm text-gray-400'>Cifras en miles de pesos </h4>
         </div>
         <div className='flex gap-4 my-4'>
            <div className='flex flex-col justify-center w-3/5 gap-3 px-4 text-sm border border-separate rounded-md border-spacing-y-2 border-gray'>
               {_.isEmpty(data?.concepts) ? (
                  <div className='flex'>
                     <div className='flex flex-col w-8/12 gap-4'>
                        <div>Histórico de Pagos Solicitante</div>
                        <div>Moral Actual Solicitante</div>
                        <div>Clave de Observación Solicitante</div>
                        <div>Clave de Prevención Solicitante</div>
                        <div>Presenta Saldo Mora Comercial y Fiscal Solicitante</div>
                     </div>
                     <div className='flex flex-col w-4/12 gap-4'>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                     </div>
                  </div>
               ) : (
                  data?.concepts?.map((cp) => {
                     let [titleConcept, valueConcept]  = Object.entries(cp ?? {})?.shift() ?? [];
                     return (
                        <div key={'concepts-credit-' + titleConcept?.replace(/ /g, '_')} className='flex w-full gap-2 '>
                           <div className='w-8/12 '>{titleConcept || '-'}</div>
                           <div className='w-3/12 text-center'>{valueConcept || 'Sin información'}</div>
                        </div>
                     );
                  })
               )}
            </div>
            <div className='items-center justify-between w-2/5 text-center border rounded-md h-fit border-gray'>
               <div className='p-2 pt-4 text-base text-center bg-gray-light'>Calificación de Buró de Crédito</div>
               <div className='p-2 pb-4 text-xl text-center bg-gray-light'>{data?.creditBureauRating || '-'}</div>
               <div className='p-2 text-base '>Calificación Ponderada</div>
               <div className='text-3xl'>{data?.weightedRating || '-/10'}</div>
               <div className='p-2 pb-4text-xs '>{data?.buroGlobal || '-/3.5'}</div>
            </div>
         </div>
         {typePerson !== 'PF' ? (
            <>
               <HistoryTable historyReport={data?.historyReport} />
               <ActiveCredits creditHistory={data?.creditHistory} creditHistoryTotal={data?.creditHistoryTotal} />
            </>
         ) : (
            <IndividualLoans creditHistory={data?.creditHistory} />
         )}
         <h4 className='w-full mt-6'>Alertas</h4>
         <div className='flex items-center w-1/4 gap-2 p-2 px-4 mb-2 text-xs bg-orange-400 rounded-md'>
            <Image alt='Icono de bandera para alertas' src='/icons/ico_flag.svg' width='12' height='10' />
            <span className='flex-auto'>Alertas</span>
            <button
               disabled={_.isEmpty(data?.alertsHistoryReport)}
               onClick={() => fnContext?.setConfig({ alertsModel: { show: true, alerts: data?.alertsHistoryReport } })}
               className={clsx('flex items-center justify-center flex-none rounded-full py-1 px-2', {
                  'hover:bg-white cursor-pointer': data?.alertsHistoryReport?.length > 0,
               })}>
               {data?.alertsHistoryReport?.length || 0}
            </button>
         </div>
      </section>
   );
};
