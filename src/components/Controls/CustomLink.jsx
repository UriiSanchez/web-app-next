import Link from 'next/link';
import PropTypes from 'prop-types';

/**
 * CustomLink - Renderiza un enlace o un botón deshabilitado basado en la propiedad `isDisabled`.
 * @component CustomLink
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode | String | HTMLElement} props.children - Contenido renderizado dentro del enlace o botón.
 * @param {string} props.sx - Clases CSS aplicadas para estilos personalizados.
 * @param {boolean} [props.isDisabled=false] - Si es `true`, renderiza un boton deshabilitado.
 * @param {string | object} props.href - La ruta del enlace (utilizado por `Link` de Next.js).
 *
 * @example  Usar como enlace
 * <CustomLink href="/FAC/RequestPreview" sx="btn-primary">
 *    Solicitudes
 *  </CustomLink>
 *
 * @example Usar como enlace con caracteristicas de LINK
 * <CustomLink href={{pathname: "/FAC/RequestPreview", query: {idGroup: 1}}} sx="btn-primary">
 *    Detalle solicitud
 * </CustomLink>
 *
 * @example Link deshabilitado
 * <CustomLink isDisabled={true} sx="btn-primary">
 *    Solicitudes
 *  </CustomLink>
 * */
export const CustomLink = ({ children, sx, isDisabled = false, href }) => {
   if (isDisabled) {
      return (
         <button disabled className={sx}>
            {children}
         </button>
      );
   }

   return (
      <Link href={href} className={sx}>
         {children}
      </Link>
   );
};

CustomLink.propTypes = {
   children: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.element]).isRequired,
   sx: PropTypes.string,
   isDisabled: PropTypes.bool,
   href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
