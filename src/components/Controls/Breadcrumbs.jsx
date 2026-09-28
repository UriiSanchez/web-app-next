import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

/**
 * Componente Breadcrumb `Camino de migas` dinámico que muestra rutas de navegación.
 *
 * @component Breadcrumbs
 * @param {object[]} routes - Un array de objetos que define las rutas de navegación.
 * @param {string} [routes[].label] - El texto que se mostrará en el cliente.
 * @param {string|object} [routes[].href] - Ruta del elemento del breadcrumb (puede ser una cadena de texto o un objeto de ruta del componente `LINK` de `NEXT.JS`)
 * @param {boolean} [routes[].lastItem] - Indica si el elemento es el último en el breadcrumb para no mostrar el último icono.
 * @param {string} [routes[].sx] - Permite añadir clases de "TailwindCSS" para darle diseño al link.
 * @param {string} [icon='chevron_right'] - Nombre del icono de `Material Symbols` a usar como separador.
 * @param {string} [sx=''] - Recibe clases de TailwindCSS para el componente completo.
 * @see https://fonts.google.com/icons Para ver más iconos en Material Symbols
 * @see https://nextjs.org/docs/14/pages/building-your-application/routing/linking-and-navigating Para saber más sobre la navegación con NEXT.JS
 * @example
 * const routesNavigation = [
 *    {
 *       label: 'Solicitudes'
 *       href: '/FAC/RequestsReview',
 *       lastItem: false,
 *       sx: '',
 *    },
 *    {
 *       label: 'CEMEX S.A de C.V'
 *       href: { {
 *          pathname: 'FAC/RequestsReview',
 *          query: { idGroup: 123 }
 *       }},
 *       lastItem: false,
 *       sx: '',
 *    }, {
 *       label: 'Editar solicitud',
 *       href: '',
 *       lastItem: true,
 *       sx: ''
 *    }
 * ];
 *
 *<Breadcrumbs routes={routesNavigation} icon="arrow_forward"/>
 *
 * @return Lista de navegación ordenada de forma horizontal, ejemplo: Solicitudes > etc...
 * */
export const Breadcrumbs = ({ routes, icon = 'chevron_right', sx = '' }) => {
   return (
      <nav aria-label='breadcrumb' className={`text-sm ${sx}`}>
         <ol className='flex items-center gap-3 text-[#545555]'>
            {routes.map((route, idx) => (
               <li key={route.label} className='flex items-center gap-2 '>
                  {route.lastItem ? (
                     <span className={route.sx || ''}>{route.label} </span>
                  ) : (
                     <Link className={`hover:text-blue-500 hover:underline {route.sx || ''}`} href={route.href}>
                        {route.label}
                     </Link>
                  )}
                  {!route.lastItem && (
                     <span className='select-none material-symbols-outlined icon-size-20 flex-none'>{icon}</span>
                  )}
               </li>
            ))}
         </ol>
      </nav>
   );
};

Breadcrumbs.propTypes = {
   routes: PropTypes.arrayOf(
      PropTypes.shape({
         label: PropTypes.string.isRequired,
         href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
         lastItem: PropTypes.bool,
         sx: PropTypes.string,
      })
   ),
   icon: PropTypes.string,
};
