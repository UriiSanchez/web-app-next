import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import clsx from 'clsx';

import { getChatsForRequest, postChatAndResponse } from '../../../services';
import { ChatItem } from './ChatItem';
import { ReplyToChatItem } from './ReplyToChatItem';
import { ChatComponentSkeleton } from '../../Skeleton';
import { useGlobalContext } from '../../../hooks';
import { getError } from '../../../helpers';
import { EnumStatus, EnumTypeChats, EnumTypeMessage } from '../../../helpers/config';

import icoSend from '../../../../public/icons/ico_send_message.svg';

/**
 * Carga los optionMessages añadidos por los facultados relacionados al ID Request recibido
 * @component
 * @param {number} idRequest - Es el número de referencia de la solicitud
 * @param {number} idStatusRequest - Es el número correspondiente al status de la solicitud
 * @example
 * <ChatComponent idRequest={1} idStatusRequest={26}/>
 * */
export const ChatComponent = ({ idRequest, idStatusRequest }) => {
   const { user, isReloading, actions } = useGlobalContext();
   const [chats, setChats] = useState([]);
   const [optionMessage, setOptionMessage] = React.useState({
      message: '',
      messageType: '',
   });
   const [actionChat, setActionChat] = useState({ type: EnumTypeChats.SAVE_CHAT, idChatReference: null });
   const [isLoading, setIsLoading] = useState(true);
   const isEnabledForStatus = idStatusRequest === EnumStatus.EN_REVISION_FACULTADO;

   useEffect(() => {
      const asyncFetchData = async () => {
         const data = await getChatsForRequest(idRequest);
         setIsLoading(false);
         setActionChat({ type: EnumTypeChats.SAVE_CHAT, idChatReference: null });
         setChats(data);
      };

      asyncFetchData();
   }, [idRequest, isReloading]);

   const onChangeState = ({ target: { name, value } }) => setOptionMessage({ ...optionMessage, [name]: value });

   const onSendMessage = async (form) => {
      try {
         form.preventDefault();
         const cloneState = structuredClone(optionMessage);
         cloneState.userAD = user.userAD;
         cloneState.idRequest = idRequest;
         if (actionChat.type === EnumTypeChats.SAVE_RESPONSE) {
            cloneState.idMessage = actionChat.idChatReference;
            delete cloneState.messageType;
         }

         const result = await postChatAndResponse(cloneState, actionChat.type);
         if (result.status !== 204) {
            getError(result);
            return;
         }

         setOptionMessage({ ...optionMessage, message: '', messageType: '' });
         actions.toggleReloading();
      } catch (e) {
         console.error(e);
      }
   };

   if (isLoading) {
      return <ChatComponentSkeleton />;
   }

   return (
      <div className='flex flex-col w-full gap-2 px-4 py-5 bg-white rounded-xl flex-nowrap'>
         <h1 className='text-xl font-semibold grow-0'>Chat (Cambios y comentarios)</h1>
         <div className='flex flex-col max-h-screen gap-4 pb-4 min-h-96 grow container-overflow'>
            {chats &&
               chats.map((item) => (
                  <ChatItem
                     key={item.idMessage}
                     chat={item}
                     userActive={user?.userAD}
                     fnAnswer={setActionChat}
                     fnReload={actions.toggleReloading}
                     enableModify={isEnabledForStatus}
                  />
               ))}
         </div>
         {isEnabledForStatus && (
            <div
               className={clsx(
                  'bg-[#F2F3F2] p-3 flex flex-col gap-3 rounded-lg transition-all duration-300 ease-in-out grow-0',
                  {
                     'min-h-36': actionChat.type === EnumTypeChats.SAVE_CHAT,
                     'max-h-64': actionChat.type === EnumTypeChats.SAVE_RESPONSE,
                  }
               )}>
               {actionChat.type === EnumTypeChats.SAVE_CHAT && (
                  <div className='flex flex-col gap-2 text-xs'>
                     <p className='col-span-3'>*Tu comentario es para:</p>
                     <div className='flex gap-3'>
                        <label
                           htmlFor='messageType-informative'
                           className={clsx(
                              'flex items-center justify-center gap-1 col-span-1 border-2 px-2 py-0.5 rounded-md border-gray-400 relative group cursor-pointer select-none',
                              {
                                 'bg-gray-400': optionMessage.messageType === EnumTypeMessage.INFORMATION,
                              }
                           )}>
                           <span className='material-symbols-outlined icon-size-20'>sell</span>
                           <input
                              id='messageType-informative'
                              name='messageType'
                              type='radio'
                              value={EnumTypeMessage.INFORMATION}
                              className='hidden'
                              autoComplete='off'
                              checked={optionMessage.messageType === EnumTypeMessage.INFORMATION}
                              onChange={onChangeState}
                           />
                           <span>Informar</span>
                           <div className='absolute z-50 hidden group-hover:block fadeIn duration-300 left-20 top-[-4.7rem] w-56 px-2 py-1 bg-[#545555] rounded-tl-md rounded-r-md text-white text-sm'>
                              Al seleccionar esta estiqueta el comentario que escribas será visible para el resto de los
                              afacultados activos.
                           </div>
                        </label>
                     </div>
                  </div>
               )}
               {actionChat.type === EnumTypeChats.SAVE_RESPONSE && (
                  <ReplyToChatItem
                     comment={chats.find((chat) => chat.idMessage === actionChat.idChatReference)}
                     fnAction={setActionChat}
                  />
               )}
               <div className='relative flex flex-row w-full gap-2 px-4 py-2 mb-3 bg-white border-2 border-black grow-0 rounded-3xl'>
                  <input
                     name='message'
                     maxLength={3000}
                     type='text'
                     value={optionMessage.message || ''}
                     onChange={onChangeState}
                     placeholder='Escribe aquí tus comentarios'
                     className='w-full text-sm outline-none placeholder-slate-400 focus:outline-none focus:border-blue-800 focus:ring-blue-800 focus:text-blue-800 '
                  />
                  <button
                     onClick={onSendMessage}
                     title='Enviar chat'
                     className={clsx('cursor-pointer', {
                        hidden:
                           actionChat.type === EnumTypeChats.SAVE_CHAT && (!optionMessage.message || !optionMessage.messageType),
                     })}
                     type='submit'>
                     <Image src={icoSend} alt='Icono - Enviar comentario' width='22' height='16' />
                  </button>
                  <span className='absolute text-xs right-4 top-10'>{optionMessage.message?.length}/3000</span>
               </div>
            </div>
         )}
      </div>
   );
};

ChatComponent.propTypes = {
   idRequest: PropTypes.number.isRequired,
   idStatusRequest: PropTypes.number.isRequired,
};
