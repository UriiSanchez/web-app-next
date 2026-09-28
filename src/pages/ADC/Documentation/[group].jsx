import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getDocumentation, getOneRequest, updateFinancialFlag } from '../../../services';
import { DocumentationTable, ParticipantsTable } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { getChangedFinancialClients, getError, sweetCustomAlert, templateSweetAlert } from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

export default function Documentation({ idGroup }) {
   const { push } = useRouter();
   const { user, actions } = useGlobalContext();
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
         id: 'returnDoc',
         isVisible: true,
         isDisable: isButtons.return,
         label: 'Devolver solicitud',
         sx: `text-white bg-black`,
         toAction: () => push(mapRoutePages.GO_TO_RETURN_REQUEST_PAGE(user.path, idGroup, 'Documentation')),
      },
      {
         id: 'next',
         isVisible: true,
         isDisable: isButtons.evaluation,
         label: 'Evaluar solicitud',
         sx: `text-white bg-black`,
         toAction: () => push(mapRoutePages.GO_TO_APPLICATION_EVALUATION_PAGE(user.path, idGroup)),
      },
   ];

   useEffect(() => {
      const fetchDataAsync = async () => {
         const result = await getOneRequest(idGroup);
         if (result.status !== 200) {
            getError(result);
            return;
         }

         const { requestResponseList, idCatStatus, ...group } = result.data;
         setApplication({
            applicants: requestResponseList,
            group,
            idCatStatus,
         });

         fnValidfinancialDocsChanges(getChangedFinancialClients(requestResponseList), idCatStatus);

         //* Se valida si la solicitud esta en AC o si esta completo el checklist
         let evaluation =
            ![EnumStatus.EN_ANALISTA, EnumStatus.DEVUELTA_ANALISTA_POR_LIDER].includes(idCatStatus) ||
            !group.sendOtherProfile;
         setIsButtons({
            return: ![EnumStatus.EN_ANALISTA, EnumStatus.DEVUELTA_ANALISTA_POR_LIDER].includes(idCatStatus),
            evaluation,
         });
      };

      fetchDataAsync();
   }, []);

   const handleGetDocumentation = async (idClient, idRequest) => {
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

   const fnValidfinancialDocsChanges = (participantsFinancialChanged, idCatStatus) => {
      if (
         !_.isEmpty(participantsFinancialChanged) &&
         [EnumStatus.EN_ANALISTA, EnumStatus.DEVUELTA_ANALISTA_POR_LIDER].includes(idCatStatus)
      ) {
         sweetCustomAlert({
            html: templateSweetAlert.CHANGE_FINANCIAL(participantsFinancialChanged),
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            focusConfirm: true,
            customClass: {
               popup: 'w-[632px] max-h-[468px]',
               htmlContainer: 'px-6 w-full',
               confirmButton: ' btn-modal-primary font-medium text-sm w-44 h-8 text-white bg-black-900 rounded-3xl',
            },
         }).then((result) => result.value && updateFinancialFlag(idGroup));
      }
   };

   return (
      <MainLayout title='Documentación requerida'>
         <HeaderTitle title='Documentación requerida del Solicitante & Obligado Solidario' buttons={buttons} />
         <div className='flex gap-4 px-8 mb-4'>
            <ParticipantsTable {...{ applycants: application.applicants, onSelect: handleGetDocumentation }} />
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
