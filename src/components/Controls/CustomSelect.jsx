import React from 'react';
import clsx from 'clsx';

import { useDetectClickOutside } from '../../hooks';

/**
 *
 * */
export const CustomSelect = ({ list, onSelectChange, idLeader }) => {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);
   const fullName = list?.find((client) => client.userAD === idLeader)?.fullName ?? 'Sin asignar';

   const listItems = list?.map((client) => {
      return (
         <div
            key={client?.userAD}
            data-testid={'option-' + client?.userAD}
            onClick={() => {
               onSelectChange(client?.userAD);
               setIsOpen(false);
            }}
            className='flex gap-2 items-center px-2 my-1 hover:bg-gray cursor-pointer hover:bg-opacity-55 rounded h-7'>
            <p className='flex-1 flex items-center justify-between text-left truncate capitalize'>{client?.fullName}</p>
            {idLeader === client?.userAD && <span className='material-symbols-outlined icon-size-20'>check</span>}
         </div>
      );
   });

   return (
      <div data-testid='custom-select' className='relative flex-1 text-xs 2xl:text-sm' ref={refElement}>
         <div
            onClick={() => setIsOpen(!isOpen)}
            className='relative flex items-center bg-white justify-between px-2 py-1 rounded cursor-pointer border border-[#BEBEBE]'>
            <p className='truncate'>{fullName}</p>
            <span className={`material-symbols-outlined ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
               keyboard_arrow_down
            </span>
         </div>
         {isOpen && (
            <div
               className={clsx(
                  'absolute p-1.5 left-0 top-10 min-w-64 rounded bg-white z-20 shadow-2xl fadeIn transform transition-all duration-300 drop-shadow-md',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               {listItems}
            </div>
         )}
      </div>
   );
};
