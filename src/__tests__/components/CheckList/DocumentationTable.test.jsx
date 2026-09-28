import { screen } from '@testing-library/react';

import { DocumentationTable } from '../../../components/CheckList/DocumentationTable';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

const wrapper = createContextWrapper({ actions: createActions({ togglePDF: jest.fn() }) });

const docs = {
   personType: 'PM',
   documentation: [
      {
         _id: 'a',
         title: 'Acta constitutiva',
         layout: 'ACTA',
         toAction: [{ type: 'func', label: 'Enviar', enable: true }],
      },
      { _id: 'b', title: 'Poderes', layout: 'POD', toAction: [] },
   ],
};

describe('DocumentationTable', () => {
   test('shows the header and one item per document', () => {
      renderComponent(<DocumentationTable docs={docs} />, { wrapper });

      expect(screen.getByText('Documentación')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Acta constitutiva' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Poderes' })).toBeInTheDocument();
      expect(screen.queryByAltText('Sin documentos')).not.toBeInTheDocument();
   });

   test('shows the empty placeholder when there are no documents', () => {
      renderComponent(<DocumentationTable docs={{ personType: 'PF', documentation: [] }} />, { wrapper });

      expect(screen.getByAltText('Sin documentos')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
   });

   test('shows the empty placeholder when docs has no documentation', () => {
      renderComponent(<DocumentationTable docs={{}} />, { wrapper });

      expect(screen.getByAltText('Sin documentos')).toBeInTheDocument();
   });

   test('passes the whole docs object to onFunc when an item runs its function action', async () => {
      const onFunc = jest.fn();
      const { user } = renderComponent(<DocumentationTable docs={docs} onFunc={onFunc} />, { wrapper });

      await user.click(screen.getByRole('button', { name: 'Enviar' }));

      expect(onFunc).toHaveBeenCalledWith(docs);
   });
});
