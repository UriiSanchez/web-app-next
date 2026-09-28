import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getOneRequest } from '../../../services';
import { EvaluationSkeleton } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { ExecuteModel } from '../../../components/Model';
import { formatId, sweetConfirmation, sweetNormal } from '../../../helpers';

import { mapRoutePages } from '../../../helpers/config';

export default function ApplicationEvaluation({ idGroup }) {
   const { push } = useRouter();
   const [apply, setApply] = useState({});
   const [settings, setSettings] = useState({
      model: false,
      cover: false,
      recommendation: false,
      detailsModel: { icon: 'check_circle', color: 'gray-100' },
   });

   useEffect(() => {
      const fetchDataAsync = async () => {
         const { status, data, error } = await getOneRequest(idGroup);
         if (status != 200) {
            sweetNormal({
               txt: error || 'No se pudo cargar la información o no existe este folio',
               icon: 'info',
            });
            return;
         }
         onSetLogicButtons(data?.requestResponseList);
         setApply(data);
      };

      fetchDataAsync();
   }, []);

   const onSetLogicButtons = (requests) => {
      //* Revisamos si todas las solicitudes tienen ya la ejecución del modelo
      let model = requests.every((rq) => rq.resultExecEm !== null);
      //* Revisamos si todas las solicitudes han completado la carátula
      let cover = requests.every((rq) => rq.coverComplete === true);
      //* Revisamos si todas las solicitudes tienen recomendación por el analista
      let recommendation = requests.every((rq) => rq.recommendationAc !== null);
      //* Revisamos si alguno de los integrantes
      let errors = [];
      let someAreMistake = false;
      requests.forEach((item) => {
         item.relatedPersonResponseList.forEach(({ statusModel, errorModel, ...rpl }) => {
            if (statusModel === 'Mistake') {
               someAreMistake = true;
               let stObj = JSON.parse(errorModel);
               errors.push(`
                  <div class='flex flex-col text-xs font-normal'>
                     <strong>${rpl.fullName}</strong>
                     <p>${stObj.message + ': ' + stObj.description || '-'}</p>
                     <p class='text-xs text-gray-300'>Trace ID: ${stObj?.traceID || ''}</p>
                  </div>
               `);
            }
         });
      });

      if (!_.isEmpty(errors) && someAreMistake) {
         sweetConfirmation({
            html: `<div class='flex flex-col justify-center items-center gap-4 h-64'>
               <img src='/icons/ico_error.svg' alt='Icono de error' width='68' />
               <h2 class='text-lg font-semibold px-2'>Ocurrió un error en la ejecución del Modelo</h2>
               <p class='text-left w-full'>Detalles: </p>
               ${errors.join('')}
            </div>`,
            timer: 8000,
            width: 450,
         });
      }

      let color = 'gray';
      if (someAreMistake) {
         color = 'red-500';
      } else if (model) {
         color = 'yellow-500';
      }

      setSettings({
         model,
         cover,
         recommendation,
         detailsModel: {
            icon: someAreMistake ? 'error' : 'check_circle',
            color,
         },
      });
   };

   return (
      <MainLayout title='Evaluación de Solicitudes' sx='h-[calc(100vh-6rem)] bg-neutral-200 bg-opacity-50'>
         <HeaderTitle
            title='Evaluación de la solicitud'
            buttons={[
               {
                  id: 'back',
                  isVisible: true,
                  label: 'Regresar',
                  sx: `text-white bg-black`,
                  toAction: () => push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, 'ADC')),
               },
            ]}
         />
         <section className='flex flex-col gap-2 px-8'>
            {_.isEmpty(apply) ? (
               <EvaluationSkeleton />
            ) : (
               <>
                  <h1 className='px-2 text-base xl:text-xl'>Solicitud&nbsp;{formatId(idGroup)}</h1>
                  <h2 className='px-2 text-base xl:text-xl'>{apply.groupName ?? '-'}</h2>
               </>
            )}
            <div className='flex justify-center gap-6 py-4 mx-36 2xl:mt-24'>
               <div className='box-content flex flex-col justify-center h-48 gap-6 px-5 py-4 bg-white rounded-lg w-72'>
                  <div className='w-full'>
                     <span className={`material-symbols-outlined icon-size-32 text-${settings.detailsModel.color}`}>
                        {settings.detailsModel.icon}
                     </span>
                  </div>
                  <p className='w-full text-base font-bold'>Resultado del modelo</p>
                  <div className='flex w-full gap-4 mt-3'>
                     <ExecuteModel {...{ isDisabled: _.isEmpty(apply), idGroup }} />
                     <button
                        type='button'
                        disabled={!settings?.model}
                        onClick={() => push(mapRoutePages.GO_TO_MODEL_PAGE(idGroup))}
                        className='px-4 py-1 text-xs text-white bg-black border select-none rounded-3xl w-28'>
                        Visualizar
                     </button>
                  </div>
               </div>
               <div className='box-content flex flex-col justify-center h-48 gap-6 px-5 py-4 bg-white rounded-lg w-72'>
                  <div className='w-full'>
                     <span
                        className={`material-symbols-outlined icon-size-32 text-${
                           settings.cover ? 'yellow-500' : 'gray'
                        }`}>
                        check_circle
                     </span>
                  </div>
                  <p className='w-full text-base font-bold'>Carátula</p>
                  <div className='flex w-full gap-4 mt-3'>
                     <button
                        type='button'
                        disabled={!settings?.model}
                        onClick={() => push(mapRoutePages.GO_TO_COVER_PAGE('Shared', idGroup))}
                        className='px-4 py-1 text-xs text-white bg-black border select-none rounded-3xl w-28'>
                        Editar
                     </button>
                  </div>
               </div>
               <div className='box-content flex flex-col justify-center h-48 gap-6 px-5 py-4 bg-white rounded-lg w-72'>
                  <div className='w-full'>
                     <span
                        className={`material-symbols-outlined icon-size-32 text-${
                           settings.recommendation ? 'yellow-500' : 'gray'
                        }`}>
                        check_circle
                     </span>
                  </div>
                  <p className='w-full text-base font-bold'>Recomendación</p>
                  <div className='flex w-full gap-4 mt-3'>
                     <button
                        type='button'
                        disabled={!settings?.cover}
                        onClick={() => push(mapRoutePages.GO_TO_RECOMENDATION_PAGE('ADC', idGroup))}
                        className='px-4 py-1 text-xs text-white bg-black border select-none rounded-3xl w-28'>
                        Recomendar
                     </button>
                  </div>
               </div>
            </div>
         </section>
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
