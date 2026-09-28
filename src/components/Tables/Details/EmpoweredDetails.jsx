import { formatMoney } from '../../../helpers';

const EmpoweredDetails = ({ person, request, isGroup }) => {
   return (
      <tr className='w-full gap-2 px-2 py-1 text-xs bg-gray-100 border-b 2xl:text-base fadeIn border-b-gray h-11'>
         <td colSpan='2' />
         <td>{isGroup && person.fullName}</td>
         <td></td>
         <td>{formatMoney(request.approvedAmount)}</td>
         <td>{request.kindProcedure}</td>
         <td colSpan='4' />
      </tr>
   );
};

export default EmpoweredDetails;
