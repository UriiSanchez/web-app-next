import React from 'react';
export const ChatComponentSkeleton = () => {
   return (
      <div className='bg-white w-full rounded-xl px-4 py-5 min-h-screen flex flex-col flex-nowrap gap-2'>
         <h1 className='font-semibold text-xl grow-0'>Chat (Cambios y comentarios)</h1>
         <div className='min-h-96 max-h-screen grow-0 flex flex-col gap-4 pb-4'>
            <div className='flex flex-col gap-3 pl-6 pr-3 py-3 bg-[#F2F3F2] rounded-tl-xl rounded-r-xl'>
               <div className='rounded-2xl box h-4 w-20' />
               <div className='flex items-center gap-4'>
                  <div className='flex-none rounded-full h-9 w-9 box'></div>
                  <div className='flex-1 text-sm gap-2 h-8 box rounded-sm' />
               </div>
               <div className='h-24 box rounded-sm' />
            </div>
            <div className='flex flex-col gap-3 pl-6 pr-3 py-3 bg-[#F2F3F2] rounded-tr-xl rounded-l-xl'>
               <div className='rounded-2xl box h-4 w-20' />
               <div className='flex items-center gap-4'>
                  <div className='flex-none rounded-full h-9 w-9 box'></div>
                  <div className='flex-1 text-sm gap-2 h-8 box rounded-sm' />
               </div>
               <div className='h-24 box rounded-sm' />
            </div>
         </div>
      </div>
   );
};
