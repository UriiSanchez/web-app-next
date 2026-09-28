import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getQueryGraph } from '../../../services';
import { TableRequests } from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext, useSourcePagination } from '../../../hooks';
import { getError, queryForUserInHistory } from '../../../helpers';
import {
   constProfiles,
   constTypePerson as TypePerson,
   EnumStatus,
   EnumTypesHistoryForProfile,
} from '../../../helpers/config';

export default function HistoryPage() {
   const { user } = useGlobalContext();
   const { sourcePage, setTotalPages, setPagination } = useSourcePagination();
   const [data, setData] = useState([]);
   const [name, setName] = useState('');
   const [isLoading, setIsLoading] = useState(true);
   const [isClickAction, setIsClickAction] = useState(false);
   const settings = useMemo(() => {
      let query = { status: '12, 23, 24' };
      if (user?.idProfile in queryForUserInHistory) {
         let options = queryForUserInHistory[user?.idProfile]();
         query[options.key] = user?.userAD;
      } else if (constProfiles.FAC === user?.idProfile) {
         query.status = EnumStatus.SOLICITUD_FINALIZADA.toString();
         query.byZone = user?.idZone;
         query.hasChats = true;
         query.searchGroupsRecLC = true;
      } else if (constProfiles.SEC === user?.idProfile) {
         query.status = EnumStatus.SOLICITUD_FINALIZADA.toString();
         query.searchGroupsRecLC = true;
      }

      return {
         query,
         table: EnumTypesHistoryForProfile[user?.idProfile] || 'HISTORY',
         isNewDesing: [constProfiles.FAC, constProfiles.SEC].includes(user?.idProfile),
      };
   }, [user]);

   const fetchData = useCallback(
      async (pageNum) => {
         if (user?.idProfile) {
            const result = await execClientMethod({ ...settings.query, page: pageNum });
            setData((currentData) => currentData.concat(result));
         }
      },
      [user?.idProfile]
   );

   useEffect(() => {
      !isClickAction && fetchData(sourcePage);
   }, [fetchData, sourcePage]);

   const onChangeState = (value) => {
      if (value === '' && isClickAction) {
         setData([]);
         fetchData(sourcePage);
         setIsLoading(true);
         setIsClickAction(false);
      }
      setName(value);
   };

   const onHandleSearch = async (e) => {
      e.preventDefault();
      setIsClickAction(true);
      setIsLoading(true);
      const result = await execClientMethod({ ...settings.query, page: 0, name });
      setData(result);
      setPagination({ currentPage: 1 });
   };

   const execClientMethod = async (params) => {
      const result = await getQueryGraph(params);

      if (result.status !== 200) {
         getError(result);
         return [];
      }

      const newData = result.data.map((u) => {
         let sentenceOS = u.requestResponseList.length <= TypePerson.APPLICANT ? ' Solicitante' : ' Solicitantes';
         return {
            ...u,
            numApplicantsHistory: u.requestResponseList?.length + sentenceOS || '-',
         };
      });

      setTotalPages(_.head(result.data)?.totalPages || 1);
      setIsLoading(false);
      return newData;
   };

   return (
      <MainLayout title='Historial' sx='flex flex-col w-full pt-3.5 px-8 mb-4'>
         <div className='flex items-center gap-3 my-4'>
            <form
               onSubmit={onHandleSearch}
               className='flex flex-row flex-none w-2/6 gap-2 px-2 py-1 bg-gray-100 border-2 border-black rounded-2xl hover:border-blue-800 hover:ring-2'>
               <span className='material-symbols-outlined opacity-20'>search</span>
               <input
                  id='search'
                  name='search'
                  maxLength='70'
                  type='search'
                  required
                  value={name}
                  autoComplete='off'
                  onChange={(e) => onChangeState(e.target.value)}
                  placeholder='Busca nombre de solicitante'
                  className='w-full px-2 text-sm bg-transparent outline-none placeholder-slate-400 focus:outline-none focus:text-blue-800 invalid:border-red-500'
               />
            </form>
            <button
               disabled={name === ''}
               onClick={(e) => onHandleSearch(e)}
               className='flex items-center justify-center w-32 px-2 py-1 text-white bg-black border select-none rounded-3xl'>
               Buscar
            </button>
         </div>
         <h1 className='py-1 mb-2 text-2xl'>Historial de solicitudes</h1>
         <TableRequests data={data} typeTable={settings.table} loading={isLoading} keepCurrentPage={sourcePage > 0} />
      </MainLayout>
   );
}
