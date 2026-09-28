import React from 'react';

export const CoverFormatSkeleton = () => {
   return (
      <div className='px-8 text-sm '>
         <div className='bg-[#F4F4F4] px-12 pt-4 pb-2 flex flex-col gap-3'>
            <h2 className='text-xl font-semibold text-[#545555]'>
               Información para caratula de autorización de crédito
            </h2>
            <h4 className='mb-4 text-sm text-[#707271]'>Grupo Financiero BASE S.A. de C.V. </h4>
         </div>
         <h4 className='flex flex-row justify-end pr-2 text-sm mt-2'>CIFRAS EN MILES</h4>
         <div className='flex items-center justify-between mb-4'>
            <div className='flex gap-2'>
               <input id='checkBase' name='checkBase' type='checkbox'  className='option-input top-[0!important]' disabled readOnly />
               <p>Banco BASE, SA, IBM</p>
            </div>
            <div className='flex gap-2'>
               <input id='checkLessor' name='checkLessor' disabled readOnly type='checkbox'  className='option-input top-[0!important]'/>
               <p>Arrendadora BASE, SA de CV SOFOM ER</p>
            </div>
            <div className='flex items-center gap-2'>
               <p className="after:content-['*'] after:ml-0.5 after:text-red-500">Crédito relacionado Art. 73</p>
               <div className='h-8 ml-2 border rounded outline-none w-36 border-black-500 box'></div>
            </div>
            <div className='flex items-center gap-6'>
               <p>Tipo de cambio</p>
               <div className='w-32 h-8 ml-2 text-center border rounded border-gray box'></div>
            </div>
         </div>
         <div className='mb-4 border rounded-md overflow-clip border-gray'>
            <h4 className='flex items-center h-8 px-4 text-white bg-black'>Datos generales</h4>
            <div className='grid grid-cols-3 gap-2 p-2'>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>Solicitante</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>Número de cliente</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>Domicilio</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>Grupo económico</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>Antigüedad</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>Ciudad</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>R.F.C</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>Sucursal</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
               <div className='flex items-center justify-end '>
                  <p className='pr-2 whitespace-nowrap'>Estado</p>
                  <div className='w-8/12 h-8 p-2 border rounded pointer-events-none border-gray undefined box'></div>
               </div>
            </div>
         </div>
         <div className='mb-4 border rounded-md overflow-clip border-gray'>
            <div className='flex items-center justify-between h-8 px-4 text-white bg-black'>
               <h4>Fecha de presentación</h4>
            </div>
            <div className='flex gap-10 p-2'>
               <div className='flex items-center '>
                  <p className='pr-2 whitespace-nowrap'>Fecha de solicitud</p>

                  <div className='w-32 h-8 p-2 text-center border rounded pointer-events-none box border-gray'></div>
               </div>
               <div className='flex items-center w-full'>
                  <p className='pr-2 whitespace-nowrap'>Analista</p>

                  <div className='w-full h-8 p-2 border rounded pointer-events-none box border-gray'></div>
               </div>
               <div className='flex items-center'>
                  <p className=' whitespace-nowrap'>Dirección comercial</p>
                  <div className='h-8 ml-2 border rounded outline-none w-72 box border-black-500 focus:outline-none focus:border-blue focus:ring-1 focus:text-blue focus:ring-blue'></div>
               </div>
            </div>
         </div>
         <div className='flex w-full gap-2 mb-4'>
            <div className='w-7/12 border rounded-md overflow-clip border-gray'>
               <div className='flex items-center h-8 px-4 text-white bg-black '>Tenencia accionario</div>
               <div className='flex flex-col gap-2 p-2 place-items-center '>
                  <div className='grid w-full grid-cols-5 text-center'>
                     <div className='col-span-2'>Accionistas</div>
                     <div className='col-span-1'>RFC</div>
                     <div className='col-span-1'>% Part. Directa</div>
                     <div className='col-span-1'>% Part. Indirecta</div>
                  </div>
                  <div className='grid w-full grid-cols-5 gap-2'>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-2 px-2'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                  </div>
                  <div className='grid w-full grid-cols-5 gap-2'>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-2 px-2'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                  </div>
                  <div className='grid w-full grid-cols-5 gap-2'>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-2 px-2'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                  </div>
                  <div className='grid w-full grid-cols-5 gap-2'>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-2 px-2'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                  </div>
                  <div className='grid w-full grid-cols-5 gap-2'>
                     <div className='flex items-center border-gray bg-[#bebebe33] border h-8 rounded col-span-2 px-2'>
                        Otros
                     </div>
                     <div className='flex box items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='flex box items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                  </div>
                  <div className='grid w-full grid-cols-5 gap-2'>
                     <div className='flex items-center justify-end border-gray bg-[#bebebe33] border h-8 rounded col-span-3 pr-6'>
                        Total
                     </div>
                     <div className='box flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                     <div className='box flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
                  </div>
               </div>
            </div>
            <div className='flex flex-col w-5/12 gap-2 max-h-max '>
               <div className='border rounded-md overflow-clip border-gray'>
                  <h4 className='flex items-center h-8 px-4 text-white bg-black'>Información financiera</h4>
                  <div className='flex'>
                     <div className='h-[88px] w-36 flex justify-center items-center border-r border-gray'>
                        Últimos EEFF
                     </div>
                     <div className='flex flex-col items-end w-full gap-2 p-2'>
                        <div className='flex items-center w-fit'>
                           <p className='pr-2 whitespace-nowrap'>Anual</p>
                           <div className='p-2 box border-gray border h-8 rounded text-center w-[247px] pointer-events-none'></div>
                        </div>
                        <div className='flex items-center w-fit'>
                           <p className='pr-2 whitespace-nowrap'>Parcial</p>
                           <div className='p-2 box border-gray border h-8 rounded text-center w-[247px] pointer-events-none'></div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className='border rounded-md grow overflow-clip border-gray'>
                  <h4 className='flex items-center h-8 px-4 text-white bg-black '>Experiencia de buró</h4>

                  <div className='grid grid-cols-3 grid-rows-3 auto-rows-max max-h-max'>
                     <div className='flex items-center px-2 py-2 border-b border-gray'>Información / Participante</div>
                     <div className='flex items-center px-2 py-2 border-b border-x border-gray'>Acreditado</div>
                     <div className='flex items-center px-2 py-2 border-b border-gray'>Aval / Obligado Solidario</div>
                     <div className='flex items-center px-2 py-2'>Fecha reporte de buró de crédito</div>
                     <div className='flex items-center w-full py-2 border-x border-gray'>
                        <div className='flex items-center p-2 box border-gray border h-8 rounded text-center w-full mx-2 bg-[#bebebe33] text-[#222222cc] pointer-events-none'></div>
                     </div>
                     <div className='flex items-center w-full py-2'>
                        <div className='flex items-center p-2 box border-gray border h-8 rounded text-center w-full mx-2 bg-[#bebebe33] text-[#222222cc] pointer-events-none'></div>
                     </div>
                     <div className='flex items-center px-2 '>Calificación de buró interno</div>
                     <div className='flex items-center w-full py-2 border-x border-gray'>
                        <div className='flex items-center p-2 box border-gray border h-8 rounded text-center w-full mx-2 bg-[#bebebe33] text-[#222222cc] pointer-events-none'></div>
                     </div>
                     <div className='flex items-center w-full py-2'>
                        <div className='flex items-center p-2 box border-gray border h-8 rounded text-center w-full mx-2 bg-[#bebebe33] text-[#222222cc] pointer-events-none'></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className='flex w-full gap-2 mb-4'>
            <div className='flex flex-col w-7/12 border rounded-md overflow-clip border-gray'>
               <h4 className='flex items-center h-8 px-4 text-white bg-black '>Informacion sectorial</h4>

               <div className='flex flex-col gap-3 p-2 grow justify-stretch'>
                  <div className='flex items-center w-full'>
                     <p className='flex justify-end w-1/6 pr-2 align-middle min-w-fit whitespace-nowrap'>
                        Código sectorial BASE
                     </p>

                     <div className='h-8 p-2 mr-4 border rounded border-gray grow box'></div>
                     <div className='flex items-center gap-2 '>
                        <p className="whitespace-nowrap after:content-['*'] after:ml-0.5 after:text-red-500">
                           Mercado objetivo
                        </p>
                        <div className='w-24 h-8 p-2 border rounded border-gray box'></div>
                     </div>
                  </div>
                  <div className='flex items-center justify-end grow'>
                     <p className='pr-2 whitespace-nowrap'>Sector</p>

                     <div className='w-10/12 h-10 p-2 border rounded pointer-events-none box border-gray'></div>
                  </div>
                  <div className='flex items-center justify-end grow'>
                     <p className='pr-2 whitespace-nowrap'>Sub sector</p>

                     <div className='w-10/12 h-10 p-2 border rounded pointer-events-none box border-gray'></div>
                  </div>
                  <div className='flex items-center justify-end grow'>
                     <p className='pr-2 whitespace-normal w-min'>Actividad especifica</p>
                     <div className='w-10/12 h-10 p-2 border rounded pointer-events-none box border-gray'></div>
                  </div>
               </div>
            </div>
            <div className='flex flex-col w-5/12 gap-2 '>
               <div className='border rounded-md overflow-clip border-gray'>
                  <h4 className='flex items-center h-8 px-4 text-white bg-black '>Mercado estratégico*</h4>
                  <div className='p-2'>
                     <div className='w-full h-8 p-2 border rounded border-gray box'></div>
                  </div>
               </div>
               <div className='flex flex-col border rounded-md grow border-gray overflow-clip'>
                  <h4 className='flex items-center h-8 px-4 text-white bg-black'>Descripción*</h4>
                  <div className='p-2 grow'>
                     <div className='w-full h-full p-2 border rounded outline-none resize-none box border-gray focus:ring-1 focus:outline-none focus:text-blue focus:border-blue'></div>
                  </div>
               </div>
            </div>
         </div>
         <div className='flex flex-col mb-4 rounded-t-md overflow-clip'>
            <div className='flex items-center w-full h-8 px-4 text-white bg-black'>Resolución de líneas</div>
            <div className='flex w-full overflow-auto container-overflow'>
               <div className='flex flex-col flex-none w-1/5'>
                  <div className='h-8 bg-black'></div>
                  <div className='flex flex-col items-center w-full gap-2 p-2 border-x border-gray'>
                     <div className='flex items-center flex-none w-full h-10 gap-2'>
                        <p className='flex-none w-1/3'>No.</p>
                        <p className='flex-none w-2/3'>Tipo </p>
                     </div>
                  </div>
                  <div className='flex-none w-full h-[20.53rem] grid grid-cols-3 items-start gap-2 px-2 pb-4 border-b border-x border-gray'>
                     <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                        No.&nbsp;1
                     </div>
                     <div className='w-full h-8 col-span-2 border rounded outline-none box border-black-500 focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>{' '}
                     <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                        No.&nbsp;2
                     </div>
                     <div className='w-full h-8 col-span-2 border rounded outline-none box border-black-500 focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>{' '}
                     <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                        No.&nbsp;3
                     </div>
                     <div className='w-full h-8 col-span-2 border rounded outline-none box border-black-500 focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>{' '}
                     <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                        No.&nbsp;4
                     </div>
                     <div className='w-full h-8 col-span-2 border rounded outline-none box border-black-500 focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>{' '}
                     <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                        No.&nbsp;5
                     </div>
                     <div className='w-full h-8 col-span-2 border rounded outline-none box border-black-500 focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>{' '}
                     <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                        No.&nbsp;6
                     </div>
                     <div className='w-full h-8 col-span-2 border rounded outline-none box border-black-500 focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>{' '}
                     <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                        No.&nbsp;7
                     </div>
                     <div className='w-full h-8 col-span-2 border rounded outline-none box border-black-500 focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>{' '}
                     <div className='items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'>
                        No.&nbsp;8
                     </div>
                     <div className='w-full h-8 col-span-2 border rounded outline-none box border-black-500 focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>
                  </div>
               </div>
               <div className='flex flex-col flex-none w-2/3'>
                  <div className='flex items-center flex-none w-full h-8 px-2 text-white bg-black'>
                     Líneas anteriores
                  </div>
                  <div className='grid items-center flex-none w-full grid-cols-10 gap-2 p-2 border-r border-gray'>
                     <div className='flex flex-col justify-center h-10 col-span-2'>
                        Autoriza <br />
                        <span className='text-xs'>(dd-mm-aaaa)</span>
                     </div>
                     <div className='col-span-2'>
                        Vencimiento <br />
                        <span className='text-xs'>(dd-mm-aaaa)</span>
                     </div>
                     <div className='col-span-2'>Monto</div>
                     <div>Moneda</div>
                     <div className='col-span-2'>Saldo</div>
                     <div className='-m-2'>Garantía</div>
                  </div>
                  <div className='flex-none w-full h-[20.53rem] grid grid-cols-10 items-start gap-2 px-2 pb-4 border-b border-r border-gray'>
                     <div className='w-full h-8 col-span-2 p-2 text-center border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 text-center border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-center border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 text-center border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-center border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 text-center border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-center border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 text-center border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-center border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 text-center border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-center border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 text-center border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-center border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 text-center border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-center border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 text-center border rounded outline-none cursor-pointer box border-gray '></div>
                     <div className='w-full h-8 col-span-2 p-2 text-right border rounded outline-none box border-gray '></div>
                     <div className='h-8 border rounded outline-none cursor-pointer box border-gray '></div>
                  </div>
                  <div className='grid items-center flex-none w-full grid-cols-10 gap-2 p-2'>
                     <div className='col-span-4 text-right'>Riesgo Solicitante Val.</div>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2'></div>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-8'></div>
                     <div className='col-span-4 text-right'>Riesgo Resto de grupo Val.</div>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2'></div>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-8'></div>
                     <div className='col-span-4 text-right'>Riesgo Potencial de grupo Val.</div>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2'></div>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-8'></div>
                  </div>
               </div>
               <div className='flex flex-col flex-none w-1/2'>
                  <div className='flex items-center flex-none w-full h-8 px-2 text-white bg-black'>Solicitud</div>
                  <div className='grid items-center flex-none w-full grid-cols-7 gap-2 p-2 border-r border-gray'>
                     <div className='flex items-center h-10 col-span-2'>Situación</div>
                     <div className='col-span-2'>Monto</div>
                     <div className='text-center'>Moneda</div>
                     <div className='text-center'>Plazo</div>
                     <div className='text-center '>Garantía</div>
                  </div>
                  <div className='flex-none w-full h-[20.53rem] grid grid-cols-7 items-start gap-2 px-2 pb-4 border-b border-r border-gray'>
                     <div className='box flex items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2'></div>
                     <div className='box flex items-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2'></div>
                     <div className='box flex items-center justify-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'></div>
                     <div className='box flex items-center justify-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'></div>
                     <div className='box flex items-center justify-center p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-1'></div>
                  </div>
                  <div className='grid items-center flex-none grid-cols-7 gap-2 p-2 full'>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-3'></div>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-3'></div>
                     <div className='box flex items-center justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-span-2 col-start-3'></div>
                  </div>
               </div>
               <div className='flex flex-col flex-none w-1/3'>
                  <div className='flex items-center flex-none w-full h-8 px-2 text-white bg-black'>Autorizado*</div>
                  <div className='grid items-center flex-none w-full grid-cols-10 gap-2 p-2 border-r border-gray'>
                     <div className='flex items-center justify-start h-10 col-span-3'>Monto*</div>
                     <div className='col-span-2 text-left'>Moneda*</div>
                     <div className='col-span-3 text-left'>Plazo*</div>
                     <div className='col-span-2 text-left'>Garantía*</div>
                  </div>
                  <div className='flex-none w-full h-[20.53rem] grid grid-cols-10 items-start gap-2 px-2 pb-4 border-b border-r border-gray'>
                     <div className='w-full h-8 col-span-3 p-2 text-right border rounded box border-gray focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>
                     <div className='h-8 col-span-2 text-center border rounded outline-none cursor-pointer box border-gray focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>
                     <div className='w-full h-8 col-span-3 p-2 text-center border rounded outline-none box border-gray focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>
                     <div className='h-8 col-span-2 text-center border rounded outline-none cursor-pointer box border-gray focus:outline-none focus:ring-1 focus:ring-blue focus:text-blue focus:border-blue'></div>
                  </div>
                  <div className='grid items-center flex-none grid-cols-10 gap-2 p-2 full'>
                     <div className='box flex items-center col-span-3 justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-start-1 ml-2'></div>
                     <div className='box flex items-center col-span-3 justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-start-1 ml-2'></div>
                     <div className='box flex items-center col-span-3 justify-end p-2 border-gray border h-8 rounded bg-[#bebebe33] text-[#222222cc] pointer-events-none col-start-1 ml-2'></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export const CoverTermsSkeleton = () => {
   return (
      <section className='flex flex-col h-auto gap-4 px-8 text-sm'>
         <div className='bg-[#F4F4F4] px-12 pt-4 pb-2 flex flex-col gap-3'>
            <h2 className='text-xl font-semibold text-[#545555]'>Sumario de términos y condiciones</h2>
            <div className='flex items-center'>
               <h4 className='w-1/2 text-sm text-[#707271]'>Grupo Financiero BASE S.A. de C.V. </h4>
               <div className='flex items-center justify-end gap-2 text-sm w-1/2'>
                  <p className='text-right basis-2/3'>Fecha presentación: </p>
                  <div className='w-36 h-8 ml-2 text-center border rounded border-gray box'></div>
               </div>
            </div>
         </div>
         <div className='flex items-center gap-2 mb-2'>
            <p className='whitespace-nowrap'>Empresa</p>
            <div className='w-2/6 h-8 p-2 border rounded pointer-events-none box border-gray'></div>
         </div>
         <div className='rounded-t-md overflow-clip'>
            <div className='h-8 px-4 bg-black'></div>
            <div className='flex flex-col w-3/5 gap-2 p-2'>
               <div className='flex items-center justify-between'>
                  <p className='pr-2 whitespace-nowrap'>Número de línea</p>
                  <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
               </div>
               <div className='flex items-center justify-between'>
                  <p className='pr-2 whitespace-nowrap'>Tipo de Crédito</p>
                  <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
               </div>
               <div className='flex items-center justify-between'>
                  <p className='pr-2 whitespace-nowrap'>Monto Autorizado</p>
                  <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
               </div>
               <div className='flex items-center justify-between'>
                  <p className='pr-2 whitespace-nowrap'>Destino</p>
                  <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
               </div>
            </div>
         </div>
         <div className='rounded-t-md overflow-clip'>
            <div className='flex items-center h-8 px-4 text-white bg-black'>
               Ubicación Geográfica del destino del crédito
            </div>
            <div className='flex flex-col gap-2 p-2'>
               <div className='flex'>
                  <div className='flex items-center w-3/5'>
                     <p className='w-1/3 pr-14'>Ubicación Geográfica del destino del crédito</p>
                     <div className='flex items-center w-2/3'>
                        <p className='pr-2 whitespace-nowrap'>Municipio/Delegación:</p>
                        <div className='w-full h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                     </div>
                  </div>
                  <div className='flex items-center w-2/5 pl-8'>
                     <p className='pr-2 whitespace-nowrap'>Estado</p>
                     <div className='w-full h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
               </div>
               <div className='flex flex-col gap-2'>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='pr-2 whitespace-nowrap'>Plazo de contrato</p>
                     <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='pr-2 whitespace-nowrap'>Recursos</p>
                     <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
                  <div className='flex items-center justify-between w-full'>
                     <p className='pr-2 whitespace-nowrap'>Disposición</p>
                     <div className='w-4/5 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='pr-2 whitespace-nowrap'>Pago de Capital</p>
                     <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='pr-2 whitespace-nowrap'>Pago de Intereses</p>
                     <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='w-1/3 pr-2 '>Obligado Solidario(s), Fianza y/o Aval(es)*</p>
                     <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='w-1/3 pr-2 '>Garantía*</p>
                     <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='pr-2 whitespace-nowrap'>Condiciones Precedentes*</p>
                     <div className='w-2/3 p-2 border rounded outline-none resize-none box h-28 border-gray -light ring-gray focus:ring-blue focus:text-blue focus:border-blue'></div>
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='pr-2 whitespace-nowrap'>Condiciones de Seguimiento*</p>
                     <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
                  <div className='flex items-center justify-between w-3/5'>
                     <p className='pr-2 whitespace-nowrap'>Condiciones contractuales*</p>
                     <div className='w-2/3 h-8 p-2 border rounded pointer-events-none box border-gray '></div>
                  </div>
               </div>
               <div className='flex items-center'>
                  <div className='w-1/5'>Condiciones de Operación*</div>
                  <div className='flex flex-col justify-end w-2/5 gap-2'>
                     <div className='flex items-center justify-end w-8/12 gap-3'>
                        <p>Monto Acumulado </p>
                        <div className='flex border border-black-500 max-w-[8rem] rounded-md box-border enabled:hover:ring-1 enabled:hover:border-blue enabled:hover:ring-blue'>
                           <div className='flex-auto w-24 h-8 pl-2 text-sm text-center outline-none box focus:outline-none focus:text-blue'></div>
                           <span className='flex items-center px-2 py-1 text-xs text-center text-gray-600 border-l select-none border-x-black-500 w-11'>
                              USD
                           </span>
                        </div>
                     </div>
                     <div className='flex items-center justify-end w-8/12 gap-3'>
                        <p>Índice de Cobertura </p>
                        <div className='flex border border-black-500 max-w-[8rem] rounded-md box-border enabled:hover:ring-1 enabled:hover:border-blue enabled:hover:ring-blue'>
                           <div className='flex-auto w-24 h-8 pl-2 text-sm text-center outline-none box focus:outline-none focus:text-blue'></div>

                           <span className='px-2 py-1 text-center text-gray-600 border-l select-none border-x-black-500 w-11'>
                              %
                           </span>
                        </div>
                     </div>
                     <div className='flex items-center justify-end w-8/12 gap-3'>
                        <p>Nocional </p>
                        <div className='flex border border-black-500 max-w-[8rem] rounded-md box-border enabled:hover:ring-1 enabled:hover:border-blue enabled:hover:ring-blue'>
                           <div className='flex-auto w-24 h-8 pl-2 text-sm text-center outline-none box focus:outline-none focus:text-blue'></div>

                           <span className='flex items-center px-2 py-1 text-xs text-center text-gray-600 border-l select-none border-x-black-500 w-11'>
                              USD
                           </span>
                        </div>
                     </div>
                     <div className='flex items-center justify-end gap-3'>
                        <div className='w-full p-2 border rounded outline-none resize-none box h-28 border-gray -light ring-gray focus:ring-blue focus:text-blue focus:border-blue'></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};
