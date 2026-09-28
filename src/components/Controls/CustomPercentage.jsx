import React from 'react';

export const CustomPercentage = ({ disabled, sxContainer = '', ...props }) => {
   if (disabled) {
      return (
         <div className='flex items-center flex-auto text-gray-600 bg-gray-100 border border-gray-400 rounded h-9'>
            <div className='flex-auto text-center'>{props?.value}</div>
            <div className='flex py-1.5 border-l border-gray-400 justify-center flex-none w-10'>%</div>
         </div>
      );
   }

   return (
      <div className={`flex items-center justify-center flex-initial  h-9 input-form ${sxContainer}`}>
         <input {...props} />
         <div className='flex py-1.5 border-l border-gray-400 justify-center flex-none w-8'>%</div>
      </div>
   );
};
