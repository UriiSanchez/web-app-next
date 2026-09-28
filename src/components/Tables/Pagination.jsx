import _ from 'lodash';
import React from 'react';
import clsx from 'clsx';

import { useGlobalContext, useSourcePagination } from '../../hooks';

/**
 * Componente de paginacion, no recibe ningun parametro pero usa el GlobalContext
 * @returns {JSX.Element} Barra de paginación
 */
 const Pagination = () => {
   const {
      actions: { setPagination },
      pagination: { currentPage, totalPages, type },
   } = useGlobalContext();
   const { sourcePage, sourceTotalPages, loadMore } = useSourcePagination();

   const hasMore = sourcePage < sourceTotalPages - 1;

   return (
      <div
         className={clsx(
            'flex items-center justify-center w-full h-10 gap-4 mt-2 cursor-pointer select-none px-3 2xl:text-lg lg:text-base ',
            {
               'text-sm': type == 'DROP',
            }
         )}>
         <button
            type='button'
            disabled={totalPages == 1 || currentPage == 1}
            onClick={() => setPagination({ currentPage: 1 })}
            className='clean enabled:hover:text-blue-800 enabled:hover:underline'>
            Primera
         </button>
         <button
            type='button'
            disabled={totalPages == 1 || currentPage == 1}
            onClick={() => setPagination({ currentPage: currentPage - 1 })}
            className='clean enabled:hover:text-blue-800 enabled:hover:underline'>
            Anterior
         </button>
         {[...Array(totalPages)].map(
            (n, idx) =>
               Math.abs(idx + 1 - currentPage) <= 2 && (
                  <button
                     type='button'
                     key={_.uniqueId('page-')}
                     onClick={() => setPagination({ currentPage: idx + 1 })}
                     className={`w-6 text-center ${
                        currentPage === idx + 1 ? 'font-bold text-black' : 'font-light text-gray'
                     } hover:bg-blue-800 hover:rounded-sm hover:text-white`}>
                     {idx + 1}
                  </button>
               )
         )}
         <button
            type='button'
            disabled={totalPages == 1 || currentPage == totalPages}
            onClick={() => setPagination({ currentPage: currentPage + 1 })}
            className='clean enabled:hover:text-blue-800 enabled:hover:underline'>
            Siguiente
         </button>
         {currentPage === totalPages && hasMore ? (
            <button
               className='clean enabled:hover:text-blue-800 enabled:hover:underline'
               type='button'
               onClick={loadMore}>
               Cargar más
            </button>
         ) : (
            <button
               type='button'
               disabled={totalPages == 1 || currentPage == totalPages}
               onClick={() => setPagination({ currentPage: totalPages })}
               className='clean enabled:hover:text-blue-800 enabled:hover:underline'>
               Última
            </button>
         )}
      </div>
   );
}

export default Pagination;