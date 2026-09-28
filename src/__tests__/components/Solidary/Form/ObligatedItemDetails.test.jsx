import { screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import ObligatedItemDetails from '../../../../components/Solidary/Form/ObligatedItemDetails';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';
import { createRouter } from '../../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ getClientsById: jest.fn(), getClientsByName: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const obligated = {
   idClient: 321,
   fullName: 'Carlos Vega',
   maritalStatus: 'Casado',
   mail: 'carlos@correo.com',
   personType: 'PF',
};

function setup(props = {}) {
   useRouter.mockReturnValue(createRouter());
   const handlers = {
      onSetObligated: jest.fn(),
      onDeletedObligated: jest.fn(),
      onAddObligated: jest.fn(),
   };
   const wrapper = createContextWrapper({
      user: { userAD: 'analista01' },
      actions: createActions({ setPagination: jest.fn(), setExpandedRows: jest.fn() }),
      expandedRows: [],
      pagination: { currentPage: 1, totalPages: 1, sourcePage: 0, sourceTotalPages: 0 },
   });
   const utils = renderComponent(
      <ObligatedItemDetails
         obligated={obligated}
         index={0}
         showSeparator={false}
         isNotEditable={false}
         idRequest={7}
         numVirtualObligateds={1}
         {...handlers}
         {...props}
      />,
      { wrapper }
   );
   return { ...handlers, ...utils };
}

// El separador es un span sin rol; se ubica por su clase.
const separators = (container) => container.querySelectorAll('span.my-4');

describe('ObligatedItemDetails', () => {
   describe('read only', () => {
      test('shows the numbered obligor with name, marital status and mail', () => {
         setup({ isNotEditable: true, index: 2 });

         expect(screen.getByText('Obligado Solidario 03')).toBeInTheDocument();
         expect(screen.getByText('Carlos Vega')).toBeInTheDocument();
         expect(screen.getByText('Casado')).toBeInTheDocument();
         expect(screen.getByText('carlos@correo.com')).toBeInTheDocument();
         expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
         expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });

      test('omits the marital status and mail when they are missing', () => {
         setup({ isNotEditable: true, obligated: { idClient: 1, fullName: 'Sociedad Uno' } });

         expect(screen.getByText('Sociedad Uno')).toBeInTheDocument();
         expect(screen.queryByText('Casado')).not.toBeInTheDocument();
         expect(screen.queryByText('carlos@correo.com')).not.toBeInTheDocument();
      });

      test('draws the separator only when asked to', () => {
         const { container, unmount } = setup({ isNotEditable: true, showSeparator: true });
         expect(separators(container)).toHaveLength(1);
         unmount();

         const second = setup({ isNotEditable: true, showSeparator: false });
         expect(separators(second.container)).toHaveLength(0);
      });
   });

   describe('editable', () => {
      test('shows the search box and the details of the obligor', () => {
         setup({ obligated: { ...obligated, personType: undefined } });

         expect(screen.getByText('Obligado Solidario 01')).toBeInTheDocument();
         expect(screen.getByRole('searchbox')).toBeInTheDocument();
         expect(screen.getByText('Carlos Vega')).toBeInTheDocument();
         expect(screen.getByText('Casado')).toBeInTheDocument();
         expect(screen.getByText('carlos@correo.com')).toBeInTheDocument();
      });

      test('shows placeholders when there is no obligor yet', () => {
         setup({ obligated: {} });

         expect(screen.getByText('Nombre')).toBeInTheDocument();
         expect(screen.getByText('Estado civil')).toBeInTheDocument();
         expect(screen.getByText('ejemplo@bancobase.com')).toBeInTheDocument();
      });

      test('hides the marital status for a legal entity and the mail for a natural person', () => {
         const { unmount } = setup({ obligated: { ...obligated, personType: 'PM' } });
         expect(screen.queryByText('Casado')).not.toBeInTheDocument();
         expect(screen.getByText('carlos@correo.com')).toBeInTheDocument();
         unmount();

         setup({ obligated: { ...obligated, personType: 'PF' } });
         expect(screen.getByText('Casado')).toBeInTheDocument();
         expect(screen.queryByText('carlos@correo.com')).not.toBeInTheDocument();
      });

      test('offers to delete an assigned obligor', async () => {
         const { onDeletedObligated, user } = setup();

         await user.click(screen.getByTitle('Haz click para eliminar'));

         expect(onDeletedObligated).toHaveBeenCalledTimes(1);
      });

      test('does not offer to delete an empty single slot but does when there are several', () => {
         const { unmount } = setup({ obligated: {}, numVirtualObligateds: 1 });
         expect(screen.queryByTitle('Haz click para eliminar')).not.toBeInTheDocument();
         unmount();

         setup({ obligated: {}, numVirtualObligateds: 2 });
         expect(screen.getByTitle('Haz click para eliminar')).toBeInTheDocument();
      });

      test('adds another obligor slot from the last one', async () => {
         const { onAddObligated, user } = setup({ showSeparator: true });

         await user.click(screen.getByRole('button', { name: 'Agregar obligado solidario +' }));

         expect(onAddObligated).toHaveBeenCalledTimes(1);
      });

      test('blocks adding another slot while the current one is empty', () => {
         setup({ showSeparator: true, obligated: {} });

         expect(screen.getByRole('button', { name: 'Agregar obligado solidario +' })).toBeDisabled();
      });

      test('does not offer to add slots when it is not the last one', () => {
         setup({ showSeparator: false });

         expect(screen.queryByRole('button', { name: 'Agregar obligado solidario +' })).not.toBeInTheDocument();
      });
   });
});
