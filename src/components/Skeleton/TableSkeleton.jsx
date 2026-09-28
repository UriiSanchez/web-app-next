import React from 'react';

export const TableSkeleton = () => {
   return (
      <table className='w-full h-72 2xl:h-[41rem]'>
         <thead className='bg-gray-100 text-sm 2xl:text-base'>
            <tr className='h-12 border-b-gray border-b-[1.5px]'>
               <th className=''><div className='w-auto h-6 bg-gray box'/></th>
               <th className=''><div className='w-auto h-6 bg-gray box'/></th>
               <th className=''><div className='w-auto h-6 bg-gray box'/></th>
               <th className=''><div className='w-auto h-6 bg-gray box'/></th>
               <th className=''><div className='w-auto h-6 bg-gray box'/></th>
               <th className=''><div className='w-auto h-6 bg-gray box'/></th>
               <th className=''><div className='w-auto h-6 bg-gray box'/></th>
            </tr>
         </thead>
         <tbody>
            <tr className='w-full px-4 py-2 min-h-[22.1rem] border rounded-sm box'>
               <td colSpan='7' className='text-center'>Cargando datos...</td>
            </tr>
         </tbody>
      </table>
   );
};
