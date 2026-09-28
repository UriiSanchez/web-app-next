import _ from 'lodash';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente "doble" ya que muestra al/los OS y el idCliente, si hay más de un OS muestra un select.
 * @param {Array(Object)} data - Viene un arreglo de RelatedPerson tipo Obligado Solidario
 */
export function ObligatedItem({ data = [] }) {
   const [selectOS, setSelectOS] = useState({});
   useEffect(() => {
      if (!_.isEmpty(data)) {
         setSelectOS(data[0]);
      }
   }, [data]);

   const onSelectOS = (e) => {
      const { value } = e.target;
      let newOS = data.find((person) => person.idClient == value);
      setSelectOS(newOS);
   };

   return (
      <>
         <div className='px-4 py-2'>
            <p className='font-bold'>Obligado Solidario</p>
            <p>
               {data.length > 1 ? (
                  <select
                     name='obligatedSolidary'
                     id='obligatedSolidary'
                     value={selectOS.idClient || ''}
                     onChange={onSelectOS}
                     className='w-48 mt-2 text-xs truncate border rounded cursor-pointer h-7 2lg:text-base border-black-500 focus:outline-none focus:text-blue-800 enabled:hover:ring-1 enabled:hover:border-blue-800 enabled:hover:ring-blue-800'>
                     {data.map((o) => (
                        <option key={o.idClient} value={o.idClient} className='w-fit'>
                           {o.fullName}
                        </option>
                     ))}
                  </select>
               ) : (
                  selectOS?.fullName || '-'
               )}
            </p>
         </div>
         <div className='px-4 py-2'>
            <p className='font-bold'>No. de Obligado Solidario</p>
            <p>{selectOS?.idClient || '-'}</p>
         </div>
      </>
   );
}

ObligatedItem.propTypes = {
   data: PropTypes.array,
};
