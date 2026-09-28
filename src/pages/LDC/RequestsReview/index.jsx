import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { getQueryGraph } from '../../../services';
import { MainLayout } from '../../../components/Layout';
import { AnalystListContainer, RequestsContainer } from '../../../components';
import { FilterCustomCheck, FilterSearchByName } from '../../../components/Filters';
import { useDebounce, useGlobalContext, useToggle } from '../../../hooks';
import { getError } from '../../../helpers';
import { EnumStatusForGraph } from '../../../helpers/config';

export default function RequestsReview() {
   const { listAnalyst, listLeaders, isReloading } = useGlobalContext();
   const [isLoading, setIsLoading] = useToggle();
   const [requests, setRequest] = useState([]);
   const [byGroupName, setByGroupName] = useState(null);
   const [filters, setFilters] = useState({
      selectedAnalystID: '',
      selectedLeaderList: [],
   });
   const debounceFilters = useDebounce(byGroupName, 500);

   const fetchAsyncData = useCallback(async (searchByGroup) => {
      try {
         setIsLoading();
         let variables = { status: EnumStatusForGraph.LEADER_REQUESTS_PAGE };
         if (!_.isEmpty(searchByGroup)) {
            variables['name'] = searchByGroup;
         }

         const result = await getQueryGraph(variables);
         if (result.status !== 200) {
            getError(result);
            return;
         }

         setRequest(result?.data);
         setFilters({ selectedAnalystID: '', selectedLeaderList: [] });
      } catch (error) {
         console.log('Error al obtener las solicitudes', error);
      } finally {
         setIsLoading();
      }
   }, []);

   useEffect(() => {
      fetchAsyncData();
   }, [isReloading]);

   useEffect(() => {
      if (debounceFilters !== null) {
         fetchAsyncData(debounceFilters);
      }
   }, [debounceFilters, fetchAsyncData]);

   useEffect(() => {
      let filterRequest = onApplyFilters(requests);
      setRequest(filterRequest);
   }, [filters]);

   const handleSelectedAnalystFilter = (analystID) =>
      setFilters((prevFilters) => ({
         ...prevFilters,
         selectedAnalystID: prevFilters.selectedAnalystID === analystID ? '' : analystID,
      }));

   const handleSetLeaderFilter = (newList) =>
      setFilters((prevFilters) => ({ ...prevFilters, selectedLeaderList: newList }));

   const onApplyFilters = (data) => {
      const { selectedAnalystID, selectedLeaderList } = filters;
      // Validamos hay un analista y uno o más líderes seleccionados.
      if (!_.isEmpty(selectedAnalystID) && !_.isEmpty(selectedLeaderList)) {
         return data?.map((item) => ({
            ...item,
            isVisible: item.idAnalyst === selectedAnalystID && selectedLeaderList.includes(item.idLeader),
         }));
      }
      // Se aplica el filtro para el analista seleccionado
      if (!_.isEmpty(selectedAnalystID)) {
         return data?.map((item) => ({ ...item, isVisible: item.idAnalyst === selectedAnalystID }));
      }

      // Se aplica el filtro para los líderes seleccionados
      if (!_.isEmpty(selectedLeaderList)) {
         return data?.map((item) => ({ ...item, isVisible: selectedLeaderList.includes(item.idLeader) }));
      }

      // Se restauran los filtros
      return data.map((item) => ({ ...item, isVisible: true }));
   };

   return (
      <MainLayout title='Solicitudes por revisar' sx='w-full py-5 px-8 relative'>
         <h1 className='py-1 text-2xl'>Solicitudes</h1>
         <div className='flex gap-5 grow mt-4'>
            <section className='flex-none flex flex-col w-[22%] 2xl:w-2/12 gap-2 border-[1.5px] border-gray rounded-lg bg-white p-3'>
               <h2 className='text-sm 2xl:text-lg font-medium'>Total de casos activos</h2>
               <div className='grid grid-cols-6 items-center px-3 py-4 border-[1.5px] rounded border-gray '>
                  <div className='col-span-5 text-xs'>Inventario al día de hoy</div>
                  <div data-testid="total-requests" className='text-xl font-medium text-center'>{requests?.length || 0}</div>
               </div>
               <h2 className='text-sm 2xl:text-lg mt-1 font-medium'>Asignadas por Analista</h2>
               <AnalystListContainer
                  analyst={listAnalyst}
                  selectedAnalystFilter={filters.selectedAnalystID}
                  onSelectedAnalystFilter={handleSelectedAnalystFilter}
               />
            </section>
            <section className='flex-auto flex flex-col gap-2'>
               <div className='mb-2 flex gap-x-4'>
                  <FilterSearchByName
                     id='byGroupName'
                     sxForm='w-1/2'
                     onSetValue={(id, value) => setByGroupName(value)}
                  />
                  <FilterCustomCheck
                     title='Líder'
                     listItems={listLeaders}
                     selectedItems={filters.selectedLeaderList}
                     onSetCheckFilter={handleSetLeaderFilter}
                     keyFilter='userAD'
                     valueFilter='fullName'
                  />
               </div>
               <RequestsContainer isLoading={isLoading} requests={requests} />
            </section>
         </div>
      </MainLayout>
   );
}
