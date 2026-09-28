import { within } from '@testing-library/react';

import ObligatedsView from '../../../components/PropertyVerification/ObligatedsView';
import { useDivMeasure, useGlobalContext } from '../../../hooks';

jest.mock('../../../hooks', () => ({ __esModule: true, useDivMeasure: jest.fn(), useGlobalContext: jest.fn() }));

const mockObligatedOne = {
   idClient: '578',
   idCatTypePerson: 2,
   fullName: 'TEST OBLIGATED ONE',
   properties: [],
   resumeInd: {
      idResume: 544,
      totalAreaDimension: 0,
      totalBuildArea: 0,
      totalCustomerValue: 0,
      resumeEnum: 'INDIVIDUAL_O',
      resume: {
         libres: {
            valor: 0,
            numero: 0,
         },
         gravados: {
            valor: 0,
            numero: 0,
         },
         inmuebles: {
            valor: 0,
            numero: 0,
         },
         embargados: {
            valor: 0,
            numero: 0,
         },
         pendientes: {
            valor: 0,
            numero: 0,
         },
         escrituracion: {
            valor: 0,
            numero: 0,
         },
      },
      creditRisk: null,
      coverageRatio: null,
   },
};

const mockObligatedTwo = {
   idClient: '300000',
   idCatTypePerson: 2,
   fullName: 'TEST OBLIGATED TWO',
   properties: [
      {
         idRelOwnership: 254,
         formFoil: '13232131',
         numberOwnership: 1,
         currency: null,
         customerValue: 3123123,
         landUnit: null,
         propertyType: null,
         buildArea: null,
         areaDimension: null,
         location: null,
         idCheckOwnership: null,
         validation: false,
         comments: null,
      },
      {
         idRelOwnership: 255,
         formFoil: '32131',
         numberOwnership: 2,
         currency: null,
         customerValue: 32323,
         landUnit: null,
         propertyType: null,
         buildArea: null,
         areaDimension: null,
         location: null,
         idCheckOwnership: null,
         validation: false,
         comments: null,
      },
   ],
   resumeInd: {
      idResume: null,
      totalAreaDimension: null,
      totalBuildArea: null,
      totalCustomerValue: null,
      resumeEnum: 'INDIVIDUAL_O',
      resume: {
         libres: {
            valor: 0,
            numero: 0,
         },
         gravados: {
            valor: 0,
            numero: 0,
         },
         inmuebles: {
            valor: 0,
            numero: 0,
         },
         embargados: {
            valor: 0,
            numero: 0,
         },
         pendientes: {
            valor: 0,
            numero: 0,
         },
         escrituracion: {
            valor: 0,
            numero: 0,
         },
      },
      creditRisk: null,
      coverageRatio: null,
   },
};

describe('ObligatedsView Component', () => {
   const mockOnUpdateData = jest.fn();
   const props = { isNotEditable: false, onUpdateData: mockOnUpdateData };
   const toggleVerificationMock = jest.fn();
   let globalContextMock;

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         actions: {
            toggleVerification: toggleVerificationMock,
         },
      };
      useGlobalContext.mockReturnValue(globalContextMock);
      useDivMeasure.mockReturnValue([null, { width: 800, height: 670 }]);
   });

   test('Al no haber obligados se renderiza la leyenda "Esta solicitud no tiene obligados solidarios que mostrar"', async () => {
      const {
         queries: { getByText },
      } = await renderPage(ObligatedsView, { props, info: [] });
      expect(getByText('Esta solicitud no tiene obligados solidarios que mostrar')).toBeVisible();
   });

   test('Al ser solo un obligado debe mostrar el nombre del obligado', async () => {
      const {
         queries: { getByTestId },
      } = await renderPage(ObligatedsView, { ...props, info: [mockObligatedOne] });
      const obligated = getByTestId('Obligated-' + mockObligatedOne.idClient);
      expect(obligated).toBeVisible();
      expect(obligated).toHaveTextContent(mockObligatedOne.fullName);
      expect(obligated).toHaveClass('bg-black');
   });

   test('Al ser más de un obligado se debe mostrar un combobox con el nombre de cada obligado', async () => {
      const {
         queries: { getByTestId, getByRole },
      } = await renderPage(ObligatedsView, { ...props, info: [mockObligatedOne, mockObligatedTwo] });
      const combo = getByTestId('obligateds-select');
      expect(combo).toBeInTheDocument();
      expect(combo.value).toBe('0');

      //* Debe estar seleccionado por default el primer obligado solidario
      const selectedOption = getByRole('option', { name: mockObligatedOne.fullName });
      expect(selectedOption.selected).toBe(true);

      //* Debe tener todos los obligados correspondientes de la lista.
      const options = within(combo).getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent(mockObligatedOne.fullName);
      expect(options[1]).toHaveTextContent(mockObligatedTwo.fullName);
   });

   test('Al cambiar de obligado solidario se deben cargar la información del otro', async () => {
      const {
         queries: { getByTestId, getByText },
         user,
      } = await renderPage(ObligatedsView, { ...props, info: [mockObligatedOne, mockObligatedTwo] });
      const selectObligated = getByTestId('obligateds-select');
      expect(getByText('Propiedad 01')).toBeVisible();

      //* Cambiamos al segundo obligado
      await user.selectOptions(selectObligated, ['1']);

      expect(getByText('Propiedad 01')).toBeVisible();
      expect(getByText('Propiedad 02')).toBeVisible();
   });
});
