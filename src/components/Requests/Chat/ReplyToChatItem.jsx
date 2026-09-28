import React from 'react';
import PropTypes from 'prop-types';

import { AvatarUser } from '../../Controls';
import { datetimeToString, setTextLimit } from '../../../helpers';
import { EnumTypeChats } from '../../../helpers/config';

/**
 * Muestra el chat al cuál se esta respondiendo.
 * @component
 * @param {Object} comment - Información del comentario a responder, se obtiene por medio del id
 * @param {Function} fnAction - Es la función para el icono close que oculta el componente
 * @example
 * const chatFound = chats.find((chat) => chat.id === 1);
 *
 * <ReplyToItem comment={chatFound} fnAction={setActionChat}/>
 * */
export const ReplyToChatItem = ({ comment, fnAction }) => {
   return (
      <div className='text-xs flex gap-2 flex-col relative grow'>
         <button
            role='button'
            title='Cancelar respuesta'
            className='absolute right-0 top-2 hover:bg-[#545555] hover:text-white rounded-3xl select-none h-5 w-5'
            onClick={() => fnAction({ type: EnumTypeChats.SAVE_CHAT, idChatReference: null })}>
            <span className='material-symbols-outlined icon-size-20'>close</span>
         </button>
         <div className='flex gap-4 items-center text-xs'>
            <AvatarUser firstLetters={comment?.firstLetters} color={comment.color} height='h-7' width='w-7' />
            <div className='flex flex-wrap items-center flex-1'>
               <div className='w-full text-sm'>{comment.fullName}</div>
               <div>{datetimeToString(comment.createDate)}</div>
            </div>
         </div>
         <div className='border-l-2 border-yellow-500 ml-3 h-auto pl-3 w-11/12'>
            {setTextLimit(comment?.message, 300) || '- Mensaje no encontrado -'}
            {comment?.message?.length > 300 && '...'}
         </div>
      </div>
   );
};

ReplyToChatItem.propTypes = {
   comment: PropTypes.shape({
      idMessage: PropTypes.number.isRequired,
      messageType: PropTypes.oneOf(['INFORMATION', 'REVISION']).isRequired,
      userAD: PropTypes.string.isRequired,
      firstLetters: PropTypes.string.isRequired,
      color: PropTypes.string,
      fullName: PropTypes.string.isRequired,
      createDate: PropTypes.any,
      message: PropTypes.string.isRequired,
      answers: PropTypes.array,
   }),
   fnAction: PropTypes.func.isRequired,
};
