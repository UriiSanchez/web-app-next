import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getRequestStatus } from '../../../services';
import { TableDetails } from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext, useSourcePagination } from '../../../hooks';
import { getError } from '../../../helpers';
import { constPageProcessType as PageProcess, EnumStatus, mapRoutePages } from '../../../helpers/config';

export default function RequestReview() {
   const router = useRouter();
   const { user } = useGlobalContext();
   const { sourcePage, setTotalPages } = useSourcePagination();
   const [isLoading, setIsLoading] = useState(true);
   const [data, setData] = useState([]);

   const fetchData = useCallback(
      async (pageNum) => {
         if (user?.userAD) {
            const filterUser = ` userCreate: "${user?.userAD}"`;
            const result = await getRequestStatus('1,2,3,4,5,6,7,8,9,22,26', pageNum, filterUser);

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

   const handleSendInfo = (data) => {
      localStorage.removeItem('idGroup');
      if (data?.idCatStatus !== EnumStatus.SOLICITUD_FINALIZADA) {
         let destination =
            data?.idCatTypeProcedure === PageProcess.GET_CHECKLIST ? 'GO_TO_CHECKLIST_PAGE' : 'GO_TO_SOLIDARY_PAGE';
         router.push(mapRoutePages[destination](data.idGroup, user.path));
      }
   };

   return (
      <MainLayout title='Solicitudes asignadas' sx='h-full px-8 mb-4'>
         <h1 className='py-4 text-2xl'>Solicitudes asignadas</h1>
         <TableDetails
            {...{ data, typeTable: 'EMG_REQUEST', isLoading, onFunc: handleSendInfo }}
            keepCurrentPage={sourcePage > 0}
         />
      </MainLayout>
   );
}
