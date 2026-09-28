import React from 'react';

export const SolidarySkeleton = () => {
   return (
      <div className='flex justify-start px-8 my-5'>
         <div className='flex flex-col h-auto pb-2 text-sm bg-opacity-75 rounded bg-neutral-50 w-80'>
            <div className='px-4 py-2 text-left text-white rounded-tl rounded-tr bg-black-900 h-9'></div>
            <div className='h-[32rem] box rounded-br rounded-bl'></div>
         </div>
      </div>
   );
};
