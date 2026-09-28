'use client';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { RowItem } from './RowItem';
import Pagination from './Pagination';
import { useGlobalContext } from '../../hooks';
import { tableColums, renderCellEmpty } from '../../helpers';

/**
 * Componente Tabla Generica que permite renderizar una tabla sin importar la información, si quieres mostrar detalles de solicitudes usar TableDetails.
 * @param {Object} props
 * @param {Array} props.data: Atributo Obligatorio - ya que deberá ser la información a mostrar.
 * @param {string} props.typeTable: Atributo Obligatorio - Debe ser añadido en el archivo initTableColums en la constante tableColums
 * @param {boolean} props.isLoading: DEFAULT = False. Añadir si se quiere mostrar el skelton cuando se esta procesando la informacióm.
 * @param {Function} props.onFunc: Añadir una función si se le quiere dar funcionalidad extra al realizar click en cada ROW.
 * @param {number} props.itemsPerPage: DEFAULT = 10. Añadir si se quiere cambiar la cantidad de elementos por pagina.
 * @param {number} props.keepCurrentPage: Indica si la página se mantiene cuando los datos de la tabla cambian.
 * @returns {JSX.Element} Tabla Generica
 */
export const TableGeneric = ({
   data = [],
   typeTable = '',
   isLoading = false,
   onFunc,
   itemsPerPage = 10,
   keepCurrentPage,
}) => {
   const {
      actions: { setPagination },
      pagination: { currentPage },
   } = useGlobalContext();
   const [sortedBy, setSortedBy] = useState({ column: null, asc: true });
   const cols = useMemo(() => tableColums[typeTable], [typeTable]);

   useEffect(() => {
      if (!_.isEmpty(data)) {
         setPagination({
            currentPage: keepCurrentPage ? currentPage : 1,
            totalPages: Math.ceil(data.length / itemsPerPage) || 1,
            type: typeTable.includes('DROP') && 'DROP',
         });
      }
   }, [data.length, keepCurrentPage]);

   const onHandleSort = (column) => {
      let asc = column === sortedBy.column ? !sortedBy.asc : true;
      data.sort((a, b) => {
         let order = a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0;
         return asc ? order * -1 : order;
      });
      setSortedBy({ column, asc });
   };

   return (
      <>
         <table className='w-full'>
            <thead className='flex p-4 text-xs text-center text-white bg-black rounded-t-lg select-none 2xl:text-base'>
               <tr className='grid items-center justify-between w-full grid-cols-12 gap-2'>
                  {cols &&
                     cols?.map((u) => (
                        <th
                           key={`TH-${u.display}`}
                           className={`${u?.sx || ''} ${u.id != 'function' && 'cursor-pointer'}`}
                           onClick={() => u.id != 'function' && onHandleSort(u.id)}>
                           <div className='flex items-center justify-center'>
                              <div className='flex flex-col items-center'>
                                 {u.display}
                                 {u.description && (
                                    <>
                                       <br />
                                       <span className='text-xs'>{u.description}</span>
                                    </>
                                 )}
                              </div>
                              {u.id == sortedBy.column && (
                                 <span className='material-symbols-outlined icon-size-24'>
                                    {sortedBy.asc ? 'arrow_drop_up' : 'arrow_drop_down'}
                                 </span>
                              )}
                           </div>
                        </th>
                     ))}
               </tr>
            </thead>
            <tbody
               className={`flex flex-col rounded-b-lg text-black text-xs 2xl:text-base text-center ${
                  typeTable.includes('DROP') ? 'h-auto' : 'border border-gray lg:min-h-[22.1rem] '
               } fadeIn`}>
               {isLoading ? (
                  <tr className='w-full px-4 py-2 min-h-[22rem] border rounded-sm box'>
                     <td></td>
                  </tr>
               ) : _.isEmpty(data) ? (
                  renderCellEmpty(typeTable)
               ) : (
                  data
                     ?.slice(currentPage * itemsPerPage - itemsPerPage, currentPage * itemsPerPage)
                     .map((item) => <RowItem key={`RowGroup-${item.idGroup}`} {...{ item, cols, onFunc }} />)
               )}
            </tbody>
         </table>
         {!_.isEmpty(data) && <Pagination />}
      </>
   );
};

TableGeneric.propTypes = {
   data: PropTypes.arrayOf(PropTypes.object).isRequired,
   typeTable: PropTypes.string.isRequired,
   isLoading: PropTypes.bool,
   onFunc: PropTypes.func,
   itemsPerPage: PropTypes.number,
   keepCurrentPage: PropTypes.bool,
};
