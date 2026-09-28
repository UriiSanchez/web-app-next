import React from 'react';

export const EmpoweredDetailSkeleton = () => {
   return (
      <div className=" px-8 my-4">
         <div className='flex items-center gap-3 my-4'>
            <p>Solicitudes</p> <span className='material-symbols-outlined icon-size-20'>chevron_right</span>
            <div className='w-56 h-6 box'></div>
            <div className='flex flex-row justify-end w-full gap-5'>
               <div className='float-right h-6 px-4 border w-36 rounded-3xl box'></div>
               <div className='float-right h-6 px-4 border w-36 rounded-3xl box'></div>
            </div>
         </div>
         <div className='w-full mt-10 h-9'>
            <div className='flex flex-row w-8/12 h-full mt-10'>
               <div className='flex w-full h-full pl-5 border  rounded-tl-md box'></div>
               <div className='flex w-full h-full pl-5 border rounded-tr-md box '></div>
            </div>
         </div>
         <div className='w-full h-screen p-5 border box'></div>
      </div>
   );
};
