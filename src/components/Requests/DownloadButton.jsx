import React from 'react';
import PropTypes from 'prop-types';

/**
 * Este componente que muestra icono de descarga y permite descargar un pdf.
 * @component DownloadButton
 * @param {Object} params - Objeto de atributos
 * @param {boolean} [params.loadingDocument=false] - Es para indicar si el componente padre esta cargando el pdf.
 * @param {string} params.urlDownload - URL del PDF construido
 * @param {string} [params.nameDocument='Document.pfd'] - Indica el nombre que se le asignara al archivo descargado.
 * @param {string} [params.isEnabled=false] - Condición boleana donde false solo muestra el icono pero no permite la descarga.
 *
 * @example Sin parametro URL
 * <DownloadButton urlDownload={''}/>
 * Se renderiza solo el icono descarga
 * <span className='float-right cursor-default material-symbols-outlined'>download</span>
 *
 * @example Esperando respuesta del endpoint
 * <DownloadButton loadingDocument={true}/>
 * Se renderiza solo el icono descarga
 * <span className='float-right cursor-default material-symbols-outlined'>download</span>
 *
 * @example Se deshabilita botón por condición
 * <DownloadButton urlDownload={'locahost:3000/myfile.pdf'} isEnabled={false}/>
 * Se renderiza solo el icono descarga
 * <span className='float-right cursor-default material-symbols-outlined'>download</span>
 *
 * @example Botón descargar habilitado
 * <DownloadButton urlDownload={'locahost:3000/myfile.pdf'} isEnabled={true} nameDocument="Prueba Archivo"/>
 * */
export const DownloadButton = ({
   loadingDocument = false,
   urlDownload,
   nameDocument = 'Document.pfd',
   isEnabled = false,
}) => {
   if (loadingDocument || !isEnabled || !urlDownload) {
      return <span className='float-right cursor-default material-symbols-outlined'>download</span>;
   }

   return (
      <a
         href={urlDownload}
         target='_blank'
         rel='noopener noreferrer'
         title='Descargar archivo'
         className='p-1 rounded-full flex-init hover:bg-gray-100 hover:text-black-900'
         download={nameDocument + '.pdf'}>
         <span className='float-right material-symbols-outlined'>download</span>
      </a>
   );
};

DownloadButton.propTypes = {
   loadingDocument: PropTypes.bool,
   urlDownload: PropTypes.string,
   nameDocument: PropTypes.string,
   isEnabled: PropTypes.bool,
};
