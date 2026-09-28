'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

import { getLoadDocuments, postStampedCover } from '../../services';
import { LoaderStatic } from '../UI';
import { useGlobalContext } from '../../hooks';
import { getError, sweetCustomAlert, templateSweetAlert } from '../../helpers';
import { EnumStatus, mapRoutePages } from '../../helpers/config';

import stylesTwo from '../Modal/modal.module.css';

export const CoverPreview = ({ idRequest, idClient, idGroup, isGroup = false, requests }) => {
   const { user, actions } = useGlobalContext();
   const router = useRouter();
   const [pdfData, setPdfData] = useState('');
   const [loader, setLoader] = useState(false);

   useEffect(() => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowY = 'hidden';

      setLoader(true);
      const getPDF = async () => {
         const result = await getLoadDocuments(idRequest, idClient, 'PDF_COVER_SIGNATURES');
         setPdfData(result);
         setLoader(false);
      };
      getPDF();
      return () => {
         document.body.style.overflow = 'auto';
         document.documentElement.style.overflowY = 'auto';
      };
   }, [idRequest, idClient]);

   const onClose = () => {
      const currentQuery = { ...router.query };
      delete currentQuery.showModal;

      router.push({
         pathname: mapRoutePages.GO_TO_REQUEST_DETAILS_PAGE('SEC', currentQuery.group),
      });
   };

   const saveStampping = async () => {
      actions.toggleLoading('Guardando carátula y el estudio...');
      try {
         let goRedirectHistory = true;
         let otherOptionsSwal = {};
         let htmlMessage = templateSweetAlert['COMPLETED_STAMPED'](idGroup);

         const result = await postStampedCover(idRequest, user.userAD).finally(() => actions.toggleLoading());
         if (result.status !== 200) {
            getError(result);
            return;
         }

         // Buscamos las solicitudes que aún no se han sellado
         let missingApplicationsForSealing = requests.filter(
            (req) => !req?.sealed && req.idCatStatus !== EnumStatus.SOLICITUD_RECHAZADA && req.idRequest !== idRequest
         );
         if (isGroup) {
            // Si aún hay solicitudes por sellar cambiamos el mensaje y regresamos a la pantalla detalles
            if (missingApplicationsForSealing.length > 0) {
               // Buscamos las solicitudes que ya han sido selladas, quitamos las que han sido rechazadas y se suma la solicitud actual.
               let otherRequest = requests.filter(
                  (req) =>
                     req?.sealed && req.idCatStatus !== EnumStatus.SOLICITUD_RECHAZADA && req.idRequest !== idRequest
               );
               let countRequestStamped = otherRequest.length + 1;
               let percentage = Math.round((countRequestStamped / requests.length) * 100);
               htmlMessage = templateSweetAlert['PROGRESS_STAMPED'](countRequestStamped, requests.length, percentage);
               goRedirectHistory = false;
               otherOptionsSwal = {
                  confirmButtonText: `Siguiente solicitud <span class="material-symbols-outlined icon-size-20">arrow_forward</span>`,
                  customClass: {
                     confirmButton: 'btn-modal-primary',
                  },
               };
            }
         }

         sweetCustomAlert({
            html: htmlMessage,
            focusConfirm: false,
            ...otherOptionsSwal,
         }).then((result) => {
            if (goRedirectHistory) {
               localStorage.removeItem('ACTIVE_APPLICANT');
               router.push(mapRoutePages.GO_TO_HISTORY());
            } else {
               localStorage.setItem(
                  'ACTIVE_APPLICANT',
                  JSON.stringify({
                     idGroup: idGroup,
                     idRequest: missingApplicationsForSealing[0].idRequest,
                  })
               );
               actions.toggleReloading();
               onClose();
            }
         });
      } catch (e) {
         console.error('SELLAR CARÁTULA ', e);
      }
   };

   return (
      <dialog open className={stylesTwo['pdf-modal']}>
         <div className='flex items-center justify-between gap-4 px-8 py-3 text-white bg-black z-50 sticky top-0'>
            <button
               className='rounded-full flex items-center hover:bg-black-900 clean'
               type='button'
               onClick={onClose}
               disabled={loader}
               title='Cerrar modal'>
               <span className='material-symbols-outlined thin pr-1'>arrow_circle_left</span>
               Regresar
            </button>
            <button disabled={loader} onClick={saveStampping} className='text-blue-700 text-lg clean'>
               Confirmar
            </button>
         </div>
         {loader ? (
            <LoaderStatic />
         ) : (
            <div className='relative w-full h-screen bg-black-900'>
               {pdfData.error && (
                  <div className='flex items-center justify-center w-full h-screen text-white'>
                     <p className='text-xl text-center'>{pdfData.error}</p>
                  </div>
               )}
               {pdfData.url && (
                  <iframe
                     src={`${pdfData.url}#toolbar=0&navpanes=0`}
                     width='100%'
                     title='Visor de PDF'
                     className='h-full'
                  />
               )}
            </div>
         )}
      </dialog>
   );
};

CoverPreview.propTypes = {
   idRequest: PropTypes.number.isRequired,
   idClient: PropTypes.string.isRequired,
   idGroup: PropTypes.number.isRequired,
   isGroup: PropTypes.bool,
   requests: PropTypes.array.isRequired
};
