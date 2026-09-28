import '@testing-library/jest-dom';
import { act, render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import './src/styles/globals.css';

// Se añaden variables de entorno
process.env.NEXT_PUBLIC_ACTIVE_ISILOANS = false;
process.env.NEXT_PUBLIC_ENVIRONMENT = 'DEVELOP'

global.renderPage = async (Component, props = {}, userProps = {}) => {
   let queries;

   await act(async () => {
      queries = render(<Component {...props} />);
   });

   const user = userEvent.setup(userProps);

   return {
      queries,
      user,
      waitFor,
      screen
   };
};

// Simulando local storage del browser
const localStorageMock = (function () {
   let store = {};

   return {
      getItem: function (key) {
         return store[key] || null;
      },
      setItem: function (key, value) {
         store[key] = value.toString();
      },
      removeItem: function (key) {
         delete store[key];
      },
      clear: function () {
         store = {};
      },
   };
})();

Object.defineProperty(window, 'localStorage', {
   value: localStorageMock,
});

// Simulando funciones que no están en el ambiente de js-dom
window.HTMLElement.prototype.scrollTo = function () {};
window.scrollTo = function () {};
