import React from 'react';

export const DerivativesSkeleton = () => {
   return (
      <>
         <div className='z-50 sticky top-0 bg-white flex border-b-[1.5px] border-black w-full py-4 px-8 mb-4'>
            <div className='flex flex-row items-center w-2/4 h-8 gap-2 box'></div>
            <div className='flex justify-end w-2/4 gap-4'>
               <div className='w-1/6 h-8 rounded-md box'></div>
               <div className='w-1/6 h-8 rounded-md box'></div>
               <div className='w-1/6 h-8 rounded-md box'></div>
            </div>
         </div>
         <div className='mt-8 ml-6'>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-4/12 h-6 box'></p>
               <div className='flex flex-col w-3/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
            </div>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-4/12 h-6 box'></p>
               <div className='flex flex-col w-3/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
            </div>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-4/12 h-6 box'></p>
               <div className='flex flex-col w-3/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
            </div>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-4/12 h-6 box'></p>
               <div className='flex flex-col w-6/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
            </div>
            <div className='flex flex-col gap-2 mb-6'>
               <p className='w-4/12 h-6 box'></p>
               <div className='flex flex-col w-3/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
            </div>
         </div>
      </>
   );
};
