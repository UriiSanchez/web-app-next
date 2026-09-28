'use client';
import _ from 'lodash';
import React, { useMemo } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

import { ModelSkeleton } from '../index';
import { formatMiles, formatMoney, formatNumber, getUUIDArray } from '../../helpers';

export const SummaryModelView = ({ data, dateElaboration, participantType, fnContext }) => {
   const modelStatus = useMemo(() => {
      return data?.modelStatus?.includes('aprobada');
   }, [data?.modelStatus]);

   if (_.isEmpty(data)) {
      return <ModelSkeleton />;
   }

   const keysPropertiesRows = getUUIDArray(data?.security?.properties?.length ?? 0, 'passive-row-')

   return (
      <section className='flex flex-col h-auto gap-4 px-8'>
         <div className='flex flex-wrap gap-1'>
            <h2 className='flex-auto text-xl font-semibold text-black-900'>Análisis de modelo experto</h2>
            <div className='flex items-center justify-end gap-2 text-sm basis-1/3'>
               <p className='text-right basis-2/3'>Fecha elaboración: </p>
               <div className='w-32 h-8 py-0.5 flex items-center justify-center border border-gray rounded bg-gray-200 text-gray-600'>
                  {dateElaboration || ''}
               </div>
            </div>
            {participantType === 'Solicitante' && (
               <>
                  <h4 className='w-full text-sm text-gray-400'>
                     Monto de línea solicitado: {formatMoney(data?.amountOfLineRequested)} MN
                  </h4>
                  <h4 className='w-full text-sm text-gray-400'>
                     Monto de línea sugerido: {formatMoney(data?.suggestedLineAmount)} MN
                  </h4>
               </>
            )}
         </div>
         {participantType === 'Solicitante' && (
            <div
               className={clsx('flex justify-center items-center rounded text-white w-full h-9', {
                  'bg-emerald-600': modelStatus,
                  'bg-red-500': !modelStatus,
               })}>
               {modelStatus ? 'Aprobado' : 'Rechazado'}
            </div>
         )}
         <div className='flex gap-4'>
            <div className='flex flex-col flex-none gap-2 w-96'>
               <h4>Parámetros obligatorios</h4>
               <div className='flex flex-col justify-around p-4 text-sm border rounded-md border-gray 2lg:text-base h-52'>
                  {!_.isEmpty(data?.requiredParameters) &&
                     Object.entries(data?.requiredParameters).map(([title, value]) => (
                        <div key={title} className='flex items-center gap-1'>
                           <span
                              className={clsx('material-symbols-outlined icon-size-20', {
                                 'text-red-500': !value,
                                 'text-emerald-600': value,
                              })}>
                              {value ? 'check_circle' : 'cancel'}
                           </span>
                           {title}
                        </div>
                     ))}
               </div>
            </div>
            <div className='flex flex-col flex-auto gap-2'>
               <h4>Calificación Global</h4>
               <div className='grid grid-cols-6 grid-rows-5 text-sm border rounded-md border-gray 2lg:text-base h-52'>
                  <div className='grid items-center grid-rows-5 row-span-5 gap-2 p-2 border-r border-gray'>
                     <div />
                     <div>Información financiera</div>
                     <div>Buró de Crédito</div>
                     {participantType === 'Solicitante' && <div>Razonabilidad de Cobertura</div>}
                     <div>Total</div>
                  </div>
                  {!_.isEmpty(data?.globalRating) &&
                     Object.entries(data?.globalRating).map(([title, obj]) => {
                        return (
                           <div
                              key={title?.replace(/ /g, '-')}
                              className={clsx('grid items-center grid-rows-5 row-span-5 gap-2 p-2 text-center', {
                                 'bg-orange-100': title === 'Calificacion Global',
                              })}>
                              <h6 className='capitalize'>{title || '-'}</h6>
                              <div>
                                 {obj['Informacion Financiera'] ? formatNumber(obj['Informacion Financiera']) : '-'}
                              </div>
                              <div>{obj['Buro de Crédito'] ? formatNumber(obj['Buro de Crédito']) : '-'}</div>
                              {participantType === 'Solicitante' && (
                                 <div>
                                    {obj['Razonabilidad de Cobertura']
                                       ? formatNumber(obj['Razonabilidad de Cobertura'])
                                       : '-'}
                                 </div>
                              )}
                              <div>{obj['Total'] ? formatNumber(obj['Total'], 2) : '-'}</div>
                           </div>
                        );
                     })}
               </div>
            </div>
         </div>
         <h4 className='w-full m-2'>Alertas</h4>
         <div className='flex items-center w-1/4 gap-2 p-2 px-4 mb-2 text-xs bg-orange-400 rounded-md'>
            <Image alt='Icono de bandera para alertas' src="/icons/ico_flag.svg" width="12" height="10" />
            <span className='flex-auto'>Alertas</span>
            <button
               disabled={_.isEmpty(data?.alertsResume)}
               onClick={() => fnContext?.setConfig({ alertsModel: { show: true, alerts: data?.alertsResume } })}
               className={clsx('flex items-center justify-center flex-none rounded-full py-1 px-2', {
                  'hover:bg-white cursor-pointer': data?.alertsResume?.length > 0,
               })}>
               {data?.alertsResume?.length || 0}
            </button>
         </div>
         {participantType === 'Solicitante' && (
            <>
               <h4 className='w-full'>Seguridad</h4>
               <div className='relative text-sm container-overflow max-h-[400px!important] mb-8'>
                  <table className='w-full text-sm rounded-md overflow-clip'>
                     <thead className='sticky top-0'>
                        <tr className='text-center text-white bg-black'>
                           <td className='py-2 pl-4'>Tipo</td>
                           <td>Otorgante</td>
                           <td>Descripción</td>
                           <td>Valor</td>
                           <td>Créditos a cubrir</td>
                           <td>Cobertura Autorizada</td>
                           <td>Cobertura Actual</td>
                        </tr>
                     </thead>
                     <tbody>
                        {_.isEmpty(data?.security) ? (
                           <tr className='h-8'>
                              <td colSpan='6' className='bg-gray opacity-60'></td>
                              <td className='px-2 py-1'>0</td>
                           </tr>
                        ) : (
                           data?.security?.properties?.map((it, idx) => (
                              <tr
                                 key={keysPropertiesRows[idx]}
                                 className='h-8 text-sm text-center odd:bg-gray-200 even:bg-white'>
                                 <td className='px-2 py-1'>{it?.typeSecurity || ''}</td>
                                 <td className='px-2 py-1'>{it?.granteeSecurity || ''}</td>
                                 <td className='px-2 py-1'>{it?.descriptionSecurity || ''}</td>
                                 <td className='px-2 py-1'>
                                    {formatMiles({ monto: it?.valueSecurity, inThousands: true, withSign: true })}
                                 </td>
                                 <td className='px-2 py-1'>
                                    {formatMiles({
                                       monto: it?.creditsToCoverSecurity,
                                       inThousands: true,
                                       withSign: true,
                                    })}
                                 </td>
                                 <td className='px-2 py-1'>
                                    {formatMiles({
                                       monto: it?.authorizedCoverageSecurity,
                                       inThousands: true,
                                       withSign: true,
                                    })}
                                 </td>
                                 <td className='px-2 py-1 bg-white'>{it?.currentCoverageSecurity || ''}</td>
                              </tr>
                           ))
                        )}
                        <tr className='h-8'>
                           <td colSpan='6' className='py-1 pr-2 text-end'>
                              Total Actual
                           </td>
                           <td className='px-2 text-center'>{data?.security['Total actual'] || '-'}</td>
                        </tr>
                        <tr className='h-8'>
                           <td colSpan='6' className='py-1 pr-2 text-end'>
                              Cobertura Recomendada
                           </td>
                           <td className='px-2 text-center'>{data?.security['Cobertura Recomendada'] || '-'}</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </>
         )}
      </section>
   );
};
