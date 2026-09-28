/*
 * @file
 *
 * @description
 * Mapa de objetos, que permite la configuración dinámica de columnas para el renderizado de tablas dinamicas.
 * Cada objeto debe devolver un arreglo de objetos, donde se definen las columnas, especificando su identificador,
 * label o título, estilos y funcionalidades adicionales.
 *
 * @namespace
 * @property {string} id - Indica el nombre del atributo que se buscará dentro de la respuesta del GET.
 * @property {string} display - Nombre que se mostrará en el thead o título de la columna en la tabla.
 * @property {string} sx - Permite añadir clases CSS de Tailwindcss o de algún otro origen.
 * @property {status|date|folio|substatus|money|notional|expand|goTO|name|chats|detailsGroup} [type] - Permite hacer flexible la construcción o transformación de datos en el método renderCellAndExpand.
 * @property {search|request|history|secretary} [origin] - Se define cuando el type=status y sirve para indentificar la clase y el color.
 * @property {ADC|EMG|FAC|LDC|MRC|SEC|Shared} pathOrigin - Indica la caperta o ruta principal de una pantalla o colección de pantallas.
 * @property {Object} [href] - Se debe emplear cuando type=goTO y dentro de este se deberá añadir un objeto con link y label.
 * @property {string} [href.link] - Permite especificar la ruta de navegación o url de una pantalla.
 * @property {string} [href.label] - Permite customizar el nombre del botón.
 * @property {string} [description] - Permite añadir una mini descripción debajo de display en el thead de la tabla.
 * @property {string} [sxValue] - Permite añadir clases de estilos para datos que no tienen un type definido.
 * @property {boolean} [showOnlyGroup] - Solo se puede emplear cuanto type=expand y deberá ser TRUE para que la funcionalidad expand solo aplica para solicitudes grupales.
 * */
export const tableColums = {
   EMG_SEARCH: [
      { id: 'idClient', display: 'Número de persona', sx: 'col-span-2' },
      { id: 'fullName', display: 'Nombre de persona', sx: 'col-span-3' },
      { id: 'group', display: 'Grupo económico', sx: 'col-span-3' },
      {
         id: 'idCatStatus',
         display: 'Estatus de solicitud',
         sx: 'col-span-2',
         type: 'status',
         origin: 'search',
      },
      { id: '', display: 'Fecha de vigencia de línea actual', sx: 'col-span-2', type: 'date' },
   ],
   EMG_REQUEST: [
      { id: 'idGroup', display: 'N° de Solicitud', sx: 'col-span-2', type: 'folio' },
      { id: 'groupName', display: 'Solicitante o grupo económico', sx: 'col-span-2' },
      { id: 'arrivedAcDate', display: 'Se asignó el:', sx: 'col-span-1', type: 'datetime' },
      { id: 'idCatStatus', display: 'Estatus', sx: 'col-span-1', type: 'status', origin: 'request' },
      { id: 'idCatStatus', display: 'Subestatus', sx: 'col-span-2', type: 'substatus' },
      { id: 'requestAmount', display: 'Monto de línea', sx: 'col-span-1', type: 'money' },
      { id: 'notional', display: 'Nocional', sx: 'col-span-1 flex-col', type: 'notional', description: '(miles usd)' },
      { id: 'idAnalyst', display: 'Analista responsable', sx: 'col-span-1' },
      { id: 'function', display: '', sx: 'col-span-1 expandButton select-none', type: 'expand' },
   ],
   HISTORY: [
      { id: 'idGroup', display: 'N° de Solicitud', sx: 'col-span-2', type: 'folio' },
      { id: 'groupName', display: 'Solicitante o grupo económico', sx: 'col-span-3' },
      { id: 'numApplicantsHistory', display: 'N° de solicitantes', sx: 'col-span-2' },
      { id: 'arrivedSecDate', display: 'Fecha de resolución', sx: 'col-span-2', type: 'datetime' },
      { id: 'idCatStatus', display: 'Estatus', sx: 'col-span-2', type: 'status', origin: 'history' },
      {
         id: 'details',
         display: '',
         sx: 'col-span-1 select-none',
         type: 'goTO',
         href: {
            label: 'Visualizar',
            link: '/Shared/History/',
         },
      },
   ],
   DROP_LIST_CLIENTS: [
      { id: 'idClient', display: 'Número de persona', sx: 'col-span-5 text-xs' },
      { id: 'name', display: 'Nombre de persona', sx: 'col-span-5 text-xs', type: 'name' },
   ],
   MRC: [
      { id: 'idGroup', display: 'Número de solicitud', sx: 'col-span-1', type: 'folio' },
      { id: 'groupName', display: 'Solicitante o grupo económico', sx: 'col-span-2' },
      { id: 'arrivedMrDate', display: 'Llegó la solicitud', sx: 'col-span-1', type: 'datetime' },
      { id: 'idCatStatus', display: 'Estatus', sx: 'col-span-1', type: 'status', origin: 'request' },
      { id: 'idCatStatus', display: 'Subestatus', sx: 'col-span-2', type: 'substatus' },
      { id: 'requestAmount', display: 'Monto de línea', sx: 'col-span-1 text-blue-800', type: 'money' },
      { id: 'nameEmg', display: 'Especialista Responsable', sx: 'col-span-2' },
      { id: 'branchOffice', display: 'Sucursal', sx: 'col-span-1' },
      { id: 'function', display: '', sx: 'col-span-1 expandButton select-none', type: 'expand' },
   ],
   ADC: [
      { id: 'idGroup', display: 'N° de Solicitud', sx: 'col-span-1', type: 'folio' },
      { id: 'groupName', display: 'Solicitante o grupo económico', sx: 'col-span-2' },
      { id: 'arrivedAcDate', display: 'Se asignó el:', sx: 'col-span-1', type: 'datetime' },
      { id: 'idCatStatus', display: 'Estatus', sx: 'col-span-1', type: 'status', origin: 'request' },
      { id: 'idCatStatus', display: 'Subestatus', sx: 'col-span-2', type: 'substatus' },
      { id: 'requestAmount', display: 'Monto de línea', sx: 'col-span-1', type: 'money' },
      { id: 'notional', display: 'Nocional', sx: 'col-span-1', type: 'notional', description: '(miles usd)' },
      { id: 'nameEmg', display: 'Especialista responsable', sx: 'col-span-1' },
      { id: 'branchOffice', display: 'Sucursal', sx: 'col-span-1' },
      { id: 'function', display: '', sx: 'col-span-1 expandButton select-none', type: 'expand' },
   ],
   SEC: [
      { id: 'idGroup', display: 'N° de Solicitud', sx: '', type: 'folio' },
      { id: 'arrivedSecDate', display: 'LLegada de solicitud', sx: '', type: 'datetime' },
      { id: 'groupName', display: 'Solicitante', sx: '' },
      {
         id: 'numApplicants',
         display: '',
         sx: '',
         sxValue: 'bg-opacity-50 bg-[#B6A269] px-2.5 py-1 rounded',
      },
      { id: 'requestAmount', display: 'Monto de línea', sx: '', type: 'money' },
      { id: 'kindGroupProcedure', display: 'Trámite', sx: '' },
      {
         id: 'instanceEmpowered',
         display: 'Instancia Facultada',
         sx: 'relative group',
         sxValue: 'text-[#458CFA]',
         tooltip: {
            text: 'facultades mancomunadas',
            sxTool:
               'left-20 2xl:left-28 top-px w-56 px-2 py-1 bg-[#545555] rounded-tl-md rounded-r-md text-white text-sm',
         },
      },
      { id: 'status', display: 'Sub estatus', sx: '' },
      { id: 'idCatStatus', display: 'Estatus', sx: '', type: 'status', origin: 'empowered' },
      { id: 'function', display: '', sx: 'select-none w-14', type: 'expand', showOnlyGroup: true },
   ],
   FAC: [
      { id: 'idGroup', display: 'N° de Solicitud', sx: '', type: 'folio' },
      { id: 'arrivedFcDate', display: 'LLegada de solicitud', sx: '', type: 'datetime' },
      { id: 'groupName', display: 'Solicitante', sx: '' },
      {
         id: 'numApplicants',
         display: '',
         sx: '',
         sxValue: 'bg-opacity-50 bg-[#B6A269] px-2.5 py-1 rounded',
      },
      { id: 'approvedAmount', display: 'Monto de línea', sx: '', type: 'money' },
      { id: 'kindGroupProcedure', display: 'Trámite', sx: '' },
      {
         id: 'instanceEmpowered',
         display: 'Instancia Facultada',
         sx: 'relative group',
         sxValue: 'text-[#458CFA]',
         tooltip: {
            text: 'facultades mancomunadas',
            sxTool:
               'left-20 2xl:left-32 top-px w-56 px-2 py-1 bg-[#545555] rounded-tl-md rounded-r-md text-white text-sm',
         },
      },
      { id: 'status', display: 'Sub estatus', sx: '' },
      { id: 'idCatStatus', display: 'Estatus', sx: '', type: 'status', origin: 'empowered' },
      { id: 'function', display: '', sx: 'select-none w-14', type: 'expand', showOnlyGroup: true },
   ],
   FAC_HISTORY: [
      { id: 'idGroup', display: 'N° de Solicitud', sx: '', type: 'folio' },
      { id: 'arrivedFcDate', display: 'LLegada de solicitud', sx: '', type: 'datetime' },
      { id: 'groupName', display: 'Solicitante', sx: '' },
      {
         id: 'numApplicants',
         display: '',
         sx: '',
         sxValue: 'bg-opacity-50 bg-[#B6A269] px-2.5 py-1 rounded',
      },
      { id: 'requestAmount', display: 'Monto de línea', sx: '', type: 'money' },
      { id: 'kindGroupProcedure', display: 'Trámite', sx: '' },
      {
         id: 'instanceEmpowered',
         display: 'Instancia Facultada',
         sx: 'relative group',
         sxValue: 'text-[#458CFA]',
         tooltip: {
            text: 'facultades mancomunadas',
            sxTool:
               'left-24 2xl:left-32 top-px w-56 px-2 py-1 bg-[#545555] rounded-tl-md rounded-r-md text-white text-sm',
         },
      },
      { id: 'idCatStatus', display: 'Estatus', sx: '', type: 'status', origin: 'empowered' },
      {
         id: 'messages',
         display: 'Comentarios',
         sx: '',
         type: 'chats',
         pathOrigin: 'FAC',
      },
      { id: 'function', display: '', sx: 'select-none w-14', type: 'expand' },
   ],
   SEC_HISTORY: [
      { id: 'idGroup', display: 'N° de solicitud', sx: '', type: 'folio' },
      { id: 'arrivedSecDate', display: 'LLegada de solicitud', sx: '', type: 'datetime' },
      { id: 'groupName', display: 'Solicitante', sx: '' },
      {
         id: 'numApplicants',
         display: '',
         sx: '',
         sxValue: 'bg-opacity-50 bg-[#B6A269] px-2.5 py-1 rounded',
      },
      { id: 'requestAmount', display: 'Monto de línea', sx: '', type: 'money' },
      { id: 'kindGroupProcedure', display: 'Trámite', sx: '' },
      {
         id: 'instanceEmpowered',
         display: 'Instancia Facultada',
         sx: 'relative group',
         sxValue: 'text-[#458CFA]',
         tooltip: {
            text: 'facultades mancomunadas',
            sxTool: 'left-20 2xl:left-28 top-px w-56 px-2 py-1 bg-[#545555] rounded-tl-md rounded-r-md text-white ',
         },
      },
      { id: 'branchOffice', display: 'Sucursal', sx: 'w-28' },
      { id: 'idCatStatus', display: 'Estatus', sx: '', type: 'status', origin: 'secretary' },
      { id: 'messages', display: 'Comentarios', sx: '' },
      { id: 'details', display: 'Detalles', sx: '', type: 'detailsGroup' },
      { id: 'function', display: '', sx: 'select-none w-14', type: 'expand' },
   ],
   ALL_TRACKING: {
      cells: [
         {
            id: 'idGroup',
            display: 'Solicitud',
            sxContainer: 'w-[300px] 2xl:max-w-[400px]',
            sxChild: 'justify-start px-8',
            sort: true,
         },
         {
            id: 'requestPerGroup',
            display: '',
            sxContainer: 'w-[35px]',
            sxChild: '',
            sort: true,
         },
         {
            id: 'branchOffice',
            display: 'Sucursal',
            sxContainer: 'w-[100px]',
            sort: true,
         },
         {
            id: 'arrivedMrDate',
            display: 'Inicio de revisión',
            sxContainer: 'w-[100px] 2xl:w-[130px]',
            tooltip: {
               text: 'Envió a mesa receptora',
               sxTooltip:
                  'left-16 2xl:left-28 -top-1 2xl:top-1 w-44 px-2 py-1 bg-[#545555] rounded-tl-md rounded-r-md text-white text-xs shadow-lg',
            },
            sort: true,
         },
         {
            id: 'quorumReachedDate',
            display: 'Autorización',
            sxContainer: 'w-[100px] max-w-[130px]',
            sort: true,
         },
         {
            id: 'requestAmount',
            display: 'Monto de línea',
            sxContainer: '',
            sort: true,
         },
         {
            id: 'authorizationAmount',
            display: 'Monto autorizado',
            sxContainer: '',
            sort: true,
         },
         {
            id: 'kindGroupProcedure',
            display: 'Trámite',
            sxContainer: '',
            sort: true,
         },
         {
            id: 'substatus',
            display: 'Subestatus',
            sxContainer: 'max-w-[200px]',
            sort: true,
         },
         {
            id: 'statusName',
            display: 'Estatus',
            sxContainer: '',
            sort: true,
         },
         {
            id: 'totalTime',
            display: 'Tiempo total',
            sxContainer: '',
            sort: true,
         },
         {
            id: 'function',
            display: '',
            sxContainer: 'w-10',
            sort: false,
         },
      ],
      rows: [
         {
            id: 'idGroup',
            sxContainer: 'w-300 2xl:max-w-[400px]',
            sxValue: '',
            type: 'allData',
         },
         {
            id: 'requestPerGroup',
            sxContainer: 'w-[35px]',
            sxValue: 'bg-opacity-80 bg-[#B6A269] text-white px-2.5 py-1 rounded',
         },
         { id: 'branchOffice', sxContainer: 'w-[100px]' },
         { id: 'arrivedMrDate', sxContainer: 'w-[100px] max-w-[130px]', type: 'datetime' },
         { id: 'quorumReachedDate', sxContainer: 'w-[100px] max-w-[130px]', type: 'datetime' },
         { id: 'requestAmount', sxContainer: '', type: 'money' },
         { id: 'authorizationAmount', sxContainer: '', type: 'money' },
         { id: 'kindGroupProcedure', sxContainer: '' },
         { id: 'substatus', sxContainer: 'max-w-[200px]' },
         { id: 'statusName', sxContainer: '', type: 'status', origin: 'tracking' },
         { id: 'totalTime', sxContainer: '' },
         { id: 'function', sxContainer: 'select-none w-14', type: 'expand', sxValue: '-rotate-90' },
      ],
   },
};
