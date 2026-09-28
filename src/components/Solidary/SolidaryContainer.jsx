'use client';
import _ from 'lodash';

import { SolidarySkeleton } from '../Skeleton';
import { SolidaryView } from './Form/SolidaryView';
import { SolidaryEdit } from './Form/SolidaryEdit';

export const SolidaryContainer = ({ applicants, isNotEditable, onUpdateInfo, creditLimit }) => {
   if (_.isEmpty(applicants)) {
      return <SolidarySkeleton />;
   }

   return (
      <div className='max-w-screen-xl px-8 my-3'>
         <div className='flex gap-5 overflow-x-auto py-5 px-1'>
            {applicants.map((item) => {
               return isNotEditable ? (
                  <SolidaryView key={'Request-' + item.idRequest} request={item} isNotEditable={isNotEditable} />
               ) : (
                  <SolidaryEdit
                     key={'Request-' + item.idRequest}
                     request={item}
                     onSet={onUpdateInfo}
                     creditLimit={creditLimit}
                     isNotEditable={isNotEditable}
                  />
               );
            })}
         </div>
      </div>
   );
};
