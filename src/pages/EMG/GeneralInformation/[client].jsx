import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { postCreateRequest, getGeneralInfo } from '../../../services';
import { ListEconomicGroup, RequestsIsiloans } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { sweetConditional, sweetModalRedirect, sweetNormal } from '../../../helpers';
import { mapRoutePages } from '../../../helpers/config';

export default function GeneralInformation({ idClient }) {
   const { push } = useRouter();
   const { user, actions } = useGlobalContext();
   const [info, setInfo] = useState({});
   const [listApplicants, setListApplicants] = useState([]);
   const isDisable = useMemo(() => {
      if (_.isEmpty(info?.applicant)) {
         return true;
      }

      if (listApplicants.length > 1) {
         let notCatchEmailAlternative = listApplicants.some(
            (appli) => appli.edit && (!appli.alternativeMail || appli.alternativeMail === '')
         );
         return notCatchEmailAlternative;
      }

      return false;
   }, [info, listApplicants]);

   const buttons = [
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: 'text-white bg-black',
         toAction: () => push('/'),
      },
      {
         id: 'next',
         isVisible: true,
         label: 'Crear solicitud',
         sx: `text-white bg-black`,
         toAction: () => onCheckForNextStep(),
         isDisable,
      },
   ];

   useEffect(() => {
      const fetchDataAsync = async () => {
         actions.toggleLoading();
         const { status, data } = await getGeneralInfo(idClient);
         if (status !== 200) {
            actions.toggleLoading();
            return;
         }

         setInfo({ applicant: data?.appli, group: data?.group, requestsIsiloans: data?.requests });
         setListApplicants([data?.appli]);
         actions.toggleLoading();
      };

      fetchDataAsync();
   }, [idClient]);

   const onCheckForNextStep = () => {
      const inProgress = info?.group.length > 0 ? info.group.some((a) => a.isInProgress) : false;
      if (inProgress) {
         sweetNormal({
            title: '¡No podemos crear la solicitud!',
            txt: 'Uno o más integrantes de tu grupo económico ya tienen una solicitud en curso.',
            icon: 'warning',
         });
      } else {
         sweetConditional({
            title: '¡Recuerda que!',
            text: 'No podrás cambiar a los integrantes del grupo económico una vez creada la solicitud.',
            onFunc: onCreateApplication,
            accept: 'Continuar',
            cancel: 'Regresar',
         });
      }
   };

   const onCreateApplication = async () => {
      try {
         actions.toggleLoading('Guardando...');
         const { status, data } = await postCreateRequest(listApplicants, user?.userAD, info.applicant.group);
         if (status !== 200) {
            return;
         }

         sweetModalRedirect({ title: '¡Se guardo la información correctamente!' });
         setTimeout(() => {
            push(mapRoutePages.GO_TO_SOLIDARY_PAGE(data?.groupRequest));
         }, 1000);
      } catch (error) {
         console.error(error);
      } finally {
         actions.toggleLoading();
      }
   };

   return (
      <MainLayout title='Información general'>
         <HeaderTitle title='Información general' buttons={buttons} />
         <div className='flex flex-col h-auto gap-4 px-8 text-sm'>
            <div className='flex gap-4 h-fit '>
               <section className='border w-5/12 max-h-[16.5rem] border-gray rounded-md text-xs 2xl:text-sm'>
                  <div className='px-4 py-3 font-normal text-white bg-black rounded-t-md'>
                     <p>Información del cliente</p>
                  </div>
                  <div className='flex flex-col px-3 py-1 max-h-[14rem] container-overflow'>
                     <div className='flex flex-row p-2'>
                        <p className='pr-2 font-semibold'>Nombre:</p>
                        <p data-testid='client-name'>{info?.applicant?.fullName ?? '-'}</p>
                     </div>
                     <div className='flex flex-row p-2'>
                        <p className='pr-2 font-semibold'>Nombre del grupo:</p>
                        <p data-testid='client-group'>{info?.applicant?.group || '-'}</p>
                     </div>
                     <div className='flex flex-row p-2'>
                        <p className='pr-2 font-semibold'>Número de persona:</p>
                        <p data-testid='client-idClient'>{info?.applicant?.idClient ?? '-'}</p>
                     </div>
                     <div className='flex flex-row p-2'>
                        <p className='pr-2 font-semibold'>RFC:</p>
                        <p data-testid='client-rfc'>{info?.applicant?.rfc || '-'}</p>
                     </div>
                     <div className='flex flex-row p-2'>
                        <p className='pr-2 font-semibold text-cobalt text-opacity-60'>Correo electrónico:</p>
                        <p data-testid='client-email' className='w-2/4 pr-2 truncate'>
                           {info?.applicant?.email ?? '-'}
                        </p>
                     </div>
                  </div>
               </section>
               <section className='border border-gray rounded-md overflow-hidden w-7/12 max-h-[16.5rem]] text-xs 2xl:text-sm '>
                  <div className='grid grid-cols-12 py-3 text-white bg-black rounded-t gap-y-4 gap-x-2 place-items-center'>
                     <input type='checkbox' id='example' disabled checked className='option-input radio !top-0' />
                     <div className='col-span-4'>Persona del grupo económico</div>
                     <div className='col-span-3'>Correo electrónico</div>
                     <div className='text-center'>Editar</div>
                     <div className='col-span-3 text-center'>Estatus de solicitud</div>
                  </div>
                  <div className='max-h-[14rem] container-overflow'>
                     <div className='grid grid-cols-12 pb-2 text-sm gap-y-4 gap-x-2 place-items-center'>
                        <div className='grid w-full h-10 grid-cols-12 col-span-12 bg-white gap-x-2 place-items-center'>
                           <input
                              type='checkbox'
                              id={'check-' + info?.applicant?.idClient}
                              disabled
                              checked
                              className='option-input radio !top-0'
                           />
                           <div className='h-4 col-span-11 text-black-500'>{info?.applicant?.fullName}</div>
                        </div>
                        {!_.isEmpty(info?.group) && (
                           <ListEconomicGroup
                              group={info?.group}
                              applicants={listApplicants}
                              onSetData={setListApplicants}
                           />
                        )}
                     </div>
                  </div>
               </section>
            </div>
            <RequestsIsiloans {...{ requests: info?.requestsIsiloans?.applicant }} />
         </div>
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { client = 0 } = params;
   return {
      props: { idClient: parseInt(client) },
   };
};
