import { EasyContext } from '../../context';

// Provider real de EasyContext con el valor indicado; las acciones se pasan como spies.
export function createContextWrapper(value) {
   return function ContextWrapper({ children }) {
      return <EasyContext.Provider value={value}>{children}</EasyContext.Provider>;
   };
}

export function createActions(overrides = {}) {
   return { toggleLoading: jest.fn(), setConfig: jest.fn(), ...overrides };
}
