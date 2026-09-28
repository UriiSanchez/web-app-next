'use client';
import PropTypes from 'prop-types';

import { formatMoney, formatNumber } from '../../helpers';

/**
 * Vista de la pantalla Relación de Propiedades, muestra un resumen general de las propiedades capturadas
 * para el Solicitante y sus Obligados. Al igual que una tabla comparativa sobre las propiedades ya verificadas.
 * @param {Object} info - Es la información general de toda la pantalla
 * @return JSX.Element - Vista Resumen general sobre las propiedades.
 * */
export default function GeneralSummaryView({ info }) {
   let colorTable =
      info?.resume?.inmueblesApplicant?.verify?.numero > 0 ||
      info?.resume?.inmueblesObligated?.verify?.numero > 0 ||
      info?.resume?.copropiedadWithOS?.numero > 0 ||
      info?.resume?.copropiedadOthers?.numero > 0
         ? 'black'
         : 'gray';

   return (
      <div className='flex gap-4 px-8 mb-4 fadeIn'>
         <div className='flex flex-col w-1/2 gap-4'>
            <table className='w-full'>
               <caption className='py-2 text-left'>Declaración del cliente</caption>
               <thead className='flex p-2 text-xs text-center text-white bg-black rounded-t select-none'>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2'>
                     <th className='col-span-3 text-left'>Resumen general</th>
                     <th className='col-span-2'>Número de inmuebles</th>
                     <th className='col-span-2'>Valors/cliente</th>
                  </tr>
               </thead>
               <tbody className='flex flex-col text-xs text-center border rounded-b border-gray'>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Inmuebles del solicitante</td>
                     <td className='col-span-2'>{info?.resume?.inmueblesApplicant?.pending?.numero || 0}</td>
                     <td className='col-span-2'>
                        {formatMoney(info?.resume?.inmueblesApplicant?.pending?.valor, 2, '$')}
                     </td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Inmuebles obligado solidario</td>
                     <td className='col-span-2'>{info?.resume?.inmueblesObligated?.pending?.numero || 0}</td>
                     <td className='col-span-2'>
                        {formatMoney(info?.resume?.inmueblesObligated?.pending?.valor, 2, '$')}
                     </td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Co-propiedad con OS</td>
                     <td className='col-span-2'>0</td>
                     <td className='col-span-2'>$</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1 border-b border-gray bg-opacity-20'>
                     <td className='col-span-3 text-left'>Co-propiedad u otros</td>
                     <td className='col-span-2'>0</td>
                     <td className='col-span-2'>$</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Libres de gravamen</td>
                     <td className='col-span-2'>0</td>
                     <td className='col-span-2'>$</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Gravados</td>
                     <td className='col-span-2'>0</td>
                     <td className='col-span-2'>$</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Embargados</td>
                     <td className='col-span-2'>0</td>
                     <td className='col-span-2'>$</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Pendiente de verificar</td>
                     <td className='col-span-2'>{info?.resume?.pendientes?.pending?.numero || 0}</td>
                     <td className='col-span-2'>{formatMoney(info?.resume?.pendientes?.pending?.valor, 2, '$')}</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>En escrituración</td>
                     <td className='col-span-2'>0</td>
                     <td className='col-span-2'>$</td>
                  </tr>
               </tbody>
            </table>
            <div className='grid items-center w-full h-8 grid-cols-7 gap-2 text-sm text-center text-white bg-black rounded'>
               <div className='col-span-3 px-2 text-left'>Propiedades pendientes</div>
               <div className='col-span-2'>{info?.resume?.pendientes?.pending?.numero || 0}</div>
               <div className='col-span-2'>{formatMoney(info?.resume?.pendientes?.pending?.valor, 2, '$')}</div>
            </div>
            <div className='flex items-center justify-center w-full h-8 text-sm text-white bg-black rounded'>
               <span>Riesgo de crédito solicitado:</span>&nbsp;
               {formatMoney(info?.creditRisk, 2, '-')}
               &nbsp;<b>MXP</b>
            </div>
            <div className='flex items-center justify-center w-full h-8 text-sm text-white bg-black rounded'>
               <span>Proporción de la cobertura:</span>&nbsp;
               {formatNumber(info?.resume?.coverageRatioClient)}
            </div>
         </div>
         <div className='flex flex-col w-1/2 gap-4'>
            <table className='w-full'>
               <caption className='py-2 text-left'>Propiedades verificadas</caption>
               <thead className={`flex p-2 text-xs text-center text-white bg-${colorTable} rounded-t select-none`}>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2'>
                     <th className='col-span-3 text-left'>Resumen general</th>
                     <th className='col-span-2'>Número de inmuebles</th>
                     <th className='col-span-2'>Valors/cliente</th>
                  </tr>
               </thead>
               <tbody className={`flex flex-col text-xs text-center border rounded-b text-${colorTable} border-gray`}>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Inmuebles del solicitante</td>
                     <td className='col-span-2'>{info?.resume?.inmueblesApplicant?.verify?.numero || 0}</td>
                     <td className='col-span-2'>
                        {formatMoney(info?.resume?.inmueblesApplicant?.verify?.valor, 2, '$')}
                     </td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Inmuebles obligado solidario</td>
                     <td className='col-span-2'>{info?.resume?.inmueblesObligated?.verify?.numero || 0}</td>
                     <td className='col-span-2'>
                        {formatMoney(info?.resume?.inmueblesObligated?.verify?.valor, 2, '$')}
                     </td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Co-propiedad con OS</td>
                     <td className='col-span-2'>{info?.resume?.copropiedadWithOS?.numero || 0}</td>
                     <td className='col-span-2'>{formatMoney(info?.resume?.copropiedadWithOS?.valor, 2, '$')}</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1 border-b border-gray bg-opacity-20'>
                     <td className='col-span-3 text-left'>Co-propiedad u otros</td>
                     <td className='col-span-2'>{info?.resume?.copropiedadOthers?.numero || 0}</td>
                     <td className='col-span-2'>{formatMoney(info?.resume?.copropiedadOthers?.valor, 2, '$')}</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Libres de gravamen</td>
                     <td className='col-span-2'>{info?.resume?.libres?.numero || 0}</td>
                     <td className='col-span-2'>{formatMoney(info?.resume?.libres?.valor, 2, '$')}</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Gravados</td>
                     <td className='col-span-2'>{info?.resume?.gravados?.numero || 0}</td>
                     <td className='col-span-2'>{formatMoney(info?.resume?.gravados?.valor, 2, '$')}</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Embargados</td>
                     <td className='col-span-2'>{info?.resume?.embargados?.numero || 0}</td>
                     <td className='col-span-2'>{formatMoney(info?.resume?.embargados?.valor, 2, '$')}</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>Pendiente de verificar</td>
                     <td className='col-span-2'>{info?.resume?.pendientes?.verify?.numero || 0}</td>
                     <td className='col-span-2'>{formatMoney(info?.resume?.pendientes?.verify?.valor, 2, '$')}</td>
                  </tr>
                  <tr className='grid items-center justify-between w-full grid-cols-7 gap-2 px-2 py-1'>
                     <td className='col-span-3 text-left'>En escrituración</td>
                     <td className='col-span-2'>{info?.resume?.escrituracion?.numero || 0}</td>
                     <td className='col-span-2'>{formatMoney(info?.resume?.escrituracion?.valor, 2, '$')}</td>
                  </tr>
               </tbody>
            </table>
            <div className='flex'>
               <div
                  className={`bg-${colorTable} grid items-center w-full h-8 grid-cols-7 gap-2 text-sm text-center rounded text-white bg-black`}>
                  <div className='col-span-3 px-2 text-left'>Propiedades libres</div>
                  <div className='col-span-2'>{info?.resume?.libres?.numero || 0}</div>
                  <div className='col-span-2'>{formatMoney(info?.resume?.libres?.valor, 2, '$')}</div>
               </div>
            </div>
            <div className={`flex justify-center items-center w-full h-8 bg-${colorTable} text-white text-sm rounded`}>
               <label>Riesgo de crédito solicitado:</label>&nbsp;
               {formatMoney(info?.creditRisk, 2, '$')}
               &nbsp;<b>MXP</b>
            </div>
            <div className={`flex justify-center items-center w-full h-8 bg-${colorTable} text-white text-sm rounded`}>
               <label>Proporción de la cobertura:</label>&nbsp;
               {formatNumber(info?.coverageRatio) || '-'}
            </div>
         </div>
      </div>
   );
}

GeneralSummaryView.propTypes = {
   info: PropTypes.object,
};
