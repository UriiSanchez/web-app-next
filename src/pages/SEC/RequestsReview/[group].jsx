import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import { getEmpoweredInformation } from '../../../services';
import {
   ApplicantDropdown,
   CoverPreview,
   EmpoweredDetailSkeleton,
   QuickActionBar,
   TabOptionDocuments,
} from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { Breadcrumbs, CustomLink } from '../../../components/Controls';
import { useDivMeasure, useGlobalContext, useLocalStorage } from '../../../hooks';
import { EnumStatus, mapRoutePages } from '../../../helpers/config';

export default function RequestsDetails({ idGroup, coverPreview }) {
   const { user, isReloading } = useGlobalContext();
   const [refElement, dimensions] = useDivMeasure();
   const [, setLs] = useLocalStorage('ACTIVE_APPLICANT');
   const [group, setGroup] = useState({});
   const [applicant, setApplicant] = useState({});
   const [isLoading, setIsLoading] = useState(true);
   const isDisabledButtons = useMemo(() => {
      if (_.isEmpty(applicant)) {
         return true;
      }

      return applicant.idCatStatus === EnumStatus.SOLICITUD_RECHAZADA ? true : applicant?.sealed;
   }, [applicant.idClient, applicant.sealed]);

   useEffect(() => {
      const fetchData = async () => {
         if (user) {
            const data = await getEmpoweredInformation(idGroup, user.userAD, 'SEC');
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

   const findIdRequestLS = (request, idRequest) => request.find((item) => item.idRequest === idRequest);

   const routesNavigation = [
      {
         label: 'Solicitudes',
         href: mapRoutePages.GO_TO_REQUESTS_PAGE(user?.path),
         lastItem: false,
         sx: '',
      },
   ];

   return (
      <MainLayout title='Detalle solicitud'>
         {coverPreview && (
            <CoverPreview
               idRequest={applicant.idRequest}
               idClient={applicant.idClient}
               idGroup={+idGroup}
               isGroup={group.isGroup}
               requests={group.requests}
            />
         )}
         {isLoading ? (
            <EmpoweredDetailSkeleton />
         ) : (
            <div className='flex flex-row' ref={refElement}>
               <section className='flex flex-col justify-between w-full gap-2 px-8 my-4 pt-3'>
                  <div className='flex items-center gap-2'>
                     <Breadcrumbs routes={routesNavigation} />
                     <ApplicantDropdown
                        isGroup={group.isGroup}
                        applicantActive={applicant}
                        listRequest={group.requests}
                        onSet={onChangeApplicant}
                        userActive={user}
                     />
                     <div className='flex gap-3'>
                        <CustomLink
                           isDisabled={isDisabledButtons}
                           href={{
                              pathname: mapRoutePages.GO_TO_COVER_PAGE(user.path, idGroup),
                              query: { idRequest: applicant.idRequest },
                           }}
                           sx='btn-secondary'>
                           Editar
                        </CustomLink>
                        <CustomLink
                           isDisabled={isDisabledButtons}
                           href={{
                              pathname: mapRoutePages.GO_TO_REQUEST_DETAILS_PAGE(user?.path, idGroup),
                              query: { coverPreview: true },
                           }}
                           sx='w-36 h-7 py-1.5 px-2 border border-black rounded-2xl text-xs 2xl:text-sm 2xl:w-40 flex items-center justify-center gap-1 select-none text-white bg-black-900'>
                           Sellar
                           <span className='material-symbols-outlined icon-size-20'>arrow_forward</span>
                        </CustomLink>
                     </div>
                  </div>
                  {!_.isEmpty(applicant) && (
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

export const getServerSideProps = async ({ query }) => {
   const { group: idGroup, coverPreview = false } = query;
   if (!idGroup || isNaN(Number(idGroup))) {
      return {
         notFound: true,
      };
   }

   return {
      props: { idGroup, coverPreview },
   };
};
