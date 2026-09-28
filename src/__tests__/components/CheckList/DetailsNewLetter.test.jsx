import { screen, within } from '@testing-library/react';

import { DetailsNewLetter } from '../../../components/CheckList/DetailsNewLetter';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const docs = [
   { _id: 'rl1', type: 'RL', title: 'Identificación', layout: 'INE Representante', folio: 71 },
   { _id: 'rl2', type: 'RL', title: 'Identificación', layout: 'Pasaporte Representante', folio: null },
   { _id: 'd1', type: 'DOC', title: 'Acta constitutiva', folio: 88 },
   { _id: 'd2', type: 'DOC', title: 'Comprobante de domicilio', folio: 0 },
];

function setup(props = {}) {
   const actions = createActions({ togglePDF: jest.fn() });
   const fnClose = jest.fn();
   const wrapper = createContextWrapper({ actions });
   const utils = renderComponent(
      <DetailsNewLetter docs={docs} showModal typePerson='PM' fnClose={fnClose} {...props} />,
      { wrapper }
   );
   return { actions, fnClose, ...utils };
}

const rowOf = (text) => screen.getByText(text).parentElement;

describe('DetailsNewLetter', () => {
   test('lists the general documents and the legal representatives for a legal entity', () => {
      setup();

      expect(screen.getByRole('heading', { name: /Requisitos para realizar la Consulta/ })).toBeInTheDocument();
      expect(screen.getByText(/ID de lo\(s\) Representante\(s\)/)).toBeInTheDocument();
      expect(screen.getByText('INE Representante')).toBeInTheDocument();
      expect(screen.getByText('Pasaporte Representante')).toBeInTheDocument();
      expect(screen.getByText('Acta constitutiva')).toBeInTheDocument();
      expect(screen.getByText('Comprobante de domicilio')).toBeInTheDocument();
   });

   test('hides the legal representatives section for a natural person', () => {
      setup({ typePerson: 'PF' });

      expect(screen.queryByText(/ID de lo\(s\) Representante\(s\)/)).not.toBeInTheDocument();
      expect(screen.queryByText('INE Representante')).not.toBeInTheDocument();
      expect(screen.getByText('Acta constitutiva')).toBeInTheDocument();
   });

   test('warns when a legal entity has no legal representative documents', () => {
      setup({ docs: docs.filter((dc) => dc.type !== 'RL') });

      expect(screen.getByText('¡Representante Legal: No Ingresado!')).toBeInTheDocument();
   });

   test('only enables Visualizar for documents that already have a folio', () => {
      setup();

      expect(within(rowOf('INE Representante')).getByRole('button', { name: 'Visualizar' })).toBeEnabled();
      expect(within(rowOf('Pasaporte Representante')).getByRole('button', { name: 'Visualizar' })).toBeDisabled();
      expect(within(rowOf('Acta constitutiva')).getByRole('button', { name: 'Visualizar' })).toBeEnabled();
      expect(within(rowOf('Comprobante de domicilio')).getByRole('button', { name: 'Visualizar' })).toBeDisabled();
   });

   test('opens the PDF of a general document with its title', async () => {
      const { actions, user } = setup();

      await user.click(within(rowOf('Acta constitutiva')).getByRole('button', { name: 'Visualizar' }));

      expect(actions.togglePDF).toHaveBeenCalledWith({ folio: 88, title: 'Acta constitutiva' });
   });

   test('opens the PDF of a legal representative document with title and layout', async () => {
      const { actions, user } = setup();

      await user.click(within(rowOf('INE Representante')).getByRole('button', { name: 'Visualizar' }));

      expect(actions.togglePDF).toHaveBeenCalledWith({ folio: 71, title: 'Identificación - INE Representante' });
   });

   test('calls fnClose from the modal close button', async () => {
      const { fnClose, user } = setup();

      await user.click(screen.getByTitle('Cerrar modal'));

      expect(fnClose).toHaveBeenCalledTimes(1);
   });
});
