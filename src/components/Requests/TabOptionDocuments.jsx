import React, { Fragment, useEffect, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { getLoadDocuments } from '../../services';
import { DownloadButton } from './DownloadButton';

import styles from '../UI/ui.module.css';

export const TabOptionDocuments = ({ idRequest, idClient, fullName }) => {
   const [pdfData, setPdfData] = useState({});
   const [loadDocuments, setLoadDocuments] = useState(true);
   const [typeDocument, setTypeDocument] = useState('PDF_COVER_ONLY');

   useEffect(() => {
      setLoadDocuments(true);
      const getPDF = async () => {
         const result = await getLoadDocuments(idRequest, idClient, typeDocument);
         setPdfData(result);
         setLoadDocuments(false);
      };
      getPDF();
   }, [typeDocument, idRequest]);

   const onChangeTypeDocument = (type) => {
      if (!loadDocuments) {
         setTypeDocument(type);
      }
   };

   return (
      <section className='w-full mt-6 grow'>
         <div className='flex flex-row w-8/12 h-10 text-white'>
            <div
               className={clsx(
                  'flex items-center w-full h-auto gap-3 px-4 rounded-tl-md bg-black-500 border-black-500',
                  {
                     'bg-black-900 border-black-900': typeDocument === 'PDF_COVER_ONLY',
                  }
               )}>
               <div
                  className='flex items-center w-full h-full gap-3 cursor-pointer'
                  onClick={() => onChangeTypeDocument('PDF_COVER_ONLY')}>
                  <span className='material-symbols-outlined'>text_snippet</span>
                  <p className='flex-1 text-sm 2xl:text-base'>Carátula</p>
               </div>
               <DownloadButton
                  urlDownload={pdfData.url}
                  isEnabled={typeDocument === 'PDF_COVER_ONLY'}
                  loadingDocument={loadDocuments}
                  nameDocument={'Carátula-' + fullName?.replace(/\s+/g, '-')}
               />
            </div>
            <div
               className={clsx('flex items-center w-full h-auto bg-black-500 border-black-500 px-4 rounded-tr-md', {
                  'bg-black-900 border-black-900': typeDocument === 'FULL_STUDIO',
               })}>
               <div
                  className='flex items-center w-full h-full gap-3 cursor-pointer'
                  onClick={() => onChangeTypeDocument('FULL_STUDIO')}>
                  <span className='material-symbols-outlined'>text_snippet</span>
                  <p className='flex-1 text-sm 2xl:text-base'>Estudio</p>
               </div>
               <DownloadButton
                  urlDownload={pdfData.url}
                  isEnabled={typeDocument === 'FULL_STUDIO'}
                  loadingDocument={loadDocuments}
                  nameDocument={'Estudio-' + fullName?.replace(/\s+/g, '-')}
               />
            </div>
         </div>
         {loadDocuments ? (
            <div className='flex flex-col items-center justify-center w-full h-screen gap-4 border-8 border-black-900'>
               <div className='flex items-center justify-center'>
                  <div className={styles.wrapper + ' animate-bounce'}>
                     <div className={styles.leftHalf}></div>
                     <div className={styles.spinner}></div>
                     <div className={styles.rightHalf}></div>
                  </div>
               </div>
               <div className='text-center'>
                  Estamos cargando el documento
                  <br />a guarda un momento...
               </div>
            </div>
         ) : (
            <Fragment>
               <div className='relative w-full h-screen p-4 bg-black-900'>
                  {pdfData.url && <iframe src={pdfData.url} width='100%' title='Visor de PDF' className='h-full' />}
                  {pdfData.error && (
                     <div className='flex items-center justify-center w-full h-screen text-white'>
                        <p className='text-xl text-center'>{pdfData.error}</p>
                     </div>
                  )}
               </div>
            </Fragment>
         )}
      </section>
   );
};

TabOptionDocuments.propTypes = {
   idRequest: PropTypes.number.isRequired,
   idClient: PropTypes.string.isRequired,
   fullName: PropTypes.string.isRequired,
};
