import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { TableSkeleton } from '../Skeleton';
import BodyRow from './BodyRow';
import HeadCell from './HeadCell';
import Pagination from './Pagination';
import { useGlobalContext } from '../../hooks';
import { renderCellEmpty, tableColums } from '../../helpers';

/**
 * *NUEVO Diseño*
 * Tabla solo para mostrar solicitudes, esta tabla esta enfocada unicamente para la pantalla solicitudes, por lo
 * cual se modifican los parametros y será obligatorio los parametros data y typeTable.
 * @component
 * @param {Object} props - Propiedades del componente TableRequests
 * @param {Array} props.data - OBLIGATORIO - Datos a mostrar en la tabla.
 * @param {'FAC'| 'SEC'|'HISTORY'|'FAC_HISTORY'|'SEC_HISTORY'} props.typeTable - OBLIGATORIO - Define el tipo de tabla soportado y permite traer las celdas dinamicas.
 * @param {boolean} [props.keepCurrentPage=false] -
 * @param {boolean} [props.loading=false] - Indicador de carga. true activa el skeleton y false lo oculta. Es false por defecto.
 * @param {Function} props.onFunc - Función de origen del componente padre para hacer clic sobre la ROW
 */
export const TableRequests = ({ data = [], keepCurrentPage = false, typeTable, onFunc, loading = false }) => {
   const {
      actions: { setPagination },
      pagination: { currentPage },
   } = useGlobalContext();
   const [sortedBy, setSortedBy] = useState({ column: null, direction: null });
   const itemsPerPage = 10;

   const cellsTable = useMemo(() => tableColums[typeTable], [typeTable]);
   const cellEmptyData = useCallback(
      () => renderCellEmpty(typeTable, 'border-b border-b-gray h-[16rem] 2xl:h-[38rem] text-gray text-lg'),
      [typeTable]
   );

   const sortData = useMemo(() => {
      const { column, direction } = sortedBy;
      if (!direction) return data;

      return [...data].sort((a, b) => {
         if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
         if (a[column] > b[column]) return direction === 'desc' ? -1 : 1;

         return 0;
      });
   }, [data, sortedBy]);

   const onHandleSort = (column) => {
      const mapOptionSort = {
         asc: 'desc',
         desc: null,
         null: 'asc',
      };

      let currentDirection = sortedBy.column === column ? sortedBy.direction : null;
      setSortedBy({ column, direction: mapOptionSort[currentDirection] });
   };

   useEffect(() => {
      if (!_.isEmpty(data)) {
         setPagination({
            currentPage: keepCurrentPage ? currentPage : 1,
            totalPages: Math.ceil(data?.length / itemsPerPage) || 1,
            type: typeTable.includes('DROP') && 'DROP',
         });
      }
   }, [data?.length, keepCurrentPage]);

   if (loading) {
      return <TableSkeleton />;
   }

   return (
      <>
         <table className='w-full table-auto new-table'>
            <thead className='text-sm 2xl:text-base'>
               <tr className='h-12 border-b-gray border-b-[1.5px]'>
                  {cellsTable?.map((cell) => (
                     <HeadCell key={'th-' + cell.id} {...{ cell, sortedBy, onHandleSort }} />
                  ))}
               </tr>
            </thead>
            <tbody className='text-center'>
               {_.isEmpty(sortData)
                  ? cellEmptyData()
                  : sortData
                       ?.slice(currentPage * itemsPerPage - itemsPerPage, currentPage * itemsPerPage)
                       .map((item) => (
                          <BodyRow
                             key={`tdGroup-${item.idGroup}`}
                             {...{ item, cells: cellsTable, onFunc, typeTable }}
                          />
                       ))}
            </tbody>
         </table>
         {!_.isEmpty(data) && <Pagination />}
      </>
   );
};

TableRequests.propTypes = {
   data: PropTypes.array.isRequired,
   typeTable: PropTypes.oneOf(['FAC', 'SEC', 'HISTORY', 'FAC_HISTORY', 'SEC_HISTORY']).isRequired,
   keepCurrentPage: PropTypes.bool,
   loading: PropTypes.bool,
   onFunc: PropTypes.func,
};
