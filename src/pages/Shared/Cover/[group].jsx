import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getCoverInfo, saveCoverInfo, validateCoverCompleted } from '../../../services';
import { Format, SideCover, TermsAndConditions } from '../../../components';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { sweetConditional, sweetNormal, sweetSnackbar } from '../../../helpers';
import { calcRiskGroupAmountEm } from '../../../helpers/calculates';
import { mapRoutePages } from '../../../helpers/config';

export default function Cover({ idGroup }) {
   const { push } = useRouter();
   const { actions, user } = useGlobalContext();
   const [pageActive, setPageActive] = useState(1);
   const [infoGroup, setInfoGroup] = useState([]);
   const [applicant, setApplicant] = useState({});
   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(true);
   const [btnSettings, setBtnSettings] = useState({ isSaveActive: false, isWatchStudyActive: false });

   useEffect(() => {
      const fetchData = async () => {
         try {
            const result = await getCoverInfo(idGroup);
            if (result.status != 200) {
               return;
            }
            setInfoGroup(result.data);
            setApplicant(result.data[0]);
            localStorage.setItem('CoverPage', JSON.stringify(result.data[0]));
         } catch (error) {
            console.log('Error en caratula: ', error);
         } finally {
            setIsLoading(false);
         }
      };

      fetchData();
   }, []);

   useEffect(() => {
      if (!_.isEmpty(applicant)) {
         let isSaveActive = false;
         let coverPage = JSON.parse(localStorage.getItem('CoverPage'));
         //* Valido si existe algún cambio a guardar
         isSaveActive = !_.isEqual(applicant, coverPage);
         setBtnSettings({ isSaveActive, isWatchStudyActive: applicant.coverComplete });
      }
   }, [applicant]);

   //*Se activa al cambiar el solicitante
   const onChangeApplycant = (idRequest) => {
      if (idRequest == applicant.idRequest) return;
      if (btnSettings.isSaveActive) {
         sweetConditional({
            title: '¿Seguro que quieres continuar?',
            text: 'Recuerda que se perderá el avance que llevas.',
            onFunc: () => {
               let savedApplicant = JSON.parse(localStorage.getItem('CoverPage'));
               let savedInfoGroup = infoGroup.map((ig) =>
                  ig.idRequest == savedApplicant.idRequest ? { ...savedApplicant } : ig
               );
               setInfoGroup(savedInfoGroup);
               updateApplicant(idRequest);
               setErrors({});
            },
            accept: 'Continuar',
            cancel: 'Cancelar',
         });
      } else {
         updateApplicant(idRequest);
      }
   };

   //* Cambia al solicitante
   const updateApplicant = (idRequest) => {
      let selectApplicant = infoGroup.find((u) => u.idRequest == idRequest);
      localStorage.setItem('CoverPage', JSON.stringify(selectApplicant));
      setApplicant(selectApplicant);
   };

   const onChangeState = (modifiedApplicant) => {
      let isCoverComplete = validateCoverCompleted(modifiedApplicant);
      if (isCoverComplete && !modifiedApplicant.coverComplete) {
         sweetSnackbar({
            html: '<p class="mt-1 text-sm">La carátula ha sido completada con éxito.</p>',
            type: 'success',
         });
      }
      modifiedApplicant['coverComplete'] = isCoverComplete;
      setInfoGroup(
         infoGroup.map((ig) => (ig.idRequest == modifiedApplicant.idRequest ? { ...modifiedApplicant } : ig))
      );
      setApplicant(modifiedApplicant);
   };

   const handleSubmit = async (e, submitterId) => {
      e.preventDefault();
      if (!_.isEmpty(errors)) {
         sweetSnackbar({ html: '<p class="mt-1 ">¡Campos invalidos!</p>', type: 'error' });
         return;
      }
      try {
         if (btnSettings.isSaveActive) {
            actions.toggleLoading('Guardando...');
            let newInfoGroup = calcRiskGroupAmountEm(infoGroup, user);
            const result = await saveCoverInfo(newInfoGroup);
            if (result.status !== 204) {
               sweetNormal({
                  title: '¡Ocurrio un error al intentar guardar la información!',
                  txt: result?.error?.response?.message,
                  icon: 'warning',
               });
               return;
            }

            setInfoGroup(newInfoGroup);
            let newApplicant = newInfoGroup.find((item) => item.idRequest === applicant.idRequest);
            localStorage.setItem('CoverPage', JSON.stringify(newApplicant));
            setBtnSettings({ ...btnSettings, isSaveActive: false });
            sweetSnackbar({ html: '<p class="mt-1 text-sm">¡Listo! Los cambios se han guardado</p>' });
         }
         if (submitterId == 'watchStudy') {
            actions.togglePDF({
               idRequest: applicant.idRequest,
               idClient: applicant.generalDataCifResponse.idClient,
               title: 'Estudio caratula',
               typePDF: 'COVER_AND_STUDY',
            });
         }
      } catch (error) {
         console.log('Guardado caratula', error);
      } finally {
         btnSettings.isSaveActive && actions.toggleLoading();
      }
   };

   return (
      <MainLayout title='Caratula'>
         <form
            className='relative'
            onSubmit={(e) => {
               const submitterId = e.nativeEvent.submitter.id;
               handleSubmit(e, submitterId);
            }}
            noValidate>
            <div className='z-50 sticky top-0 bg-white flex border-b-[1.5px] border-black mb-4 py-4 px-8 font-semibold'>
               <div className='flex items-center gap-2 text-xl basis-1/2'>
                  <SideCover {...{ data: infoGroup }} onFunc={onChangeApplycant} />
                  <h1 className='w-full truncate'>
                     Solicitante:&nbsp;{applicant?.generalDataCifResponse?.applicant || ''}
                  </h1>
               </div>
               <div className='flex justify-end space-x-4 text-xs basis-1/2 font-extralight'>
                  <button
                     type='button'
                     onClick={() => push(mapRoutePages.GO_TO_APPLICATION_EVALUATION_PAGE(user.path, idGroup))}
                     className='flex items-center justify-center px-4 text-white border cursor-pointer select-none w-36 rounded-3xl bg-black-900'>
                     Regresar
                  </button>
                  <button
                     type='submit'
                     disabled={!btnSettings.isSaveActive}
                     id='save'
                     className='flex items-center justify-center px-4 text-white bg-blue-800 border cursor-pointer select-none w-36 rounded-3xl'>
                     Guardar
                  </button>
                  <button
                     type='button'
                     onClick={() => setPageActive(1)}
                     disabled={pageActive == 1}
                     className='flex items-center justify-center px-4 text-white border select-none disabled:hidden w-36 rounded-3xl bg-black-900 fadeIn'>
                     Anterior
                  </button>
                  <button
                     type='button'
                     disabled={pageActive == 2}
                     onClick={() => setPageActive(2)}
                     className='flex items-center justify-center px-4 text-white border select-none disabled:hidden w-36 rounded-3xl bg-black-900 fadeIn'>
                     Siguiente
                  </button>
                  <button
                     type='submit'
                     disabled={!btnSettings.isWatchStudyActive}
                     id='watchStudy'
                     className={` flex items-center justify-center w-36 px-4 border rounded-3xl select-none bg-black-900 text-white fadeIn ${
                        pageActive == 1 ? 'hidden' : ''
                     }`}>
                     Ver estudio
                  </button>
               </div>
            </div>
            {pageActive == 1 && (
               <Format
                  {...{
                     data: applicant,
                     fnSet: onChangeState,
                     isLoading,
                     errors,
                     setErrors,
                  }}
               />
            )}
            {pageActive == 2 && <TermsAndConditions {...{ data: applicant, fnSet: onChangeState, isLoading }} />}
         </form>
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group },
   };
};
