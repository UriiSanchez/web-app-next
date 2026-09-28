import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getTrackingGraph } from '../../../services';
import { NewPagination, TableDemo } from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { FilterContainer } from '../../../components/Filters';
import { getError } from '../../../helpers';
import { useGlobalContext } from '../../../hooks';

export default function TrackingPage() {
   const {
      pagination,
      actions: { setPagination },
   } = useGlobalContext();
   const [allRequest, setAllRequest] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [filters, setFilters] = React.useState({});
   const loadedPagesRef = useRef(new Map());
   const lastFetchedFiltersRef = useRef({});

   const fetchAsyncData = useCallback(
      async (targetPage, currentFilters) => {
         setIsLoading(true);
         try {
            const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(lastFetchedFiltersRef.current);
            if (filtersChanged) {
               setAllRequest([]);
               loadedPagesRef.current.clear();
               lastFetchedFiltersRef.current = currentFilters;
            }

            const pagesToEnsureLoaded = Array.from({ length: targetPage }, (_, i) => i + 1);
            let currentTotalPages = pagination.totalPages;

            const fetchPromises = [];
            for (const pageNum of pagesToEnsureLoaded) {
               if (!loadedPagesRef.current.has(pageNum)) {
                  fetchPromises.push(
                     getTrackingGraph({
                        status: '2,3,4,5,6,7,8,9,12,22,23,24,26',
                        page: pageNum,
                        ...currentFilters,
                     }).then((response) => {
                        if (response.status === 200) {
                           loadedPagesRef.current.set(pageNum, response.data);
                           let countPages = _.head(response.data)?.totalPages || 1;
                           if (countPages !== currentTotalPages) {
                              currentTotalPages = countPages;
                           }
                        }
                     })
                  );
               }
            }

            await Promise.all(fetchPromises);
            setPagination({ totalPages: currentTotalPages });

            let highestPageLoaded = 0;
            for (let i = 1; i <= currentTotalPages; i++) {
               if (loadedPagesRef.current.has(i)) {
                  highestPageLoaded = i;
               } else {
                  break;
               }
            }

            let newAllRequest = [];
            for (let i = 1; i <= highestPageLoaded; i++) {
               if (loadedPagesRef.current.has(i)) {
                  newAllRequest = newAllRequest.concat(loadedPagesRef.current.get(i));
               }
            }
            setAllRequest(newAllRequest);
         } catch (error) {
            getError({ status: 500, error });
         } finally {
            setIsLoading(false);
         }
      },
      [pagination.totalPages]
   );

   useEffect(() => {
      if (!_.isEmpty(filters)) {
         setPagination({ currentPage: 1 });
         fetchAsyncData(1, filters);
      }
   }, [filters, fetchAsyncData]);

   const onHandlePageChange = useCallback(
      async (newPage) => {
         if (newPage < 1 || newPage > pagination.totalPages) return;
         setPagination({ currentPage: newPage });
         await fetchAsyncData(newPage, lastFetchedFiltersRef.current);
      },
      [pagination.totalPages, fetchAsyncData, lastFetchedFiltersRef]
   );

   const displayedRequests = allRequest.slice((pagination.currentPage - 1) * 10, pagination.currentPage * 10);

   return (
      <MainLayout title='Seguimiento' sx='flex flex-col w-full py-5 px-8 relative'>
         <h1 className='py-1 text-2xl'>Seguimiento</h1>
         <div className='flex items-center gap-2 mt-6 mb-9'>
            <FilterContainer onApplyFilters={setFilters} />
            <div className='flex justify-end flex-1'>
               <button disabled className='flex gap-1 p-2 text-sm rounded-lg 2xl:text-base'>
                  <span className='material-symbols-outlined icon-size-20'>download</span>Descargar
               </button>
            </div>
         </div>
         <TableDemo data={displayedRequests} typeTable='ALL_TRACKING' loading={isLoading} />
         <NewPagination
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={onHandlePageChange}
         />
      </MainLayout>
   );
}
