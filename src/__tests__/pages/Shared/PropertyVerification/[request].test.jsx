import { fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import PropertyVerification from '../../../../pages/Shared/PropertyVerification/[request]';
import { getPropertyFormat, savePropertyFormat } from '../../../../services';
import { useDivMeasure, useGlobalContext } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';
import { initConstants } from '../../../../helpers';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({
   __esModule: true,
   getPropertyFormat: jest.fn(),
   savePropertyFormat: jest.fn(),
}));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useDivMeasure: jest.fn()
}));

const mockPropertiesInitial = {
   applicant: {
      idClient: '161300',
      idCatTypePerson: 1,
      fullName: 'TEST S.A. DE C.V.',
      properties: [],
      resumeInd: {
         idResume: null,
         totalAreaDimension: null,
         totalBuildArea: null,
         totalCustomerValue: null,
         resumeEnum: 'INDIVIDUAL_A',
         resume: null,
         creditRisk: null,
         coverageRatio: null,
      },
   },
   obligedList: [],
   resumeGeneral: {
      idResume: null,
      totalAreaDimension: null,
      totalBuildArea: null,
      totalCustomerValue: null,
      resumeEnum: 'GENERAL_EMG',
      resume: null,
      creditRisk: 4000000,
      coverageRatio: null,
   },
   propertiesFormat: {
      idPropertiesFormat: 520,
      idCatStatus: 15,
      idRequest: 520,
      uniqueFolio: null,
      result: null,
      verificationDate: null,
      description: null,
      genericFolio: null,
      createDate: '2025-08-20T11:45:55',
      modifyDate: '26-08-2025',
      hasVerification: true,
      typeVerification: 'SOCIETY',
      pendingVerification: true,
   },
   idCatStatusGroup: 1,
};

const mockItemVerification = {
   open: false,
   item: {
      catTypePerson: 0,
      check: false,
      checkDate: '',
      checkNumber: 0,
      currency: 'MXN',
      description: '',
      idCheckOwnership: null,
      idRelOwnership: null,
      otherName1: '',
      otherName2: '',
      otherName3: '',
      otherName4: '',
      ownerName: '',
      ownershipStatus: '',
      ownershipValue: '',
      ownerType: '',
      typeValue: '',
   },
};

describe('PropertyVerification', () => {
   const props = { idRequest: 1, idGroup: '1', origin: 'Documentation' };
   const toggleVerificationMock = jest.fn();
   const mockActions = {
      toggleLoading: jest.fn(),
      toggleReloading: jest.fn(),
      toggleVerification: toggleVerificationMock,
      setStepper: jest.fn(),
   };
   let pushMock = jest.fn();
   let globalContextMock;

   beforeEach(() => {
      jest.clearAllMocks();
      useRouter.mockReturnValue({ push: pushMock });
      getPropertyFormat.mockResolvedValue({ status: 200, data: mockPropertiesInitial });
      savePropertyFormat.mockResolvedValue({ status: 200 });

      useDivMeasure.mockReturnValue([null, { width: 800, height: 670 }]);
      // useLockBodyScroll.mockImplementation(() => ({}));
   });

   afterEach(() => {
      jest.restoreAllMocks();
   });

   describe('All redirects within the screen Property Verification', () => {
      beforeEach(() => {
         globalContextMock = {
            user: mockUsers.EF,
            verifyProperty: { open: false, item: mockItemVerification },
            isReloading: false,
            actions: mockActions,
         };
         useGlobalContext.mockReturnValue(globalContextMock);
      });

      test('it should render initial show "Inmuebles de Solicitante" and show buttons "Regresar" and "Continuar"', async () => {
         const {
            queries: { getByRole },
         } = await renderPage(PropertyVerification, props);

         expect(getByRole('heading', { name: /Inmuebles de Solicitante/i, level: 2 })).toBeInTheDocument();

         const btnSaved = getByRole('button', { name: /Guardar/i });
         expect(btnSaved).toBeInTheDocument();

         const btnReturn = getByRole('button', { name: /Regresar/i });
         expect(btnReturn).toBeInTheDocument();
         expect(btnReturn).toBeEnabled();

         const btnNext = getByRole('button', { name: /Continuar/i });
         expect(btnNext).toBeInTheDocument();
         expect(btnNext).toBeEnabled();
      });

      test('it should navigate to "Inmuebles de Obligado Solidario" screen when "Continuar" button is clicked', async () => {
         const {
            queries: { getByRole, getByText },
            waitFor,
         } = await renderPage(PropertyVerification, props);

         const btnNext = getByRole('button', { name: /Continuar/i });

         fireEvent.click(btnNext);
         await waitFor(() => {
            expect(getByText(initConstants.title['2'])).toBeInTheDocument();
         });
      });

      test('it should navigate to "Resumen general de inmuebles" screen when "Continuar" button is clicked', async () => {
         const {
            queries: { getByRole, getByText },
            waitFor,
         } = await renderPage(PropertyVerification, props);

         const btnNext = getByRole('button', { name: /Continuar/i });

         fireEvent.click(btnNext);
         fireEvent.click(btnNext);
         await waitFor(() => {
            expect(getByText(initConstants.title['3'])).toBeInTheDocument();
         });
      });

      test('it should navigate to "Verificación de sociedad" screen when "Continuar" button is clicked', async () => {
         const {
            queries: { getByRole, getByText },
            waitFor,
         } = await renderPage(PropertyVerification, props);

         const btnNext = getByRole('button', { name: /Continuar/i });

         fireEvent.click(btnNext);
         fireEvent.click(btnNext);
         fireEvent.click(btnNext);
         await waitFor(() => {
            expect(getByText(initConstants.title['4'])).toBeInTheDocument();
         });
      });

      test('Return to the "Documentation" screen when the prop origin is "Documentation" by clicking the back button.', async () => {
         const {
            queries: { getByRole },
            user,
         } = await renderPage(PropertyVerification, props);

         const btnReturn = getByRole('button', { name: /Regresar/i });
         await user.click(btnReturn);
         expect(pushMock).toHaveBeenCalledWith('/EMG/Documentation/' + props.idGroup);
      });

      test('Return to the "History" screen when the prop origin is "Shared" by clicking the back button.', async () => {
         const {
            queries: { getByRole },
            user,
         } = await renderPage(PropertyVerification, { ...props, origin: 'History' });

         const btnReturn = getByRole('button', { name: /Regresar/i });
         await user.click(btnReturn);
         expect(pushMock).toHaveBeenCalledWith('/Shared/History/' + props.idGroup);
      });
   });

   describe('Profile Especialista de Financiamiento', () => {
      beforeEach(() => {
         globalContextMock = {
            user: mockUsers.EF,
            verifyProperty: { open: false, item: mockItemVerification },
            isReloading: false,
            actions: mockActions,
         };
         useGlobalContext.mockReturnValue(globalContextMock);
      });

      test('it should render initial show and button "Guardar" is disabled', async () => {
         const {
            queries: { getByText, getByRole, getByTestId, getAllByRole },
         } = await renderPage(PropertyVerification, props);

         const btnSaved = getByRole('button', { name: /Guardar/i });
         expect(btnSaved).toBeInTheDocument();

         const dateCreation = getByTestId('fecha-elaboracion');
         expect(dateCreation).toBeInTheDocument();
         expect(dateCreation).toHaveTextContent('26-08-2025');

         expect(getByText('Propiedad 01')).toBeInTheDocument();

         const btnVerification = getAllByRole('button', { name: /verificación/i })[0];
         expect(btnVerification).toBeInTheDocument();
         expect(btnVerification).toBeDisabled();

         const btnAdd = getAllByRole('button', { name: /add_circle/i })[0];
         expect(btnAdd).toBeInTheDocument();
         expect(btnAdd).toBeDisabled();
      });

      test('It is verified that the user can use the "continue" and "return" buttons', async () => {
         const {
            queries: { getByRole, getByText },
            waitFor,
         } = await renderPage(PropertyVerification, props);

         fireEvent.click(getByRole('button', { name: /Continuar/i }));
         await waitFor(() => {
            expect(getByText(initConstants.title['2'])).toBeInTheDocument();
         });

         fireEvent.click(getByRole('button', { name: /Regresar/i }));
         await waitFor(() => {
            expect(getByText(initConstants.title['1'])).toBeInTheDocument();
         });
      });

      test('it should enable save button when a change is made and check saved', async () => {
         const {
            user,
            queries: { getByLabelText, getByRole },
            waitFor,
         } = await renderPage(PropertyVerification, props);
         const btnSaved = getByRole('button', { name: /Guardar/i });
         await user.type(getByLabelText('Folio del formulario'), '1');

         expect(btnSaved).toBeEnabled();

         // Simular el guardado
         savePropertyFormat.mockResolvedValue({ status: 200 });
         user.click(btnSaved);
         await waitFor(() => {
            expect(savePropertyFormat).toHaveBeenCalledTimes(1);
         });
      });

      test('it adds a property form when clicking the add (+) button', async () => {
         const {
            user,
            queries: { getByRole, getByText, getByLabelText },
         } = await renderPage(PropertyVerification, props);
         const addButton = getByRole('button', { name: 'add_circle' });
         await user.type(getByLabelText('Folio del formulario'), '1000');
         await user.click(addButton);

         expect(getByText('Propiedad 02')).toBeVisible();
      });

      test('it deletes the property form when clicking the delete (x) button when there is more than one property', async () => {
         const {
            user,
            queries: { getByRole, getByText, getByLabelText, getAllByRole, queryByText },
         } = await renderPage(PropertyVerification, props);
         const addButton = getByRole('button', { name: 'add_circle' });

         await user.type(getByLabelText('Folio del formulario'), '1000');
         await user.click(addButton);

         expect(getByText('Propiedad 02')).toBeVisible();

         await user.click(getAllByRole('button', { name: 'close' })[1]);
         expect(queryByText('Propiedad 02')).toBeNull();
      });

      test('it clears the property form when clicking the delete (x) button when there is only one property full', async () => {
         const {
            user,
            queries: { getByLabelText, getByRole },
         } = await renderPage(PropertyVerification, props);

         const locationInput = getByLabelText('Ubicación');
         await user.type(locationInput, 'test location');

         const deleteButton = getByRole('button', { name: 'close' });
         await user.click(deleteButton);

         expect(locationInput.value).toBe('');
      });

      test('it enables verification button when property has been saved', async () => {
         mockPropertiesInitial.applicant.properties[0] = { idRelOwnership: 1 };
         getPropertyFormat.mockResolvedValue({ status: 200, data: mockPropertiesInitial });

         const {
            queries: { getByRole },
         } = await renderPage(PropertyVerification, props);

         expect(getByRole('button', { name: 'verificación open_in_new' })).toBeEnabled();
      });

      test('it calls toggleVerification action when clicking the verification button', async () => {
         mockPropertiesInitial.applicant.properties[0] = { idRelOwnership: 1 };
         getPropertyFormat.mockResolvedValue({ status: 200, data: mockPropertiesInitial });

         const {
            user,
            queries: { getByRole },
         } = await renderPage(PropertyVerification, props);

         const verificationButton = getByRole('button', { name: 'verificación open_in_new' });
         await user.click(verificationButton);

         expect(toggleVerificationMock).toHaveBeenCalled();
      });

      test('it shows verification modal when verification open flag is true', async () => {
         globalContextMock.verifyProperty = {
            open: true,
            item: {
               ...mockItemVerification.item,
               catTypePerson: 1,
               checkNumber: 1,
            },
         };
         useGlobalContext.mockReturnValueOnce(globalContextMock);

         const {
            queries: { getByText },
         } = await renderPage(PropertyVerification, props);

         expect(getByText('Verificación 01')).toBeVisible();
      });

      test('it should close the verification modal without saving when clicking the close (x) button', async () => {
         globalContextMock.verifyProperty = {
            open: true,
            item: {
               ...mockItemVerification.item,
               catTypePerson: 1,
               checkNumber: 1,
            },
         };
         useGlobalContext.mockReturnValueOnce(globalContextMock);

         const {
            user,
            queries: { getByTestId },
         } = await renderPage(PropertyVerification, props);

         const closeButton = getByTestId('close-modal-verification');
         await user.click(closeButton);

         expect(toggleVerificationMock).toHaveBeenCalled();
      });

      test('it should close the modal and disable finish button when canceling the confirmation message for "Embargada" in partnership verification', async () => {
         const {
            user,
            queries: { getByRole, getByText, getAllByRole },
         } = await renderPage(PropertyVerification, props);

         for (let i = 0; i < 3; i++) {
            const nextButton = getByRole('button', { name: 'Continuar' });
            await user.click(nextButton);
         }

         const resultInput = getByRole('combobox', { name: 'Resultado' });
         await user.selectOptions(resultInput, ['embargada']);

         const returnButtons = getAllByRole('button', { name: 'Regresar' });
         await user.click(returnButtons[1]);

         expect(getByText('¡Sociedad embargada!')).not.toBeVisible();
         expect(getByRole('button', { name: 'Finalizado' })).toBeDisabled();
      });
   });

   describe('Profile Mesa Receptora', () => {
      beforeEach(() => {
         globalContextMock = {
            user: mockUsers.MR,
            verifyProperty: { open: false, item: mockItemVerification },
            isReloading: false,
            actions: mockActions,
         };
         useGlobalContext.mockReturnValue(globalContextMock);
      });

      test('it should have no editable inputs when profile is MR', async () => {
         const {
            queries: { queryAllByRole },
         } = await renderPage(PropertyVerification, props);

         const textInputs = queryAllByRole('textbox');
         const selectInputs = queryAllByRole('combobox');

         expect(textInputs.length).toBe(0);
         expect(selectInputs.length).toBe(0);
      });
   });

   describe('Profile Líder de Contraparte', () => {
      beforeEach(() => {
         mockPropertiesInitial.applicant.properties = [
            {
               idRelOwnership: 1,
               formFoil: '1',
               numberOwnership: 1,
               customerValue: 10000,
               landUnit: 'squareMeter',
               propertyType: 'roomHouse',
               buildArea: '80',
               areaDimension: '100',
               location: 'Test location',
               validation: false,
               idCheckOwnership: {
                  idCheckOwnership: 1,
                  checkNumber: 1,
                  checkDate: '2024-04-02',
                  ownerName: 'Test owner name',
                  ownershipStatus: 'gravado',
                  typeValue: 'appraisal',
                  currency: 'MXN',
                  ownershipValue: 3200000,
                  ownerType: 'APPLICANT',
               },
            },
         ];

         globalContextMock = {
            user: mockUsers.LDC,
            verifyProperty: { open: false, item: mockItemVerification },
            isReloading: false,
            actions: mockActions,
         };
         useGlobalContext.mockReturnValue(globalContextMock);
      });

      test('it should display additional input fields when clicking the expand button when profile is LDC', async () => {
         const {
            user,
            queries: { getByText, getByLabelText },
         } = await renderPage(PropertyVerification, props);

         await user.click(getByText('keyboard_double_arrow_right'));

         expect(getByLabelText('Comentarios')).toBeVisible();
      });

      test('it should hide the additional fields when clicking the shrink button', async () => {
         const {
            user,
            queries: { getByText, queryByLabelText },
         } = await renderPage(PropertyVerification, props);

         await user.click(getByText('keyboard_double_arrow_right'));
         await user.click(getByText('keyboard_double_arrow_left'));

         expect(queryByLabelText('Comentarios')).toBeNull();
      });
   });
});
