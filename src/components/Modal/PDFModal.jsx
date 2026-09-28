import _ from 'lodash';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { dowloadDocumentFetch, downloadCoverStudio } from '../../services';
import { Loader } from '../UI';
import { useGlobalContext } from '../../hooks';
import { createUrlPdf, getError } from '../../helpers';

import icoBack from '../../../public/icons/ico_back.svg';
import icoDownload from '../../../public/icons/ico_download.svg';
import styles from './modal.module.css';

const InitShowPDF = {
   folio: 0,
   isShow: false,
   src: '',
   title: '',
   idRequest: '',
   idClient: '',
   prefixName: '',
};

const fnActions = {
   DOCUMENTS: ({ folio }) => dowloadDocumentFetch(folio),
   COVER_AND_STUDY: ({ idClient, idRequest }) => downloadCoverStudio(idRequest, idClient),
   ONLY_COVER: ({ idClient, idRequest }) => downloadCoverStudio(idRequest, idClient, 'PDF_COVER_SIGNATURES'),
};

export const PDFModal = () => {
   const { showPDF, actions } = useGlobalContext();
   const [pdfData, setPdfData] = useState('');
   const [error, setError] = useState('');
   const [loader, setLoader] = useState(true);

   useEffect(() => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowY = 'hidden';

      return () => {
         document.body.style.overflow = 'auto';
         document.documentElement.style.overflowY = 'auto';
      };
   }, [pdfData, error]);

   useEffect(() => {
      if (!_.isEmpty(showPDF.src)) {
         setPdfData(showPDF.src);
         return;
      }

      const fetchPDF = async () => {
         const { folio, idRequest, idClient, typePDF = 'DOCUMENTS' } = showPDF;
         let result = await fnActions[typePDF]({ folio, idRequest, idClient });

         setLoader(false);
         if (result.status !== 200) {
            setError('¡Archivo no disponible! No se pudo cargar el PDF.');
            getError(result);
            return;
         }
         setPdfData(createUrlPdf(result.data.response));
      };
      fetchPDF();
   }, [showPDF]);

   return (
      <dialog open className={styles['pdf-modal']}>
         <div className='flex items-center justify-center gap-4 px-8 py-2 text-white bg-black'>
            <button
               className='rounded-full flex-init hover:bg-black-900'
               type='button'
               title='Cerrar modal'
               onClick={() => actions.togglePDF(InitShowPDF)}>
               <Image src={icoBack} alt='Botón regresar' />
            </button>
            <h1 className='text-xl flex-[2_2_80%]'>{showPDF.title || '-'}</h1>
            {!error && (
               <a
                  href={pdfData}
                  target='_blank'
                  rel='noopener noreferrer'
                  title='Descargar archivo'
                  className='rounded-full flex-init hover:bg-black-900'
                  download={`${showPDF.prefixName + '-' ?? ''}${showPDF.title.replace(/\s+/g, '-')}.pdf`}>
                  <Image src={icoDownload} alt='Botón de descarga' />
               </a>
            )}
         </div>
         <div className='h-screen'>
            {loader && <Loader msg='Cargando documento...' />}
            {pdfData && <iframe src={pdfData} width='100%' height='100%' title='Visor de PDF' />}
            {error && (
               <div className='flex items-center justify-center w-full h-screen'>
                  <h1 className='-mt-4 text-xl'>{error}</h1>
               </div>
            )}
         </div>
      </dialog>
   );
};
