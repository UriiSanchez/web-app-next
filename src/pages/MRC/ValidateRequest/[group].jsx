import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { graphGetGroup, onChangeRequestStatusOrAssignUser } from '../../../services';
import { ApplicantContainer } from '../../../components';
import { CustomSelect, HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { formatId, getError, sweetCustomAlert } from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

export default function ValidateRequest({ idGroup }) {
   const { push } = useRouter();
   const { user, actions, listLeaders } = useGlobalContext();
   const [apply, setApply] = useState({});
   const [information, setInformation] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         const result = await graphGetGroup('REQUEST_VALIDATE_MR', idGroup);
         if (result.status !== 200) {
            getError(result);
            return;
         }

         const { requestResponseList, sendOtherProfile, nameEmg } = result.data;
         setApply({ requestResponseList, sendOtherProfile, nameEmg, idLeader: null });
         let newInfo = requestResponseList.map((request) => ({ idRequest: request.idRequest, comment: '' }));
         setInformation(newInfo);
      };

      fetchData();
   }, []);

   const handleAssignRequest = async () => {
      try {
         actions.toggleLoading('Asignando...');
         const result = await onChangeRequestStatusOrAssignUser({
            idGroupRequest: idGroup,
            idCatStatus: EnumStatus.EN_ASIGNACION_LIDER,
            idLeader: apply?.idLeader,
            userCreate: user.userAD,
            nextProfile: 'LC',
         });

         if (result.status !== 204) {
            getError(result);
            return;
         }

         sweetCustomAlert({
            icon: 'success',
            text: 'Se asignó la solicitud con éxito',
            showConfirmButton: false,
            iconColor: '#FDD835',
            timer: 3000,
            timerProgressBar: false,
         }).then(() => push(mapRoutePages.GO_TO_REQUESTS_PAGE('MRC')));
      } catch (error) {
         console.error(error);
      } finally {
         actions.toggleLoading();
      }
   };

   const handleReturnRequest = async () => {
      try {
         actions.toggleLoading('Devolviendo...');
         const result = await onChangeRequestStatusOrAssignUser({
            idGroupRequest: idGroup,
            idCatStatus: EnumStatus.DEVUELTA_EF_POR_MESA,
            userCreate: user.userAD,
            nextProfile: 'EF',
            requests: information,
         });

         if (result.status !== 204) {
            getError(result);
            return;
         }

         sweetCustomAlert({
            icon: 'success',
            title: '¡Solicitud devuelta!',
            text: 'Se ha notificado al Especialista de Financiamiento',
            showConfirmButton: false,
            iconColor: '#FDD835',
            timer: 3000,
            timerProgressBar: false,
         }).then(() => push(mapRoutePages.GO_TO_REQUESTS_PAGE('MRC')));
      } catch (error) {
         console.error(error);
      } finally {
         actions.toggleLoading();
      }
   };

   const handleChangeLeader = (userAD) => setApply({ ...apply, idLeader: userAD });

   return (
      <MainLayout title='Validación de solicitudes'>
         <HeaderTitle
            title='Validar solicitud'
            buttons={[
               {
                  id: 'back',
                  isVisible: true,
                  label: 'Regresar',
                  sx: 'bg-black text-white',
                  toAction: () => push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, 'MRC')),
               },
            ]}
         />
         <section className='flex flex-col gap-10'>
            <div className='flex flex-col gap-4 px-16'>
               <h2 className='text-xl'>Solicitud {formatId(idGroup)}</h2>
               <div className='flex gap-4 p-1'>
                  <div className='flex-none w-64 space-y-1'>
                     <p className='font-semibold text-xs 2xl:text-sm '>Especialista</p>
                     <div className='px-2 py-1.5 rounded text-sm 2xl:text-base bg-[#CECECE] border border-[#BEBEBE]'>
                        {apply?.nameEmg || 'No definido'}
                     </div>
                  </div>
                  <div className='flex-none w-64 space-y-1'>
                     <p className="font-semibold text-xs 2xl:text-sm after:content-['*'] after:ml-0.5 after:text-red-500">
                        Líder de Crédito
                     </p>
                     <CustomSelect list={listLeaders} onSelectChange={handleChangeLeader} idLeader={apply?.idLeader} />
                  </div>
               </div>
               <ApplicantContainer data={apply?.requestResponseList} comments={information} onSet={setInformation} />
            </div>
            <div className='flex justify-between px-16 mb-5'>
               <button
                  className='flex items-center gap-2 py-2 pl-3 pr-4 bg-black-900 hover:bg-black-light text-white rounded-3xl'
                  onClick={handleReturnRequest}>
                  <span className='material-symbols-outlined icon-size-20'>arrow_back</span>
                  <span className='text-sm'>Devolver solicitud</span>
               </button>
               <div className='group relative inline-block z-0'>
                  <button
                     disabled={!apply?.sendOtherProfile || _.isEmpty(apply?.idLeader)}
                     onClick={handleAssignRequest}
                     className={`flex items-center gap-2 py-2 pl-4 pr-3 bg-black-900 enabled:hover:bg-black-light text-white rounded-3xl`}>
                     <span className='text-sm'>Asignar solicitud</span>
                     <span className='material-symbols-outlined icon-size-20'>arrow_forward</span>
                  </button>

                  {apply?.sendOtherProfile && _.isEmpty(apply?.idLeader) && (
                     <div
                        role='tooltip'
                        className='absolute z-50 -top-6 left-2/2 bg-[#545555] transform -translate-x-1/2 px-3 py-1 text-xs 2xl:text-sm text-white rounded-t rounded-bl invisible opacity-0 group-hover:opacity-100 group-hover:visible transition duration-300 w-max shadow-lg'>
                        Tienes información por completar
                     </div>
                  )}
               </div>
            </div>
         </section>
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
