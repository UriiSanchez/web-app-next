import _ from 'lodash';
import Image from 'next/image';
import PropTypes from 'prop-types';

import { DocumentationItem } from './DocumentationItem';
import imgEmptyDocs from '../../../public/pictures/ph_docs.svg';

/**
 * Componente genérico para mostrar los documentos por participante en la sección Checklist
 * @param {Object} docs - Recibe un objeto donde debe traer Documentations para cargar el Checklist
 * @param {Function} [onFunc] - Función que se ejecuta al hacer clic en algún botón que permite ejecutar alguna acción en el componente padre.
 */
export const DocumentationTable = ({ docs, onFunc }) => {
   return (
      <div className='w-5/12'>
         <div className='px-4 py-2 text-sm text-white bg-black border-transparent rounded-t'>Documentación</div>
         <div
            className={`h-${_.isEmpty(docs?.documentation) ? 'full' : 'auto'} border-b rounded-b border-x border-gray`}>
            {!_.isEmpty(docs?.documentation) ? (
               docs.documentation.map((dc) => (
                  <DocumentationItem
                     key={'Box-' + dc._id}
                     props={dc}
                     typePerson={docs?.personType}
                     fnAction={() => onFunc(docs)}
                  />
               ))
            ) : (
               <div className='flex flex-col justify-center w-full h-full'>
                  <div className='flex flex-row justify-center'>
                     <Image src={imgEmptyDocs} alt='Sin documentos' />
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

DocumentationTable.propTypes = {
   docs: PropTypes.object.isRequired,
   onFunc: PropTypes.func,
};
