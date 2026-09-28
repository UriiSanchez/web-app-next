import React from 'react';
import clsx from 'clsx';

import { iconsCellsMapping } from '../../helpers';

const HeadCell = ({ cell, sortedBy, onHandleSort }) => {
   let sortIcon = iconsCellsMapping[sortedBy?.direction] || '';
   return (
      <th
         data-testid={`test-thead-${cell.id}`}
         className={clsx(`${cell?.sx} px-1`, {
            'cursor-pointer': cell.id !== 'function',
         })}
         onClick={() => cell.id != 'function' && onHandleSort(cell.id)}>
         <div className='flex items-center justify-center'>
            <div className='flex flex-col items-center'>
               {cell.display}
               {cell.description && <span className='text-xs'>{cell.description}</span>}
            </div>
            {cell.id === sortedBy?.column && <span className='material-symbols-outlined icon-size-24'>{sortIcon}</span>}
         </div>
      </th>
   );
};

export default HeadCell;
