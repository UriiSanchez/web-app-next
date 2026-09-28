'use client';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { getClientsById, getClientsByName } from '../../../services';
import { DropdownList } from '../../Controls';
import { TableGeneric } from '../../Tables/TableGeneric';
import { useGlobalContext } from '../../../hooks';
import { sweetNormal, setTextLimit } from '../../../helpers';
import { constTypePerson as TypePerson } from '../../../helpers/config';

const fnActions = {
   forNumber: (value) => getClientsById(`idClient=${value}&typeSolEnum=NONE`),
   forName: (value) => getClientsByName(value, 'SHORT'),
};

export default function SearchObligated({ idRequest, onSetItem, idx }) {
   const { user, actions } = useGlobalContext();
   const [search, setSearch] = useState({ type: 'forName', value: '', ph: 'Buscar por nombre de persona' });
   const [listClients, setListClients] = useState([]);
   const inputSearch = useRef();
   const DropdownData = [
      {
         ph: 'Buscar por número de persona',
         title: 'Número de persona',
         type: 'forNumber',
      },
      {
         ph: 'Buscar por nombre de persona',
         title: 'Nombre de persona',
         type: 'forName',
      },
   ];

   const onChangeState = ({ target }) => {
      let value = search.type == 'forNumber' ? target.value.replace(/\D/g, '') : target.value;
      setSearch({ ...search, value });
   };

   const onModeChange = (obj) => setSearch({ ...search, ...obj, value: '' });

   const onSearchClient = async (e) => {
      try {
         e.preventDefault();
         //* Se valida que no venga vació
         if (_.isEmpty(search.value)) {
            sweetNormal({
               txt: `¡Ingresa un ${search.type == 'forName' ? 'nombre' : 'número'} de cliente!`,
               icon: 'info',
            });
            return;
         }

         //* Se activa la búsqueda de por tipo
         actions.toggleLoading('Buscando Obligado Solidario...');
         const result = await fnActions[search.type](search.value);
         if (result.status !== 200) {
            let txt = `No se encontro ningún cliente con:<br/><b>${search}</b>`;
            if (search.type == 'forName') {
               txt = `No se encontro ningún cliente con:<br/><b>${search.value}</b>`;
               setListClients([]);
            }
            sweetNormal({ txt, icon: 'warning' });
            return;
         }
         search.type === 'forNumber' ? onSelectClient(result.data) : setListClients(result.data);
      } catch (error) {
         console.log('búsqueda de obligados: ', error);
      } finally {
         !_.isEmpty(search.value) && actions.toggleLoading();
         setSearch({ ...search, value: '' });
      }
   };

   const onSelectClient = (data) => {
      const { idClient, businessName, name, email, civilStatus, personType } = data;
      let newObli = {
         fullName: businessName || name,
         idCatTypePerson: TypePerson.SOLIDARY_OBLIGED,
         idClient,
         idRequest,
         mail: setTextLimit(email),
         newObli: true,
         personType,
         userCreate: user?.userAD,
      };

      if (personType.toLowerCase() != 'pm') {
         newObli['maritalStatus'] = civilStatus || 'Soltero';
      }

      onSetItem(newObli, idx);
   };

   return (
      <>
         <form
            ref={inputSearch}
            id={'search_' + idRequest}
            onSubmit={onSearchClient}
            className='relative flex p-1.5 border rounded border-gray-400 hover:ring-1 hover:border-blue-800 hover:ring-blue-800  items-center w-full'>
            <input
               name='search'
               id='search'
               type='search'
               autoComplete='on'
               maxLength={40}
               value={search.value}
               onChange={onChangeState}
               placeholder={search.ph}
               className='w-full h-6 outline-none focus:outline-none focus:ring-blue-800 focus:text-blue-800 focus:border-blue-800'
            />
            <DropdownList key={'dropdown-' + idRequest + '-' + idx} toAction={onModeChange} data={DropdownData}>
               <span className='px-1 border-l-2 border-gray material-symbols-outlined icon-size-20'>
                  arrow_downward
               </span>
            </DropdownList>
         </form>
         {!_.isEmpty(listClients) && (
            <ListSelectClient
               key={'table-' + idRequest + '-' + idx}
               {...{ data: listClients, setData: setListClients, fnAction: onSelectClient }}
            />
         )}
      </>
   );
}

const ListSelectClient = ({ fnAction, data, setData }) => {
   const refDown = useRef(null);

   useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
         document.removeEventListener('touchstart', handleClickOutside);
      };
   }, []);

   const handleClickOutside = (event) => {
      if (refDown.current && !refDown.current.contains(event.target)) {
         setData([]);
      }
   };

   const onHandleClick = (item) => {
      fnAction(item);
      setData([]);
   };

   return (
      <div ref={refDown} className='z-50 text-sm bg-white rounded-md shadow-lg w-96 ring-1 ring-black ring-opacity-5'>
         <TableGeneric {...{ data, onFunc: onHandleClick, typeTable: 'DROP_LIST_CLIENTS', itemsPerPage: 3 }} />
      </div>
   );
};
