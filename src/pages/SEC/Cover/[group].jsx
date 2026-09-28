import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getCoverInfo, saveCoverInfo, validateCoverCompleted } from '../../../services';
import { Format, TermsAndConditions } from '../../../components';
import { Breadcrumbs } from '../../../components/Controls';
import { MainLayout } from '../../../components/Layout';
import { useGlobalContext } from '../../../hooks';
import { sweetNormal, sweetQuestionAction, sweetSnackbar, templateSweetAlert } from '../../../helpers';
import { mapRoutePages } from '../../../helpers/config';
import { calcRiskGroupAmountEm } from '../../../helpers/calculates';

export default function CoverDetails({ idGroup, idRequest }) {
   const router = useRouter();
   const { actions, user } = useGlobalContext();
   const [infoGroup, setInfoGroup] = useState([]);
   const [applicant, setApplicant] = useState({});
   const [errors, setErrors] = useState({});
   const [isSaveActive, setIsSaveActive] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const result = await getCoverInfo(idGroup);
            if (result.status != 200) {
               return;
            }
            let findApplicant = result.data.find((item) => item.idRequest === +idRequest);
            setApplicant(findApplicant);
            localStorage.setItem('CoverPage', JSON.stringify(findApplicant));
            setInfoGroup(result.data);
         } catch (error) {
            console.log('Error en caratula: ', error);
         } finally {
            setIsLoading(false);
         }
      };

      fetchData();
   }, [idRequest]);

   useEffect(() => {
      if (!_.isEmpty(applicant)) {
         let isSaveActive = false;
         let coverPage = JSON.parse(localStorage.getItem('CoverPage'));
         //* Valido si existe algún cambio a guardar
         isSaveActive = !_.isEqual(applicant, coverPage);
         setIsSaveActive(isSaveActive);
      }
   }, [applicant]);

   const routesNavigation = [
      {
         label: 'Solicitudes',
         href: mapRoutePages.GO_TO_REQUESTS_PAGE(user?.path),
         lastItem: false,
         sx: '',
      },
      {
         label: applicant?.generalDataCifResponse?.applicant ?? 'Cargando...',
         href: mapRoutePages.GO_TO_REQUEST_DETAILS_PAGE(user?.path, idGroup),
         lastItem: false,
         sx: '',
      },
      {
         label: 'Edición de Carátula',
         lastItem: true,
         href: '',
         sx: 'font-bold',
      },
   ];

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

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!_.isEmpty(errors)) {
         sweetSnackbar({ html: '<p class="mt-1 ">¡Campos invalidos!</p>', type: 'error' });
         return;
      }

      try {
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
         setApplicant(newApplicant);
         setIsSaveActive(false);
         sweetSnackbar({
            html: '<p class="mt-1 text-sm">¡Los cambios se han guardado correctamente!</p>',
            timer: 2000,
         });
      } catch (error) {
         console.error('Guardado caratula', error);
      } finally {
         isSaveActive && actions.toggleLoading();
      }
   };

   const onBackReviews = () => {
      localStorage.removeItem('CoverPage');
      router.push(mapRoutePages.GO_TO_REQUEST_DETAILS_PAGE(user?.path, idGroup));
   };

   return (
      <MainLayout title='Editar Carátula' sx='flex flex-col w-full mb-4'>
         <form className='relative' onSubmit={handleSubmit}>
            <div className='sticky top-0 z-50 flex flex-row items-center p-4 m-4 bg-white'>
               <Breadcrumbs routes={routesNavigation} sx='w-1/2' />
               <div className='flex justify-end w-1/2 gap-2'>
                  <button
                     type='submit'
                     disabled={!isSaveActive}
                     className='px-2 text-xs text-white bg-blue-800 border cursor-pointer select-none w-36 h-7 rounded-3xl'>
                     Guardar
                  </button>
                  <button
                     type='button'
                     onClick={(e) => {
                        if (isSaveActive) {
                           sweetQuestionAction({
                              html: templateSweetAlert.CHANGES_NOT_SAVE_COVER(),
                              fnAction: () => onBackReviews(),
                           });
                        } else onBackReviews();
                     }}
                     className='w-36 px-2 h-7 text-xs text-white bg-[#383939] border cursor-pointer select-none rounded-3xl'>
                     Regresar
                  </button>
               </div>
            </div>
            <Format {...{ data: applicant, fnSet: onChangeState, isLoading, errors, setErrors }} />
            <TermsAndConditions {...{ data: applicant, fnSet: onChangeState, isLoading }} />
         </form>
      </MainLayout>
   );
}

export const getServerSideProps = async ({ params, query }) => {
   const { group = 0 } = params;
   return {
      props: { idGroup: group, idRequest: query.idRequest },
   };
};
