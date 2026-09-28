import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getOneRequest } from '../../../services';
import { EvaluationSkeleton } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { hasClientFinancialChanges, formatId, getError } from '../../../helpers';
import { mapRoutePages } from '../../../helpers/config';

export default function ApplicationEvaluation({ idGroup }) {
   const { push } = useRouter();
   const [apply, setApply] = useState({});
   const [settings, setSettings] = useState({ model: false, cover: false, recommendation: false });

   useEffect(() => {
      const fetchData = async () => {
         const result = await getOneRequest(idGroup);
         if (result.status !== 200) {
            getError(result);
            return;
         }

         if (hasClientFinancialChanges(result.data?.requestResponseList)) {
            push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, 'LDC'));
         }

         fnSetLogicButtons(result.data?.requestResponseList);
         setApply(result.data);
      };

      fetchData();
   }, []);

   const fnSetLogicButtons = (requests) => {
      //* Revisamos si todas las solicitudes tienen ya la ejecución del modelo
      let model = requests.every((rq) => rq.resultExecEm !== null);
      //* Revisamos si todas las solicitudes han completado la caratula
      let cover = requests.every((rq) => rq.coverComplete === true);
      //* Revisamos si todas las solicitudes tienen recomendación por el líder
      let recommendation = requests.every((rq) => rq.recommendationLc !== null);
      setSettings({ model, cover, recommendation });
   };

   return (
      <MainLayout title='Model' sx='bg-neutral-200 bg-opacity-50'>
         <HeaderTitle
            title='Evaluación de la solicitud'
            buttons={[
               {
                  id: 'back',
                  isVisible: true,
                  label: 'Regresar',
                  sx: `text-white bg-black`,
                  toAction: () => push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, 'LDC')),
               },
            ]}
         />
         <section className='flex flex-col gap-2 px-8'>
            {_.isEmpty(apply) ? (
               <EvaluationSkeleton />
            ) : (
               <>
                  <h1 data-testid='title-request' className='px-2 text-base xl:text-xl'>
                     Solicitud&nbsp;{apply?.idGroup && formatId(idGroup)}
                  </h1>
                  <h2 className='px-2 text-base xl:text-xl'>{apply.groupName ?? '-'}</h2>
               </>
            )}
            <div className='flex justify-center gap-6 py-4 2xl:mt-24'>
               <div className='box-content flex flex-col justify-center h-48 gap-6 px-5 py-4 bg-white rounded-lg w-72'>
                  <div className='w-full select-none'>
                     <span
                        className={`material-symbols-outlined icon-size-32 text-${
                           settings.model ? 'yellow-500' : 'gray'
                        }`}>
                        check_circle
                     </span>
                  </div>
                  <p className='w-full text-base font-bold'>Resultado del modelo</p>
                  <div className='flex w-full gap-4 mt-3'>
                     <button
                        type='button'
                        disabled={!settings.model}
                        onClick={() => push(mapRoutePages.GO_TO_MODEL_PAGE(idGroup))}
                        className='px-4 py-1 text-xs text-white bg-black border select-none rounded-3xl w-28'>
                        Visualizar
                     </button>
                  </div>
               </div>
               <div className='box-content flex flex-col justify-center h-48 gap-6 px-5 py-4 bg-white rounded-lg w-72'>
                  <div className='w-full select-none'>
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
                        disabled={!settings.model}
                        onClick={() => push(mapRoutePages.GO_TO_COVER_PAGE('Shared', idGroup))}
                        className='px-4 py-1 text-xs text-white bg-black border select-none rounded-3xl w-28'>
                        Editar
                     </button>
                  </div>
               </div>
               <div className='box-content flex flex-col justify-center h-48 gap-6 px-5 py-4 bg-white rounded-lg w-72'>
                  <div className='w-full select-none'>
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
                        disabled={!settings.cover}
                        onClick={() => push(mapRoutePages.GO_TO_RECOMENDATION_PAGE('LDC', idGroup))}
                        className='px-4 py-1 text-xs text-white bg-black border select-none rounded-3xl w-28'>
                        Recomendar
                     </button>
                  </div>
               </div>
            </div>
            <div className='flex gap-6 pb-8'>
               <button
                  onClick={() => push(mapRoutePages.GO_TO_RETURN_REQUEST_PAGE('LDC', idGroup, 'ApplicationEvaluation'))}
                  className='flex items-center px-4 py-2 text-xs text-white bg-black border select-none rounded-3xl'>
                  <span className='material-symbols-outlined icon-size-20'>arrow_back</span>
                  Devolver solicitud al analista
               </button>
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
