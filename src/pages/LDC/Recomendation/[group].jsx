import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { getOneRequest, onChangeRequestStatusOrAssignUser } from '../../../services';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { MainModal } from '../../../components/Modal';
import { useGlobalContext, useToggle } from '../../../hooks';
import { getError, sweetConfirmation } from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

import ItemRecomendation from './components/ItemRecomendation';

import icoWarning from '../../../../public/icons/ico_warning.svg';

export default function LeaderRecomendation({ idGroup }) {
   const { push } = useRouter();
   const { user, actions } = useGlobalContext();
   const [apply, setApply] = useState([]);
   const [btnFinish, setBtnFinish] = useState(true);
   const [showModal, setShowModal] = useToggle();

   useEffect(() => {
      const fetchDataAsync = async () => {
         const result = await getOneRequest(idGroup);
         if (result.status != 200) {
            getError(result);
            return;
         }

         setApply(result.data.requestResponseList);
      };

      fetchDataAsync();
   }, []);

   useEffect(() => {
      let result = !_.isEmpty(apply) && apply.every((ap) => ap.recommendationLc != null);
      setBtnFinish(!result);
   }, [apply]);

   const onChangeState = (value, idRequest, attribute) => {
      setApply(apply.map((ap) => (ap.idRequest == idRequest ? { ...ap, [attribute]: value } : ap)));
   };

   const onAssignRequest = async () => {
      let allAreNOTRecommended = apply.every((ap) => !ap.recommendationLc);
      try {
         setShowModal();
         actions.toggleLoading('Finalizando este proceso tardará unos segundos...');
         let requests = apply.map(({ idRequest, commentLc, recommendationLc }) => {
            let newReq = { idRequest, recommendationLc };
            //* Solo si se ingreso un comentario se añade el atributo al nuevo objeto
            if (!_.isEmpty(commentLc)) {
               newReq['comment'] = commentLc;
            }

            newReq['idCatStatus'] = recommendationLc
               ? EnumStatus.EN_REVISION_FACULTADO
               : EnumStatus.SOLICITUD_RECHAZADA;
            return newReq;
         });

         const result = await onChangeRequestStatusOrAssignUser({
            idGroupRequest: idGroup,
            idCatStatus: allAreNOTRecommended ? EnumStatus.SOLICITUD_FINALIZADA : EnumStatus.EN_REVISION_FACULTADO,
            userCreate: user.userAD,
            nextProfile: 'FC',
            requests,
         });

         if (result.status !== 204) {
            getError(result);
            return;
         }

         sweetConfirmation({
            html: `
               <div class='flex flex-col justify-center items-center gap-4 h-56 w-72 mx-auto'>
                  <img src='/icons/ico_success.svg' alt='Proceso éxitoso' width='78' />
                  <p class='text-center text-gray select-none'>Finalizaste la solicitud con éxito te redirigiremos a tus solicitudes</p>
               </div>
            `,
            timer: 3000,
         });

         setTimeout(() => {
            push(mapRoutePages.GO_TO_REQUESTS_PAGE('LDC'));
         }, 3000);
      } catch (error) {
         console.log(error);
      } finally {
         actions.toggleLoading();
      }
   };

   return (
      <>
         <MainModal isOpened={showModal} xs='max-w-sm fixed-position-modal fadeIn'>
            <div className='flex flex-col items-center justify-center gap-4 py-2'>
               <Image src={icoWarning} alt='¡Warning! Al continuar finalizarás el proceso de la solicitud' />
               <h1 className='text-lg font-bold text-center'>¿Estás seguro?</h1>
               <p className='text-base text-center text-gray'>Al continuar finalizarás el proceso de la solicitud</p>
               <div className='w-4/6 space-y-2 text-sm font-bold 2xl:w-3/6'>
                  <button
                     onClick={onAssignRequest}
                     className='w-full px-4 py-1 text-white bg-black hover:bg-black-900 rounded-3xl'>
                     Continuar
                  </button>
                  <button
                     onClick={setShowModal}
                     className='w-full px-4 py-1 text-blue-800 hover:bg-blue-800 hover:text-white rounded-3xl'>
                     Cancelar
                  </button>
               </div>
            </div>
         </MainModal>
         <MainLayout title='Recomendacion de resultado' sx='h-auto min-h-max bg-white bg-opacity-50'>
            <HeaderTitle
               title=' Recomendación de resultado'
               buttons={[
                  {
                     id: 'back',
                     isVisible: true,
                     label: 'Regresar',
                     sx: `text-white bg-black`,
                     toAction: () => push(mapRoutePages.GO_TO_APPLICATION_EVALUATION_PAGE('LDC', idGroup)),
                  },
               ]}
            />
            <section className='flex flex-col gap-10 px-8'>
               <div className='flex flex-col gap-4'>
                  <h2 className='text-xl'>Solicitantes</h2>
                  <ItemRecomendation data={apply} onSet={onChangeState} />
               </div>
               <div className='flex justify-end mb-5'>
                  <button
                     disabled={btnFinish}
                     className='flex items-center justify-center gap-2 py-2 px-4 bg-black [&:disabled]:hover:bg-gray hover:bg-black-900 text-white rounded-3xl w-44'
                     onClick={setShowModal}>
                     <span className='text-sm'>Finalizar</span>
                     <span className='material-symbols-outlined icon-size-20'>arrow_forward</span>
                  </button>
               </div>
            </section>
         </MainLayout>
      </>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
