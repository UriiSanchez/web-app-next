import React from 'react';
import { DateRange } from 'react-date-range';
import { es } from 'date-fns/locale';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useDetectClickOutside } from '../../hooks';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export const FilterRangeDates = ({ data, onSet }) => {
   const { isOpen, setIsOpen, refElement } = useDetectClickOutside(false);
   const today = new Date();
   const defaultDateRange = [
      {
         startDate: today,
         endDate: today,
         key: 'selection',
      },
   ];

   return (
      <div className='relative' ref={refElement}>
         <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='bg-[#E8E8E8] flex items-center rounded-lg px-4 py-1.5 gap-1 text-sm 2xl:text-base'>
            Periodo
            <span className='material-symbols-outlined icon-size-20'>
               {isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
            </span>
         </button>
         {isOpen && (
            <div
               className={clsx(
                  'absolute p-1 -left-36 top-10 rounded-md border border-[#BEBEBE] bg-white z-20 shadow-2xl fadeIn transform transition-all duration-300 drop-shadow-lg',
                  {
                     'translate-x-full hidden': !isOpen,
                  }
               )}>
               <DateRange
                  locale={es}
                  months={2}
                  maxDate={today}
                  ranges={data}
                  editableDateInputs={false}
                  onChange={(item) => onSet('byDateRange', [item.selection])}
                  moveRangeOnFirstSelection={false}
                  monthDisplayFormat='MMMM yyyy'
                  showDateDisplay={false}
                  showMonthAndYearPickers={false}
                  direction='horizontal'
                  className='custom-calendar'
               />
               <div className='w-full flex justify-end'>
                  <button
                     title='Limpiar filtro de fechas'
                     className='text-sm px-2 py-1 rounded-md'
                     onClick={() => onSet('byDateRange', defaultDateRange)}>
                     Limpiar
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

FilterRangeDates.propTypes = {
   data: PropTypes.array,
   onSet: PropTypes.func,
};
