import _ from 'lodash';
import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/router';

import { getOneRequest } from '../../../services';
import { DetailsGroup, HistoryDetailsSkeleton, RowRequest, DetailsRequest } from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { HeaderTitle } from '../../../components/Controls';
import { useGlobalContext } from '../../../hooks';
import { formatId, getError } from '../../../helpers';

export default function HistoryDetails({ idGroup }) {
   const router = useRouter();
   const { user } = useGlobalContext();
   const [data, setData] = useState({});
   const [expandedRows, setExpandedRows] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const navigation = [
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: 'border-black text-white bg-black ',
         toAction: () => router.push('/Shared/History'),
      },
   ];

   useEffect(() => {
      const fetchData = async () => {
         try {
            const result = await getOneRequest(idGroup, true);
            if (result.status !== 200) {
               getError(result);
               return;
            }

            setData(result.data);
         } catch (error) {
            console.log('Error en historial: ', error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchData();
   }, []);

   const onClicExpansion = (e, rowId) => {
      e.stopPropagation();
      let rows = expandedRows.includes(rowId) ? expandedRows.filter((id) => id != rowId) : [...expandedRows, rowId];
      setExpandedRows(rows);
   };

   return (
      <MainLayout title='Detalles solicitud'>
         <HeaderTitle title={`Solicitud ${formatId(idGroup || '')}`} buttons={navigation} />
         {isLoading ? (
            <HistoryDetailsSkeleton />
         ) : (
            <div className='flex flex-col gap-4 px-8 py-2 text-sm'>
               <DetailsGroup info={data} idProfile={user?.idProfile} />
               <div className='flex flex-col justify-center w-auto h-auto'>
                  <div className='flex flex-row items-center w-full h-10 px-4 text-white bg-black rounded-t'>
                     <p>Solicitantes de grupo económico</p>
                  </div>
                  <div className='flex flex-col w-full h-auto border-b border-l border-r rounded-b border-gray'>
                     {data?.requestResponseList?.map((ap) => {
                        const isExpanded = expandedRows.includes(ap.idRequest);
                        const { arrivedSecDate, isGroup, branchOffice } = data;
                        return (
                           <Fragment key={_.uniqueId('fragment-')}>
                              <RowRequest
                                 key={`G${idGroup}-Row-${ap.idRequest}`}
                                 data={ap}
                                 isExpanded={isExpanded}
                                 idProfile={user?.idProfile}
                                 fnSet={(e) => onClicExpansion(e, ap.idRequest)}
                              />
                              {isExpanded && (
                                 <DetailsRequest
                                    key={'Req-' + ap.idRequest}
                                    info={{ ...ap, isGroup, branchOffice, arrivedSecDate }}
                                 />
                              )}
                           </Fragment>
                        );
                     })}
                  </div>
               </div>
            </div>
         )}
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
