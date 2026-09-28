import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';

import { useGlobalContext } from '../../hooks';
import { renderCellAndExpand } from '../../helpers';
import { constTypePerson as TypePerson } from '../../helpers/config';

const EmpoweredDetails = dynamic(() => import('./Details/EmpoweredDetails'));
const EmpoweredHistory = dynamic(() => import('./Details/EmpoweredHistory'));
const SecretaryDetails = dynamic(() => import('./Details/SecretaryDetails'));
const SecretaryHistory = dynamic(() => import('./Details/SecretaryHistory'));
const TrackingDetails = dynamic(() => import('./Details/TrackingDetails'));

const listComponentsDetails = {
   FAC: EmpoweredDetails,
   SEC: SecretaryDetails,
   FAC_HISTORY: EmpoweredHistory,
   SEC_HISTORY: SecretaryHistory,
};

const BodyRow = ({ item, cells, onFunc, typeTable }) => {
   const {
      expandedRows,
      actions: { setExpandedRows },
   } = useGlobalContext();

   const isExpanded = expandedRows.includes(item?.idGroup);

   const listRequests = item?.requestResponseList?.map((request, idx) => {
      const NewComponent = listComponentsDetails[typeTable];
      let person = request.relatedPersonResponseList?.find((person) => person.idCatTypePerson === TypePerson.APPLICANT);

      return NewComponent ? (
         <NewComponent
            key={person.fullName.replace(/\s+/g, '_')}
            person={person}
            isGroup={item.isGroup}
            request={request}
            idx={idx}
         />
      ) : null;
   });

   return (
      <Fragment>
         <tr
            onClick={onFunc ? () => onFunc(item) : undefined}
            className={clsx(
               'text-xs 2xl:text-base w-full gap-2 px-2 py-1 h-16 border-b-[#B7B8B7] border-b-[1.5px] bg-white',
               {
                  'hover:bg-[#F4F4F4]': !isExpanded,
                  'cursor-pointer': onFunc !== undefined,
               }
            )}>
            {renderCellAndExpand(cells, item, setExpandedRows, isExpanded)}
         </tr>
         {isExpanded && typeTable !== 'ALL_TRACKING' && listRequests}
         {isExpanded && typeTable === 'ALL_TRACKING' && (
            <TrackingDetails
               idGroup={item.idGroup}
               isGroup={item.isGroup}
               groupName={item.groupName}
               onExpand={() => setExpandedRows(item.idGroup)}
               listApplicants={item.listApplicants}
               listRequests={item.requestResponseList}
               requestPerGroup={item.requestPerGroup}
            />
         )}
      </Fragment>
   );
};

export default BodyRow;
