import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getOneRequest, getDocumentation, onChangeRequestStatusOrAssignUser } from '../../../services';
import { ParticipantsTable, DocumentationTable } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { getError, sweetConditional, sweetConfirmation, sweetModalRedirect, sweetNormal } from '../../../helpers';
import { EnumStatus, constNextProfileAndStatus, mapRoutePages } from '../../../helpers/config';

import LegalRepresentatives from './components/LegalRepresentatives';

export default function Documentation({ idGroup }) {
   const { push } = useRouter();
   const { user, actions } = useGlobalContext();
   const [application, setApplication] = useState([]);
   const [docs, setDocs] = useState({});
   const [isNextProfile, setIsNextProfile] = useState({
      disabled: true,
      name: 'Enviar solicitud',
      idCatStatus: EnumStatus.EN_MESA_RECEPTORA,
      nextProfile: 'MR',
      msg: '',
   });
   const [modLegal, setModLegal] = useState({ show: false, info: null });
   const buttons = [
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: 'text-white bg-black',
         toAction: () => push(mapRoutePages.GO_TO_SOLIDARY_PAGE(idGroup)),
      },
      {
         id: 'next',
         isVisible: true,
         isDisable: isNextProfile.disabled,
         label: isNextProfile.name,
         sx: 'text-white bg-black',
         toAction: () =>
            sweetConditional({
               title: '¡Última revisión!',
               text: '<p>¡Por favor! Antes de continuar, revisa que todos los participantes cumplan con todos los documentos requeridos.</p>',
               onFunc: onPassRequestToDesk,
               confirmButtonColor: '#059669',
               cancelButtonColor: '#ef4444',
            }),
      },
   ];

   useEffect(() => {
      const fetchDataAsync = async () => {
         const result = await getOneRequest(idGroup);
         if (result.status !== 200) {
            getError(result);
            return;
         }

         const { requestResponseList, idCatStatus, sendOtherProfile, oldStatus } = result.data;
         if (
            [
               EnumStatus.SOLICITUD_FINALIZADA,
               EnumStatus.SOLICITUD_CANCELADA,
               EnumStatus.SOLICITUD_CANCELADA_POR_EMBARGO,
            ].includes(idCatStatus)
         ) {
            sweetConfirmation({
               html: `<h2 class="text-3xl font-semibold my-4">¡Solicitud <span class="text-gray">Cancelada</span> o <span class="text-gray">Finalizada</span>!</h2>
               <p class="text-base mb-2">La solicitud que deseas ver ha sido <b>cancelada</b> o <b>finalizada</b> y ya no está disponible para su acceso. Si necesitas informacción adicional visita la sección de <b>Historial</b>.</p>
               <p class="text-gray font-bold">Te redireccionaremos a la pantalla solicitudes..</p>`,
               width: 560,
               timer: 5000,
            });

            setTimeout(() => {
               push(mapRoutePages.GO_TO_REQUESTS_PAGE('EMG'));
            }, 5000);
         }

         setApplication({
            applicants: requestResponseList,
            sendOtherProfile,
            idCatStatus,
         });

         let nextData = constNextProfileAndStatus[idCatStatus];
         setIsNextProfile({
            disabled:
               [
                  EnumStatus.EN_ESPECIALISTA_FINANCIAMIENTO,
                  EnumStatus.DEVUELTA_EF_POR_MESA,
                  EnumStatus.DEVUELTA_EF_POR_LIDER,
                  EnumStatus.DEVUELTA_EF_POR_ANALISTA,
               ].includes(idCatStatus) && sendOtherProfile
                  ? false
                  : true,
            name: idCatStatus === EnumStatus.EN_ESPECIALISTA_FINANCIAMIENTO ? 'Enviar solicitud' : 'Reenviar solicitud',
            idCatStatus: oldStatus || nextData?.nextStatus || EnumStatus.EN_MESA_RECEPTORA,
            nextProfile: nextData?.nextProfile || '',
            msg: nextData?.msg || '',
         });
      };

      fetchDataAsync();
   }, []);

   const onApplyCIEC = () => {
      actions.toggleLoading('Procesando...');
      setTimeout(() => {
         sweetNormal({ title: 'Solicitud CIEC', txt: 'Se ha enviado el correo correctamente', icon: 'success' });
         actions.toggleLoading();
      }, 1500);
   };

   const onModalLegal = (info) => {
      setModLegal({ show: !_.isEmpty(info), info: !_.isEmpty(info) ? info : null });
   };

   const onGetDocumentation = async (idClient, idRequest) => {
      try {
         actions.toggleLoading('Buscando documentos...');
         const objApply = application.applicants.find((u) => u.idRequest == idRequest);
         let docs = objApply?.relatedPersonResponseList.find((i) => i.idClient == idClient);
         const result = await getDocumentation({ ...docs, idGroup, idStatusGroup: application.idCatStatus }, user);

         if (result.status !== 200) {
            getError(result);
         }

         setDocs({ ...result.data });
      } catch (error) {
         console.log(error);
      } finally {
         actions.toggleLoading();
      }
   };

   const onPassRequestToDesk = async () => {
      const { idCatStatus, nextProfile, msg } = isNextProfile;
      try {
         const result = await onChangeRequestStatusOrAssignUser({
            idGroupRequest: idGroup,
            idCatStatus,
            nextProfile,
            userCreate: user.userAD,
         });

         if (result.status !== 204) {
            getError(result);
            return;
         }

         sweetModalRedirect({ title: msg });
         setTimeout(() => {
            push('/');
         }, 1000);
      } catch (error) {
         console.log('Pase de solicitud MRC: ', error);
      }
   };

   return (
      <>
         {modLegal.show && <LegalRepresentatives info={modLegal.info} fnSet={onModalLegal} />}
         <MainLayout title='Documentación requerida'>
            <HeaderTitle
               {...{
                  buttons,
                  title: 'Documentación requerida del Solicitante & Obligado Solidario',
                  request: { idCatStatus: application.idCatStatus, idGroup },
                  showCancel: true,
               }}
            />
            <div className='flex gap-4 px-8 mb-4 max-w-screen-2xl 2xl:mx-auto'>
               <ParticipantsTable
                  {...{
                     applycants: application.applicants,
                     onApplyCIEC,
                     onSelect: onGetDocumentation,
                  }}
               />
               <DocumentationTable {...{ docs, onFunc: onModalLegal }} />
            </div>
         </MainLayout>
      </>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: parseInt(group) },
   };
};
