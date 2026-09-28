import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import {
   getCustomerProfile,
   checkCompletePCD,
   handleVerifyCalculators,
   saveCustomerProfile,
   checkDataVerification,
   validationIfSaved,
} from '../../../services';
import { DerivativesSkeleton, MainModal } from '../../../components';
import { HeaderTitle } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';

const CoverageProfileView = dynamic(() => import('../../../components/PCD').then((mod) => mod.CoverageProfileView));
const ExchangeRateCalculatorView = dynamic(() =>
   import('../../../components/PCD').then((mod) => mod.ExchangeRateCalculatorView)
);
const RateCalculatorView = dynamic(() => import('../../../components/PCD').then((mod) => mod.RateCalculatorView));
const ProfileSummaryView = dynamic(() => import('../../../components/PCD').then((mod) => mod.ProfileSummaryView));

import { useGlobalContext, useLocalStorage, useToggle } from '../../../hooks';
import {
   compareJSON,
   EnumCongruence,
   getError,
   initDerivatives as init,
   sweetCustomAlert,
   sweetSnackbar,
   templateSweetAlert,
} from '../../../helpers';
import { constProfiles, EnumStatus, mapRoutePages } from '../../../helpers/config';

import icoVeracity from '../../../../public/icons/ico_veracity.svg';
import dynamic from 'next/dynamic';

export default function PCDPage({ idRequest, idGroup }) {
   const { push } = useRouter();
   const { actions, user, general, isReloading } = useGlobalContext();
   const [data, setData] = useState({});
   const [step, setStep] = useLocalStorage('Step_PCD', init.Enum.COVERAGE);
   const [showVeracity, setShowVeracity] = useToggle(false);
   const [settings, setSettigns] = useState({ next: true, save: true, isLoad: true });
   const disabledInputs = useMemo(() => {
      return (
         ![
            EnumStatus.EN_ESPECIALISTA_FINANCIAMIENTO,
            EnumStatus.DEVUELTA_EF_POR_MESA,
            EnumStatus.DEVUELTA_EF_POR_ANALISTA,
            EnumStatus.DEVUELTA_EF_POR_LIDER,
         ].includes(+data.idGroupStatus) || user?.idProfile !== constProfiles.EMG
      );
   }, [data.idGroupStatus, user?.idProfile]);

   const statePages = useMemo(() => {
      if (!_.isEmpty(data)) {
         const storedData = JSON.parse(localStorage.getItem('PCD_Page')) || '';
         let complete = checkCompletePCD(data);
         return {
            coverageProfile: {
               isSave: validationIfSaved(storedData.coverageProfile),
               isCompleted: complete.coverageProfile,
            },
            calculatorRate: {
               isSave: validationIfSaved(storedData.calculatorRate),
               isCompleted: data?.selectedCalculator === 'rate' ? complete.calculator : false,
            },
            calculatorRateExchange: {
               isSave: validationIfSaved(storedData.calculatorRateExchange),
               isCompleted: data?.selectedCalculator === 'typechange' ? complete.calculator : false,
            },
            profileResume: {
               isSave: validationIfSaved(storedData.profileResume),
               isCompleted: complete.profileSummary,
            },
         };
      }
   }, [data, isReloading, settings]);

   const PCDViewsConfig = {
      1: {
         Component: CoverageProfileView,
         getProps: ({ data, handleUpdateData, disabledInputs, statePages }) => ({
            info: data?.coverageProfile,
            onUpdateData: handleUpdateData,
            isDisabled: disabledInputs,
            isSave: statePages.coverageProfile.isSave,
            isComplete: statePages.coverageProfile.isCompleted,
         }),
      },
      2:
         data?.selectedCalculator === 'rate'
            ? {
                 Component: RateCalculatorView,
                 getProps: ({ data, handleUpdateData, general, disabledInputs, statePages }) => ({
                    info: data?.calculatorRate,
                    onUpdateData: handleUpdateData,
                    dollar: general?.DOLLAR,
                    isDisabled: disabledInputs,
                    isSave: statePages.calculatorRate.isSave,
                    isComplete: statePages.calculatorRate.isCompleted,
                 }),
              }
            : {
                 Component: ExchangeRateCalculatorView,
                 getProps: ({ data, handleUpdateData, general, disabledInputs, statePages }) => ({
                    info: data?.calculatorRateExchange,
                    dollar: general?.DOLLAR,
                    onUpdateData: handleUpdateData,
                    isDisabled: disabledInputs,
                    isSave: statePages.calculatorRateExchange.isSave,
                    isComplete: statePages.calculatorRateExchange.isCompleted,
                 }),
              },
      3: {
         Component: ProfileSummaryView,
         getProps: ({ data, handleUpdateData, disabledInputs, statePages }) => ({
            info: data?.profileResume,
            onUpdateData: handleUpdateData,
            isDisabled: disabledInputs,
            isSave: statePages.profileResume.isSave,
            isComplete: statePages.profileResume.isCompleted,
         }),
      },
   };

   const buttons = [
      {
         id: 'save',
         isVisible: true,
         isDisable: settings.save,
         label: 'Guardar',
         sx: `text-white bg-blue-800`,
         toAction: () => handleSaveData(),
      },
      {
         id: 'back',
         isVisible: true,
         label: 'Regresar',
         sx: `text-white bg-black`,
         toAction: () => handleNavigation('back'),
      },
      {
         id: 'next',
         isVisible: true,
         isDisable: settings.next,
         label: step === init.Enum.SUMMARY ? 'Finalizar' : 'Continuar',
         sx: `text-white bg-black`,
         toAction: () => handleNavigation('next'),
      },
   ];

   useEffect(() => {
      const fetchDataAsync = async () => {
         if (user?.userAD) {
            const { status, data } = await getCustomerProfile(idRequest, true);
            if (status !== 200) {
               return;
            }
            await validateHasHistory(data);
            setData(data);
         }
      };

      fetchDataAsync();
   }, [idRequest, isReloading, user?.userAD]);

   useEffect(() => {
      if (!_.isEmpty(data)) {
         let next = true;
         const storedState = JSON.parse(localStorage.getItem('PCD_Page')) || '';
         const resultCompare = compareJSON(data, storedState);
         if (step === init.Enum.COVERAGE) {
            next = _.isEmpty(data.selectedCalculator);
         } else if (step === init.Enum.CALCULATORS) {
            if (data.selectedCalculator === 'rate') {
               next =
                  data.calculatorRate.congruenceCreditors === EnumCongruence.EXCEEDED ||
                  [EnumCongruence.INSUFFICIENCY, EnumCongruence.EXCEEDED].includes(
                     data.calculatorRate.rateCalculator.congruenceCalculator
                  );
            }

            if (data.selectedCalculator === 'typechange') {
               next = data?.calculatorRateExchange?.annualConsistencyValidation?.title === 'No congruencia';
            }
         } else {
            next = false;
         }

         setSettigns({ ...settings, isLoad: false, next, save: resultCompare });
      }
   }, [data, step]);

   useEffect(() => {
      if (step > init.Enum.SUMMARY) {
         finalizeFormat();
         return;
      }

      actions.setStepper({ options: init.steps, step, isShow: true });
   }, [step]);

   const handleNavigation = (type) => {
      if (type === 'back' && step === init.Enum.COVERAGE) {
         finalizeFormat();
         return;
      } else if (type === 'back' && !settings.save) {
         actions.toggleReloading();
      }

      //* Sí el botón guardar está habilitado debe guardarse la info
      if (type === 'next') {
         if (step === init.Enum.SUMMARY && !data.isCompleted) {
            confirmExit();
            return;
         }

         if (step === init.Enum.SUMMARY && data.isCompleted && !data.veracity) {
            setShowVeracity();
            return;
         }
         !settings.save && handleSaveData();
      }

      let newStep = type === 'next' ? step + 1 : step - 1;
      setStep(newStep);
   };

   const handleUpdateData = (attribute, obj) => {
      let upData = structuredClone(data);
      upData[attribute] = obj;
      if (attribute === 'coverageProfile' && !_.isEmpty(obj.calculatorType.isType)) {
         upData.selectedCalculator = obj.calculatorType.isType;
         handleVerifyCalculators(upData, general?.DOLLAR);
      }

      upData.isCompleted = checkCompletePCD(upData).allPCD;
      upData.veracity = checkDataVerification(upData, compareJSON);
      setData(upData);
   };

   const handleConfirmVeracity = () => {
      setShowVeracity();
      handleSaveData(true);
   };

   const validateHasHistory = async (data) => {
      if (data?.hasHistory) {
         sweetCustomAlert({
            html: templateSweetAlert.HAVE_INFO_PCD(),
            confirmButtonText: 'Si, usar información',
            cancelButtonText: 'No, empezar desde cero',
            focusConfirm: false,
            focusCancel: false,
            showCancelButton: true,
            reverseButtons: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
               confirmButton: 'btn-modal-primary',
               cancelButton: 'btn-modal-secondary',
            },
         }).then(async (result) => {
            const resultSaved = await saveCustomerProfile(
               {
                  ...data,
                  needsHistory: result.value ?? false,
               },
               init.Enum.LOAD_INFORMATION,
               user?.userAD
            );

            if (resultSaved.status !== 204) {
               getError(resultSaved);
               return;
            }
            actions.toggleReloading();
         });
      }
   };

   const confirmExit = () => {
      sweetCustomAlert({
         html: templateSweetAlert.INCOMPLETE_PCD(statePages, data?.selectedCalculator),
         confirmButtonText: 'Guardar y salir',
         cancelButtonText: 'Ir a completar',
         focusConfirm: true,
         focusCancel: false,
         showCancelButton: true,
         reverseButtons: true,
         allowOutsideClick: false,
         allowEscapeKey: false,
         customClass: {
            popup: 'w-[475px] h-[355px]',
            htmlContainer: 'px-6 pt-8 pb-6 w-full',
            actions: 'w-full place-content-between py-2 px-6',
            confirmButton:
               'btn-modal-secondary text-sm w-[140px] h-[27px] text-blue-800 bg-white hover:bg-blue-800 hover:text-white rounded-3xl',
            cancelButton:
               ' btn-modal-primary text-sm  w-[140px] h-[27px] text-white bg-black-900 hover:bg-black-light rounded-3xl',
         },
      }).then((result) => {
         if (result.value === true) handleSaveData(false, true);
      });
   };

   const handleSaveData = async (veracity = false, exit = false) => {
      try {
         if (settings.save === false || veracity || exit) {
            actions.toggleLoading('Guardando...');
            const cloneData = structuredClone(data);
            if (veracity) {
               cloneData.veracity = true;
            }

            const result = await saveCustomerProfile(cloneData, step, user?.userAD);
            if (result.status !== 204) {
               getError(result);
               actions.toggleLoading();
               return;
            }

            sweetSnackbar({
               html: '<p class="mt-1 text-sm">¡Listo! Los cambios se han guardado</p>',
            });

            actions.toggleLoading();
            setSettigns({ ...settings, save: true });
            (veracity || exit) && setStep(step + 1);
            localStorage.setItem('PCD_Page', JSON.stringify(cloneData));
         }
      } catch (error) {}
   };

   const finalizeFormat = () => {
      push(mapRoutePages.GO_TO_CHECKLIST_PAGE(idGroup, user?.path));
      localStorage.removeItem('Step_PCD');
      localStorage.removeItem('PCD_Page');
      actions.setStepper({ options: [], step: init.Enum.COVERAGE, isShow: false });
   };

   const renderingViews = () => {
      const viewConfig = PCDViewsConfig[step];
      if (!viewConfig || !viewConfig.Component) {
         return (
            <div className='flex flex-col items-center justify-center h-[80vh] gap-4'>
               <h1 className='text-2xl'>Ocurrió un error al procesar la información.</h1>
            </div>
         );
      }

      const { Component, getProps } = viewConfig;
      const props = getProps({ data, handleUpdateData, general, disabledInputs, statePages });

      return <Component {...props} />;
   };

   return (
      <>
         {showVeracity && (
            <MainModal isOpened={showVeracity} xs='max-w-sm fixed-position-modal fadeIn'>
               <div className='flex flex-col items-center justify-center gap-4 py-2'>
                  <Image src={icoVeracity} alt='Debes de aceptar la declaración de veracidad' />
                  <h1 className='text-lg font-bold text-center'>Declaración de veracidad</h1>
                  <p className='text-base text-center text-gray-300'>
                     La recomendación realizada se encuentra fundamentada en información verídica y confiable,
                     proporcionada a Banco Base en cumplimiento con el artículo 112 de la Ley de Instituciones de
                     Crédito.
                  </p>
                  <div className='w-4/6 space-y-2 text-sm font-bold 2xl:w-3/6'>
                     <button
                        onClick={handleConfirmVeracity}
                        className='w-full px-4 py-1 text-white bg-black-900 hover:bg-black-light rounded-3xl'>
                        Acepto
                     </button>
                  </div>
               </div>
            </MainModal>
         )}
         <MainLayout title={init.title[step] || ''}>
            {settings.isLoad ? (
               <DerivativesSkeleton />
            ) : (
               <>
                  <HeaderTitle title={`Solicitante: ${data?.clientName || ''}`} buttons={buttons} />
                  {renderingViews()}
               </>
            )}
         </MainLayout>
      </>
   );
}

export const getServerSideProps = async ({ query }) => {
   const { request = 0, idGroup = 0 } = query;
   return {
      props: { idRequest: request, idGroup },
   };
};
