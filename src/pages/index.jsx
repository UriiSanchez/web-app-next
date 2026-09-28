import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { getRequestsByParam } from '../services';
import { TableGeneric } from '../components';
import { DropdownList } from '../components/Controls';
import { MainLayout } from '../components/Layout';
import { useGlobalContext, useToggle } from '../hooks';
import { sweetNormal } from '../helpers';
import { constPageProcessType as PageProcess, EnumStatus, mapRoutePages } from '../helpers/config';

import icoSearch from '../../public/icons/ico_search.svg';

export default function SearchPage() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useToggle();
   const { user } = useGlobalContext();
   const [requestsData, setRequestsData] = useState([]);
   const [searchMode, setSearchMode] = useState({
      type: 'forNumber',
      value: '',
      ph: '¿A quién quieres encontrar hoy?',
   });
   const [filters, setFilters] = useState({
      byAssign: true,
      byUnassign: true,
      byFinished: true,
   });

   const DropdownData = [
      {
         ph: 'Buscar por Número de persona',
         title: 'Número de persona',
         type: 'forNumber',
      },
      {
         ph: 'Buscar por Nombre de persona',
         title: 'Nombre de persona',
         type: 'forName',
      },
      {
         ph: 'Buscar por Grupo económico',
         title: 'Grupo económico',
         type: 'forGroup',
      },
   ];

   useEffect(() => {
      const { byAssign, byUnassign, byFinished } = filters;
      const filterRequest = requestsData?.map((r) => {
         let isVisible =
            (byFinished && r.idCatStatus == EnumStatus.SOLICITUD_FINALIZADA) ||
            (byAssign && r.idCatStatus != null && r.idCatStatus != EnumStatus.SOLICITUD_FINALIZADA) ||
            (byUnassign && r.idCatStatus == null);
         return { ...r, isVisible };
      });
      setRequestsData(filterRequest);
   }, [filters, isLoading]);

   const onInputChange = ({ target }) => {
      let value = searchMode.type == 'forNumber' ? target.value.replace(/\D/g, '') : target.value;
      setSearchMode({ ...searchMode, value: value });
   };

   const onModeChange = (obj) => setSearchMode({ ...searchMode, ...obj, value: '' });

   const onHandleSearch = async (e) => {
      e.preventDefault();
      try {
         const { type, value } = searchMode;
         setIsLoading();
         if (_.isEmpty(value)) {
            sweetNormal({
               txt: 'Es necesario que ingreses un número de cliente o el nombre que deseas buscar.',
               icon: 'warning',
            });
            return;
         }

         let searchWord = type === 'forNumber' ? `idClient=${value}&typeSolEnum=ALL` : value;
         let { status, requests } = await getRequestsByParam(type, searchWord.trim());
         if (status !== 200) {
            setRequestsData([]);
            return;
         }

         if (requests === 'PF') {
            sweetNormal({
               title: '¡Recuerda que!',
               txt: `Las <b class="text-yellow-500">Personas Físicas</b> no pueden participar como solicitantes de un crédito. <br/>Por favor intenta con otro cliente.`,
            });
            return;
         }

         setRequestsData(requests);
      } catch (error) {
         console.log('Busqueda de clientes: ', error);
      } finally {
         setIsLoading();
      }
   };

   const onSendInfo = async (data) => {
      localStorage.removeItem('idGroup');
      if (data?.statusRequest !== 'Sin Solicitud') {
         if (data?.createUser !== user?.userAD) {
            sweetNormal({
               txt: `
               <h1 class="text-3xl font-bold mb-3">¡Solicitud creada por otro usuario!</h1>
               Recuerda que solo puedes acceder a las solicitudes que tú creaste, para ver tus solicitudes puedes hacer clic en la opción <b>Solicitudes</b>.`,
            });
            return;
         }

         if (data?.idCatStatus !== EnumStatus.SOLICITUD_FINALIZADA) {
            let destination =
               data?.idCatTypeProcedure === PageProcess.SAVE_OBLIGED ? 'GO_TO_SOLIDARY_PAGE' : 'GO_TO_CHECKLIST_PAGE';
            router.push(mapRoutePages[destination](data.idGroup, user.path));
         }
      } else {
         router.push(mapRoutePages.GO_TO_GENERAL_INFORMATION_PAGE(data.idClient));
      }
   };

   return (
      <MainLayout title='Buscador de personas' sx='flex flex-col w-full pt-3.5 px-8 mb-4'>
         <div className='flex items-center mb-4'>
            <h1 className='flex-auto text-2xl'>Buscador de personas</h1>
            <form
               className='flex flex-row w-full p-1.5 gap-2 border rounded border-gray-400 hover:border-blue-800 hover:ring-1 hover:ring-blue-800 flex-[2_2_35%]'
               onSubmit={onHandleSearch}>
               <Image src={icoSearch} alt='Icono de buscar - Barra de busqueda' className='opacity-40' />
               <input
                  name='searchInput'
                  maxLength={40}
                  type='search'
                  value={searchMode.value}
                  onChange={onInputChange}
                  placeholder={searchMode.ph}
                  className='w-full text-sm outline-none placeholder-slate-400 focus:outline-none focus:border-blue-800 focus:ring-blue-800 focus:text-blue-800 '
               />
               <DropdownList toAction={onModeChange} data={DropdownData}>
                  <span className='px-1 border-l-2 border-gray material-symbols-outlined icon-size-20'>
                     arrow_downward
                  </span>
               </DropdownList>
            </form>
            <div className='flex items-center justify-end flex-auto gap-2'>
               <p className=''>Filtrar por: </p>
               <div className='flex gap-2'>
                  <label htmlFor='byAssign' className='cursor-pointer'>
                     <input
                        id='byAssign'
                        name='byAssign'
                        type='checkbox'
                        className='option-input'
                        checked={filters.byAssign}
                        onChange={() => setFilters({ ...filters, byAssign: !filters.byAssign })}
                     />
                     En curso
                  </label>
               </div>
               <div className='flex gap-2'>
                  <label htmlFor='byUnassign' className='cursor-pointer'>
                     <input
                        id='byUnassign'
                        name='byUnassign'
                        type='checkbox'
                        className='option-input'
                        checked={filters.byUnassign}
                        onChange={() => setFilters({ ...filters, byUnassign: !filters.byUnassign })}
                     />
                     Sin solicitud
                  </label>
               </div>
               <div className='flex gap-2'>
                  <label htmlFor='byFinished' className='cursor-pointer'>
                     <input
                        id='byFinished'
                        name='byFinished'
                        type='checkbox'
                        className='option-input'
                        checked={filters.byFinished}
                        onChange={() => setFilters({ ...filters, byFinished: !filters.byFinished })}></input>
                     Finalizado
                  </label>
               </div>
            </div>
         </div>
         <TableGeneric
            {...{
               data: requestsData?.filter((r) => r.isVisible),
               typeTable: 'EMG_SEARCH',
               isLoading,
               onFunc: onSendInfo,
            }}
         />
      </MainLayout>
   );
}
