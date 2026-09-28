import _ from 'lodash';
import { useState } from 'react';
import PropTypes from 'prop-types';

import PropertiesView from './Form/PropertiesView';
import PropertiesEdit from './Form/PropertiesEdit';
import IndividualSummary from './Details/IndividualSummary';
import { useDivMeasure } from '../../hooks';

/**
 * Vista de la pantalla Relación de Propiedades, permite al usuario capturar propiedades y visualizar en una
 * lista a todos los obligados solidarios relacionados con el solicitante.
 * @param {Array} info - Es la información general de toda la pantalla
 * @param {function} onUpdateData - Función que hereda del componente padre para actualizar el state principal.
 * @param {boolean} isNotEditable - Indica si deben estar habilitados los campos.
 * @return JSX.Element - Vista de Obligados.
 * */
export default function ObligatedsView({ info, onUpdateData, isNotEditable }) {
   const [refFirst, dimensionsFirst] = useDivMeasure();
   const [refSecond, dimensionsSecond] = useDivMeasure();
   const [idxActive, setIdxActive] = useState(0);

   const handleChangeVirtual = (_it, newObj) => {
      let newInfo = info.map((o) => (o.idClient === newObj.idClient ? { ...newObj } : o));
      onUpdateData('obligedList', newInfo);
   };
   const handleObligatedActive = (e) => setIdxActive(e.target.value);

   if (_.isEmpty(info)) {
      return (
         <div className='flex items-center justify-center px-16 mb-12 h-96'>
            <h1 className='text-lg font-semibold'>Esta solicitud no tiene obligados solidarios que mostrar</h1>
         </div>
      );
   }

   return (
      <div className='h-auto px-8 mb-12 fadeIn'>
         <div className='flex flex-row gap-4' ref={refFirst}>
            <div className='flex flex-col flex-none w-1/6 gap-3' ref={refSecond}>
               {info.length > 1 ? (
                  <select
                     id='applicant'
                     name='applicant'
                     data-testid="obligateds-select"
                     value={idxActive}
                     onChange={(e) => handleObligatedActive(e)}
                     className='w-full h-8 py-1 text-xs text-black input-form'>
                     {info.map((u, idx) => (
                        <option key={u.idClient} value={idx}>
                           {u.fullName}
                        </option>
                     ))}
                  </select>
               ) : (
                  <div
                     data-testid={'Obligated-' + info[0]?.idClient}
                     className='flex items-center justify-center w-full h-10 p-1 my-1 text-xs text-white bg-black border rounded'>
                     {info[0]?.fullName}
                  </div>
               )}
            </div>
            {isNotEditable ? (
               <PropertiesView
                  {...{
                     info: info[idxActive],
                     onUpdateData: handleChangeVirtual,
                  }}
               />
            ) : (
               <PropertiesEdit
                  {...{
                     info: info[idxActive],
                     onUpdateData: handleChangeVirtual,
                     width: `${dimensionsFirst.width - dimensionsSecond.width}px`,
                  }}
               />
            )}
         </div>
         <IndividualSummary key='oblySummary' data={info[idxActive]?.resumeInd} />
      </div>
   );
}

ObligatedsView.propTypes = {
   info: PropTypes.array,
   onUpdateData: PropTypes.func,
   isNotEditable: PropTypes.bool,
};
