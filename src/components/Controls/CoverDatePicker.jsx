import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';

export default function CoverDatePicker({ data, onChangeVirtual }) {
   const detailsRef = useRef(null);
   const [showDateMsg, setShowDateMsg] = useState(false);

   useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
         document.removeEventListener('touchstart', handleClickOutside);
      };
   }, []);

   const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
         detailsRef.current.open = false;
         setShowDateMsg(false);
      }
   };

   const onSelect = (value) => {
      let newValue = dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY') : value;
      detailsRef.current.open = false;
      onChangeVirtual({ value: newValue, name: 'termEm', type: 'text' }, 'modelAuthorization');
   };

   return (
      <details
         ref={detailsRef}
         onClick={() => setShowDateMsg(false)}
         className='relative h-8 col-span-3 text-center border rounded outline-none cursor-pointer border-gray  focus:ring-blue-800 focus:text-blue-800  hover:ring-1 hover:border-blue-800 hover:ring-blue-800'>
         <summary className='flex items-center justify-center h-full list-none'>
            {data?.modelAuthorization?.termEm || 'dd/mm/aaaa'}
         </summary>
         <div className='absolute bg-white border  w-full top-[102%] ring-blue-800 ring-1 rounded text-blue-800 border-blue-800'>
            <div className='w-full hover:bg-blue-800 hover:text-white' onClick={() => onSelect('1 año')}>
               1 año
            </div>
            <input
               min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
               placeholder='00-00-0000'
               className='w-full text-center rounded-b cursor-pointer hover:bg-blue-800 hover:text-white focus:border-none'
               type='date'
               name='termEm-date'
               id='termEm-date'
               onChange={(e) => onSelect(e.target.value)}
               onClick={(e) => e.target.showPicker()}
               onKeyDown={(e) => {
                  e.preventDefault();
                  setShowDateMsg(true);
               }}
            />
            <div className={`absolute w-60 right-1/2 translate-x-1/2 pointer-events-none ${showDateMsg || 'hidden'}`}>
               <p className='w-full px-2 py-1 mt-1 text-xs text-white bg-blue-800 border border-blue-800 rounded'>
                  Haz clic para seleccionar una fecha
               </p>
            </div>
         </div>
      </details>
   );
}
