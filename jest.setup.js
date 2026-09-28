import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = 'false';
process.env.NEXT_PUBLIC_ENVIRONMENT = 'DEVELOP';

// Storage nativo de JSDOM: cadenas vacías, coerción y aislamiento entre casos.
beforeEach(() => {
   window.localStorage.clear();
   window.sessionStorage.clear();
});

afterEach(() => {
   cleanup();
   jest.restoreAllMocks();
   jest.useRealTimers();
   window.localStorage.clear();
   window.sessionStorage.clear();
});

// APIs de desplazamiento que JSDOM no implementa.
window.HTMLElement.prototype.scrollTo = jest.fn();
window.scrollTo = jest.fn();
