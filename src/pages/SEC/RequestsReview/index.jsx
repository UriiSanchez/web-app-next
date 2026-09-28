import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getQueryGraph } from '../../../services';
import { TableRequests } from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { useSourcePagination } from '../../../hooks';
import { getError } from '../../../helpers';
import { mapRoutePages } from '../../../helpers/config';

export default function RequestReview() {
   const router = useRouter();
   const { sourcePage, setTotalPages, setPagination } = useSourcePagination();
   const [data, setData] = useState([]);
   const [name, setName] = useState('');
   const [isLoading, setIsLoading] = useState(true);
   const [isClickAction, setIsClickAction] = useState(false);

   const fetchData = useCallback(async (pageNum) => {
      const result = await execClientMethod({ status: '6', page: pageNum, searchGroupsRecLC: true });
      setData((currentData) => currentData.concat(result));
   }, []);

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
      const result = await execClientMethod({ status: '6', page: 0, name, searchGroupsRecLC: true });
      setData(result);
      setPagination({ currentPage: 1 });
   };

   const execClientMethod = async (params) => {
      const result = await getQueryGraph(params);

      if (result.status !== 200) {
         getError(result);
         return [];
      }

      setTotalPages(_.head(result.data)?.totalPages || 1);
      setIsLoading(false);
      return result.data;
   };

   const handleSendInfo = (requestData) => {
      router.push(mapRoutePages.GO_TO_REQUEST_DETAILS_PAGE('SEC',requestData?.idGroup));
   };

   return (
      <MainLayout title='Solicitudes por revisar' sx='flex flex-col w-full pt-3.5 px-8 mb-4'>
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
         <h1 className='py-1 mb-2 text-2xl'>Por revisar</h1>
         <TableRequests
            data={data}
            typeTable='SEC'
            keepCurrentPage={sourcePage > 0}
            loading={isLoading}
            onFunc={handleSendInfo}
         />
      </MainLayout>
   );
}
