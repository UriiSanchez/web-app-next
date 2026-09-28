import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useDetectClickOutside } from '../../../hooks';
import { mapIconForStatus } from '../../../helpers/config';

/**
 * Este componente sirve para mostrar una lista de solicitudes con el nombre del aplicante y
 * permite seleccionar uno lo cual cambia el `idRequestActive`
 * @param {Object} props - Propiedades que recibe el componente
 * @param {Number} props.idRequestActive - ID Request activa en el contenedor padre.
 * @param {Array} props.listApplicants - Listado de aplicantes a renderizar en el select.
 * @param {function} props.onSelectChange - Función que le indica al padré que debe cambiar el `idRequestActive`.
 * @returns {JSX.Element} - Un select con los aplicantes que participan en la solicitud.
 */
export function TrackingSelect({ idRequestActive, listApplicants, onSelectChange }) {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);
   const fullName = listApplicants?.find((client) => client.idRequest === idRequestActive)?.fullName ?? '-';

   const listClients = listApplicants?.map((client) => {
      let elementIconForStatus = mapIconForStatus[client.idCatStatus];

      return (
         <div
            key={client?.idClient}
            onClick={() => {
               onSelectChange(client?.idRequest);
               setIsOpen(false);
            }}
            className='flex gap-2 items-center px-2 my-1 hover:bg-gray cursor-pointer hover:bg-opacity-55 rounded h-7'>
            {elementIconForStatus && (
               <span className={`material-symbols-outlined icon-size-20 filled ${elementIconForStatus.color}`}>
                  {elementIconForStatus.icon}
               </span>
            )}
            <p className='flex-1 text-left truncate'>{client?.fullName}</p>
         </div>
      );
   });

   return (
      <div data-testid="tracking-select" className='relative flex-1 text-xs 2xl:text-sm' ref={refElement}>
         <div
            onClick={() => setIsOpen(!isOpen)}
            className='relative flex items-center bg-[#EEEEEE] max-w-[17rem] 2xl:max-w-[21rem] justify-between px-3 py-1 rounded-md cursor-pointer group'>
            <p className='truncate'>{fullName}</p>
            <span className='material-symbols-outlined'>{isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
         </div>
         {isOpen && (
            <div
               className={clsx(
                  'absolute p-2 left-0 top-10 rounded-lg w-auto bg-white z-20 shadow-2xl fadeIn transform transition-all duration-300 drop-shadow-lg',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               {listClients}
            </div>
         )}
      </div>
   );
}

TrackingSelect.propTypes = {
   idRequestActive: PropTypes.number,
   listApplicants: PropTypes.array,
   onSelectChange: PropTypes.func,
};
