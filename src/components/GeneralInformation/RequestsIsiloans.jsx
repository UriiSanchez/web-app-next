import _ from 'lodash';
import React from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

import { formatMoney } from '../../helpers';

import flag_mexico from '../../../public/flags/flag_mx.svg';
import flag_us from '../../../public/flags/flag_us.svg';

/**
 * Devuelve una tabla con las líneas de crédito anteriores del cliente principal
 * @component RequestsIsiloans
 * @param {Object}  props - Propiedades del componente
 * @param {Object} props.requests - Trae
 **/
export const RequestsIsiloans = ({ requests}) => {
   return (
      <div className='flex-1 mb-4 overflow-y-auto border rounded-md border-gray text-xs 2xl:text-sm '>
         <table className='w-full text-center'>
            <thead className='text-white bg-black rounded-t'>
               <tr>
                  <th className='py-3 font-normal w-fit'>Número de línea</th>
                  <th className='font-normal'>Tipo de producto activo</th>
                  <th className='font-normal'>Fecha de inicio</th>
                  <th className='font-normal'>Fecha de vencimiento</th>
                  <th className='font-normal'>Monto autorizado</th>
                  <th className='font-normal'>Divisa</th>
               </tr>
            </thead>
            <tbody className='fadeIn'>
               {_.isEmpty(requests) ? (
                  <tr>
                     <td colSpan='6' className='h-64 text-xl text-center text-gray'>
                        Sin productos activos
                     </td>
                  </tr>
               ) : (
                  requests.map((credit) => (
                     <tr key={'creditLine-' + credit.lineNumber}>
                        <td className='py-3'>{credit.lineNumber}</td>
                        <td>{credit.typeActiveProduct}</td>
                        <td>{credit.startDate || '-'}</td>
                        <td>{credit.endDate || '-'}</td>
                        <td>{formatMoney(credit.authorizedAmount)}</td>
                        <td>
                           <div className='flex justify-center'>
                              <Image
                                 className='w-[25px]'
                                 src={credit.currency == 'USD' ? flag_us : flag_mexico}
                                 alt='money'
                              />
                           </div>
                        </td>
                     </tr>
                  ))
               )}
            </tbody>
         </table>
      </div>
   );
};

RequestsIsiloans.propTypes = {
   requests: PropTypes.array,
};
