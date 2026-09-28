'use client';
import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';

import { useDetectClickOutside } from '../../hooks';

/**
 * Este componente muestra un menú desplegable y permite realizar la reasignación de un `Analista` o `Líder` sobre una solicitud.
 * @param {Object} props - Propiedades que heredan del componente padre.
 *  @param {array} props.listItems - Lista de objetos que se pretende que contenga mínimo los siguientes atributos: `color`, `userAD`, `fullName`
 *  @param {object} props.assignedItem - Objeto con el item seleccionado, debe contener mínimo los siguientes atributos: `color`, `userAD`, `fullName`
 *  @param {boolean} [props.isEnabled=true] - Indica si el componente debe estar `habilitado` o `deshabilitado`. Por default se encuentra habilitado.
 *  @param {idAnalyst|idLeader} [props.attribute=''] - Permité indicarle al componente padré sobre qué atributo se debe realizar la validación.
 *  @param {function} props.onReassignRequest - Función para cambiar la selección del item (`usuario`) activo, donde es necesario pasarle el `userAd` y `attribute`.
 * @returns {JSX.Element} - Menú desplegable de la lista que recibe.
 */
export function ReassignmentRequestDropdown({
   listItems,
   assignedItem,
   isEnabled = true,
   attribute = '',
   onReassignRequest,
}) {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);

   const handleChangeSelectedItem = (e, userAd) => {
      e.stopPropagation();
      setIsOpen(false);
      onReassignRequest(userAd, attribute);
   };

   return (
      <div
         data-testid='dropdown-reassignment'
         className='relative flex-none w-48 2xl:flex-1 2xl:w-auto text-sm 2xl:text-base'
         ref={refElement}>
         <div
            onClick={(e) => {
               e.stopPropagation();
               isEnabled && setIsOpen(!isOpen);
            }}
            className={clsx('flex items-center gap-1 max-w-[17rem] 2xl:max-w-[21rem] justify-between rounded', {
               'cursor-pointer': isEnabled,
               'bg-[#E0E0E0] px-1 cursor-default': !isEnabled,
            })}>
            <span
               style={{ backgroundColor: assignedItem?.color ?? 'black' }}
               className='flex-none h-3 rounded-full w-3'></span>
            <p className='truncate flex-1 capitalize'>{assignedItem?.fullName ?? 'Sin asignar'}</p>
            <span className={`material-symbols-outlined ${isOpen ? 'rotate-180' : 'rotate-0'} `}>
               keyboard_arrow_down
            </span>
         </div>
         {isOpen && isEnabled && (
            <div
               className={clsx(
                  'absolute p-2 left-0 top-7 max-w-[17rem] 2xl:max-w-[21rem] rounded-lg bg-white border border-gray z-20 shadow-2xl fadeIn transform transition-all duration-300',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               <div className='container-overflow'>
                  {_.isEmpty(assignedItem) && (
                     <div
                        onClick={(e) => {
                           e.stopPropagation();
                           setIsOpen(false);
                        }}
                        className={clsx(
                           'flex items-center px-2 my-1 cursor-pointer hover:bg-blue-800 hover:text-white gap-3 rounded h-8 group',
                           {
                              'border-[1.5px] border-blue-800': _.isEmpty(assignedItem?.userAD),
                           }
                        )}>
                        <span className='flex-none w-3 h-3 rounded-full bg-black'></span>
                        <span className='flex-auto line-clamp-1'>Sin asignar</span>
                     </div>
                  )}
                  {listItems?.map(({ color, userAD, fullName }) => {
                     const backgroundColor = color ?? 'black';
                     return (
                        <div
                           data-testid={"menu-option-"+userAD}
                           key={userAD}
                           onClick={(e) => handleChangeSelectedItem(e, userAD)}
                           className={clsx(
                              'flex items-center px-2 my-1 cursor-pointer hover:bg-blue-800 hover:text-white gap-3 rounded h-8',
                              {
                                 'border-[1.5px] border-blue-800': userAD === assignedItem?.userAD,
                              }
                           )}>
                           <span style={{ backgroundColor }} className='flex-none w-3 h-3 rounded-full' />
                           <p className='flex-auto line-clamp-1 truncate capitalize'>{fullName}</p>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );
}

ReassignmentRequestDropdown.propTypes = {
   listItems: PropTypes.array,
   assignedItem: PropTypes.object,
   isEnabled: PropTypes.bool,
   attribute: PropTypes.string,
   onReassignRequest: PropTypes.func,
};
