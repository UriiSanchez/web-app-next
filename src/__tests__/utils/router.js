// Adaptador del router de Pages de Next para componentes que consumen useRouter.
export function createRouter(overrides = {}) {
   return {
      basePath: '',
      pathname: '/',
      route: '/',
      query: {},
      asPath: '/',
      push: jest.fn().mockResolvedValue(true),
      replace: jest.fn().mockResolvedValue(true),
      reload: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
      isFallback: false,
      isReady: true,
      isPreview: false,
      isLocaleDomain: false,
      ...overrides,
   };
}
