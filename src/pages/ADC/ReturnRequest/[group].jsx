import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getOneRequest, onChangeRequestStatusOrAssignUser } from '../../../services';
import { ApplicantContainer } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { formatId, getError, sweetConditional, sweetModalRedirect } from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

export default function ReturnRequest({ idGroup }) {
   const { push } = useRouter();
   const { user, actions } = useGlobalContext();
   const [apply, setApply] = useState({});
   const [information, setInformation] = useState([]);

   useEffect(() => {
      const fetchDataAsync = async () => {
         const result = await getOneRequest(idGroup);
         if (result.status != 200) {
            getError(result);
            return;
         }

         setApply(result.data.requestResponseList);
         let newInfo = result.data.requestResponseList.map((request) => ({
            idRequest: request.idRequest,
            comment: '',
         }));
         setInformation(newInfo);
      };

      fetchDataAsync();
   }, []);

   const onReturnRequest = async () => {
      try {
         actions.toggleLoading('Devolviendo solicitud...');
         const result = await onChangeRequestStatusOrAssignUser({
            idGroupRequest: idGroup,
            idCatStatus: EnumStatus.DEVUELTA_EF_POR_ANALISTA,
            userCreate: user.userAD,
            nextProfile: 'EF',
            requests: information,
         });

         if (result.status != 204) {
            getError(result)
            return;
         }

         sweetModalRedirect({ title: 'Solicitud devuelta, se ha notificado al Especialista de Mercados Globales' });
         setTimeout(() => {
            push(mapRoutePages.GO_TO_REQUESTS_PAGE(user.path));
         }, 2500);
      } catch (error) {
         console.log('Devolución solicitud: ', error);
      } finally {
         actions.toggleLoading();
      }
   };

   return (
      <MainLayout title='Validación de solicitudes'>
         <HeaderTitle
            title='Devolver solicitud'
            buttons={[
               {
                  id: 'back',
                  isVisible: true,
                  label: 'Regresar',
                  sx: 'bg-black text-white',
                  toAction: () => push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, user.path)),
               },
            ]}
         />
         <section className='flex flex-col gap-10 px-8'>
            <div className='flex flex-col gap-4'>
               <h2 className='text-xl'>Solicitud {formatId(idGroup)}</h2>
               <ApplicantContainer data={apply} comments={information} onSet={setInformation}/>
            </div>
            <div className='flex justify-between mb-5'>
               <button
                  className='flex items-center gap-2 py-2 pl-3 pr-4 text-white bg-black-900 hover:bg-black-light rounded-3xl'
                  onClick={() =>
                     sweetConditional({
                        title: '¿Estás seguro?',
                        text: 'Tu solicitud se devolverá al especialista de mercados globales.',
                        onFunc: onReturnRequest,
                        accept: 'Continuar',
                        cancel: 'Cancelar',
                        confirmButtonColor: '#059669',
                        cancelButtonColor: '#ef4444',
                     })
                  }>
                  <span className='material-symbols-outlined icon-size-20'>arrow_back</span>
                  <span className='text-sm'>Devolver solicitud</span>
               </button>
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
