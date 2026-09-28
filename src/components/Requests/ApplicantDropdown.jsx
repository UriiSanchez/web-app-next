import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useDetectClickOutside } from '../../hooks';
import { mapAttributeStatusFormFaculty, mapStatusColorFaculty } from '../../helpers';
import { constProfiles as Profiles, EnumStatus } from '../../helpers/config';

/**
 * Este componente sirve para mostrar una lista de solicitudes
 *  @param {Object} `applicantActive` - Recibe el id de la solcitud seleccionada
 *  @param {Array} listRequest - Recibe los datos de la lista de solicitudes a mostrar
 *  @param {Function} onSet - Solo es requerido si la solicitud es Grupal
 *  @param {Boolean} isGroup - Indica la solicitud es grupal.
 *  @param {Object} userActive - Indica el usuario activo
 * @returns {JSX.Element} - Botón y lista de analistas.
 */
export function ApplicantDropdown({ applicantActive, listRequest, onSet, isGroup = false, userActive }) {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);
   const resolutionForFaculty = mapAttributeStatusFormFaculty[userActive?.profileType];
   if (!isGroup) {
      return (
         <div className='relative w-full group'>
            <p className='w-4/6 truncate'>{applicantActive.fullName}</p>
            <div
               className={
                  'absolute z-50 hidden fadeIn duration-300 w-auto px-2 py-1 left-1 bg-black-500 rounded-bl-md rounded-r-md text-white text-sm'
               }>
               {applicantActive.fullName}
            </div>
         </div>
      );
   }

   const onChangeApplicant = (element) => {
      if (applicantActive !== element) {
         onSet(element);
      }
      setIsOpen(false);
   };

   const getDataForProfile = (element) => {
      if (userActive.idProfile === Profiles.FAC) {
         return mapStatusColorFaculty[element[resolutionForFaculty]] || {};
      }

      let keyMap = '';

      if (element.idCatStatus === EnumStatus.SOLICITUD_RECHAZADA) {
         keyMap = 'REJECTED';
      } else {
         keyMap = element?.sealed ? 'STAMPED' : 'PENDING';
      }

      return mapStatusColorFaculty[keyMap];
   };

   return (
      <div className='relative flex-1' ref={refElement}>
         <div
            onClick={() => setIsOpen(!isOpen)}
            className='relative flex items-center justify-between px-2 bg-gray-100 border-2 border-black rounded-md cursor-pointer select-none group min-w-72 max-w-fit'>
            <p>{applicantActive.fullName}</p>
            <span className='material-symbols-outlined'>{isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
         </div>
         {isOpen && (
            <div
               className={clsx(
                  'absolute p-2 left-0 top-8 rounded-lg w-auto bg-white z-20 shadow-2xl fadeIn transform transition-all duration-300 drop-shadow-lg',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               {listRequest?.map((request) => {
                  let statusColors = getDataForProfile(request);
                  let isClientActive = request.idClient === applicantActive.idClient;
                  return (
                     <div
                        key={request?.idRequest}
                        onClick={() => onChangeApplicant(request)}
                        className={clsx('flex gap-1 items-center gap-4 px-2 my-1 hover:bg-gray cursor-pointer', {
                           'bg-[#dcdee6] rounded': isClientActive,
                           'hover:bg-gray hover:bg-opacity-55 rounded': !isClientActive,
                        })}>
                        <p className='flex-1 truncate'>{request?.fullName}</p>
                        <p className={`text-sm ${statusColors.color}`}>{statusColors.title}</p>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
}

ApplicantDropdown.propTypes = {
   applicantActive: PropTypes.object.isRequired,
   listRequest: PropTypes.array.isRequired,
   isGroup: PropTypes.bool,
   onSet: PropTypes.func,
   userActive: PropTypes.object,
};
