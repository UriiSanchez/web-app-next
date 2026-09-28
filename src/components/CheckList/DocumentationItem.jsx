import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';

import { DetailsNewLetter } from './DetailsNewLetter';
import { useGlobalContext, useToggle } from '../../hooks';
import { colorStatus } from '../../helpers';

/**
 * Componente que devuelve un box por documento.
 * @param {Object} props - Información por cada documento.
 * @param {String} typePerson - Tipo de persona.
 * @param {Function} fnAction - Función ligada para relizar la ejecución por Perfil.
 */
export const DocumentationItem = ({ props, typePerson, fnAction }) => {
   const { actions } = useGlobalContext();
   const [showModal, setShowModal] = useToggle(false);
   const [combo, setCombo] = useState({ folio: 0, title: '' });

   useEffect(() => {
      setCombo({ folio: 0, title: '' });
   }, [props]);

   const genericControls = (item, doc, idx) => {
      switch (item.type) {
         case 'btn':
            return (
               <button
                  key={'checkItem-' + doc._id + '-' + idx}
                  type='button'
                  disabled={!item?.enable}
                  onClick={() => actions.togglePDF({ folio: doc.folio, title: doc.title })}
                  className='flex items-center justify-center w-24 px-3 py-1 text-xs text-white bg-black border lg:w-28 rounded-3xl'>
                  {item?.label || ''}
               </button>
            );
         case 'link':
            return item?.enable ? (
               <Link
                  key={'checkItem-' + doc._id + '-' + idx}
                  href={item.url || ''}
                  className='flex items-center justify-center px-3 py-1 text-xs text-white bg-black border w-28 rounded-3xl'>
                  {item.label}
               </Link>
            ) : (
               <button
                  key={'checkItem-' + doc._id + '-' + idx}
                  disabled
                  className='flex items-center justify-center px-3 py-1 text-xs text-white bg-black border w-28 rounded-3xl'>
                  {item.label}
               </button>
            );
         case 'list':
            return (
               <div key={'checkItem-' + doc._id + '-' + idx} className='flex flex-col gap-3 md:flex-row'>
                  <select
                     key={doc._id + 'select'}
                     id='comboYear'
                     disabled={!item.enable}
                     value={combo.folio || ''}
                     onChange={(e) => setCombo({ folio: e.target.value, title: doc.title })}
                     className={`p-0.5 border rounded border-gray-400 text-${
                        (!item.enable && 'gray') || 'black'
                     } cursor-pointer`}>
                     <option value=''>Año</option>
                     {item.data?.map((dc) => (
                        <option
                           key={dc.year}
                           value={dc?.folio || ''}
                           className={dc.folio === 0 ? 'text-red-500' : 'text-emerald-600'}>
                           {dc.year}
                        </option>
                     ))}
                  </select>
                  <button
                     disabled={combo.folio == 0}
                     key={doc._id + 'button-year'}
                     type='button'
                     onClick={() => actions.togglePDF(combo)}
                     className='flex items-center justify-center py-1 text-xs text-white bg-black border w-14 rounded-3xl'>
                     {item?.label}
                  </button>
               </div>
            );
         case 'func':
            return (
               <button
                  key={'checkItem-' + doc._id}
                  type='button'
                  disabled={!item?.enable}
                  onClick={() => fnAction()}
                  className='flex items-center justify-center w-24 px-3 py-1 text-xs text-white bg-black border lg:w-28 rounded-3xl'>
                  {item?.label || ''}
               </button>
            );
         default:
            break;
      }
   };

   return (
      <div className='flex flex-row h-32 text-xs border-b last:border-b-0 border-gray lg:text-sm 2xl:text-base'>
         <div className='box-content flex flex-col py-2 pl-4 pr-2 basis-5/6'>
            <h3 className='text-sm '>{props?.title || ''}</h3>
            {props?.subtitle && <h5 className='text-xs text-gray-500 2lg:text-sm'>{props?.subtitle || ''}</h5>}
            {props?.selectedType && <h5 className='mt-1 text-sm text-black'>Método: {props?.selectedType || '-'}</h5>}
            {props?.status && (
               <p className={`flex gap-1 mt-1 text-sm text-${colorStatus[props?.status] || 'gray'}`}>
                  Estatus: {props?.status || '-'}
                  {parse(props?.icon || '')}
               </p>
            )}
            {props?.layout && props?.layout == 'CNNV' ? (
               <>
                  <button
                     disabled={!props?.isEnable}
                     onClick={setShowModal}
                     className='relative flex items-center flex-none mt-1 text-sm text-left 2xl:text-base text-black-light group clean'>
                     Requisitos para consulta BC
                     <span
                        className={`material-symbols-outlined icon-size-20 text-${
                           props?.isEnable ? 'blue-800' : 'gray'
                        }`}>
                        open_in_new
                     </span>
                     <div className='absolute z-10 justify-center hidden w-full group-hover:flex top-5 -left-[1rem] fadeIn'>
                        <div
                           className={`self-center px-2 py-1 text-xs rounded-bl-md rounded-r-md bg-${
                              props?.isEnable ? 'blue-500' : 'black'
                           } text-white whitespace-nowrap`}>
                           {props?.isEnable
                              ? 'Haz clic para ver más información'
                              : 'La solicitud NO se encuentra del lado del Especialista de Mercados Globales'}
                        </div>
                     </div>
                  </button>
                  {showModal && (
                     <DetailsNewLetter
                        docs={props?.docs}
                        fnClose={setShowModal}
                        typePerson={typePerson}
                        showModal={showModal}
                     />
                  )}
               </>
            ) : (
               <p className='mt-1 text-xs text-gray-400 '>{props?.layout}</p>
            )}
         </div>
         <div className='flex flex-col items-center justify-center py-4 space-y-2 basis-2/6'>
            {!_.isEmpty(props?.toAction) && props.toAction.map((item, idx) => genericControls(item, props, idx))}
         </div>
      </div>
   );
};

DocumentationItem.propTypes = {
   props: PropTypes.object.isRequired,
   typePerson: PropTypes.string,
   fnAction: PropTypes.func,
};
