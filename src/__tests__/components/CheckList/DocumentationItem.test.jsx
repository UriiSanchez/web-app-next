import { screen, within } from '@testing-library/react';

import { DocumentationItem } from '../../../components/CheckList/DocumentationItem';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const baseDoc = { _id: 'doc1', title: 'Estados financieros', layout: 'EF', toAction: [] };

function setup(props = baseDoc) {
   const actions = createActions({ togglePDF: jest.fn() });
   const fnAction = jest.fn();
   const wrapper = createContextWrapper({ actions });
   const view = (p) => <DocumentationItem props={p} typePerson='PM' fnAction={fnAction} />;
   const utils = renderComponent(view(props), { wrapper });
   return { actions, fnAction, view, ...utils };
}

describe('DocumentationItem', () => {
   test('shows the title, subtitle, method, status and layout', () => {
      setup({
         ...baseDoc,
         subtitle: 'Últimos 2 años',
         selectedType: 'Manual',
         status: 'Completado',
         icon: '<b>listo</b>',
      });

      expect(screen.getByRole('heading', { name: 'Estados financieros' })).toBeInTheDocument();
      expect(screen.getByText('Últimos 2 años')).toBeInTheDocument();
      expect(screen.getByText('Método: Manual')).toBeInTheDocument();
      expect(screen.getByText(/Estatus: Completado/)).toHaveClass('text-emerald-600');
      expect(screen.getByText('listo')).toBeInTheDocument();
      expect(screen.getByText('EF')).toBeInTheDocument();
   });

   test('uses a gray status color for unknown statuses', () => {
      setup({ ...baseDoc, status: 'Otro' });

      expect(screen.getByText(/Estatus: Otro/)).toHaveClass('text-gray');
   });

   test('renders no action controls when toAction is empty', () => {
      setup();

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
   });

   describe('btn action', () => {
      const withBtn = (enable) => ({ ...baseDoc, folio: 55, toAction: [{ type: 'btn', label: 'Ver', enable }] });

      test('opens the PDF of the document', async () => {
         const { actions, user } = setup(withBtn(true));

         await user.click(screen.getByRole('button', { name: 'Ver' }));

         expect(actions.togglePDF).toHaveBeenCalledWith({ folio: 55, title: 'Estados financieros' });
      });

      test('is disabled when the action is not enabled', () => {
         setup(withBtn(false));

         expect(screen.getByRole('button', { name: 'Ver' })).toBeDisabled();
      });
   });

   describe('link action', () => {
      test('renders a link to the given url when enabled', () => {
         setup({ ...baseDoc, toAction: [{ type: 'link', label: 'Ir', enable: true, url: '/FAC/Cargar' }] });

         expect(screen.getByRole('link', { name: 'Ir' })).toHaveAttribute('href', '/FAC/Cargar');
      });

      test('renders a disabled button instead of a link when not enabled', () => {
         setup({ ...baseDoc, toAction: [{ type: 'link', label: 'Ir', enable: false, url: '/FAC/Cargar' }] });

         expect(screen.queryByRole('link')).not.toBeInTheDocument();
         expect(screen.getByRole('button', { name: 'Ir' })).toBeDisabled();
      });
   });

   describe('func action', () => {
      test('runs fnAction when clicked', async () => {
         const { fnAction, user } = setup({ ...baseDoc, toAction: [{ type: 'func', label: 'Enviar', enable: true }] });

         await user.click(screen.getByRole('button', { name: 'Enviar' }));

         expect(fnAction).toHaveBeenCalledTimes(1);
      });

      test('is disabled when the action is not enabled', () => {
         setup({ ...baseDoc, toAction: [{ type: 'func', label: 'Enviar', enable: false }] });

         expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
      });
   });

   describe('list action', () => {
      const listDoc = {
         ...baseDoc,
         toAction: [
            {
               type: 'list',
               label: 'Ver',
               enable: true,
               data: [
                  { year: 2023, folio: 301 },
                  { year: 2024, folio: 302 },
               ],
            },
         ],
      };

      test('lists the years and keeps the button disabled until one is selected', () => {
         setup(listDoc);

         expect(screen.getByRole('combobox')).toHaveValue('');
         expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Año', '2023', '2024']);
         expect(screen.getByRole('button', { name: 'Ver' })).toBeDisabled();
      });

      test('opens the PDF of the selected year', async () => {
         const { actions, user } = setup(listDoc);

         await user.selectOptions(screen.getByRole('combobox'), '2024');
         await user.click(screen.getByRole('button', { name: 'Ver' }));

         expect(actions.togglePDF).toHaveBeenCalledWith({ folio: '302', title: 'Estados financieros' });
      });

      test('disables the select when the action is not enabled', () => {
         setup({ ...listDoc, toAction: [{ ...listDoc.toAction[0], enable: false }] });

         expect(screen.getByRole('combobox')).toBeDisabled();
      });

      test('clears the selected year when the document changes', async () => {
         const { user, rerender, view } = setup(listDoc);
         await user.selectOptions(screen.getByRole('combobox'), '2023');
         expect(screen.getByRole('button', { name: 'Ver' })).toBeEnabled();

         rerender(view({ ...listDoc }));

         expect(screen.getByRole('combobox')).toHaveValue('');
         expect(screen.getByRole('button', { name: 'Ver' })).toBeDisabled();
      });
   });

   describe('new letter (CNNV) layout', () => {
      const newLetter = {
         ...baseDoc,
         layout: 'CNNV',
         isEnable: true,
         docs: [{ _id: 'd1', type: 'DOC', title: 'Acta constitutiva', folio: 88 }],
      };

      test('opens and closes the requirements modal', async () => {
         const { user } = setup(newLetter);
         expect(screen.queryByText(/Requisitos para realizar la Consulta/)).not.toBeInTheDocument();

         await user.click(screen.getByRole('button', { name: /Requisitos para consulta BC/ }));
         const modal = screen.getByRole('dialog');
         expect(within(modal).getByText('Acta constitutiva')).toBeInTheDocument();

         await user.click(screen.getByTitle('Cerrar modal'));
         expect(screen.queryByText(/Requisitos para realizar la Consulta/)).not.toBeInTheDocument();
      });

      test('disables the requirements button when the request is not enabled', () => {
         setup({ ...newLetter, isEnable: false });

         expect(screen.getByRole('button', { name: /Requisitos para consulta BC/ })).toBeDisabled();
      });

      test('does not show the layout text as a paragraph', () => {
         setup(newLetter);

         expect(screen.queryByText('CNNV')).not.toBeInTheDocument();
      });
   });
});
