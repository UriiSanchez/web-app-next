import { fireEvent } from '@testing-library/react';

import { CoverageProfileView } from '../../../components/PCD';

const mockCustomerProfile = {
   calculatorType: {
      isType: '',
      data: [],
   },
   customerImports: {
      isType: '',
      whatPercentage: '',
      fromWhere: '',
      currencyHedgingPolicy: '',
      foreignCurrencyInputs: '',
   },
   customerExports: {
      isType: '',
      whatPercentage: '',
      toWhere: '',
      currencyHedgingPolicy: '',
      foreignCurrencyDomesticSales: '',
   },
   descriptionOfStrategy: '',
   customerHasExperience: {
      isType: '',
      data: [],
   },
};

const mockCustomerProfileComplete = {
   calculatorType: {
      data: [
         {
            rateType: 'variableRate',
            porcentage: '10',
         },
      ],
      isType: 'rate',
   },
   customerExports: {
      isType: 'Si',
      toWhere: 'EU',
      whatPercentage: '10',
      currencyHedgingPolicy: '15',
   },
   customerImports: {
      isType: 'Si',
      fromWhere: 'EU',
      whatPercentage: '9',
      currencyHedgingPolicy: '13',
   },
   customerHasExperience: {
      data: [],
      isType: 'No',
   },
   descriptionOfStrategy: 'información',
};

describe('CoverageProfileView component', () => {
   let mockOnUpdateData;

   beforeEach(() => {
      jest.clearAllMocks();
      mockOnUpdateData = jest.fn();
   });

   test('renders correctly with initial state and radio buttons', async () => {
      const {
         queries: { getByLabelText, getAllByRole, getByPlaceholderText },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isSave: false,
         isComplete: false,
      });

      const radioYES = getAllByRole('radio', { name: 'Sí' });
      const radioNot = getAllByRole('radio', { name: 'No' });
      const textarea = getByPlaceholderText('Escribe aquí la estrategia...');

      expect(getByLabelText('Tasa')).toBeInTheDocument();
      expect(getByLabelText('Tipo de cambio')).toBeInTheDocument();
      expect(radioYES).toHaveLength(3);
      expect(radioNot).toHaveLength(3);
      expect(textarea).toBeInTheDocument();
   });

   test('Selects "Tasa" and updates info, showing CardGenericContainer for rate', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: false,
      });
      const radioBtn = getByRole('radio', { name: 'Tasa' });
      await user.click(radioBtn);

      const updateInfo = {
         ...mockCustomerProfile,
         calculatorType: {
            isType: 'rate',
            data: [],
         },
      };

      expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));

      const result = await renderPage(CoverageProfileView, {
         info: updateInfo,
         isDisabled: false,
         onUpdateData: mockOnUpdateData,
         isSave: true,
         isComplete: false,
      });

      expect(result.queries.getByText('Tasa 01')).toBeVisible();
      expect(result.queries.getByText('Modalidad de cobertura de tasa')).toBeVisible();
   });

   // test('it enables add (+) and delete (x) buttons when filling one of the card fields for question 1', async () => {
   //    const mockTypeRate = {
   //       ...mockCustomerProfile,
   //       calculatorType: {
   //          isType: 'rate',
   //          data: [],
   //       },
   //    };
   //
   //    const {
   //       user,
   //       queries: { getByText, getByRole },
   //    } = await renderPage(CoverageProfileView, { info: mockTypeRate, onUpdateData: mockOnUpdateData, isDisabled: false });
   //
   //    const comboRate = getByRole('combobox', { name: 'Fuente de información' });
   //    expect(getByText('Tasa 01')).toBeInTheDocument();
   //    expect(getByText('Fuente de información')).toBeInTheDocument();
   //    // Se valida que combo se encuentre y este habilitado
   //    expect(comboRate).toBeInTheDocument();
   //    expect(comboRate).toBeEnabled();
   //
   //    //Se selecciona la opción Tasa variable
   //    await user.selectOptions(comboRate, ['Tasa variable']);
   //    const updateInfo = {
   //       ...mockCustomerProfile,
   //       calculatorType: {
   //          isType: 'rate',
   //          data: [
   //             {
   //                rateType: 'variableRate',
   //             },
   //          ],
   //       },
   //    };
   //
   //    expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
   //    expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));
   //
   //    const result = await renderPage(CoverageProfileView, { info: updateInfo, isDisabled: false, onUpdateData: mockOnUpdateData });
   //    expect(result.queries.getByRole('button', { name: 'add_circle' })).toBeEnabled();
   // });

   test('Selects "Tipo de cambio" and updates info, showing CardGenericContainer for typechange', async () => {
      const {
         user,
         queries: { getByRole },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: false,
      });
      const radioBtn = getByRole('radio', { name: 'Tipo de cambio' });
      await user.click(radioBtn);

      const updateInfo = {
         ...mockCustomerProfile,
         calculatorType: {
            isType: 'typechange',
            data: [],
         },
      };

      expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));

      const result = await renderPage(CoverageProfileView, {
         info: updateInfo,
         isDisabled: false,
         onUpdateData: mockOnUpdateData,
         isSave: true,
         isComplete: false,
      });

      expect(result.queries.getByText('Cruce 01')).toBeVisible();
      expect(result.queries.getByText('Tipo de subyacente: Cruces de divisas a operar')).toBeVisible();
   });

   test('Selects "Sí" for customersImports and show percentage and fromWhere inputs', async () => {
      const {
         user,
         queries: { getByLabelText },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: false,
      });
      await user.click(getByLabelText('Sí', { selector: '#imports-0' }));

      const updateInfo = { ...mockCustomerProfile };
      updateInfo.customerImports.isType = 'Si';

      expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));

      const result = await renderPage(CoverageProfileView, {
         info: updateInfo,
         isDisabled: false,
         onUpdateData: mockOnUpdateData,
         isSave: true,
         isComplete: false,
      });

      expect(result.queries.getByText('¿Qué porcentaje?')).toBeInTheDocument();
      expect(result.queries.getByTestId('import-whatPercentage')).toBeInTheDocument();
      expect(result.queries.getByText('De dónde:')).toBeInTheDocument();
      expect(result.queries.getByPlaceholderText('Escribe el lugar')).toBeInTheDocument();
      expect(result.queries.getByText('Política de cobertura de divisas:')).toBeInTheDocument();
      expect(result.queries.getByTestId('import-currencyHedgingPolicy')).toBeInTheDocument();
   });

   test('Selects "No" for customersImports and show percentage and fromWhere inputs', async () => {
      const {
         user,
         queries: { getByLabelText },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: false,
      });
      await user.click(getByLabelText('No', { selector: '#imports-1' }));

      const updateInfo = { ...mockCustomerProfile };
      updateInfo.customerImports.isType = 'No';

      expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));

      const result = await renderPage(CoverageProfileView, {
         info: updateInfo,
         isDisabled: false,
         onUpdateData: mockOnUpdateData,
         isSave: true,
         isComplete: false,
      });

      expect(result.queries.getByText('Insumos en moneda extranjera:')).toBeInTheDocument();
      expect(result.queries.getByTestId('import-foreignCurrency')).toBeInTheDocument();
   });

   test('Selects "Sí" for customersExports and show percentage and fromWhere inputs', async () => {
      const {
         user,
         queries: { getByLabelText },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: false,
      });
      await user.click(getByLabelText('Sí', { selector: '#exports-0' }));

      const updateInfo = { ...mockCustomerProfile };
      updateInfo.customerExports.isType = 'Si';

      expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));

      const result = await renderPage(CoverageProfileView, {
         info: updateInfo,
         isDisabled: false,
         onUpdateData: mockOnUpdateData,
         isSave: true,
         isComplete: false,
      });

      expect(result.queries.getByText('¿Qué porcentaje?')).toBeInTheDocument();
      expect(result.queries.getByTestId('exports-whatPercentage')).toBeInTheDocument();
      expect(result.queries.getByText('A dónde:')).toBeInTheDocument();
      expect(result.queries.getByPlaceholderText('Escribe el lugar')).toBeInTheDocument();
   });

   test('Selects "No" for customersExports and show policy and foreignCurrencyDomesticSales inputs', async () => {
      const {
         user,
         queries: { getByLabelText },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: false,
      });
      await user.click(getByLabelText('No', { selector: '#exports-1' }));

      const updateInfo = { ...mockCustomerProfile };
      updateInfo.customerExports.isType = 'No';

      expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));

      const result = await renderPage(CoverageProfileView, {
         info: updateInfo,
         isDisabled: false,
         onUpdateData: mockOnUpdateData,
         isSave: true,
         isComplete: false,
      });

      expect(result.queries.getByText('Ventas nacionales en moneda extranjera:')).toBeInTheDocument();
      expect(result.queries.getByTestId('export-foreignCurrency')).toBeInTheDocument();
   });

   test('update comment when text is entered into the textarea', async () => {
      const {
         queries: { getByPlaceholderText },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: false,
      });
      const textarea = getByPlaceholderText('Escribe aquí la estrategia...');
      const newtext = 'Esta es una Unit Testing';
      fireEvent.change(textarea, { target: { name: 'descriptionOfStrategy', value: newtext } });
      const updateInfo = { ...mockCustomerProfile };
      updateInfo.descriptionOfStrategy = newtext;
      expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));
   });

   test('Selects "Sí" for customerHasExperience and show CardExperienceItem', async () => {
      const {
         user,
         queries: { getByLabelText },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfile,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: false,
      });
      await user.click(getByLabelText('Sí', { selector: '#experience-0' }));

      const updateInfo = { ...mockCustomerProfile };
      updateInfo.customerHasExperience.isType = 'Si';

      expect(mockOnUpdateData).toHaveBeenCalledTimes(1);
      expect(mockOnUpdateData).toHaveBeenCalledWith('coverageProfile', expect.objectContaining(updateInfo));

      const result = await renderPage(CoverageProfileView, {
         info: updateInfo,
         isDisabled: false,
         onUpdateData: mockOnUpdateData,
         isSave: true,
         isComplete: false,
      });
      expect(
         result.queries.getByText('Instituciones financieras con las que opera el cliente. (máx. 5 instituciones)')
      ).toBeInTheDocument();
      expect(result.queries.getByText('Institución Financiera 01')).toBeInTheDocument();
   });

   test('If the information is complete even if it has not been saved, the inputs must have the class "input.form" or "option-form"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfileComplete,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: false,
         isComplete: true,
      });

      expect(getByTestId('rate')).toHaveClass('option-input');
      expect(getByTestId('typechange')).toHaveClass('option-input');
      expect(getByTestId('fromWhere')).toHaveClass('input-form');
      expect(getByTestId('toWhere')).toHaveClass('input-form');
      expect(getByTestId('descriptionOfStrategy')).toHaveClass('input-form');
   });

   test('If the information is incomplete, the inputs with "mandatory" class and the alert at the top of the page are displayed', async () => {
      const updateInfo = { ...mockCustomerProfile };
      updateInfo.customerImports.isType = 'Si';
      updateInfo.customerExports.isType = 'Si';
      const {
         queries: { getByTestId, getByText, getByAltText },
      } = await renderPage(CoverageProfileView, {
         info: updateInfo,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: true,
         isComplete: false,
      });

      expect(getByAltText('Información del completado de los campos de la sección')).toBeInTheDocument;
      expect(getByText('campos obligatorios')).toBeInTheDocument();

      expect(getByTestId('rate')).toHaveClass('mandatory');
      expect(getByTestId('typechange')).toHaveClass('mandatory');

      expect(getByTestId('fromWhere')).toHaveClass('mandatory');
      expect(getByTestId('toWhere')).toHaveClass('mandatory');
      expect(getByTestId('descriptionOfStrategy')).toHaveClass('mandatory');
   });

   test('If the information is complete and something has already been saved, the inputs must be "input.form" or "option-form"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfileComplete,
         onUpdateData: mockOnUpdateData,
         isDisabled: false,
         isSave: true,
         isComplete: true,
      });

      expect(getByTestId('rate')).toHaveClass('option-input');
      expect(getByTestId('typechange')).toHaveClass('option-input');
      expect(getByTestId('fromWhere')).toHaveClass('input-form');
      expect(getByTestId('toWhere')).toHaveClass('input-form');
      expect(getByTestId('descriptionOfStrategy')).toHaveClass('input-form');
   });

   test('If the page is disabled the input class must be "disabled"', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(CoverageProfileView, {
         info: mockCustomerProfileComplete,
         onUpdateData: mockOnUpdateData,
         isDisabled: true,
         isSave: true,
         isComplete: true,
      });

      expect(getByTestId('fromWhere')).toHaveClass('disabled');
      expect(getByTestId('toWhere')).toHaveClass('disabled');
      expect(getByTestId('descriptionOfStrategy')).toHaveClass('disabled');
   });
});
