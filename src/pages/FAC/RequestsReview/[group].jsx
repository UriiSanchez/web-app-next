import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { getEmpoweredInformation, postSaveAuthorization } from '../../../services';
import {
   ApplicantDropdown,
   AuthorizationButtons,
   EmpoweredDetailSkeleton,
   QuickActionBar,
   TabOptionDocuments,
} from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { useDivMeasure, useGlobalContext, useLocalStorage } from '../../../hooks';
import {
   EnumOptionsDecisionFaculty as DecisionFaculty,
   getError,
   mapMissingFaculty,
   sweetCustomAlert,
   templateSweetAlert,
} from '../../../helpers';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

export default function RequestsDetails({ idGroup }) {
   const {
      user,
      isReloading,
      actions: { toggleReloading },
   } = useGlobalContext();
   const [, setLs, removeLS] = useLocalStorage('ACTIVE_APPLICANT');
   const router = useRouter();
   const [refElement, dimensions] = useDivMeasure();
   const [group, setGroup] = useState({});
   const [applicant, setApplicant] = useState({});
   const [isLoading, setIsLoading] = useState(true);
   const inStatusForRevisionFaculty = group?.idCatStatus === EnumStatus.EN_REVISION_FACULTADO;

   useEffect(() => {
      const fetchData = async () => {
         if (user) {
            const data = await getEmpoweredInformation(idGroup, user.userAD);
            if (!_.isEmpty(data)) {
               setGroup(data);
               const lsIDRequestApplicant = JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'));
               setApplicant(findIdRequestLS(data.requests, lsIDRequestApplicant.idRequest));
               setIsLoading(false);
            }
         }
      };

      fetchData();
   }, [user?.userAD, isReloading]);

   const onChangeApplicant = (item) => {
      setApplicant(item);
      setLs({ idGroup: group.idGroup, idRequest: item.idRequest });
   };

   const onChangeAuthorization = async (value) => {
      try {
         const isSaved = await postSaveAuthorization(applicant.idRequest, user.userAD, value);

         if (!isSaved) {
            toggleReloading();
            return;
         }

         //* Si la solicitud es individual, es el último Facultado en firmar y la decisión fue RECHAZAR se redirecciona al historial.
         if (!group.isGroup && applicant.lastRejection && value === DecisionFaculty.NOT) {
            removeLS();
            router.push(mapRoutePages.GO_TO_HISTORY());
            return;
         }

         //Si una solicitud es grupal se valida si hay request pendientes por firmar.
         let pendingRequestForDecisions = group.requests.filter(
            (item) => item.idRequest !== applicant.idRequest && item.idCatStatus === EnumStatus.EN_REVISION_FACULTADO
         );

         let keyHTMLMessage = 'REQUEST_AUTHORIZATION';
         const otherTypeFaculty = mapMissingFaculty[user.profileType];
         //Verificamos si algún facultado del otro tipo ya AUTORIZO la solicitud.
         const haveYesDecisionOtherType = applicant?.authorizationsFaculty?.some(
            (item) => item.decisionFaculty === DecisionFaculty.YES && item.typeFaculty === otherTypeFaculty
         );

         //Si la solicitud ya cuenta con un AUTORIZAR por las dos partes se debe cerrar
         const isCompletedThisRequest = haveYesDecisionOtherType && value === DecisionFaculty.YES;

         if (pendingRequestForDecisions.length === 0 && isCompletedThisRequest) {
            keyHTMLMessage = 'COMPLETE_AUTHORIZATION';
         }

         // Si la solicitud es grupal se verifica si todas las demás solicitudes han sido rechazadas.
         const allRequestAreRejected = !group.isGroup
            ? false
            : group.requests
               .filter((item) => item.idRequest !== applicant.idRequest)
               .every((item) => item.idCatStatus === EnumStatus.SOLICITUD_RECHAZADA);

         if (pendingRequestForDecisions.length === 0 && value === DecisionFaculty.NOT && allRequestAreRejected) {
            removeLS();
            router.push(mapRoutePages.GO_TO_HISTORY());
            return;
         }

         sweetCustomAlert({
            html: templateSweetAlert[keyHTMLMessage](group.idGroup),
            focusConfirm: false,
         }).then((result) => {
            if (group.isGroup && pendingRequestForDecisions.length > 0) {
               setLs({ idGroup: group.idGroup, idRequest: pendingRequestForDecisions[0].idRequest });
               toggleReloading();
            } else {
               removeLS();
               router.push(mapRoutePages.GO_TO_REQUESTS_PAGE(user.path));
            }
         });
      } catch (error) {
         console.error(error);
         getError({ status: 500, error });
      }
   };

   const findIdRequestLS = (request, idRequest) => request.find((item) => item.idRequest === idRequest);

   return (
      <MainLayout title={`Detalle solicitud ${idGroup}`} sx='h-full '>
         {isLoading ? (
            <EmpoweredDetailSkeleton />
         ) : (
            <div className='flex flex-row gap-x-4' ref={refElement}>
               <section className='flex flex-col justify-between w-full gap-2 pt-3 pl-8 my-4'>
                  <div className='flex items-center gap-2'>
                     <Link className='flex-none hover:text-blue-500 hover:underline' href={mapRoutePages.GO_TO_REQUESTS_PAGE(user.path)}>
                        Solicitudes
                     </Link>
                     <span className='flex-none select-none material-symbols-outlined icon-size-20'>chevron_right</span>
                     <ApplicantDropdown
                        isGroup={group.isGroup}
                        applicantActive={applicant}
                        listRequest={group.requests}
                        onSet={onChangeApplicant}
                        userActive={user}
                     />
                     {inStatusForRevisionFaculty ? (
                        <AuthorizationButtons
                           idStatusRequest={applicant.idCatStatus}
                           lastRejection={applicant.lastRejection}
                           authorizations={applicant.authorizationsFaculty}
                           userAD={user.userAD}
                           profileType={user?.profileType}
                           onSet={onChangeAuthorization}
                        />
                     ) : (
                        <Link
                           href={mapRoutePages.GO_TO_HISTORY()}
                           className='flex items-center justify-center px-4 py-1 text-xs text-white bg-black h-7 w-36 hover:bg-black-900 rounded-3xl'>
                           Regresar
                        </Link>
                     )}
                  </div>
                  {applicant && (
                     <TabOptionDocuments
                        idRequest={applicant.idRequest}
                        idClient={applicant.idClient}
                        fullName={applicant.fullName}
                     />
                  )}
               </section>
               <QuickActionBar requestActive={applicant} dimensions={dimensions} />
            </div>
         )}
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
