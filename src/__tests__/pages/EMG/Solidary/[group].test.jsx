import { useRouter } from 'next/router';

import SolidaryPage from '../../../../pages/EMG/Solidary/[group]';
import { getInfoSolidary } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ __esModule: true, getInfoSolidary: jest.fn(), validateAmount: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');

   return {
      ...originalModule,
      useGlobalContext: jest.fn(),
   };
});

const mockData = {
   applicants: [
      {
         idCatStatus: 1,
         idCatTypeProcedure: 3,
         idGroupRequest: 1,
         idRequest: 472,
         kindProcedure: '',
         requestAmount: null,
         relatedPersonResponseList: [
            {
               fullName: 'SOLICITANTE 01',
               idCatTypePerson: 1,
               idClient: '38100',
               deleted: false,
               idRequest: 472,
               mail: null,
               maritalStatus: null,
               userCreate: 'testuser',
               personType: 'PM',
               rfc: null,
            },
         ],
         validate: {
            valid: true,
            procedure: 'Nuevo Tramite',
         },
      },
   ],
   credits: {
      applicantNotParticipateInRequest: [],
      creditTotalAmount: 0,
   },
   idCatStatus: 1,
   total: 1200000,
   idGroup: 1,
};

describe('Solidary & Obligateds Page', () => {
   const props = { idGroup: 1 };
   let globalContextMock;
   let informationMock;
   let pushMock = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         user: mockUsers.EF,
         actions: { toggleLoading: jest.fn() },
         general: { UDI: '8.421934' },
      };

      informationMock = { status: 200, data: mockData };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      getInfoSolidary.mockResolvedValue(informationMock);
   });

   test('it should render initial show idGroup and button "Asignar solicitud" is disabled', async () => {
      const {
         queries: { getByRole, getByText },
      } = await renderPage(SolidaryPage, props);
      const btnContinue = getByRole('button', { name: /Continuar/i });
      expect(btnContinue).toBeInTheDocument();
      expect(btnContinue).toBeDisabled();

      const comboKind = getByRole('combobox', { name: 'Tipo de trámite' });
      expect(comboKind).toBeInTheDocument();
      expect(comboKind).toBeEnabled();

      const applicantName = getByText('SOLICITANTE 01');
      expect(applicantName).toBeInTheDocument();
      expect(applicantName).toHaveTextContent('SOLICITANTE 01');

      const obligatedInitial = getByText('Obligado Solidario 01');
      expect(obligatedInitial).toBeInTheDocument();
      expect(obligatedInitial).toHaveTextContent('Obligado Solidario 01');

      const inputSearch = getByRole('searchbox');
      expect(inputSearch).toBeInTheDocument();
      expect(inputSearch).toBeEnabled();
   });

   // describe('when amount requested is 0', () => {
   //    test('continue button is disabled', async () => {
   //       const {
   //          user,
   //          queries: { getByRole, getByLabelText },
   //       } = await renderPage(SolidaryPage, props);
   //
   //       const btnContinue = getByRole('button', { name: /Continuar/i });
   //       await user.selectOptions(getByRole('combobox', { name: 'Tipo de trámite' }), 'Nuevo Tramite');
   //       await user.type(getByLabelText('Monto de línea solicitado'), '0');
   //
   //       expect(btnContinue).toBeDisabled();
   //    });
   // });
   //
   // describe('when amount requested is greater then 15 million', () => {
   //    test('continue button is disabled', async () => {
   //       const {
   //          user,
   //          queries: { findByRole, getByRole, getByLabelText },
   //       } = await renderPage(SolidaryPage, { idGroup: 1 });
   //
   //       const continueBtn = await findByRole('button', { name: 'Continuar' });
   //       await user.selectOptions(getByRole('combobox', { name: 'Tipo de trámite' }), 'Nuevo Tramite');
   //       await user.type(getByLabelText('Monto de línea solicitado'), '20000000');
   //
   //       expect(continueBtn).toBeDisabled();
   //    });
   //
   //    test('an error message is displayed', async () => {
   //       const {
   //          user,
   //          queries: { findByRole, findByText, getByLabelText },
   //       } = await renderPage(SolidaryPage, { idGroup: 1 });
   //
   //       const procedureType = await findByRole('combobox', { name: 'Tipo de trámite' });
   //       await user.selectOptions(procedureType, 'Nuevo Tramite');
   //       await user.type(getByLabelText('Monto de línea solicitado'), '20000000');
   //
   //       const message = await findByText(/Sobrepasaste el límite de/);
   //       expect(message).toBeVisible();
   //    });
   // });
   //
   // describe('when amount requested is between 0 and 15 million', () => {
   //    test('continue button is enabled', async () => {
   //       const {
   //          user,
   //          queries: { findByRole, getByRole, getByLabelText },
   //       } = await renderPage(SolidaryPage, { idGroup: 1 });
   //
   //       const continueBtn = await findByRole('button', { name: 'Continuar' });
   //       await user.selectOptions(getByRole('combobox', { name: 'Tipo de trámite' }), 'Nuevo Tramite');
   //       await user.type(getByLabelText('Monto de línea solicitado'), '10000000');
   //       expect(continueBtn).toBeEnabled();
   //    });
   //
   //    test('a success message is displayed', async () => {
   //       const {
   //          user,
   //          queries: { findByRole, findByText, getByLabelText },
   //       } = await renderPage(SolidaryPage, { idGroup: 1 });
   //
   //       const procedureType = await findByRole('combobox', { name: 'Tipo de trámite' });
   //       await user.selectOptions(procedureType, 'Nuevo Tramite');
   //       await user.type(getByLabelText('Monto de línea solicitado'), '10000000');
   //
   //       const message = await findByText(/Estás solicitando/);
   //       expect(message).toBeVisible();
   //    });
   // });
   //
   // test('calls service to search for OS when typing enter on OS search box', async () => {
   //    const {
   //       user,
   //       queries: { findByRole },
   //    } = await renderPage(SolidaryPage, { idGroup: 1 });
   //
   //    const searchInput = await findByRole('searchbox');
   //    await user.type(searchInput, 'test search');
   //    await user.keyboard('{Enter}');
   //
   //    expect(getClientsByName).toHaveBeenCalledWith('test search', 'SHORT');
   // });
   //
   // test('adds an OS section when clicking on add OS button', async () => {
   //    const {
   //       user,
   //       queries: { findByRole, findByText },
   //    } = await renderPage(SolidaryPage, { idGroup: 1 });
   //
   //    const addBtn = await findByRole('button', { name: 'Agregar obligado solidario +' });
   //    await user.click(addBtn);
   //
   //    const secondOS = await findByText('Obligado Solidario 02');
   //    expect(secondOS).toBeVisible();
   // });
   //
   // test('hides add OS button when 10 OS sections has been added', async () => {
   //    const {
   //       user,
   //       queries: { findByRole, queryByRole },
   //    } = await renderPage(SolidaryPage, { idGroup: 1 });
   //
   //    for (let i = 0; i < 9; i++) {
   //       const addBtn = await findByRole('button', { name: 'Agregar obligado solidario +' });
   //       await user.click(addBtn);
   //    }
   //
   //    expect(queryByRole('button', { name: 'Agregar obligado solidario +' })).toBeNull();
   // });
   //
   // test('deletes OS section when clicking the X button', async () => {
   //    const {
   //       user,
   //       queries: { findByRole, findAllByRole, queryByText },
   //    } = await renderPage(SolidaryPage, { idGroup: 1 });
   //
   //    const addBtn = await findByRole('button', { name: 'Agregar obligado solidario +' });
   //    await user.click(addBtn);
   //
   //    const [, deleteBtn] = await findAllByRole('button', { name: 'close' });
   //    await user.click(deleteBtn);
   //
   //    expect(queryByText('Obligado Solidario 02')).toBeNull();
   // });
});
