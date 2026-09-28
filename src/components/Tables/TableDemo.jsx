import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { TableSkeleton } from '../Skeleton';
import BodyRow from './BodyRow';
import { CellItem } from './Items/CellItem';
import { renderCellEmpty, tableColums } from '../../helpers';
import { useSortData } from '../../hooks';

/**
 * *Tabla DEMO*
 * Será reemplazada una vez que termine de hacer o probar los ajustes necesarios para los nuevos cambios
 * para la configuración de las tablas.
 * @component
 * @param {Object} props - Propiedades del componente TableRequests
 * @param {Array} props.data - Datos a mostrar en la tabla.
 * @param {'FAC'| 'SEC'|'HISTORY'|'FAC_HISTORY'|'SEC_HISTORY'|'ALL_TRACKING'} props.typeTable - Define el tipo de tabla soportado y permite traer las celdas dinamicas.
 * @param {boolean} [props.loading=false] - Indicador de carga. true activa el skeleton y false lo oculta. Es false por defecto.
 * @param {Function} props.onFunc - Función de origen del componente padre para hacer clic sobre la ROW
 */
export const TableDemo = ({ data = [], typeTable, onFunc, loading = false }) => {
   const { sortData, sortedBy, onHandleSort } = useSortData(data);
   const settingsTable = useMemo(() => tableColums[typeTable], [typeTable]);
   const cellEmptyData = useCallback(
      () => renderCellEmpty(typeTable, 'border-b border-b-gray h-[16rem] 2xl:h-[38rem] text-gray text-lg'),
      [typeTable]
   );

   if (loading) {
      return <TableSkeleton />;
   }

   return (
      <table className='w-full table-auto new-table'>
         <thead className='text-sm 2xl:text-base'>
            <tr className='h-12 border-b-gray border-b-[1.5px]'>
               {settingsTable.cells?.map((cell) => (
                  <CellItem key={'th-' + cell.id} {...{ cell, sortedBy, onHandleSort }} />
               ))}
            </tr>
         </thead>
         <tbody className='text-center'>
            {_.isEmpty(sortData)
               ? cellEmptyData()
               : sortData.map((item) => (
                    <BodyRow
                       key={`tdGroup-${item.idGroup}`}
                       item={item}
                       cells={settingsTable.rows}
                       onFunc={onFunc}
                       typeTable={typeTable}
                    />
                 ))}
         </tbody>
      </table>
   );
};

TableDemo.propTypes = {
   data: PropTypes.array.isRequired,
   typeTable: PropTypes.oneOf(['FAC', 'SEC', 'HISTORY', 'FAC_HISTORY', 'SEC_HISTORY', 'ALL_TRACKING']).isRequired,
   loading: PropTypes.bool,
   onFunc: PropTypes.func,
};
