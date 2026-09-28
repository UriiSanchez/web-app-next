import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { produce } from 'immer';

import { getStateResults, saveStateResults, statusStateResults } from '../../../services';
import { MainLayout } from '../../../components/Layout';
import { HeaderTitle, Tooltip, NumericInput } from '../../../components/Controls';
import { StateSkelton } from '../../../components/Skeleton/StateSkeleton';
import { useGlobalContext } from '../../../hooks';
import { sweetNormal, tooltipMessages, sweetSnackbar, compareJSON } from '../../../helpers';
import { onCalculateConcepts } from '../../../helpers/calculates';
import { constProfiles as Profile, constTypePerson as TypePerson, mapRoutePages } from '../../../helpers/config';

import PeriodView from '../components/PeriodView';

export default function StateResults({ idRequest, idGroup, idClient }) {
   const { user, actions } = useGlobalContext();
   const { push } = useRouter();
   const [request, setRequest] = useState();
   const [settings, setSettigns] = useState({ save: true, finish: true, isLoad: true });

   const isUserADC = user?.idProfile == Profile.ADC;

   let buttons = [
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: `text-white bg-black`,
         toAction: () => {
            localStorage.removeItem('SR_Page');
            push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, user.path));
         },
         isDisable: false,
      },
   ];

   if (isUserADC) {
      buttons = [
         {
            id: 'save',
            isVisible: true,
            label: 'Guardar',
            sx: `text-white bg-blue-800`,
            toAction: () => {
               onSaveStateResults('save');
            },
            isDisable: settings.save,
         },
         ...buttons,
         {
            id: 'finish',
            isVisible: true,
            label: 'Finalizar',
            sx: `text-white bg-black`,
            toAction: () => {
               onSaveStateResults('finish');
            },
            isDisable: !settings.finish,
         },
      ];
   }

   useEffect(() => {
      fetchData();
   }, []);

   useEffect(() => {
      if (request) {
         let requestOld = JSON.parse(localStorage.getItem('SR_Page')) || '';
         let resultCompared = compareJSON(request, requestOld);
         setSettigns({
            ...settings,
            save: resultCompared,
            finish: statusStateResults(request.periods),
         });
      }
   }, [request]);

   const fetchData = async () => {
      try {
         const { status, data } = await getStateResults(idRequest, idClient);
         if (status !== 200) {
            return;
         }
         setRequest(data);
         setSettigns({ ...settings, isLoad: false });
      } catch (error) {
         console.log(error);
      }
   };

   const onSaveStateResults = async (type) => {
      try {
         actions.toggleLoading('Guardando...');
         let updateRequest = {
            ...request,
            userModify: user?.userAD,
            dateElaboration: dayjs().format('DD-MM-YYYY'),
            status: type == 'save' ? '20' : '21',
         };

         const result = await saveStateResults(updateRequest);
         if (result.status !== 204) {
            sweetNormal({ txt: result?.error?.response?.message || result?.error, icon: 'warning' });
            return;
         }
         setRequest(updateRequest);

         sweetSnackbar({
            html: '<p class="mt-1 text-sm">¡Listo! Los cambios se han guardado</p>',
         });

         if (type != 'save') {
            localStorage.removeItem('SR_Page');
            push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, user.path));
         }
      } catch (error) {
         sweetNormal({ txt: 'No se pudo guardar la información, intente mas tarde', icon: 'info' });
         console.log('Error al guardar el estado de resultados', error);
      } finally {
         actions.toggleLoading();
      }
   };

   const onChangeVirtual = (value, atName, period, id) => {
      const newRequest = produce(request, (draftRequest) => {
         draftRequest.periods[period][atName].forEach((item) => {
            if (item.id === id) {
               item.amount = value === null ? value : String(value);
            }
         });

         draftRequest.periods[period].concepts = onCalculateConcepts(draftRequest.periods[period].concepts, id);
      });

      setRequest(newRequest);
   };

   return (
      <MainLayout title='Estado de resultados' sx='pb-10'>
         <HeaderTitle
            title={` ${(request?.idCatTypePerson == TypePerson.APPLICANT ? 'Solicitante: ' : 'Obligado Solidario: ') + request?.fullName}`}
            buttons={buttons}
         />
         {settings.isLoad ? (
            <StateSkelton />
         ) : (
            <section className='flex flex-col gap-4 px-8 text-sm'>
               <div className='flex items-center justify-between w-full'>
                  <div className='flex-col flex-auto gap-2'>
                     <div className='text-xl'>Estado de resultados</div>
                     <div className='text-black-500'>Cifras en miles de pesos</div>
                  </div>
                  <div className='flex items-center justify-end text-sm basis-1/3'>
                     <p className='mr-2 font-semibold text-right basis-2/3'>Fecha de elaboración</p>
                     <div className='w-28 h-6 py-0.5 text-center border border-[#848484] rounded bg-[#EDEDED] text-[#848484]'>
                        {request?.dateElaboration}
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-flow-col grid-cols-4 gap-4 pl-8 pr-8 text-sm gap-x-12'>
                  {/* COLUMNA 1 */}
                  <div className='row-span-4 '></div>
                  {request?.periods?.map(
                     ({ month, monthIncludes, officeOrAccountant, periodType, sourceInformation, year }, index) => (
                        <PeriodView
                           key={`${year}-${periodType}`}
                           disabled
                           id={`period-${index}`}
                           month={month}
                           monthIncludes={parseInt(monthIncludes) || 0}
                           officeOrAccountant={officeOrAccountant ?? ''}
                           periodType={periodType}
                           sourceInformation={sourceInformation ?? ''}
                           year={year}
                        />
                     )
                  )}
               </div>
               <div className='w-full h-8 mt-4 bg-black rounded-md rounded-b-none'></div>
               <div className='pl-8 pr-8 space-y-2'>
                  <div className='grid grid-cols-4 gap-12'>
                     <div className='grid items-center grid-cols-1 gap-2'>
                        {request?.periods[0]?.concepts.map((c) => (
                           <div key={c.id} className='flex items-center justify-end col-span-1 gap-2'>
                              {c.description}
                              {['1', '6', '14'].includes(c.id) && <Tooltip msg={tooltipMessages[c.id] || ''} />}
                           </div>
                        ))}
                     </div>
                     {request?.periods?.map((period, index) => (
                        <div
                           key={`${'concept-' + period.periodType}-${period.year}`}
                           className='grid items-center grid-cols-1 gap-2'>
                           {period?.concepts?.map((concept) => (
                              <div key={concept.id} className='flex items-center col-span-1 gap-4'>
                                 <NumericInput
                                    disabled={!isUserADC || concept.automatic}
                                    allowNegative
                                    onChange={(value) => onChangeVirtual(value, 'concepts', index, concept.id)}
                                    percentage={concept.percentage}
                                    percentageId={`percentage-period${index}-${concept.id}`}
                                    value={concept.amount}
                                    valueId={`amount-period${index}-${concept.id}`}
                                    viewDecimals={concept.automatic || !isUserADC}
                                    withPercentage={true}
                                 />
                              </div>
                           ))}
                        </div>
                     ))}
                  </div>
               </div>
               <div className='flex flex-col ml-2 text-lg'>
                  <p>{request?.fullName}</p>
                  <p>Cédula de depreciación y amortización</p>
               </div>
               <div className='w-full h-8 bg-black rounded-md rounded-b-none'></div>
               <div className='grid items-center grid-flow-col grid-cols-4 gap-4 pl-8 pr-8 text-sm gap-x-12'>
                  {/* COLUMNA 1 */}
                  <div className='row-span-4 '></div>
                  {request?.periods?.map(
                     ({ month, monthIncludes, officeOrAccountant, periodType, sourceInformation, year }, index) => (
                        <PeriodView
                           key={`${year}-${periodType}`}
                           disabled
                           id={`period-${index}`}
                           month={month}
                           monthIncludes={parseInt(monthIncludes) || 0}
                           officeOrAccountant={officeOrAccountant ?? ''}
                           periodType={periodType}
                           sourceInformation={sourceInformation ?? ''}
                           year={year}
                        />
                     )
                  )}
               </div>
               <div className='grid items-center grid-cols-4 gap-12 pl-8 pr-8 space-y-2'>
                  {request?.periods?.length > 0 && (
                     <div className='flex items-center justify-end col-span-1 gap-2 pt-3'>
                        Depreciación y amortización
                        {<Tooltip msg={tooltipMessages[8]} />}
                     </div>
                  )}
                  {request?.periods?.map((period, index) =>
                     period?.depreciationSchedule.map((item) => (
                        <div key={item.id} className='flex items-center col-span-1 gap-4'>
                           <NumericInput
                              allowNegative
                              disabled={!isUserADC || item.automatic}
                              onChange={(value) => onChangeVirtual(value, 'depreciationSchedule', index, item.id)}
                              value={item.amount}
                              valueId={`${item.description}-period${index}`}
                              viewDecimals={!isUserADC}
                           />
                        </div>
                     ))
                  )}
               </div>
               <div className='flex flex-col ml-2 text-lg'>
                  <p>Análisis de operatividad de Divisas (opcional)</p>
               </div>
               <div className='w-full h-8 bg-black rounded-md rounded-b-none'></div>
               <div className='pb-10 pl-8 pr-8 space-y-2'>
                  <div className='grid grid-cols-4 gap-12'>
                     <div className='grid items-center grid-cols-1 gap-2'>
                        {request?.periods[0]?.analyseOperating.map((c) => {
                           return (
                              <div key={4 + c.id} className='text-right whitespace-nowrap'>
                                 {c.description}
                              </div>
                           );
                        })}
                     </div>
                     {request?.periods?.map((period, index) => (
                        <div
                           key={`${'Operating-' + period.periodType}-${period.year}`}
                           className='grid items-center grid-cols-1 gap-2'>
                           {period?.analyseOperating?.map((item) => {
                              return (
                                 <div key={item.id} className='flex items-center col-span-1 gap-4'>
                                    <NumericInput
                                       allowNegative
                                       disabled={!isUserADC || item.automatic}
                                       onChange={(value) => onChangeVirtual(value, 'analyseOperating', index, item.id)}
                                       value={item.amount}
                                       valueId={`${item.description}-period${index}`}
                                       viewDecimals={!isUserADC}
                                    />
                                 </div>
                              );
                           })}
                        </div>
                     ))}
                  </div>
               </div>
            </section>
         )}
      </MainLayout>
   );
}

export const getServerSideProps = async ({ query }) => {
   const { idClient, idGroup, request = '' } = query;
   return {
      props: { idClient, idGroup, idRequest: request },
   };
};
