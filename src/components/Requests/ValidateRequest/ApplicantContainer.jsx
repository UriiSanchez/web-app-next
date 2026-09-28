import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import { ApplicantItem } from './ApplicantItem';
import { constTypePerson as TypePerson } from '../../../helpers/config';

/**
 * Componente para mostrar una lista de los participantes de una solicitud,
 * gestionando el estado de carga y la colección de comentarios.
 *
 * @component ApplicantContainer
 * @param {Array} props.data - Un arreglo del atributo `requestResponseList` de la información principal.
 * @param {string[]} props.comments - Un arreglo de los comentarios que se capturan al regresar o mandar la solicitud.
 * @param {function(string[]):void} props.onSet - Función callback que se invoca cuando la colección de comentarios es actualizada.
 * Recibe el array actualizado de comentarios
 * */
export const ApplicantContainer = ({ data, comments, onSet }) => {
   if (_.isEmpty(data)) {
      return (
         <div data-testid='applicant-skeleton-container' className='flex flex-row gap-4 mx-auto container-overflow'>
            <div className='flex flex-col flex-none w-64 gap-4'>
               <div>
                  <div className='h-8 px-4 py-2 text-white rounded-t 2xl:py-4 bg-black-900'/>
                  <div className='h-24 px-4 py-2 text-sm bg-white border rounded-b border-gray box'></div>
               </div>
               <div className='px-4 py-2 border rounded border-gray bg-white container-overflow h-[15rem!important] xl:h-[17rem!important] box'></div>
               <div className='flex h-32 p-1 bg-white border rounded border-gray box'></div>
            </div>
         </div>
      );
   }

   const onChangeVirtual = (idRequest, value) => {
      let newInfo = comments.map((item) => {
         if (item.idRequest === idRequest) {
            item.comment = value;
         }
         return item;
      });

      onSet(newInfo);
   };

   return (
      <div className='flex flex-row gap-4 mx-auto container-overflow p-1'>
         {data.map(({ relatedPersonResponseList, idRequest }) => {
            let soli = relatedPersonResponseList.find((sl) => sl.idCatTypePerson === TypePerson.APPLICANT);
            let oblys = relatedPersonResponseList.filter((sl) => sl.idCatTypePerson === TypePerson.SOLIDARY_OBLIGED);

            return (
               <ApplicantItem
                  key={'Applicant-' + idRequest}
                  idRequest={idRequest}
                  fullName={soli?.fullName || '-'}
                  comment={comments?.find((comm) => comm.idRequest === idRequest)?.comment || ''}
                  listObligated={oblys}
                  onVirtual={onChangeVirtual}
               />
            );
         })}
      </div>
   );
};

ApplicantContainer.propTypes = {
   comments: PropTypes.array.isRequired,
   onSet: PropTypes.func.isRequired,
};
