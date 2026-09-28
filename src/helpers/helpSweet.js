import Swal from 'sweetalert2';
import _ from 'lodash';

import { constSnackbarColors as snackbarColors } from './config';
import { formatId } from './helpFormats';

const colorConfirm = '#222222';

/**
 * Muestra una alerta de SweetAlert condicional que permite al usuario elegir Confirmar o Cancelar,
 * al pulsar Confirmar se ejecutará una acción o función, al pulsar Cancelar solo se cierra.
 * @param {Object} params - Debe pasarse un objeto como parametro principal.
 * @param {string} [params.html='NOT FOUND ATTRIBUTE HTML'] - Es un string que puede contener código HTML o texto plano.
 * @param {Function} params.fnAction - Función que se ejecutará cuando el usuario pulse Confirmar.
 *
 * @example Contenido HTML
 * sweetQuestionAction({
 *    html: `<p> Prueba con html <br/> ¿Estás seguro de continuar?</p>`,
 *    fnAction: () ≥ alert('Seleccionaste continuar')
 * }
 *
 * @example Texto plano
 * sweetQuestionAction({
 *    html: 'Esto solo es una prueba de desarrollo',
 *    fnAction: () ≥ console.log('¡¡texto plano!!')
 * }
 * */
export const sweetQuestionAction = ({ html = 'NOT FOUND ATTRIBUTE HTML', fnAction }) => {
   Swal.fire({
      html,
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
         confirmButton: 'btn-accept-swal',
         cancelButton: 'btn-cancel-swal',
      },
   }).then((result) => {
      if (result.isConfirmed) {
         fnAction();
      }
   });
};

export const sweetCustomAlert = (options) =>
   Swal.fire({
      confirmButtonText: 'Ok',
      customClass: {
         confirmButton: 'btn-accept-swal',
      },
      ...options,
   });

export const sweetConditional = (propertys) => {
   const {
      title,
      text,
      onFunc,
      accept = 'Sí, continuar',
      cancel = 'No, regresar',
      icon = 'question',
      confirmButtonColor = '#F7AC20',
      cancelButtonColor = '#6E7881',
   } = propertys;
   Swal.fire({
      allowOutsideClick: false,
      cancelButtonColor,
      cancelButtonText: cancel,
      confirmButtonColor,
      confirmButtonText: accept,
      html: text,
      icon: icon || 'question',
      showCancelButton: true,
      title,
   }).then((result) => {
      if (result.isConfirmed) {
         onFunc();
      }
   });
};

export const sweetConfirmation = ({ html, timer = 1000, allowOutsideClick = false, width = 350 }) => {
   Swal.fire({
      allowOutsideClick,
      html,
      showConfirmButton: false,
      timer,
      width,
   });
};

export const sweetModalRedirect = ({ title, html = 'Te redirigiremos en <b></b> milliseconds.', timer = 2000 }) => {
   let timerInterval;
   Swal.fire({
      icon: 'success',
      title,
      html,
      timer,
      timerProgressBar: true,
      didOpen: () => {
         Swal.showLoading();
         const b = Swal.getHtmlContainer().querySelector('b');
         timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft();
         }, 100);
      },
      willClose: () => {
         clearInterval(timerInterval);
      },
   });
};

export const sweetNormal = ({ title = '', txt = '', icon = '' }) => {
   Swal.fire({
      title,
      html: txt,
      confirmButtonColor: colorConfirm,
      confirmButtonText: 'Aceptar',
      icon,
   });
};

export const sweetSnackbar = ({ html = '', type = 'confirm', timer = 1500 }) => {
   let background = snackbarColors[type] || '#064bb5';

   Swal.fire({
      background,
      html,
      color: '#fff',
      customClass: {
         closeButton: `close-snackbar-${type}`,
      },
      padding: '0.5em',
      position: 'bottom-end',
      showCloseButton: true,
      showConfirmButton: false,
      closeButtonHtml: `<span class="material-symbols-outlined icon-size-20">close</span>`,
      timer,
      timerProgressBar: true,
      toast: true,
      width: 420,
      didOpen: (toast) => {
         toast.addEventListener('mouseenter', Swal.stopTimer);
         toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
   });
};

export const sweetToast = Swal.mixin({
   toast: true,
   position: 'bottom-end',
   showConfirmButton: false,
   timer: 3000,
   timerProgressBar: true,
   didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
   },
});

/**
 * Genera un listado de secciones incompletas del PCD en formato HTML, dependiendo del estado de cada sección
 * retorna una cadena de elementos de lista para indicar cuáles faltan por completar
 * @param {Object} sections - Objeto con el estado de cada sección
 * @param {String} typeCalculator - Tipo de calculadora seleccionada en el perfil de cobertura
 * @returns {String} - Lista de las secciones incompletas
 */
const incompleteSections = (sections, typeCalculator) => {
   let showSections = '';
   if (!sections.coverageProfile.isCompleted)
      showSections += `<li class='text-left text-sm'>
               <b>Sección 1: </b> Perfil de Cobertura
            </li>`;
   if (typeCalculator === 'rate' ? !sections.calculatorRate.isCompleted : !sections.calculatorRateExchange.isCompleted)
      showSections += `<li class='text-left text-sm'>
               <b>Sección 2: </b> Calculadora de Parámetros de Operación
            </li>`;
   if (!sections.profileResume.isCompleted)
      showSections += `<li class='text-left text-sm'>
            <b>Sección 3: </b> Perfil del Cliente
         </li>`;

   return showSections;
};

/**
 * Genera un párrafo por cada uno de los clientes que han cambiado sus documentos financieros
 * @param {String[]} clientList - Lista de nombres de clientes que han cambiado sus documentos financieros
 * @returns {JSX.Element} - Elemento JSX que contiene el listado de parrafos con los nombres de los clientes que cambiaron
 */
const clientsChanged = (clientList) => {
   let nameList = '';
   if (!_.isEmpty(clientList)) {
      clientList.forEach((c) => {
         nameList += `<p>${c} </p>`;
      });
   }

   return nameList;
};

const iconInformation = (color = '#1C1D1C') => `<div class='flex items-center justify-center'>
   <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none'>
      <path
         fill-rule='evenodd'
         clip-rule='evenodd'
         d='M24 7.5C19.6239 7.5 15.4271 9.23839 12.3327 12.3327C9.23839 15.4271 7.5 19.6239 7.5 24C7.5 26.1668 7.92678 28.3124 8.75599 30.3143C9.58519 32.3161 10.8006 34.1351 12.3327 35.6673C13.8649 37.1994 15.6839 38.4148 17.6857 39.244C19.6876 40.0732 21.8332 40.5 24 40.5C26.1668 40.5 28.3124 40.0732 30.3143 39.244C32.3161 38.4148 34.1351 37.1994 35.6673 35.6673C37.1994 34.1351 38.4148 32.3161 39.244 30.3143C40.0732 28.3124 40.5 26.1668 40.5 24C40.5 19.6239 38.7616 15.4271 35.6673 12.3327C32.5729 9.23839 28.3761 7.5 24 7.5ZM10.2114 10.2114C13.8684 6.55446 18.8283 4.5 24 4.5C29.1717 4.5 34.1316 6.55446 37.7886 10.2114C41.4455 13.8684 43.5 18.8283 43.5 24C43.5 26.5608 42.9956 29.0965 42.0157 31.4623C41.0357 33.8282 39.5993 35.9778 37.7886 37.7886C35.9778 39.5993 33.8282 41.0357 31.4623 42.0157C29.0965 42.9956 26.5608 43.5 24 43.5C21.4392 43.5 18.9035 42.9956 16.5377 42.0157C14.1718 41.0357 12.0222 39.5993 10.2114 37.7886C8.40068 35.9778 6.96432 33.8282 5.98435 31.4623C5.00438 29.0965 4.5 26.5608 4.5 24C4.5 18.8283 6.55446 13.8684 10.2114 10.2114ZM22.5 16.5C22.5 15.6716 23.1716 15 24 15H24.016C24.8444 15 25.516 15.6716 25.516 16.5V16.516C25.516 17.3444 24.8444 18.016 24.016 18.016H24C23.1716 18.016 22.5 17.3444 22.5 16.516V16.5ZM21.9192 21.1144C22.4302 20.8609 23.0029 20.7583 23.5703 20.8188C24.1404 20.8795 24.6812 21.1024 25.1286 21.461C25.576 21.8196 25.9113 22.2989 26.0947 22.8421C26.2781 23.3853 26.3021 23.9697 26.1636 24.5261L24.7473 30.1993L24.8162 30.1649C25.5535 29.7873 26.4574 30.0789 26.8351 30.8162C27.2127 31.5535 26.9211 32.4574 26.1838 32.8351L26.089 32.8836C25.5757 33.1403 24.9996 33.2444 24.4289 33.1835C23.8583 33.1226 23.3171 32.8994 22.8695 32.5402C22.4219 32.1811 22.0867 31.7011 21.9037 31.1572C21.7208 30.6136 21.6976 30.029 21.8367 29.4727L23.2524 23.8019L23.2397 23.8082L23.1576 23.8481C22.4131 24.2114 21.5151 23.9022 21.1519 23.1576C20.7886 22.4131 21.0978 21.5151 21.8424 21.1519L21.9192 21.1144Z'
         fill='${color}'
      />
   </svg>
</div>`;

/**
 * Plantillas predefinidas para mostrar contenido en SweetAlert2
 * Cada método devuelve un fragmento JSX para renderizar dentro de la alerta
 */
export const templateSweetAlert = {
   DELETE_CHAT: () => {
      return `<div class='flex flex-col gap-4'>
         ${iconInformation('#FE8083')}
         <h1 class="font-bold"> Estas apunto de eliminar tu comentario</h1>
         <p class="text-left text-sm text-center">
            Al eliminar el comentario se borrarán todas las respuetas del mismo, ¿estas seguro de realizar la acción?
         </p>
      </div>`;
   },
   COMPLETE_AUTHORIZATION: (idRequest) => {
      return `<div class='flex flex-col gap-4'>
         ${iconInformation()}
         <h1 class="font-bold">¡Solicitud completada con éxito!</h1>
         <p class="text-left text-sm text-center">
            ¡La solicitud nº <b>${formatId(idRequest, 8)}</b> ha sido completada con éxito!
            <br />¡Buen trabajo!
         </p>
      </div>`;
   },
   CHANGES_NOT_SAVE_COVER: () => {
      return `<div class='flex flex-col gap-4'>
         ${iconInformation('#FE8083')}
         <h1 class="font-bold"> ¿Deseas regresar sin guardar?</h1>
         <p class="text-left text-sm text-center">
            Los cambios, en la carátula no se han guardado.<br/>
            Si continúas, tus cambios se perderán.
         </p>
      </div>`;
   },
   REQUEST_AUTHORIZATION: () => {
      return `<div class='flex flex-col gap-4'>
         ${iconInformation()}
         <h1 class="font-bold">¡Bien hecho!</h1>
         <p class="text-left text-sm text-center">
           Tu revisión nos acerca un paso más al cierre de esta solicitud! ¡Gracias por tu agilidad y dedicación!
            <br />
            <br /> Recuerda que, mientras los demás usuarios aún no hayan firmado, puedes cambiar tu decisión de
            autorizar o rechazar según lo consideres necesario.
         </p>
      </div>`;
   },
   REQUEST_REJECTED: () => {
      return `<div class='flex flex-col gap-4'>
         ${iconInformation()}
         <h1 class="font-bold">Atención: Eres el último de tu área</h1>
         <p class="text-left text-sm text-center">
            Los demás facultados ya han rechazado esta solicitud. ¿Estás seguro de que deseas rechazar?
            <strong>Esta acción cerrará la solicitud definitivamente.</strong>
         </p>
      </div>`;
   },
   MODAL_DETAILS_HISTORY_SEC: (item) => {
      return `<div class="text-left">
         <h1 class="text-black-900 text-xl mb-2">${item?.groupName || 'No definido'}</h1><hr/>
         <div class="grid grid-cols-4 gap-4 mt-4 text-sm px-4">
            <div class="col-span-3 font-bold">Responsable</div>
            <div class="col-span-1 font-bold">Rol</div>
            <div class="col-span-3">${item?.nameAnalyst || 'No definido'}</div>
            <div class="col-span-1">Analista</div>
            <div class="col-span-3">${item?.nameEmg || 'No definido'}</div>
            <div class="col-span-1">Especialista</div>
         </div>
      </div>`;
   },
   COMPLETED_STAMPED: (idRequest) => {
      return `<div class='flex flex-col gap-4'>
         ${iconInformation()}
         <h1 class="font-bold">¡Solicitud completada con éxito!</h1>
         <p class="text-left text-sm text-center">
            La solicitud nº <b>${formatId(idRequest, 8)}</b> cerrada.
            <br />Guardando datos en OnBase. ¡Buen trabajo!
         </p>
      </div>`;
   },
   PROGRESS_STAMPED: (count, total, porcentage) => {
      const radio = 70;
      const circ = 2 * Math.PI * radio;
      const strokePct = ((100 - porcentage) * circ) / 100;
      return `<div class="flex flex-col gap-4">
         <div class="flex items-center justify-center">
            <svg width="200" height="200">
               <g transform="rotate(90 100 100) scale(-1 1) translate(-200 0)">
                  <circle r="70" cx="100" cy="100" fill="transparent" stroke="#717271" stroke-opacity="0.75" stroke-width="16" stroke-dasharray="${circ}" stroke-dashoffset="0" stroke-linecap="round"/>
                  <circle r="70" cx="100" cy="100" fill="transparent" stroke="#F5A800" stroke-width="1rem" stroke-dasharray="${circ}" stroke-dashoffset="${strokePct}" stroke-linecap="round"/>
               </g>
               <text x="50%" y="50%"
               dominant-baseline="central"
               text-anchor="middle"
               font-weight="bold"
               fill="#383D54"
               font-size="28px"> ${count}/${total}</text>
           </svg>
         </div>
         <h1 class="font-bold">¡Vas por buen camino!</h1>
         <p class="text-left text-sm text-center">
            ¿Listo para seguir? Continuemos con la próxima.
         </p>
      </div>`;
   },
   HAVE_INFO_PCD: () => {
      return `<div class='flex flex-col gap-4 mt-4'>
         ${iconInformation()}
         <h1 class="font-bold"> Información previa encontrada</h1>
         <p class="text-left text-sm text-left">
            Este solicitante ya cuenta con información registrada de una solicitud anterior.<br/>
            Puedes usarla para no empezar desde cero. ¿Quieres utilizarla para pre-llenar el formulario?
         </p>
      </div>`;
   },
   INCOMPLETE_PCD: (sections, typeCalculator) => {
      return `<div class='flex flex-col gap-4 mt-4'>
         ${iconInformation()}
         <h1 class="font-bold"> Información incompleta</h1>
         <p class="text-left text-sm">
            Tienes información obligatoria por completar en:<br/>
         </p>
         <div class='flex flex-col gap-2'>
         ${incompleteSections(sections, typeCalculator)}
         </div>
      </div>`;
   },
   CHANGE_FINANCIAL: (clientList) => {
      return `<div class='flex flex-col mx-8 mt-5'>
         ${iconInformation()}
         <div class='w-full h-full gap-x-4 mt-5'>
            <h1 class="font-semibold text-base">Se detectó una actualización de la información financiera</h1>
            <p class="text-left text-sm pt-3">
               Como consecuencia, la información previamente capturada en el balance general y estado de resultados fue eliminada<br/><br/>
               Se deben actualizar la información faltante y generar nuevamente el resultado del modelo<br/>
            </p>
            <p class="text-left text-sm font-semibold pt-3 pb-2.5">
            Estas actualizaciones no fueron validadas por mesa receptora
            </p>
            <div class='flex flex-col w-full max-h-28 text-base text-left border-t-2 border-b-2 border-black-light py-2 '>
               <div class='flex flex-col w-full h-full overflow-y-auto font-normal text-sm gap-y-3 custom-scrollbar'>
            ${clientsChanged(clientList)}
               </div>
            </div>
         </div>
      </div>`;
   },
   NO_ASSIGNED_LEADER: () => {
      return `<h2 class="text-3xl font-semibold my-4">¡No eres el Líder de esta Solicitud!</h2>
               <p class="text-base mb-2">Solo puede <b>acceder</b> a la solicitud el <b>Líder asignado</b>.</p>
               <p class="text-gray font-bold">Te redireccionaremos a la pantalla solicitudes...</p>`;
   },
};
