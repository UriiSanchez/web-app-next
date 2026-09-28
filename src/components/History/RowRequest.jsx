import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { IconVerification } from '..';
import { useGlobalContext } from '../../hooks';
import { formatId, statusData } from '../../helpers';
import { constTypePerson as TypePerson, constProfiles as Profile, EnumStatus as Estatus } from '../../helpers/config';

/**
 * Componente fila para visualizar detalles por participante de la solicitud en la pantalla detalles.
 * @param {Object} data - Información por solicitud
 * @param {func} fnSet - Función para ocultar o mostrar los detalles
 * @param {Boolean} isExpanded - Permite saber si se muestran u ocultan los detalles
 */
export function RowRequest({ data, fnSet, isExpanded }) {
   const { actions, user } = useGlobalContext();
   const person = useMemo(
      () => data?.relatedPersonResponseList?.find((person) => person.idCatTypePerson === TypePerson.APPLICANT),
      [data?.relatedPersonResponseList]
   );

   const objInit = useMemo(() => {
      let objTemp = {};
      if (data.idCatStatus in statusData) {
         objTemp.status = statusData[data.idCatStatus];
      }

      objTemp.showVerify =
         ![Estatus.SOLICITUD_CANCELADA, Estatus.SOLICITUD_CANCELADA_POR_EMBARGO].includes(data.idCatStatus) &&
         [Profile.EMG, Profile.ADC, Profile.LDC].includes(user?.idProfile);
      return objTemp;
   }, [data.idCatStatus]);

   return (
      <div
         className={`flex items-center w-auto p-3 gap-10 border-t border-black-500 first:border-t-none ${
            isExpanded ? 'border-b' : ''
         } `}>
         <div className='w-10'>
            <p style={{ backgroundColor: person?.color }} className='p-2 text-center text-white border rounded-full'>
               {person?.firstTwoLetters}
            </p>
         </div>
         <div className='w-3/12'>
            <p>{person?.fullName}</p>
         </div>
         <div className='w-3/12'>
            <p>Núm de solicitud: {formatId(data?.idGroupRequest) + '-' + data?.idRequest}</p>
         </div>
         <div className='flex items-center w-1/12 gap-2'>
            {objInit?.status && (
               <span className={`material-symbols-outlined filled ${objInit?.status?.color || ''}`}>
                  {objInit?.status?.icon || '-'}
               </span>
            )}
            <p className='flex-1'>{objInit?.status?.label || '-'}</p>
         </div>
         {objInit?.showVerify && (
            <IconVerification
               {...{
                  idProfile: user?.idProfile,
                  idCatStatus: data?.idCatStatus,
                  idRequest: data.idRequest,
                  idGroup: data?.idGroupRequest,
                  hasVerification: data?.hasVerification,
                  pendingVerification: data?.pendingVerification,
               }}
            />
         )}
         <div className='flex items-center justify-end flex-1'>
            {[Profile.ADC, Profile.LDC].includes(user.idProfile) && (
               <button
                  type='button'
                  disabled={![Estatus.SOLICITUD_AUTORIZADA, Estatus.SOLICITUD_RECHAZADA].includes(data.idCatStatus)}
                  className='flex items-center justify-center px-4 py-1 text-white bg-black border rounded-full'
                  onClick={() =>
                     actions.togglePDF({
                        idRequest: data.idRequest,
                        idClient: person.idClient,
                        title: 'Estudio Carátula',
                        typePDF: 'COVER_AND_STUDY'
                     })
                  }>
                  Descargar <span className='material-symbols-outlined icon-size-20'>download</span>
               </button>
            )}
         </div>
         <div className='items-end content-end justify-end w-10 text-right'>
            <button onClick={fnSet} className='float-right '>
               <span className='material-symbols-outlined filled hover:bg-black-900 hover:text-white rounded-3xl'>
                  {isExpanded ? 'expand_less' : 'expand_more'}
               </span>
            </button>
         </div>
      </div>
   );
}

RowRequest.propTypes = {
   data: PropTypes.object,
   fnSet: PropTypes.func,
   isExpanded: PropTypes.bool,
};
