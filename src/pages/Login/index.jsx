import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';

import { AuthLayout } from '../../components/Layout';
import { IconSpin } from '../../components/SVG';
import { encryptOnlyFront, getCurrentYear } from '../../helpers';

import demoImage from '../../../public/login_demo.svg';
import logoBlack from '../../../public/logo_black.png';

export default function LoginPage() {
   const { data: session, status } = useSession();
   const [msgError, setMsgError] = useState('');
   const [toggleType, setToggleType] = useState(false);
   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting, isValid },
   } = useForm({ mode: 'onChange' });
   const year = getCurrentYear();
   const router = useRouter();

   useEffect(() => {
      if (status === 'authenticated') {
         router.push(session.user.settings?.startPage);
      }
   }, [session, status]);

   const onSubmit = async ({ userName, password }) => {
      setMsgError("");
      let parseInfo = encryptOnlyFront(JSON.stringify({ userName, password }));
      const res = await signIn('credentials', { parseInfo, redirect: false });
      if (res?.status !== 200) {
         setMsgError(res.error);
      }
   };

   return (
      <AuthLayout title='EasyCredit - Login'>
         <div className='flex flex-row h-screen'>
            <div className='flex flex-col basis-1/2 2xl:px-28 md:px-14 sm:px-4'>
               <div className='flex items-end flex-auto select-none'>
                  <Image src="/logo_black.png" alt='Logo EasyCreadit Negro' width={150} height={100} className=" w-auto h-auto" priority />
               </div>
               <div className='flex-[2_2_80%] flex flex-col justify-center gap-4 lg:px-16 md:px-8 sm:px-1'>
                  <h1 className='text-2xl font-bold select-none'>Inicia sesión</h1>
                  <p className='pb-6 select-none'>Identifica tu usuario para ingresar a la plataforma</p>
                  <form onSubmit={handleSubmit(onSubmit)} className='mb-16'>
                     <div className='flex flex-col gap-1 mb-6'>
                        <label
                           htmlFor='userName'
                           className={clsx('font-semibold', {
                              "after:content-['*'] after:ml-0.5 after:text-red-500 after:font-light": errors?.userName,
                           })}>
                           Usuario
                        </label>
                        <div
                           className={clsx(
                              'flex flex-row w-full p-1.5 gap-2 border rounded border-gray-400 hover:border-blue-800 hover:ring-1 ',
                              {
                                 'border-red-500 ring-1 ring-red-500 hover:border-red-500 !text-red-500':
                                    errors?.userName,
                              }
                           )}>
                           <span aria-label='icono usuario' className='material-symbols-outlined thin text-gray-400'>
                              account_circle
                           </span>
                           <input
                              id='userName'
                              name='userName'
                              type='text'
                              autoComplete='off'
                              placeholder='Usuario BANCO BASE'
                              className='w-full text-sm font-medium outline-none placeholder-slate-400 focus:outline-none focus:text-blue-800'
                              {...register('userName', {
                                 required: 'Este campo es requerido',
                                 pattern: {
                                    value: /^[a-zA-Z']*$/,
                                    message: 'El formato no es correcto',
                                 },
                              })}
                           />
                        </div>
                        {errors?.userName && <span className='text-xs text-red-500'>{errors?.userName?.message}</span>}
                     </div>
                     <div className='flex flex-col gap-1 mb-6'>
                        <label
                           htmlFor='password'
                           className={clsx('font-semibold', {
                              "after:content-['*'] after:ml-0.5 after:text-red-500 after:font-light": errors?.password,
                           })}>
                           Contraseña
                        </label>
                        <div
                           className={clsx(
                              'flex flex-row w-full p-1.5 gap-2 border rounded border-gray-400 hover:border-blue-800 hover:ring-1',
                              {
                                 'border-red-500 ring-1 ring-red-500 hover:border-red-500 !text-red-500':
                                    errors?.password,
                              }
                           )}>
                           <span aria-label='icono candado' className='material-symbols-outlined text-gray-400 thin'>
                              lock
                           </span>
                           <input
                              id='password'
                              name='password'
                              type={toggleType ? 'text' : 'password'}
                              autoComplete='off'
                              placeholder='tu contraseña estará oculta'
                              className='w-full text-sm outline-none placeholder-slate-400 focus:outline-none focus:text-blue-800'
                              {...register('password', {
                                 required: 'Este campo es requerido',
                              })}
                           />
                           <button
                              type='button'
                              aria-label={toggleType ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                              className='flex text-black '
                              onClick={() => setToggleType(!toggleType)}>
                              <span className='material-symbols-outlined'>
                                 {toggleType ? 'visibility' : 'visibility_off'}
                              </span>
                           </button>
                        </div>
                        {errors?.password && <span className='text-xs text-red-500'>{errors?.password?.message}</span>}
                     </div>
                     <div
                        className={clsx('gap-1 mb-6 p-3 px-6 text-sm bg-red-500 bg-opacity-90 rounded text-white', {
                           flex: msgError,
                           hidden: !msgError,
                        })}>
                        <span className='pr-2 text-sm material-symbols-outlined'>block</span>
                        <div>{msgError}</div>
                     </div>
                     <button
                        type='submit'
                        className='flex justify-center rounded-full w-full py-2 text-white bg-black hover:bg-black-900'
                        disabled={isSubmitting || !isValid}>
                        {isSubmitting ? (
                           <>
                              <IconSpin />
                              &nbsp;Iniciando sesión
                           </>
                        ) : (
                           'Iniciar sesión'
                        )}
                     </button>
                  </form>
               </div>
               <div className='flex items-start flex-auto text-xs font-light select-none text-gray'>
                  <p>Copyright @BancoBase{year} | Política de Privacidad</p>
               </div>
            </div>
            <div className='flex flex-col justify-start text-white select-none basis-1/2 bg-black-900 gap-14 sm:text-center'>
               <div className='flex-[1_1_auto] flex justify-end flex-col items-center gap-2'>
                  <h1 className='text-2xl'>¡Bienvenido a tu nueva plataforma!</h1>
                  <p>Otorga créditos + rápido + sencillo + easy</p>
               </div>
               <div className='flex-[2_1_auto] px-16 flex justify-center items-start'>
                  <Image src="/login_demo.svg" alt='Demo EasyCreadit' width="100" height="100" className='flex-auto' priority />
               </div>
            </div>
         </div>
      </AuthLayout>
   );
}
