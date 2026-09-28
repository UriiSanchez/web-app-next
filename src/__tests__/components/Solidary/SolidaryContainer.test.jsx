import { screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { SolidaryContainer } from '../../../components/Solidary/SolidaryContainer';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../services', () => ({
   getClientsById: jest.fn(),
   getClientsByName: jest.fn(),
   validateAmount: jest.fn(() => ({ valid: true, procedure: '' })),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const buildRequest = (idRequest, fullName) => ({
   idRequest,
   kindProcedure: 'Nuevo Tramite',
   requestAmount: 1000000,
   relatedPersonResponseList: [
      { idCatTypePerson: 1, idClient: idRequest * 10, fullName },
      { idCatTypePerson: 2, idClient: idRequest * 10 + 1, idRequest, fullName: `Obligado de ${fullName}` },
   ],
});

const applicants = [buildRequest(1, 'Empresa Alfa'), buildRequest(2, 'Empresa Beta')];

function setup(props = {}) {
   useRouter.mockReturnValue(createRouter());
   const onUpdateInfo = jest.fn();
   const wrapper = createContextWrapper({
      user: { userAD: 'analista01' },
      actions: createActions({ setPagination: jest.fn(), setExpandedRows: jest.fn() }),
      expandedRows: [],
      pagination: { currentPage: 1, totalPages: 1, sourcePage: 0, sourceTotalPages: 0 },
   });
   const utils = renderComponent(
      <SolidaryContainer
         applicants={applicants}
         isNotEditable={false}
         onUpdateInfo={onUpdateInfo}
         creditLimit={5000000}
         {...props}
      />,
      { wrapper }
   );
   return { onUpdateInfo, ...utils };
}

describe('SolidaryContainer', () => {
   test.each([[[]], [undefined]])('shows the skeleton instead of cards when applicants is %p', (value) => {
      setup({ applicants: value });

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Tipo de trámite/)).not.toBeInTheDocument();
   });

   test('renders an editable card per applicant', async () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Empresa Alfa' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Empresa Beta' })).toBeInTheDocument();
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
      expect(await screen.findByText('Obligado de Empresa Alfa')).toBeInTheDocument();
      expect(screen.getAllByRole('searchbox')).toHaveLength(2);
   });

   test('passes the edits of a card to onUpdateInfo with its request id', async () => {
      const { onUpdateInfo, user } = setup();
      const [firstProcedure] = screen.getAllByLabelText(/Tipo de trámite/);

      await user.selectOptions(firstProcedure, '');

      expect(onUpdateInfo).toHaveBeenCalledWith(1, expect.objectContaining({ idRequest: 1, kindProcedure: '' }));
   });

   test('renders read only cards when the applicants are not editable', async () => {
      setup({ isNotEditable: true });

      expect(screen.getByRole('heading', { name: 'Empresa Alfa' })).toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
      expect(await screen.findByText('Obligado de Empresa Beta')).toBeInTheDocument();
   });
});
