import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getQueryGraph } from '../../../services';
import { TableDetails } from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { useSourcePagination } from '../../../hooks';
import { getError } from '../../../helpers';
import { mapRoutePages } from '../../../helpers/config';

export default function RequestReview() {
   const router = useRouter();
   const { sourcePage, setTotalPages } = useSourcePagination();
   const [isLoading, setIsLoading] = useState(true);
   const [data, setData] = useState([]);

   const fetchData = useCallback(
      async (pageNum) => {
         const result = await getQueryGraph({ status: '2,3,4,5,6,7,8,9,22,26', page: pageNum });
         if (result.status !== 200) {
            getError(result);
            setIsLoading(false);
            return;
         }

         setData((currentData) => currentData.concat(result.data));
         setTotalPages(result.data?.[0]?.totalPages);
         setIsLoading(false);
      },
      [setTotalPages]
   );

   useEffect(() => {
      fetchData(sourcePage);
   }, [fetchData, sourcePage]);

   const handleSendInfo = (requestData) => {
      localStorage.removeItem('idGroup');
      router.push(mapRoutePages.GO_TO_CHECKLIST_PAGE(requestData.idGroup, 'MRC'));
   };

   return (
      <MainLayout title='Solicitudes por revisar' sx='h-full px-14 mb-4'>
         <h1 className='py-4 text-2xl '>Solicitudes por revisar</h1>
         <TableDetails
            {...{ data, typeTable: 'MRC', isLoading, onFunc: handleSendInfo }}
            keepCurrentPage={sourcePage > 0}
         />
      </MainLayout>
   );
}
