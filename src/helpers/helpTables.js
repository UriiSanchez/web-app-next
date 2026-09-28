import _ from 'lodash';
import Link from 'next/link';
import Image from 'next/image';

import { catStatus, EnumStatus as Status, constRequestLifeStatus as RequestLifeStatus } from './config';
import { datetimeToString, dateToString } from './helpDates';
import { formatId, formatMoney } from './helpFormats';
import { sweetCustomAlert, templateSweetAlert } from './helpSweet';

import icoSearch from '../../public/icons/ico_search.svg';

export const renderCellAndExpand = (cols, item, onFunc, isExpanded) => {
   return cols.map((cl) => {
      let value = item[cl.id];
      let uKey = _.uniqueId(`cell-${cl.id}-`);

      /*Se trata de forma independiente el botón de expandir*/
      if (cl.type === 'expand') {
         const buttomElement = (
            <td key={uKey} className={cl.sx}>
               <button
                  data-testid={'btn-expanded-' + item.idGroup}
                  aria-expanded={isExpanded}
                  onClick={(e) => {
                     e.stopPropagation();
                     onFunc(item.idGroup);
                  }}>
                  <span className={`material-symbols-outlined icon-size-24 hover:bg-[#D9D9D9] rounded-3xl ${cl.sxValue || ''}`}>
                     {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
               </button>
            </td>
         );

         if (cl.showOnlyGroup) {
            return item.isGroup ? buttomElement : <td key={uKey} className={cl.sx}></td>;
         }

         return buttomElement;
      }

      let element = <span className={cl.sxValue || ''}>{value || '-'}</span>;
      if (cl.type in cellsTypeMapping) {
         element = cellsTypeMapping[cl.type]({ uKey, value, cl, item });
      }

      return (
         <td key={uKey} className={cl.sx || cl.sxContainer || ''}>
            {element}
            {cl.tooltip && (
               <div
                  className={`absolute z-50 hidden group-hover:block fadeIn duration-300 transition-all ease-in-out ${
                     cl.tooltip.sxTool || ''
                  }`}>
                  {cl.tooltip.text}
               </div>
            )}
         </td>
         //
      );
   });
};

export const renderCellEmpty = (typeTable, sx = '') => {
   const elements = {
      MRC: (
         <tr className='flex justify-center items-center w-full min-h-[22rem] text-gray text-lg'>
            <td>No hay solicitudes por revisar</td>
         </tr>
      ),
      EMG_SEARCH: (
         <tr className='flex justify-center items-center w-full min-h-[22rem] text-gray text-lg'>
            <td className='flex flex-col items-center gap-2 select-none'>
               <Image src={icoSearch} width='auto' height='auto' alt='Icono de lupa' className='w-10 opacity-40' />
               <p>Escribe en el buscador para mostrar resultados</p>
            </td>
         </tr>
      ),
      EMG_HISTORY: (
         <tr className='flex justify-center items-center w-full min-h-[22rem] text-gray text-lg'>
            <td>Aún no hay solicitudes terminadas</td>
         </tr>
      ),
      EMG_REQUEST: (
         <tr className='flex justify-center items-center w-full min-h-[22rem] text-gray text-lg'>
            <td>No hay solicitudes ingresadas</td>
         </tr>
      ),
      HISTORY: (
         <tr className='h-[16rem] 2xl:h-[38rem] w-full text-gray text-lg'>
            <td colSpan='6'>No hay solicitudes por revisar</td>
         </tr>
      ),
   };

   return (
      elements[typeTable] || (
         <tr className={sx || 'flex items-center justify-center w-full min-h-[22rem]  text-lg  text-gray'}>
            <td colSpan='12'>No se encontraron registros</td>
         </tr>
      )
   );
};

export const iconsCellsMapping = {
   asc: 'arrow_drop_up',
   desc: 'arrow_drop_down',
};

const cellsTypeMapping = {
   allData: ({ item }) => {
      return (
         <div className='flex justify-end gap-4 pl-8'>
            <div className='bg-[#FFE8A3] rounded-lg h-8 flex items-center justify-center px-2 py-3'>FM</div>
            <div className="flex-none w-52 2xl:w-10/12 text-left">
               <p className="font-semibold">{formatId(item.idGroup, 8)}</p>
               <p className="truncate" title={item.groupName}>{item.groupName || '-'}</p>
            </div>
         </div>
      );
   },
   chats: ({ cl: { pathOrigin }, item }) => {
      return item?.hasChats ? (
         <Link href={`/${pathOrigin}/RequestsReview/${item.idGroup}`}>
            <span
               className={`${
                  item?.hasChats ? 'text-blue-800' : 'text-gray-400'
               } cursor-pointer material-symbols-outlined icon-size-20 filled`}>
               open_in_new
            </span>
         </Link>
      ) : (
         <button disabled className='cursor-default clean'>
            <span className='material-symbols-outlined icon-size-20'>open_in_new</span>
         </button>
      );
   },
   date: ({ value }) => dateToString(value),
   datetime: ({ value }) => datetimeToString(value),
   detailsGroup: ({ item }) => {
      return (
         <button
            data-testid={`btn-details-${item.idGroup}`}
            className='text-[#458CFA] hover:text-blue-800'
            onClick={() => {
               sweetCustomAlert({
                  width: '38rem',
                  html: templateSweetAlert.MODAL_DETAILS_HISTORY_SEC(item),
                  showConfirmButton: false,
                  showCloseButton: true,
                  customClass: { closeButton: 'text-black-900 hover:text-black text-3xl' },
               });
            }}>
            <span className='material-symbols-outlined icon-size-24'>info</span>
         </button>
      );
   },
   folio: ({ value }) => formatId(value, 8),
   money: ({ value }) => formatMoney(value, 0,'-'),
   name: ({ value, item }) => value || item.businessName || item.name || '-',
   notional: ({ item: { requestResponseList, isGroup } }) => {
      let notional = _.head(requestResponseList)?.notional || _.head(requestResponseList)?.authorizationNotional || '0';
      return !isGroup ? formatMoney(notional) : '-';
   },
   goTO: ({ cl: { href }, item }) => (
      <Link href={href.link + item.idGroup} className='px-5 py-1 text-xs text-white bg-black border w-28 rounded-3xl'>
         {href.label}
      </Link>
   ),
   status: ({ value, cl }) => {
      let lblStatus = { class: 'bg-gray', title: 'Sin Solicitud' };
      if (value) {
         lblStatus = schemaOriginStatus[cl.origin](value);
      }

      return <span className={`px-2 py-1 rounded-full text-xs 2xl:text-sm ${lblStatus.class}`}>{lblStatus.title}</span>;
   },
   substatus: ({ value }) => {
      return (
         <span className='px-2 rounded-full'>
            {![
               Status.EN_ESPECIALISTA_FINANCIAMIENTO,
               Status.SOLICITUD_FINALIZADA,
               Status.SOLICITUD_CANCELADA,
               Status.SOLICITUD_CANCELADA_POR_EMBARGO,
            ].includes(value)
               ? catStatus[value]
               : '-'}
         </span>
      );
   },
};

const schemaOriginStatus = {
   empowered: (idStatus) => {
      let isFinish = RequestLifeStatus.finish.includes(idStatus);
      return {
         title: isFinish ? 'Finalizada' : 'En Proceso',
         class: 'bg-[#E8E8E8]',
      };
   },
   search: (idStatus) => {
      let arrayStatus = [
         Status.SOLICITUD_FINALIZADA,
         Status.SOLICITUD_CANCELADA,
         Status.SOLICITUD_CANCELADA_POR_EMBARGO,
      ];
      let title = idStatus === Status.SOLICITUD_FINALIZADA ? 'Finalizada' : 'En Proceso';
      return {
         title,
         class: arrayStatus.includes(idStatus) ? 'bg-finish' : 'bg-process',
      };
   },
   request: () => {
      return {
         title: 'En Proceso',
         class: 'bg-process',
      };
   },
   history: (idStatus) => {
      return {
         title: catStatus[idStatus],
         class: idStatus === Status.SOLICITUD_FINALIZADA ? 'bg-finish' : 'bg-process',
      };
   },
   secretary: (idStatus) => {
      return {
         title: RequestLifeStatus.finish.includes(idStatus) ? 'Finalizada' : 'En Proceso',
         class: idStatus === Status.SOLICITUD_FINALIZADA ? 'bg-finish' : 'bg-process',
      };
   },
   tracking: (idStatus) => {
     const mapColorsForStatus = {
        'Finalizado': 'bg-[#A5D3C1]',
        'En proceso': 'bg-[#F6B03E]',
        'Cancelado': 'bg-[#FE8083]'
     }

     return {
        title: idStatus,
        class: mapColorsForStatus[idStatus] || 'bg-gray'
     }
   }
};
