import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import clsx from 'clsx';

import { postChatAndResponse } from '../../../services';
import { AvatarUser } from '../../Controls';
import { datetimeToString, getError, templateSweetAlert, sweetQuestionAction, sweetSnackbar } from '../../../helpers';
import { EnumTypeChats } from '../../../helpers/config';

import icoAnswers from '../../../../public/icons/ico_answers.svg';

const settingTypeComment = {
   INFORMATION: {
      label: 'Informativo',
      color: 'bg-yellow-500',
   },
};

/**
 * Genera una card con la información requerida para cada chat del arreglo principal.
 * @component
 * @param {Array} chat - Arreglo de chats acorde a la request.
 * @param {string} userActive - Es el user del usuario en sesión.
 * @param {Function} fnAnswer - Función que habilita la respuesta de un chat.
 * @param {Function} fnReload - Función que indica por medio del Global Context que se deben recargar los chats.
 * @param {boolean} enableModify - Es el valor que nos indica si se pueden agregar o eliminar los chats.
 * */
export const ChatItem = ({ chat, userActive, fnAnswer, fnReload, enableModify }) => {
   const [toggle, setToogle] = useState(false);
   const messageType = settingTypeComment[chat.messageType];
   const isTheChatFromTheOnlineUser = userActive === chat.userAD;

   const onDeleteMessage = async (idMessage, typeMessage) => {
      try {
         const result = await postChatAndResponse({ idMessage, userAD: userActive }, typeMessage);
         if (result.status !== 204) {
            getError(result);
            return;
         }

         if (chat?.messageResponse?.length === 1) {
            setToogle(false);
         }

         if (typeMessage === EnumTypeChats.DELETE_RESPONSE) {
            sweetSnackbar({ html: '¡Comentario eliminado!', type: 'confirm' });
         }

         fnReload();
      } catch (e) {
         console.error(e);
      }
   };

   return (
      <div
         className={clsx('flex flex-col gap-3 pl-6 pr-3 py-3', {
            'bg-[#F2F3F2] rounded-tl-xl rounded-r-xl': !isTheChatFromTheOnlineUser,
            'bg-[#545555] rounded-tr-xl rounded-l-xl  text-white': isTheChatFromTheOnlineUser,
         })}>
         <div className='flex items-center justify-between'>
            <span className={`px-3 py-1 rounded-2xl text-center text-white text-xs ${messageType.color}`}>
               {messageType.label}
            </span>
            {isTheChatFromTheOnlineUser && enableModify && (
               <button
                  onClick={() =>
                     sweetQuestionAction({
                        html: templateSweetAlert['DELETE_CHAT'](),
                        fnAction: () => onDeleteMessage(chat.idMessage, EnumTypeChats.DELETE_CHAT),
                     })
                  }
                  role='button'
                  title='Eliminar comentario'
                  className='flex hover:bg-[#D9D9D9] hover:text-black-900 rounded-3xl select-none h-6 w-6 items-center justify-center'>
                  <span className='cursor-pointer material-symbols-outlined thin'>delete</span>
               </button>
            )}
         </div>
         <div className='flex items-center gap-4'>
            <AvatarUser firstLetters={chat.firstLetters} color={chat?.color} />
            <div className='flex flex-wrap items-center flex-1 text-sm'>
               <div className='w-full'>{chat.fullName}</div>
               <div className='text-xs'>{datetimeToString(chat.createDate)}</div>
            </div>
         </div>
         <div className='h-auto text-sm'>{chat.message}</div>
         <div className='flex items-center justify-between text-xs'>
            {enableModify && (
               <button
                  className='text-blue-500'
                  onClick={() => fnAnswer({ type: EnumTypeChats.SAVE_RESPONSE, idChatReference: chat.idMessage })}>
                  Responder
               </button>
            )}
            {!_.isEmpty(chat.messageResponse) && (
               <button onClick={() => setToogle(true)} className='flex items-center justify-center gap-1 group'>
                  <Image
                     src={icoAnswers}
                     alt='Respuestas de facultados'
                     className={isTheChatFromTheOnlineUser ? '' : 'invert'}
                  />
                  <span className='w-full group-hover:underline'>
                     {chat?.messageResponse.length} Respuesta{chat?.messageResponse.length > 1 && 's'}
                  </span>
               </button>
            )}
         </div>
         {toggle && (
            <div className='flex flex-col gap-3 transition-all duration-300 ease-in-out'>
               <hr />
               <div className='flex justify-between'>
                  <h2 className='text-sm'>Respuestas</h2>
                  <button
                     onClick={() => setToogle(false)}
                     role='button'
                     title='Cerrar respuestas'
                     className='hover:bg-[#D9D9D9] hover:text-black-900 rounded-3xl select-none h-5 w-5'>
                     <span className='material-symbols-outlined icon-size-20'>close</span>
                  </button>
               </div>
               {chat?.messageResponse.map((answer) => {
                  return (
                     <div key={answer.idMessageResp} className='flex flex-col gap-3 mb-2'>
                        <div className='flex items-center gap-4 text-xs'>
                           <AvatarUser
                              firstLetters={answer.firstLetters}
                              height='h-7'
                              width='w-7'
                              color={answer.color}
                           />
                           <div className='flex flex-wrap items-center flex-1'>
                              <div className='w-full text-sm'>{answer.fullName}</div>
                              <div>{datetimeToString(answer.createDate)}</div>
                           </div>
                           {userActive === answer.userAD && enableModify && (
                              <button
                                 onClick={() => onDeleteMessage(answer.idMessageResp, EnumTypeChats.DELETE_RESPONSE)}
                                 role='button'
                                 title='Eliminar comentario'
                                 className='flex hover:bg-[#D9D9D9] hover:text-black-900 rounded-3xl select-none h-6 w-6 items-center justify-center'>
                                 <span className='cursor-pointer material-symbols-outlined thin'>delete</span>
                              </button>
                           )}
                        </div>
                        <div className='w-11/12 h-auto pl-3 ml-3 text-xs border-l-2 border-yellow-500'>
                           {answer.message}
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
};

ChatItem.propTypes = {
   chat: PropTypes.shape({
      idMessage: PropTypes.number.isRequired,
      messageType: PropTypes.oneOf(['INFORMATION', 'REVISION']).isRequired,
      userAD: PropTypes.string.isRequired,
      firstLetters: PropTypes.string.isRequired,
      color: PropTypes.string,
      fullName: PropTypes.string.isRequired,
      createDate: PropTypes.any,
      message: PropTypes.string.isRequired,
      messageResponse: PropTypes.array,
   }),
   userActive: PropTypes.string.isRequired,
   fnAnswer: PropTypes.func.isRequired,
   fnReload: PropTypes.func.isRequired,
   enableModify: PropTypes.bool.isRequired,
};
