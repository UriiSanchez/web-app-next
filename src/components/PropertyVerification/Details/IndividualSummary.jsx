'use client';
import PropTypes from 'prop-types';

import { formatMoney } from '../../../helpers';

/**
 * Componente generico para mostrar un resumen individual para el Solicitante y para cada uno de los Obligados Solidarios.
 * @param {Object} data - Se pasa el objeto del resumen individual de cada participante.
 * @returns Una barra de totales y una tabla con el resumen de las propiedades.
 */
export default function IndividualSummary({ data }) {
   return (
      <>
         <div className='flex px-4 py-2 my-4 text-xs text-white bg-black rounded'>
            <div className='flex-none w-20'>Total</div>
            <div className='flex-1 w-80'>
               Dimensiones de terreno en m<sup>2</sup>:&nbsp;{data?.totalAreaDimension || '-'}
            </div>
            <div className='flex-1 w-80'>
               m<sup>2</sup> de construcción:&nbsp;{data?.totalBuildArea || '-'}
            </div>
            <div className='flex-1 w-80'>
               Valor s/cliente:&nbsp;
               {formatMoney(data?.totalCustomerValue, 2, '-')}
            </div>
         </div>
         <div className='flex flex-col'>
            <div className='flex justify-between items-center py-2 px-[15px] text-center bg-black text-xs text-white rounded-t'>
               <span className='px-2'>Resumen individual</span>
               <span className='px-2'>Inmueble(s) del solicitante</span>
               <span className='px-2'>Libres de gravamen</span>
               <span className='px-2'>Gravados</span>
               <span className='px-2'>Embargados</span>
               <span className='px-2'>Pendientes por verificar</span>
               <span className='px-2'>En escrituración</span>
            </div>
            <div className='border rounded-b border-gray'>
               <div className='flex justify-between items-center py-2 px-[15px] text-center text-black text-xs '>
                  <span className='w-[9rem] text-left'>Número de inmuebles</span>
                  <span className='w-[11rem]'>{data?.resume ? data.resume?.inmuebles?.numero : 0}</span>
                  <span className='w-[8rem]'>{data?.resume ? data.resume?.libres?.numero : 0}</span>
                  <span className='w-[4.5rem]'>{data?.resume ? data.resume?.gravados?.numero : 0}</span>
                  <span className='w-24'>{data?.resume ? data.resume?.embargados?.numero : 0}</span>
                  <span className='w-40'>{data?.resume ? data.resume?.pendientes?.numero : 0}</span>
                  <span className='w-28'>{data?.resume ? data.resume?.escrituracion?.numero : 0}</span>
               </div>
               <div className='flex justify-between items-center py-2 px-[15px] text-center text-black text-xs '>
                  <span className='w-[9rem] text-left'>Valor de propiedad</span>
                  <span className='w-[11rem]'>{formatMoney(data.resume?.inmuebles?.valor, 2, '$')}</span>
                  <span className='w-[8rem]'>{formatMoney(data.resume?.libres?.valor, 2, '$')}</span>
                  <span className='w-[4.5rem]'>{formatMoney(data.resume?.gravados?.valor, 2, '$')}</span>
                  <span className='w-24'>{formatMoney(data.resume?.embargados?.valor, 2, '$')}</span>
                  <span className='w-40'>{formatMoney(data.resume?.pendientes?.valor, 2, '$')}</span>
                  <span className='w-28'>{formatMoney(data.resume?.escrituracion?.valor, 2, '$')}</span>
               </div>
            </div>
         </div>
      </>
   );
}

IndividualSummary.propTypes = {
   data: PropTypes.object,
};
