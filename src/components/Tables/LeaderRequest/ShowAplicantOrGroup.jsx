import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { constTypePerson as TypePerson } from '../../../helpers/config';
import { useDetectClickOutside } from '../../../hooks';
import { clsx } from 'clsx';

/**
 * Permite mostrar un combobox si `isGroup` es true y si es falso solo muestra un div con el nombre del grupo.
 * @param {Object} props Propiedades que heredan del componente padre.
 * @param {boolean} props.isGroup Indica si la solicitud es Grupal o Individual.
 * @param {string} props.groupName Es el nombre del grupo o del solicitante.
 * @param {array} props.requests Listado de solicitudes pertenecientes a la solicitud.
 * @param {function} props.onSelectRequest Función que permite cambiar el detalle de la solicitud a visualizar.
 * @param {number} [props.idRequestSelected=undefined]  Valor numérico que permite validar si se ha seleccionado una solicitud.
 * */
export const ShowAplicantOrGroup = ({
   isGroup,
   groupName,
   requests,
   onSelectRequest,
   idRequestSelected = undefined,
}) => {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);

   if (!isGroup) {
      return <div>{groupName}</div>;
   }

   const handleSelectOption = (e, idRequest) => {
      e.stopPropagation();
      setIsOpen(false);
      onSelectRequest(idRequest);
   };

   const onSearchRequestName = (idRequest) => {
      let person = requests
         .find((request) => request.idRequest === idRequest)
         .relatedPersonResponseList.find((p) => p.idCatTypePerson === TypePerson.APPLICANT);
      return person?.fullName ?? 'SIN-NAME';
   };

   const itemShowName = _.isUndefined(idRequestSelected) ? groupName : onSearchRequestName(idRequestSelected);

   return (
      <div
         data-testid='dropdown-applicant'
         className='relative flex-none w-48 2xl:flex-1 2xl:w-auto text-xs 2xl:text-base'
         ref={refElement}>
         <div
            onClick={(e) => {
               e.stopPropagation();
               setIsOpen(!isOpen);
            }}
            className='flex items-center gap-1 max-w-[17rem] 2xl:max-w-[21rem] justify-between rounded cursor-pointer bg-white pl-2 h-8'>
            <p title={itemShowName} className='truncate flex-1 capitalize' data-testid="name-applicant">
               {itemShowName}
            </p>
            <span className={`material-symbols-outlined ${isOpen ? 'rotate-180' : 'rotate-0'} `}>
               keyboard_arrow_down
            </span>
         </div>
         <div
            className={clsx(
               'absolute p-2 left-0 top-8 max-w-[20rem] 2xl:max-w-[21rem] bg-white border border-gray z-20 shadow-2xl fadeIn transform transition-all duration-300',
               {
                  'translate-x-full hidden': !isOpen,
               }
            )}>
            <div
               data-testid={'option-' + { groupName }}
               onClick={(e) => handleSelectOption(e, '')}
               className='flex items-center px-2 my-1 cursor-pointer hover:bg-blue-800 hover:text-white gap-3 h-8'>
               <p className='flex-auto line-clamp-1 truncate capitalize'>{groupName}</p>
            </div>
            {requests.map((req) => {
               let person = req.relatedPersonResponseList.find((p) => p.idCatTypePerson === TypePerson.APPLICANT);
               let keyId = person.fullName.replace(/ /g, '-');
               return (
                  <div
                     data-testid={'option-' + keyId}
                     key={keyId}
                     onClick={(e) => handleSelectOption(e, req?.idRequest)}
                     title={person.fullName}
                     className={clsx(
                        'flex items-center px-2 my-1 cursor-pointer hover:bg-blue-800 hover:text-white gap-3 h-8',
                        {
                           'bg-blue-800 text-white': req?.idRequest === idRequestSelected,
                        }
                     )}>
                     <p className='flex-auto line-clamp-1 truncate capitalize'>&ensp;&ensp;{person.fullName}</p>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

ShowAplicantOrGroup.propTypes = {
   isGroup: PropTypes.bool.isRequired,
   groupName: PropTypes.string.isRequired,
   requests: PropTypes.array.isRequired,
   onSelectRequest: PropTypes.func.isRequired,
};
