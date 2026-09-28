import _, { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getDocumentation, getOneRequest } from '../../../services';
import { DocumentationTable, ParticipantsTable } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import {
   getChangedFinancialClients,
   getError,
   sweetConfirmation,
   sweetCustomAlert,
   templateSweetAlert,
} from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

export default function Documentation({ idGroup }) {
   const { push, replace } = useRouter();
   const { user, actions, isReloading } = useGlobalContext();
   const [application, setApplication] = useState([]);
   const [docs, setDocs] = useState({});
   const [isButtons, setIsButtons] = useState({ return: true, evaluation: true });
   const buttons = [
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: `text-white bg-black`,
         toAction: () => push(mapRoutePages.GO_TO_REQUESTS_PAGE(user.path)),
      },
      {
         id: 'return',
         isVisible: true,
         isDisable: isButtons.return,
         label: 'Devolver solicitud',
         sx: `text-white bg-black`,
         toAction: () => push(mapRoutePages.GO_TO_RETURN_REQUEST_PAGE(user.path, idGroup, 'Documentation')),
      },
      {
         id: 'evaluation',
         isVisible: true,
         isDisable: isButtons.evaluation,
         label: 'Evaluar solicitud',
         sx: `text-white bg-black`,
         toAction: () => push(mapRoutePages.GO_TO_APPLICATION_EVALUATION_PAGE(user.path, idGroup)),
      },
   ];

   useEffect(() => {
      fetchDataAsync();
   }, [user?.userAD]);

   useEffect(() => {
      if (isReloading) {
         fetchDataAsync();
         actions.toggleReloading();
      }
   }, [isReloading]);

   const fetchDataAsync = async () => {
      if (user?.userAD) {
         const result = await getOneRequest(idGroup);
         if (result.status !== 200) {
            getError(result);
            return;
         }
         const { requestResponseList, idCatStatus, ...group } = result.data;

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

         setApplication({
            applicants: requestResponseList,
            group,
            idCatStatus,
         });
         fnValidfinancialDocsChanges(getChangedFinancialClients(requestResponseList), idCatStatus);

         setIsButtons({
            return: ![EnumStatus.EN_ASIGNACION_LIDER, EnumStatus.EN_REVISION_LIDER].includes(idCatStatus),
            evaluation: idCatStatus !== EnumStatus.EN_REVISION_LIDER || _.isEmpty(group.idAnalyst),
         });
      }
   };

   const fnValidfinancialDocsChanges = (participantsFinancialChanged, idCatStatus) => {
      if (!_.isEmpty(participantsFinancialChanged)) {
         sweetCustomAlert({
            html: templateSweetAlert.CHANGE_FINANCIAL(participantsFinancialChanged),
            confirmButtonText: [
               EnumStatus.EN_ASIGNACION_LIDER,
               EnumStatus.EN_ANALISTA,
               EnumStatus.DEVUELTA_ANALISTA_POR_LIDER,
            ].includes(idCatStatus)
               ? 'Aceptar'
               : 'Devolver al analista',
            allowOutsideClick: false,
            allowEscapeKey: false,
            focusConfirm: true,
            customClass: {
               popup: 'w-[632px] max-h-[468px]',
               htmlContainer: 'px-6 w-full',
               confirmButton: ' btn-modal-primary font-medium text-sm w-44 h-8 text-white bg-black-900 rounded-3xl',
            },
         }).then((result) => {
            if (idCatStatus === EnumStatus.EN_REVISION_LIDER)
               push(mapRoutePages.GO_TO_RETURN_REQUEST_PAGE('LDC', idGroup, 'ApplicationEvaluation'));
         });
      }
   };

   const onGetDocumentation = async (idClient, idRequest) => {
      try {
         actions.toggleLoading('Buscando documentos...');
         const objApply = application.applicants.find((u) => u.idRequest == idRequest);
         let docs = objApply?.relatedPersonResponseList.find((i) => i.idClient == idClient);
         const result = await getDocumentation(
            { ...docs, idGroup, idStatusGroup: application.idCatStatus, hasVerification: objApply.hasVerification },
            user
         );

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

   return (
      <MainLayout title='Documentación requerida'>
         <HeaderTitle
            {...{
               buttons,
               title: 'Documentación requerida del Solicitante & Obligado Solidario',
               request: { ...application?.group, idCatStatus: application.idCatStatus },
               showBall: true,
               showCancel: false,
            }}
         />
         <div className='flex gap-4 px-8 mb-6'>
            <ParticipantsTable {...{ applycants: application.applicants, onSelect: onGetDocumentation }} />
            <DocumentationTable {...{ docs }} />
         </div>
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
