import { screen } from '@testing-library/react';

import MethodConsult from '../../../../../pages/MRC/BuroValidation/components/MethodConsult';
import { renderComponent } from '../../../../utils/render';
import { createActions, createContextWrapper } from '../../../../utils/context';

const docMCBC = {
   selectedType: 'Consulta manual',
   folio: 12,
   screenBureau: {
      docs: [
         { _id: 'a', title: 'Autorización', layout: 'Formato X', status: 'Completado', enable: true, folio: 7 },
         { _id: 'b', title: 'Comprobante', status: 'Pendiente', enable: false, folio: 0 },
         { _id: 'c', title: 'Otro documento', status: 'En proceso', enable: true, folio: 9 },
         { _id: 'd', title: 'Sin estado', enable: true, folio: 11 },
      ],
   },
};

const renderMethod = (doc = docMCBC) => {
   const actions = createActions({ togglePDF: jest.fn() });
   const utils = renderComponent(<MethodConsult docMCBC={doc} />, { wrapper: createContextWrapper({ actions }) });
   return { actions, ...utils };
};

const viewButtons = () => screen.getAllByRole('button', { name: 'Visualizar' });

describe('MethodConsult', () => {
   describe('selected method', () => {
      test('shows the heading and the selected consult type', () => {
         renderMethod();

         expect(screen.getByRole('heading', { name: 'Método para la consulta de Buró de Crédito' })).toBeInTheDocument();
         expect(screen.getByRole('heading', { name: 'Consulta manual' })).toBeInTheDocument();
      });

      test('shows a dash when there is no selected type', () => {
         renderMethod({ folio: 0 });

         expect(screen.getByRole('heading', { name: '-' })).toBeInTheDocument();
      });

      test('opens the PDF of the method with its title and folio', async () => {
         const { actions, user } = renderMethod();

         await user.click(viewButtons()[0]);

         expect(actions.togglePDF).toHaveBeenCalledWith({ title: 'Consulta manual', folio: 12 });
      });

      test('disables the view button when the folio is 0', () => {
         renderMethod({ ...docMCBC, folio: 0 });

         expect(viewButtons()[0]).toBeDisabled();
      });

      test('updates the method when the document changes', () => {
         const { rerender } = renderMethod();

         rerender(<MethodConsult docMCBC={{ selectedType: 'Consulta automática', folio: 30 }} />);

         expect(screen.getByRole('heading', { name: 'Consulta automática' })).toBeInTheDocument();
         expect(screen.queryByRole('heading', { name: 'Consulta manual' })).not.toBeInTheDocument();
      });
   });

   describe('bureau documents', () => {
      test('lists each document with its title', () => {
         renderMethod();

         ['Autorización', 'Comprobante', 'Otro documento', 'Sin estado'].forEach((title) => {
            expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
         });
         expect(viewButtons()).toHaveLength(5);
      });

      test('shows the layout only when the document has one', () => {
         renderMethod();

         expect(screen.getByText('Formato X')).toBeInTheDocument();
         expect(screen.getAllByRole('heading', { level: 5 })).toHaveLength(4);
      });

      test('colors the status by its meaning and falls back to gray', () => {
         renderMethod();

         expect(screen.getByText('Completado')).toHaveClass('text-emerald-600');
         expect(screen.getByText('Pendiente')).toHaveClass('text-red-500');
         expect(screen.getByText('En proceso')).toHaveClass('text-gray');
      });

      test('does not show a status line for a document without status', () => {
         renderMethod({ ...docMCBC, screenBureau: { docs: [docMCBC.screenBureau.docs[3]] } });

         expect(screen.getByRole('heading', { name: 'Sin estado' })).toBeInTheDocument();
         expect(screen.queryAllByRole('heading', { level: 5 })).toHaveLength(0);
      });

      test('opens the PDF of the clicked document with its title and folio', async () => {
         const { actions, user } = renderMethod();

         await user.click(viewButtons()[3]);

         expect(actions.togglePDF).toHaveBeenCalledTimes(1);
         expect(actions.togglePDF).toHaveBeenCalledWith({ title: 'Otro documento', folio: 9 });
      });

      test('disables the view button of documents that are not enabled', () => {
         renderMethod();

         expect(viewButtons()[1]).toBeEnabled();
         expect(viewButtons()[2]).toBeDisabled();
      });

      test('lists only the method row when the document has no bureau screen', () => {
         renderMethod({ selectedType: 'Consulta manual', folio: 12 });

         expect(viewButtons()).toHaveLength(1);
      });
   });
});
