import _ from 'lodash';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { ObligatedItem, ResultItem } from '..';
import { AlertsModel } from '../Controls';
import { useGlobalContext } from '../../hooks';
import { datetimeToString, dateToString, formatMoney, templateHistory } from '../../helpers';
import { constTypePerson as TypePerson, EnumStatus as Estatus } from '../../helpers/config';

/**
 * Renderiza componentes para mostrar detalles por cada solicitud.
 * @param {Object} info - Información de la solicitud junto con idGroup, fecha de secretariado y sucursal.
 * @returns
 */
export function DetailsRequest({ info }) {
   const { general, actions, user } = useGlobalContext();
   const requestTemplate = useMemo(() => {
      let status = [
         Estatus.SOLICITUD_CANCELADA,
         Estatus.SOLICITUD_CANCELADA_POR_EMBARGO,
         Estatus.SOLICITUD_RECHAZADA,
      ].includes(info.idCatStatus)
         ? 'declined'
         : 'approved';
      return templateHistory[status](user?.idProfile);
   }, [info, user?.idProfile]);

   const fnFormat = {
      money: formatMoney,
      date: dateToString,
      datetime: datetimeToString,
   };

   const renderComponents = (item) => {
      //* Se añade al principio para que no realice la búsqueda del valor o de la persona.
      if (item.type === 'like') {
         return <ResultItem key={item.id + '-' + info.idRequest} item={item} source={info} />;
      }

      const findValue = info[item.id];
      let person = info?.relatedPersonResponseList?.find((person) => person.idCatTypePerson === TypePerson.APPLICANT);
      switch (item.type) {
         case 'applicant':
            return (
               <div key={item.id + '-' + info.idRequest} className='px-4 py-2'>
                  <p className='font-bold'>{item.display}</p>
                  <p>{person[item.id] || '-'}</p>
               </div>
            );
         case 'obligated':
            let obligated = info?.relatedPersonResponseList?.filter(
               (person) => person.idCatTypePerson === TypePerson.SOLIDARY_OBLIGED
            );
            return <ObligatedItem key={'list-' + info.idRequest} data={obligated} />;
         case 'datetime':
            let value = item.id === 'lastDateBureau' ? person[item.id] : info[item.id];
            return (
               <div key={item.id + '-' + info.idRequest} className='px-4 py-2'>
                  <p className='font-bold'>{item.display}</p>
                  <p>{datetimeToString(value)}</p>
               </div>
            );
         case 'alerts':
            let alertsClient = findValue ? findValue[person?.idClient] : [];
            const isAlertsEmpty = alertsClient.length === 0;

            return (
               <div key={item.id + '-' + info.idRequest} className='flex gap-4 px-4 py-2 item-center'>
                  <p className='font-bold'>{item.display}</p>
                  <button
                     className={clsx('inline-block w-5 h-5 ml-1 group relative clean', {
                        'cursor-default': isAlertsEmpty,
                        'text-blue-800': !isAlertsEmpty,
                     })}
                     type='button'
                     disabled={isAlertsEmpty}
                     onClick={() =>
                        actions.setConfig({ alertsModel: { show: true, alerts: _.flatten(alertsClient) } })
                     }>
                     <span className='material-symbols-outlined icon-size-20'>open_in_new</span>
                     {!isAlertsEmpty && (
                        <div className='absolute hidden w-auto left-4 group-hover:block top-4'>
                           <p className='w-32 px-2 py-0.5 mt-1 text-sm text-center text-white rounded-bl-md rounded-e-md bg-blue-800'>
                              Mostrar alertas
                           </p>
                        </div>
                     )}
                  </button>
               </div>
            );
         default:
            let newValue = item.type in fnFormat ? fnFormat[item.type](findValue) : findValue || '-';
            return (
               <div key={item.id + '-' + info.idRequest} className='px-4 py-2'>
                  <p className='font-bold'>{item.display}</p>
                  <p>{newValue}</p>
               </div>
            );
      }
   };

   return (
      <div className='w-auto h-auto p-7'>
         <div className='grid w-full grid-cols-5 gap-4'>
            {general.alertsModel.show && <AlertsModel />}
            {requestTemplate.map((item) => renderComponents(item))}
         </div>
      </div>
   );
}

DetailsRequest.propTypes = {
   info: PropTypes.object,
};
