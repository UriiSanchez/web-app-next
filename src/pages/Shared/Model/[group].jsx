'use client';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { getResultModel } from '../../../services';
import { SideMenu, TitleModelSkeleton } from '../../../components';
import { AlertsModel } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';

const SummaryModelView = dynamic(() => import('../../../components/Model').then((mod) => mod.SummaryModelView));
const PaymentCapacityView = dynamic(() => import('../../../components/Model').then((mod) => mod.PaymentCapacityView), {
   ssr: false,
});
const CreditHistoryView = dynamic(() => import('../../../components/Model').then((mod) => mod.CreditHistoryView), {
   ssr: false,
});
const RateExchangeView = dynamic(() => import('../../../components/Model').then((mod) => mod.RateExchangeView), {
   ssr: false,
});
const FinancialReasonsView = dynamic(
   () => import('../../../components/Model').then((mod) => mod.FinancialReasonsView),
   {
      ssr: false,
   }
);
const CoverageRationalityView = dynamic(
   () => import('../../../components/Model').then((mod) => mod.CoverageRationalityView),
   {
      ssr: false,
   }
);
import { useGlobalContext } from '../../../hooks';
import { getError } from '../../../helpers';
import { mapRoutePages } from '../../../helpers/config';

const modelViewsConfig = {
   1: {
      Component: SummaryModelView,
      getProps: (participant, actions) => ({
         data: participant?.info?.resumeResponse,
         dateElaboration: participant?.dateElaboration,
         participantType: participant?.info?.participantType,
         fnContext: actions,
      }),
   },
   2: {
      Component: PaymentCapacityView,
      getProps: (participant, actions) => ({
         data: participant?.info?.paymentCapacity,
         dateElaboration: participant?.dateElaboration,
         fnContext: actions,
      }),
   },
   3: {
      Component: CreditHistoryView,
      getProps: (participant, actions) => ({
         data: participant?.info?.creditHistoryReport,
         dateElaboration: participant?.dateElaboration,
         typePerson: participant?.info?.typePerson,
         fnContext: actions,
      }),
   },
   4: {
      Component: FinancialReasonsView,
      getProps: (participant) => ({
         data: participant?.info?.financialReasons,
         dateElaboration: participant?.dateElaboration,
      }),
   },
   5: {
      Component: CoverageRationalityView,
      getProps: (participant) => ({
         data: participant?.info?.swapRate,
         dateElaboration: participant?.dateElaboration,
         resume: participant?.info?.resumeResponse,
      }),
   },
   6: {
      Component: RateExchangeView,
      getProps: (participant) => ({
         data: participant?.info?.exchangeRate,
         dateElaboration: participant?.dateElaboration,
         resume: participant?.info?.resumeResponse,
      }),
   },
};

export default function ModelAnalysis({ idGroup }) {
   const { push } = useRouter();
   const { general, actions, user } = useGlobalContext();
   const [data, setData] = useState([]);
   const [participant, setParticipant] = useState({});
   const [pageActive, setPageActive] = useState(1);
   const [btns, setBtns] = useState({ back: true, next: true });

   useEffect(() => {
      const fetchDataAsync = async () => {
         const result = await getResultModel(idGroup);
         if (result.status !== 200) {
            getError(result);
            return;
         }
         const { idRequest, dateElaboration, applicant } = result?.data?.[0] || {};
         //* Resguarda la información general del grupo
         setData(result.data);
         //* Se guarda la información del participante activo
         setParticipant({ idRequest, dateElaboration, info: applicant });
         //* Se obtiene la primera posición de las pantallas disponibles.
         setPageActive(applicant.pages[0]);
      };

      fetchDataAsync();
   }, []);

   useEffect(() => {
      const index = participant?.info?.pages?.indexOf(pageActive);
      let next = _.isEmpty(participant) || index == participant?.info?.pages?.length - 1;
      setBtns({ back: index > 0 ? false : true, next });
   }, [pageActive, participant]);

   const onSetScreen = (type) => {
      const index = participant?.info?.pages?.indexOf(pageActive);
      let newPageActive = participant?.info?.pages[type == 'back' ? index - 1 : index + 1];
      setPageActive(newPageActive);
   };

   const onChangeApplycant = (objGral, item) => {
      setParticipant({ ...objGral, info: item });
      setPageActive(item.pages[0]);
   };

   const renderingViews = () => {
      const viewConfig = modelViewsConfig[pageActive];
      if (!viewConfig || !viewConfig.Component) {
         return (
            <div className='flex flex-col items-center justify-center h-[80vh] gap-4'>
               <h1 className='text-2xl'>Ocurrió un error al procesar la información.</h1>
            </div>
         );
      }

      const { Component, getProps } = viewConfig;
      const props = getProps(participant, actions);

      return <Component {...props} />;
   };

   return (
      <>
         {general.alertsModel.show && <AlertsModel />}
         <MainLayout title='Resultado del modelo experto'>
            <div className='flex border-b-[1.5px] border-black mb-4 py-4 px-8 font-semibold'>
               <div className='flex items-center flex-auto gap-2 text-xl'>
                  <SideMenu data={data} onFunc={onChangeApplycant} idActive={participant?.info?.idClient} />
                  {_.isEmpty(participant) ? (
                     <TitleModelSkeleton />
                  ) : (
                     <h1 className='w-full'>
                        {participant?.info?.participantType + ': ' + participant?.info?.fullName}
                     </h1>
                  )}
               </div>
               <div className='flex items-center justify-end flex-1 space-x-4 text-xs font-extralight'>
                  <button
                     type='button'
                     onClick={() => push(mapRoutePages.GO_TO_APPLICATION_EVALUATION_PAGE(user.path, idGroup))}
                     className='flex items-center justify-center px-4 py-1 text-white border cursor-pointer select-none w-36 rounded-3xl bg-black-900'>
                     Regresar
                  </button>
                  <button
                     type='button'
                     onClick={() => onSetScreen('back')}
                     disabled={btns.back}
                     className='flex items-center justify-center px-4 py-1 text-white border select-none w-36 rounded-3xl bg-black-900'>
                     Anterior
                  </button>
                  <button
                     type='button'
                     disabled={btns.next}
                     onClick={() => onSetScreen('next')}
                     className={`flex items-center justify-center w-36 py-1 px-4 border rounded-3xl select-none bg-black-900 text-white`}>
                     Siguiente
                  </button>
               </div>
            </div>
            {renderingViews()}
         </MainLayout>
      </>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
