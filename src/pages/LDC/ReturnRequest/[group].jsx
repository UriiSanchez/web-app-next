import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getOneRequest, onChangeRequestStatusOrAssignUser } from '../../../services';
import { ApplicantContainer } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import {
   formatId,
   getError,
   hasClientFinancialChanges,
   sweetConditional,
   sweetConfirmation,
   sweetModalRedirect,
   templateSweetAlert,
} from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';
import { isEmpty } from 'lodash';
import { id } from 'date-fns/locale';

export default function ReturnRequest({ idGroup, origin }) {
   const { push, replace } = useRouter();
   const { user, actions } = useGlobalContext();
   const [apply, setApply] = useState({});
   const [information, setInformation] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         if (user?.userAD) {
            const result = await getOneRequest(idGroup);
            if (result.status !== 200) {
               getError(result);
               return;
            }

            if (user.userAD !== result.data.idLeader) {
               sweetConfirmation({
                  html: templateSweetAlert['NO_ASSIGNED_LEADER'](),
                  width: 560,
                  timer: 5000,
               });

               setTimeout(() => {
                  replace(mapRoutePages.GO_TO_REQUESTS_PAGE('LDC'));
               }, 5000);
            }

            setApply(result.data.requestResponseList);
            let newInfo = result.data.requestResponseList.map((request) => ({
               idRequest: request.idRequest,
               comment: '',
            }));
            setInformation(newInfo);
         }
      };

      fetchData();
   }, [user, idGroup]);

   const onReturnRequest = async () => {
      try {
         actions.toggleLoading('Devolviendo solicitud...');
         const result = await onChangeRequestStatusOrAssignUser({
            idGroupRequest: idGroup,
            idCatStatus:
               origin == 'Documentation' ? EnumStatus.DEVUELTA_EF_POR_LIDER : EnumStatus.DEVUELTA_ANALISTA_POR_LIDER,
            userCreate: user.userAD,
            nextProfile: origin == 'Documentation' ? 'EF' : 'AC',
            requests: information,
         });

         if (result.status !== 204) {
            getError(result);
            return;
         }

         sweetModalRedirect({
            title: `¡Solicitud devuelta! Se ha notificado al ${
               origin == 'Documentation' ? 'Especialista de Mercados Globales' : 'Analista'
            }`,
         });
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
                  toAction: () =>
                     hasClientFinancialChanges(apply)
                        ? push(`/LDC/Documentation/${idGroup}`)
                        : push(`/LDC/${origin}/${idGroup}`),
               },
            ]}
         />
         <section className='flex flex-col gap-10 px-8'>
            <div className='flex flex-col gap-4'>
               <h2 className='text-xl'>Solicitud {formatId(idGroup)}</h2>
               <ApplicantContainer data={apply} comments={information} onSet={setInformation} />
            </div>
            <div className='flex justify-between mb-5'>
               <button
                  className='flex items-center gap-2 py-2 pl-3 pr-4 text-white bg-black-900 hover:bg-black-light rounded-3xl'
                  onClick={() =>
                     sweetConditional({
                        title: '¿Estás seguro?',
                        text: `Tu solicitud se devolverá al <b> ${
                           origin == 'Documentation' ? 'especialista de mercados globales' : 'analista de contraparte'
                        }</b>.`,
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

export const getServerSideProps = async ({ query }) => {
   const { group = 0, origin = 'Documentation' } = query;
   return {
      props: { idGroup: group, origin },
   };
};
