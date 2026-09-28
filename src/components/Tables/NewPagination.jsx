import clsx from 'clsx';
import React from 'react';

export const NewPagination = ({ currentPage, totalPages, onPageChange }) => {
   const pageNumbers = [];
   for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
   }

   return (
      <div
         aria-label='Pagination'
         className='flex items-center justify-center w-full h-10 gap-4 mt-2 select-none px-3 2xl:text-lg lg:text-base'>
         <button
            type='button'
            disabled={totalPages === 1 || currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className='clean enabled:hover:text-blue-800 enabled:hover:underline'>
            Primera
         </button>
         {pageNumbers.map(
            (numbers, idx) =>
               Math.abs(idx + 1 - currentPage) <= 2 && (
                  <button
                     type='button'
                     key={`page-${numbers}`}
                     onClick={() => onPageChange(numbers)}
                     className={clsx('w-6 text-center hover:bg-blue-800 hover:rounded-sm hover:text-white', {
                        'font-bold text-black': numbers === currentPage,
                        'font-light text-gray': numbers !== currentPage,
                     })}>
                     {numbers}
                  </button>
               )
         )}
         <button
            type='button'
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className='clean enabled:hover:text-blue-800 enabled:hover:underline'>
            Siguiente
         </button>
      </div>
   );
};
