import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { EasyContext } from '../../context';
import { renderComponent } from './render';
import { createActions } from './context';
import { createRouter } from './router';

// Valor mínimo de EasyContext que necesitan MainLayout y las tablas/bandejas de las páginas.
// `overrides.actions` se mezcla con las acciones espiadas por defecto en lugar de sustituirlas.
export function createPageContext({ actions, ...overrides } = {}) {
   return {
      user: { profile: 'Analista', fullName: 'Ana Lopez', firstLetters: 'AL', color: '#475569', idProfile: 2, status: [] },
      settings: { startPage: '/', menu: [] },
      loader: { isShow: false, msg: '' },
      showPDF: { isShow: false },
      stepper: { isShow: false, step: 1, options: [], config: {} },
      pagination: { currentPage: 1, totalPages: 1, sourcePage: 0, sourceTotalPages: 0 },
      general: { alertsModel: { show: false, alerts: [] } },
      verifyProperty: { open: false },
      expandedRows: [],
      isReloading: false,
      listAnalyst: [],
      listLeaders: [],
      ...overrides,
      actions: createActions({
         togglePDF: jest.fn(),
         setPagination: jest.fn(),
         setExpandedRows: jest.fn(),
         toggleReloading: jest.fn(),
         setStepper: jest.fn(),
         toggleVerification: jest.fn(),
         ...actions,
      }),
   };
}

/**
 * Renderiza una página con EasyContext real, router y sesión simulados.
 * La suite debe declarar `jest.mock('next/router', () => ({ useRouter: jest.fn() }))` y
 * `jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }))`.
 * Devuelve además el `context` y el `router` usados, para aserciones sobre acciones y navegación, y
 * `updateContext(overrides)`, que sustituye partes del valor del contexto y vuelve a renderizar
 * (por ejemplo para simular un cambio de `pagination.sourcePage` o de `isReloading`).
 */
export function renderPage(ui, { context = {}, router = {}, session = null, ...renderOptions } = {}) {
   const contextValue = createPageContext(context);
   const routerValue = createRouter(router);
   useRouter.mockReturnValue(routerValue);
   useSession.mockReturnValue({ data: session, status: session ? 'authenticated' : 'unauthenticated' });

   const holder = { value: contextValue };
   function ContextWrapper({ children }) {
      return <EasyContext.Provider value={holder.value}>{children}</EasyContext.Provider>;
   }

   const utils = renderComponent(ui, { wrapper: ContextWrapper, ...renderOptions });

   return {
      context: contextValue,
      router: routerValue,
      updateContext: (overrides) => {
         holder.value = { ...holder.value, ...overrides };
         utils.rerender(ui);
      },
      ...utils,
   };
}
