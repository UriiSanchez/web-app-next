import clsx from 'clsx';

import { useGlobalContext } from '../../../hooks';
import { datetimeToString, formatMoney } from '../../../helpers';
import { EnumStatus } from '../../../helpers/config';

const EmpoweredHistory = ({ person, request, idx }) => {
   const { actions } = useGlobalContext();
   return (
      <>
         {idx === 0 && (
            <tr className='w-full gap-2 px-8 py-1 text-xs font-semibold bg-gray-100 border-b-2 2xl:text-sm text-neutral-500 fadeIn border-b-gray h-14'>
               <td />
               <td>Solicitante</td>
               <td>Trámite</td>
               <td colSpan='2'>Monto autorizado MXN</td>
               <td>Nocional autorizado USD</td>
               <td>Fecha resolución</td>
               <td>Plazo de Vigencia</td>
               <td>Cáratula</td>
               <td />
            </tr>
         )}
         <tr className='w-full h-10 gap-2 px-8 py-1 text-xs bg-gray-100 border-b 2xl:text-sm fadeIn border-b-gray'>
            <td>
               <span
                  className={clsx('material-symbols-outlined filled ', {
                     'text-red-500': request.idCatStatus === EnumStatus.SOLICITUD_RECHAZADA,
                     'text-emerald-600': request.idCatStatus === EnumStatus.SOLICITUD_AUTORIZADA,
                  })}>
                  {request.idCatStatus === EnumStatus.SOLICITUD_RECHAZADA ? 'cancel' : 'check_circle'}
               </span>
            </td>
            <td>{person.fullName}</td>
            <td>{request.kindProcedure}</td>
            <td colSpan='2'>{formatMoney(request.requestAmount)}</td>
            <td>{formatMoney(request.authorizationNotional)}</td>
            <td>{datetimeToString(request.resolutionDate)}</td>
            <td>{datetimeToString(request.finalizeDate)}</td>
            <td>
               {request.idCatStatus === EnumStatus.SOLICITUD_AUTORIZADA && (
                  <button
                     type='button'
                     className='bg-transparent'
                     onClick={() =>
                        actions.togglePDF({
                           idRequest: request.idRequest,
                           idClient: person.idClient,
                           title: `${person.fullName.replace(/[ .]$/g, '')}`,
                           prefixName: 'Carátula',
                           typePDF: 'ONLY_COVER',
                        })
                     }>
                     <span className='text-blue-500 material-symbols-outlined'>visibility</span>
                  </button>
               )}
            </td>
            <td />
         </tr>
      </>
   );
};

export default EmpoweredHistory;
