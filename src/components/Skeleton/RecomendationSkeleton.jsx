import React from 'react';

export const RecomendationSkeleton = () => {
   return (
      <div className='flex gap-4 fadeIn'>
         <div className='flex flex-col w-1/4'>
            <div className='px-4 py-2 text-white rounded-t-lg 2xl:py-4 bg-black-900 h-9'></div>
            <div className='h-20 px-4 py-2 text-sm bg-white border rounded-b-lg border-gray box'></div>
            <div className='px-4 py-2 mt-4 border rounded border-gray bg-white container-overflow h-[26.5rem!important] min-h-80 box'></div>
         </div>
         <div className='flex flex-col w-1/4'>
            <div className='px-4 py-2 text-white rounded-t-lg 2xl:py-4 bg-black-900 h-9'></div>
            <div className='h-full px-4 py-2 bg-white border rounded border-gray container-overflow box'></div>
         </div>
         <div className='flex flex-col w-1/4'>
            <div className='px-4 py-2 text-white rounded-t-lg 2xl:py-4 bg-black-900 h-9'></div>
            <div className='h-full px-4 py-2 bg-white border rounded border-gray container-overflow box'></div>
         </div>
      </div>
   );
};
