import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { getPropertyFormat, savePropertyFormat } from '../../../services';
import { PropertySkeleton } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { initConstants, compareJSON, sweetConditional, sweetSnackbar, getError } from '../../../helpers';
import { calcGlobalSummary } from '../../../helpers/calculates';
import { EnumStatus as Estatus, constProfiles as Profile } from '../../../helpers/config';

const ApplicantView = dynamic(() => import('../../../components/PropertyVerification/ApplicantsView'));
const ObligatedsView = dynamic(() => import('../../../components/PropertyVerification/ObligatedsView'), {
   ssr: false,
});
const GeneralSummaryView = dynamic(() => import('../../../components/PropertyVerification/GeneralSummaryView'), {
   ssr: false,
});
const VerificationCompanyView = dynamic(
   () => import('../../../components/PropertyVerification/VerificationCompanyView'),
   {
      ssr: false,
   }
);
const ModalVerification = dynamic(
   () => import('../../../components/PropertyVerification/ModalVerification/VerificationForm'),
   { ssr: false }
);

const propertyViewsConfig = {
   1: {
      Component: ApplicantView,
      getCustomProps: (data, onUpdateData, isNotEditable) => ({
         info: data.applicant,
         onUpdateData,
         isNotEditable,
      }),
   },
   2: {
      Component: ObligatedsView,
      getCustomProps: (data, onUpdateData, isNotEditable) => ({
         info: data.obligedList,
         onUpdateData,
         isNotEditable,
      }),
   },
   3: {
      Component: GeneralSummaryView,
      getCustomProps: (data, onUpdate, isNotEditable) => ({
         info: data.resumeGeneral,
         isNotEditable,
      }),
   },
   4: {
      Component: VerificationCompanyView,
      getCustomProps: (info, onUpdateData, isNotEditable, others) => ({
         info,
         onUpdateData,
         isNotEditable,
         ...others,
      }),
   },
};

export default function PropertyVerification({ idRequest, idGroup, origin }) {
   const router = useRouter();
   const { user, verifyProperty, isReloading, actions } = useGlobalContext();
   const [info, setInfo] = useState({});
   const [step, setStep] = useState(1);
   const [btnState, setBtnState] = useState({
      nextDisabled: false,
      nextTitle: 'Continuar',
      saveDisabled: true,
      freezeDisabled: true,
   });

   const buttons = [
      {
         id: 'save',
         isVisible: true,
         isDisable: user?.idProfile === Profile.MRC || btnState.saveDisabled,
         label: 'Guardar',
         sx: `text-white bg-blue-800`,
         toAction: () => onSaveProperty('save'),
      },
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: `text-white bg-black`,
         toAction: () => onNavigation('back'),
      },
      {
         id: 'next',
         isVisible: true,
         isDisable: btnState.nextDisabled,
         label: btnState.nextTitle,
         sx: `text-white bg-black`,
         toAction: () => onNavigation('next'),
      },
   ];

   const isNotEditable = useMemo(() => {
      if ([Profile.ADC, Profile.LDC, Profile.MRC].includes(user?.idProfile)) {
         return true;
      }

      return [
         Estatus.SOLICITUD_RECHAZADA,
         Estatus.SOLICITUD_CANCELADA,
         Estatus.SOLICITUD_CANCELADA_POR_EMBARGO,
      ].includes(info?.idCatStatusGroup);
   }, [info?.idCatStatusGroup, user?.idProfile]);

   const genericUrl = useMemo(() => {
      let baseUrl = origin === 'Documentation' ? `${user?.path}` : 'Shared';
      return `/${baseUrl}/${origin}/${idGroup}`;
   }, [idGroup, origin, user?.path]);

   useEffect(() => {
      const fetchDataAsync = async () => {
         const { status, data } = await getPropertyFormat(idRequest);
         if (status !== 200) {
            return;
         }

         setInfo(data);
      };

      fetchDataAsync();
   }, [isReloading]);

   useEffect(() => {
      if (user?.idProfile !== Profile.MRC) {
         const storedState = JSON.parse(localStorage.getItem('Property_Page')) || '';
         const resultCompare = compareJSON(info, storedState);
         let nextDisabled = false;
         let saveDisabled = true;

         if (step === 4) {
            let { uniqueFolio, result } = info?.propertiesFormat || {};
            nextDisabled = _.isEmpty(uniqueFolio) || result === 'embargada';
            saveDisabled = result === 'embargada' || resultCompare;
         } else {
            saveDisabled = resultCompare;
         }

         setBtnState({
            ...btnState,
            nextDisabled,
            saveDisabled,
            freezeDisabled: _.isEmpty(info) ? true : verificationComplete(),
         });
      }
   }, [info]);

   useEffect(() => {
      if (step > initConstants.steps.length) {
         onCloseFormat();
         return;
      }

      setBtnState({
         ...btnState,
         nextDisabled: step === 4 && user?.idProfile === Profile.EMG && _.isEmpty(info?.propertiesFormat?.uniqueFolio),
         nextTitle: step === 4 ? 'Finalizado' : 'Continuar',
      });

      actions.setStepper({ options: initConstants.steps, step, isShow: true });
   }, [step]);

   const verificationComplete = () => {
      let disable = false;
      if (info?.hasProperty) {
         disable = info?.applicant.properties.some((p) => p.validation === false);
      }

      if (info?.hasPropertyOS) {
         info?.obligedList.forEach((o) => {
            if (!_.isEmpty(o.properties) && o.properties.some((p) => p.validation === false)) {
               disable = true;
            }
         });
      }

      if (
         _.isEmpty(info?.propertiesFormat?.uniqueFolio) ||
         _.isEmpty(info?.propertiesFormat?.result) ||
         _.isEmpty(info?.propertiesFormat?.verificationDate)
      ) {
         disable = true;
      }

      return disable;
   };

   const onNavigation = (type) => {
      if (type === 'back' && step === 1) {
         onCloseFormat();
         return;
      }

      if (type === 'next' && step === initConstants.steps.length && user?.idProfile !== Profile.MRC) {
         if (
            !btnState.freezeDisabled &&
            info?.propertiesFormat?.idCatStatus !== Estatus.FORMATO_CONGELADO &&
            user?.idProfile !== Profile.EMG
         ) {
            sweetConditional({
               title: '¡Atención!',
               text: 'No has guardado la información en el expediente digital, ¿Estás seguro de salir?',
               onFunc: () => onSaveProperty('finish'),
               accept: 'Continuar',
               cancel: 'Cancelar',
            });
            return;
         }

         !btnState.saveDisabled && onSaveProperty();
      }

      let newStep = type === 'next' ? step + 1 : step - 1;
      setStep(newStep);
   };

   const handleUpdateData = (attribute, obj) => {
      let newInfo = { ...info, [attribute]: obj };
      //* Solo se realiza el Cálculo Global para el Especialista.
      if (attribute !== 'propertiesFormat' && user.idProfile === Profile.EMG) {
         let upInfo = calcGlobalSummary(newInfo);
         setInfo(upInfo);
      } else {
         setInfo(newInfo);
      }
   };

   const onSaveProperty = async (typeAct) => {
      try {
         actions.toggleLoading('Guardando datos...');
         let newInfo = structuredClone(info);
         newInfo.propertiesFormat.userModify = user?.userAD;
         const result = await savePropertyFormat(newInfo, user?.idProfile);
         if (result.status !== 200) {
            getError(result);
            return;
         }

         if (typeAct === 'finish') {
            setTimeout(() => {
               setStep(step + 1);
            }, 1000);
            return;
         }

         sweetSnackbar({
            html: '<p class="mt-1 text-sm">¡Listo! Los cambios se han guardado</p>',
         });

         actions.toggleReloading();
      } catch (error) {
         console.log('Property Verification', error);
      } finally {
         actions.toggleLoading();
      }
   };

   const renderCurrentPropertyView = () => {
      const viewConfig = propertyViewsConfig[step];
      if (!viewConfig || !viewConfig.Component) {
         return (
            <div className='flex flex-col items-center justify-center h-[80vh] gap-4'>
               <h1 className='text-2xl'>Ocurrió un error al procesar la información.</h1>
            </div>
         );
      }

      const { Component, getCustomProps } = viewConfig;
      const props = getCustomProps(info, handleUpdateData, isNotEditable, { idGroup, btnState, genericUrl });
      return <Component {...props} />;
   };

   const onCloseFormat = () => {
      localStorage.removeItem('Property_Page');
      actions.setStepper({ options: [], step: 1, isShow: false });
      router.push(genericUrl);
   };

   return (
      <>
         {verifyProperty.open && <ModalVerification propertyInfo={info} isShow={verifyProperty.open} />}
         <MainLayout title='Relación de propiedades & verificación de sociedad'>
            <HeaderTitle title='Relación de propiedades & verificación de sociedad' buttons={buttons} />
            <div className='flex px-8 py-4'>
               <div className='flex items-center text-xl basis-2/3'>
                  <h2 className='text-black-light'>{initConstants.title[step] || ''}</h2>
               </div>
               <div className='flex items-center justify-end text-sm basis-1/3'>
                  <p className='mr-2 font-semibold text-right basis-2/3'>Fecha de elaboración:</p>
                  <div
                     data-testid='fecha-elaboracion'
                     className='w-28 h-6 py-0.5 text-center border border-[#848484] rounded bg-[#EDEDED] text-[#848484]'>
                     {info?.propertiesFormat?.modifyDate || ''}
                  </div>
               </div>
            </div>
            {!_.isEmpty(info) ? renderCurrentPropertyView() : <PropertySkeleton />}
         </MainLayout>
      </>
   );
}

export const getServerSideProps = async ({ query }) => {
   const { request = 0, idGroup = 0, origin = 'Documentation' } = query;
   return {
      props: { idRequest: request, idGroup, origin },
   };
};
