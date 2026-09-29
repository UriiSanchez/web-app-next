import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'false';
process.env.NEXT_PUBLIC_ENVIRONMENT = 'DEVELOP';

// Storage nativo de JSDOM: cadenas vacías, coerción y aislamiento entre casos.
beforeEach(() => {
   window.localStorage.clear();
   window.sessionStorage.clear();
   // APIs de desplazamiento que JSDOM no implementa. Se recrean por caso porque
   // restoreAllMocks (afterEach) descarta los mocks definidos a nivel de módulo.
   window.HTMLElement.prototype.scrollTo = jest.fn();
   window.scrollTo = jest.fn();
});

afterEach(() => {
   cleanup();
   jest.restoreAllMocks();
   jest.useRealTimers();
   window.localStorage.clear();
   window.sessionStorage.clear();
});
