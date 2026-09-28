import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getRequestStatus } from '../../../services';
import { MainLayout } from '../../../components/Layout';
import { TableDetails } from '../../../components/Tables';
import { useGlobalContext, useSourcePagination } from '../../../hooks';
import { getError } from '../../../helpers';
import { mapRoutePages } from '../../../helpers/config';

export default function RequestReview() {
   const router = useRouter();
   const { user } = useGlobalContext();
   const { sourcePage, setTotalPages } = useSourcePagination();
   const [isLoading, setIsLoading] = useState(true);
   const [data, setData] = useState([]);

   const fetchData = useCallback(
      async (pageNum) => {
         if (user?.userAD) {
            const filterUser = ` idAnalyst: "${user?.userAD}"`;
            const result = await getRequestStatus('4,5,6,8,9,22,26', pageNum, filterUser);

            if (result.status !== 200) {
               getError(result);
               setIsLoading(false);
               return;
            }

            setData((currentData) => currentData.concat(result.data));
            setTotalPages(result.data?.[0]?.totalPages);
            setIsLoading(false);
         }
      },
      [setTotalPages, user?.userAD]
   );

   useEffect(() => {
      fetchData(sourcePage);
   }, [fetchData, sourcePage]);

   const handleSendInfo = (requestData) => {
      localStorage.removeItem('idGroup');
      router.push(mapRoutePages.GO_TO_CHECKLIST_PAGE(requestData.idGroup, user.path));
   };

   return (
      <MainLayout title='Solicitudes por revisar' sx='h-full px-8 mb-12 2xl:mb-4'>
         <h1 className='py-4 text-2xl '>Solicitudes por revisar</h1>
         <TableDetails
            {...{ typeTable: 'ADC', data, isLoading, onFunc: handleSendInfo }}
            keepCurrentPage={sourcePage > 0}
         />
      </MainLayout>
   );
}
