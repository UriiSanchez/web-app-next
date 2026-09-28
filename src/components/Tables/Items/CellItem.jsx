import { iconsCellsMapping } from '../../../helpers';
import clsx from 'clsx';
import React from 'react';
import { TooltipControl } from '../../Controls/TooltipControl';

export const CellItem = ({ cell, sortedBy, onHandleSort }) => {
   let sortIcon = iconsCellsMapping[sortedBy?.direction] || '';

   return (
      <th
         data-testid={`test-thead-${cell.id}`}
         className={`${cell.sxContainer || ''} px-2`}
         onClick={() => cell.sort && onHandleSort(cell.id)}>
         <div
            className={clsx(`flex items-center ${cell.sxChild || 'justify-center'} `, {
               'cursor-pointer': cell.sort,
            })}>
            <div
               className={clsx('flex flex-col items-center', {
                  'group relative z-0': cell.tooltip,
               })}>
               {cell.display || ''}
               {cell.subtitle && (
                  <span className={`${cell.subtitle?.sxSubtitle || ''} text-xs`}>{cell.subtitle?.text}</span>
               )}
               {cell.tooltip && <TooltipControl text={cell.tooltip?.text} sx={cell.tooltip.sxTooltip} />}
            </div>
            {cell.id === sortedBy?.column && <span className='material-symbols-outlined icon-size-24'>{sortIcon}</span>}
         </div>
      </th>
   );
};
