import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { produce } from 'immer';

import { getBalanceSheet, saveBalanceSheet, statusGeneralBalance } from '../../../services';
import { MainLayout } from '../../../components/Layout';
import { HeaderTitle } from '../../../components/Controls';
import { BalanceSkeleton } from '../../../components/Skeleton';
import { useGlobalContext } from '../../../hooks';
import { compareJSON, sweetNormal, sweetSnackbar } from '../../../helpers';
import { onCalculateGB } from '../../../helpers/calculates';
import { constProfiles as Profile, constTypePerson as TypePerson, mapRoutePages } from '../../../helpers/config';

import ItemBalance from './components/ItemBalance';
import PeriodView from '../components/PeriodView';

export default function GeneralBalance({ idClient, idGroup, idRequest, rfc }) {
   const { push } = useRouter();
   const { user, actions, isReloading } = useGlobalContext();
   const [request, setRequest] = useState(null);
   const [settings, setSettigns] = useState({ save: true, finish: true, isLoad: true });

   const isUserADC = user?.idProfile == Profile.ADC;

   const buttons = [
      {
         id: 'save',
         isVisible: true,
         label: 'Guardar',
         sx: `text-white bg-blue-800`,
         toAction: () => onSaveBG('save'),
         isDisable: settings.save,
      },
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: `text-white bg-black`,
         toAction: () => onNavigate(),
      },
      {
         id: 'finish',
         isVisible: true,
         label: isUserADC ? 'Finalizar' : 'Continuar',
         sx: `text-white bg-black`,
         toAction: () => (isUserADC ? onSaveBG('finish') : onNavigate()),
         isDisable: settings.finish,
      },
   ];

   useEffect(() => {
      const fetchData = async () => {
         const { status, data } = await getBalanceSheet(rfc, idRequest, idClient);
         if (status !== 200) {
            return;
         }
         setRequest(data);
         setSettigns({ ...settings, isLoad: false });
      };
      fetchData();
   }, [idRequest, idClient, rfc, isReloading]);

   useEffect(() => {
      if (request) {
         let requestOld = JSON.parse(localStorage.getItem('BS_Page')) || '';
         let resultCompared = compareJSON(request, requestOld);
         setSettigns({
            ...settings,
            save: resultCompared,
            finish: statusGeneralBalance(request),
         });
      }
   }, [request]);

   const onNavigate = () => {
      localStorage.removeItem('BS_Page');
      push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, user.path));
   };

   const onSaveBG = async (type) => {
      try {
         actions.toggleLoading('Guardando...');
         const updatedRequest = produce(request, (draftRequest) => {
            draftRequest.status = type === 'save' ? 20 : 21;
            draftRequest.dataOrigin = 'MANUAL';
            draftRequest.userModify = user.userAD;
         });

         const result = await saveBalanceSheet(updatedRequest);
         if (result.status !== 204) {
            return;
         }

         sweetSnackbar({
            html: '<p class="mt-1 text-sm">¡Listo! Los cambios se han guardado</p>',
         });

         if (type !== 'save') {
            localStorage.removeItem('BS_Page');
            push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, user.path));
            return;
         }
         actions.toggleReloading();
      } catch (error) {
         sweetNormal({ txt: 'No se pudo guardar la información, intente mas tarde', icon: 'info' });
         console.log('Error al guardar el balance general', error);
      } finally {
         actions.toggleLoading();
      }
   };

   const onChangeState = (value, name, periodIndex) => {
      const newRequest = produce(request, (draftRequest) => {
         draftRequest.periods[periodIndex][name] = value;
      });

      setRequest(newRequest);
   };

   const onUpdateState = (value, idx, idItem) => {
      const newRequest = produce(request, (draftRequest) => {
         let { concepts } = draftRequest.periods[idx];
         concepts.forEach((concept) => {
            if (concept.idItemChild === idItem) {
               concept.value = value === null ? value : String(value);
            }
         });

         draftRequest.periods[idx].concepts = onCalculateGB(concepts, idItem) || concepts;
      });

      setRequest(newRequest);
   };

   return (
      <MainLayout title='Balance General' sx='pb-10'>
         <HeaderTitle
            title={
               (request?.idCatTypePerson == TypePerson.APPLICANT ? 'Solicitante: ' : 'Obligado solidario: ') + (request?.fullName || '')
            }
            buttons={buttons}
         />
         {settings.isLoad ? (
            <BalanceSkeleton />
         ) : (
            <section className='flex flex-col gap-4 px-8 pb-10 text-sm'>
               <div className='flex items-center justify-between w-full'>
                  <div className='flex-col flex-auto gap-2'>
                     <div className='text-xl'>Balance General</div>
                     <div className='text-gray'>Cifras en miles de pesos</div>
                  </div>
                  <div className='flex items-center justify-end text-sm basis-1/3'>
                     <p className='mr-2 font-semibold text-right basis-2/3'>Fecha elaboración</p>
                     <div className='w-28 h-6 py-0.5 text-center border border-[#848484] rounded bg-[#EDEDED] text-[#848484]'>
                        {request?.dateElaboration}
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-flow-col grid-cols-4 px-4 text-sm gap-y-4 gap-x-8'>
                  <div className='row-span-4 '></div>
                  {!_.isEmpty(request) &&
                     request?.periods.map(
                        ({ month, monthIncludes, officeOrAccountant, periodType, sourceInformation, year }, index) => (
                           <PeriodView
                              key={`${year}-${periodType}`}
                              disabled={!isUserADC}
                              id={`period-${index}`}
                              month={month}
                              monthIncludes={monthIncludes}
                              officeOrAccountant={officeOrAccountant ?? ''}
                              onOfficeChange={(value) => onChangeState(value, 'officeOrAccountant', index)}
                              onSourceChange={(value) => onChangeState(value, 'sourceInformation', index)}
                              periodType={periodType}
                              sourceInformation={sourceInformation ?? ''}
                              year={Number(year)}
                           />
                        )
                     )}
               </div>
               {!_.isEmpty(request) && <ItemBalance info={request} fnSet={onUpdateState} disabled={!isUserADC} />}
            </section>
         )}
      </MainLayout>
   );
}

export const getServerSideProps = async ({ query }) => {
   const { idClient = 0, idGroup = 0, request = 0, rfc = 0 } = query;
   return {
      props: { idClient, idGroup, idRequest: request, rfc },
   };
};
