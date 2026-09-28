import { Fragment } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { isValidEmail } from '../../helpers';

/**
* Muestra un listado de los miembros del grupo económico ligados al cliente
* @Component ListEconomicGroup
* @param {Object} props - Propiedades del componente
* @param {Array} props.group - Arreglo de clientes pertenecientes al grupo económico
* @param {Array} props.applicants - Arreglo de clientes seleccionados para participar en la solicitud
* @param {Func} props.onSetData - Función que permite actualizar el estado de applicants.
* */
export const ListEconomicGroup = ({ group, applicants, onSetData }) => {
   const onCheckboxChange = (newApplicant) => {
      let existApplicant = applicants.some((apply) => apply.idClient === newApplicant.idClient);
      let newApplicants = !existApplicant
         ? [...applicants, newApplicant]
         : applicants.filter((apply) => apply.idClient !== newApplicant.idClient);

      onSetData([...newApplicants]);
   };

   const onEditToogle = (idClient) => {
      let newApplicants = applicants.map((apply) => {
         if (apply.idClient === idClient) {
            return { ...apply, edit: !apply.edit };
         }

         return apply;
      });
      onSetData(newApplicants);
   };

   const onHandleChange = (idClient, value) => {
      onSetData((prevState) =>
         prevState.map((apply) =>
            apply.idClient === idClient
               ? {
                    ...apply,
                    alternativeMail: value,
                 }
               : apply
         )
      );
   };

   return (
      <Fragment>
         {group?.map((item) => {
            const existApplicant = applicants.find((appli) => appli?.idClient === item.idClient);
            const isEmailValid =
               isValidEmail(existApplicant?.alternativeMail) || existApplicant?.alternativeMail === '';
            return (
               <Fragment key={'Applicant-' + item.idClient}>
                  <input
                     id={'client-' + item.idClient}
                     type='checkbox'
                     checked={existApplicant?.idClient === item.idClient}
                     className='option-input radio !top-0'
                     onChange={() => onCheckboxChange(item)}
                  />
                  <div className='col-span-1'>{item?.idClient}</div>
                  <div className='col-span-3 text-center'>{item.fullName}</div>
                  <div className='w-full col-span-3 p-1 text-center truncate h-fit'>
                     {existApplicant?.edit ? (
                        <input
                           id={'alternativeMail-' + item.idClient}
                           data-testid={'input-alternative-' + item.idClient}
                           type='email'
                           value={existApplicant.alternativeMail ?? ''}
                           onChange={(e) => onHandleChange(item.idClient, e.target.value)}
                           className={clsx('w-full clean border-b-[1.5px] border-gray outline-none text-center', {
                              'border-red-500 text-red-500': !isEmailValid,
                              'border-blue-500 focus:text-blue-500': isEmailValid,
                           })}
                           placeholder='Correo alternativo'
                        />
                     ) : (
                        <p className='w-full col-span-3 p-1 text-center truncate h-fit'>{item.email}</p>
                     )}
                  </div>
                  <div className='flex justify-center w-full p-1'>
                     <button
                        data-testid={'edit-alternative-' + item.idClient}
                        onClick={() => onEditToogle(item.idClient)}
                        className={clsx('w-fit text-center select-none cursor-pointer', {
                           'text-red-500 hover:bg-red-500 px-1 hover:rounded hover:text-white': existApplicant?.edit,
                           'text-blue-800 hover:bg-blue-800 px-1 hover:rounded hover:text-white': existApplicant,
                           'text-gray-400 cursor-default': !existApplicant,
                        })}>
                        {existApplicant?.edit ? 'Cancelar' : 'Editar'}
                     </button>
                  </div>
                  <div className='col-span-3'>
                     {item.isInProgress ? (
                        <span className='px-4 select-none rounded-xl bg-process'>En proceso</span>
                     ) : (
                        <span className='px-4 select-none rounded-xl bg-gray-light'>Sin solicitud</span>
                     )}
                  </div>
               </Fragment>
            );
         })}
      </Fragment>
   );
};

ListEconomicGroup.propTypes = {
   group: PropTypes.array.isRequired,
   applicants: PropTypes.array.isRequired,
   onSetData: PropTypes.func,
};
