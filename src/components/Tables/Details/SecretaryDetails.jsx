import { formatMoney } from '../../../helpers';

const SecretaryDetails = ({ person, request, isGroup }) => {
   return (
      <tr className='w-full text-xs 2xl:text-base gap-2 px-2 py-1 fadeIn border-b-gray border-b h-11 bg-gray-100'>
         <td colSpan='2' />
         <td>{isGroup && person.fullName}</td>
         <td></td>
         <td>
            {formatMoney(request.requestAmount)}
         </td>
         <td>
            {request.kindProcedure}
         </td>
         <td colSpan='4' />
      </tr>
   );
};

export default SecretaryDetails;