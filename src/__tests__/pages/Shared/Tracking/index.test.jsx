import { within } from '@testing-library/react';
import { useRouter } from 'next/router';

import TrackingPage from '../../../../pages/Shared/Tracking';
import { getTrackingGraph } from '../../../../services';
import { useDetectClickOutside, useGlobalContext, useSortData } from '../../../../hooks';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../../services', () => ({ __esModule: true, getTrackingGraph: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useDetectClickOutside: jest.fn(),
   useSortData: jest.fn(),
}));

const mockData = [
   {
      idGroup: 81,
      groupName: 'INDUSTRIALIZADORA INTEGRAL DEL AGAVE S A P I DE CV',
      requestPerGroup: 1,
      branchOffice: 'LOMAS',
      arrivedMrDate: null,
      quorumReachedDate: null,
      requestAmount: null,
      authorizationAmount: null,
      substatus: 'Cancelada',
      statusName: 'Cancelado',
      totalTime: '0 hrs',
      totalPages: 1,
      userCreate: 'userONE',
      idAnalyst: null,
      requestResponseList: [
         {
            idRequest: 107,
            idGroupRequest: 81,
            idCatStatus: 23,
            kindProcedure: null,
            relatedPersonResponseList: [
               {
                  idClient: '18649',
                  fullName: 'INDUSTRIALIZADORA INTEGRAL DEL AGAVE S A P I DE CV',
                  idRequest: 107,
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: 82,
      groupName: 'INNOVATIVE DEL NORTE S.A. DE C.V.',
      requestPerGroup: 1,
      branchOffice: 'LOMAS',
      arrivedMrDate: null,
      quorumReachedDate: null,
      requestAmount: 2000000,
      authorizationAmount: null,
      substatus: 'Cancelada',
      statusName: 'Cancelado',
      totalTime: '0 hrs',
      totalPages: 1,
      userCreate: 'userONE',
      idAnalyst: null,
      requestResponseList: [
         {
            idRequest: 108,
            idGroupRequest: 82,
            idCatStatus: 23,
            kindProcedure: 'Nuevo Tramite',
            relatedPersonResponseList: [
               {
                  idClient: '785300',
                  fullName: 'INNOVATIVE DEL NORTE S.A. DE C.V.',
                  idRequest: 108,
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: 83,
      groupName: 'INNOVATIVE DEL NORTE S.A. DE C.V.',
      requestPerGroup: 1,
      branchOffice: 'LOMAS',
      arrivedMrDate: '2025-06-13T11:35:35',
      quorumReachedDate: null,
      requestAmount: 3200000,
      authorizationAmount: null,
      substatus: 'Cancelada',
      statusName: 'Cancelado',
      totalTime: '0 hrs',
      totalPages: 1,
      userCreate: 'userTWO',
      idAnalyst: 'userONE',
      requestResponseList: [
         {
            idRequest: 109,
            idGroupRequest: 83,
            idCatStatus: 23,
            kindProcedure: 'Nuevo Tramite',
            relatedPersonResponseList: [
               {
                  idClient: '785300',
                  fullName: 'INNOVATIVE DEL NORTE S.A. DE C.V.',
                  idRequest: 109,
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: 84,
      groupName: 'BEMIS DE MEXICO S.A. DE C.V.',
      requestPerGroup: 1,
      branchOffice: 'LOMAS',
      arrivedMrDate: null,
      quorumReachedDate: null,
      requestAmount: 12333333,
      authorizationAmount: null,
      substatus: 'Cancelada',
      statusName: 'Cancelado',
      totalTime: '0 hrs',
      totalPages: 1,
      userCreate: 'userTWO',
      idAnalyst: 'userONE',
      requestResponseList: [
         {
            idRequest: 110,
            idGroupRequest: 84,
            idCatStatus: 23,
            kindProcedure: 'Nuevo Tramite',
            relatedPersonResponseList: [
               {
                  idClient: '260700',
                  fullName: 'BEMIS DE MEXICO S.A. DE C.V.',
                  idRequest: 110,
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: 85,
      groupName: 'BEMIS DE MEXICO S.A. DE C.V.',
      requestPerGroup: 1,
      branchOffice: 'LOMAS',
      arrivedMrDate: null,
      quorumReachedDate: null,
      requestAmount: 2000000,
      authorizationAmount: null,
      substatus: 'Cancelada',
      statusName: 'Cancelado',
      totalTime: '0 hrs',
      totalPages: 1,
      userCreate: 'userTHREE',
      idAnalyst: null,
      requestResponseList: [
         {
            idRequest: 111,
            idGroupRequest: 85,
            idCatStatus: 23,
            kindProcedure: 'Nuevo Tramite',
            relatedPersonResponseList: [
               {
                  idClient: '260700',
                  fullName: 'BEMIS DE MEXICO S.A. DE C.V.',
                  idRequest: 111,
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: 86,
      groupName: 'BEMIS DE MEXICO S.A. DE C.V.',
      requestPerGroup: 1,
      branchOffice: 'LOMAS',
      arrivedMrDate: '2025-06-13T11:41:09',
      quorumReachedDate: null,
      requestAmount: 34000,
      authorizationAmount: null,
      substatus: 'En análisis de contraparte',
      statusName: 'En proceso',
      totalTime: '0 hrs',
      totalPages: 1,
      userCreate: 'userTWO',
      idAnalyst: 'userONE',
      requestResponseList: [
         {
            idRequest: 112,
            idGroupRequest: 86,
            idCatStatus: 4,
            kindProcedure: 'Nuevo Tramite',
            relatedPersonResponseList: [
               {
                  idClient: '260700',
                  fullName: 'BEMIS DE MEXICO S.A. DE C.V.',
                  idRequest: 112,
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: 89,
      groupName: 'INDUSTRIALIZADORA INTEGRAL DEL AGAVE S A P I DE CV',
      requestPerGroup: 1,
      branchOffice: 'LOMAS',
      arrivedMrDate: null,
      quorumReachedDate: null,
      requestAmount: 2500000,
      authorizationAmount: null,
      substatus: 'Cancelada',
      statusName: 'Cancelado',
      totalTime: '0 hrs',
      totalPages: 1,
      userCreate: 'userTWO',
      idAnalyst: null,
      requestResponseList: [
         {
            idRequest: 115,
            idGroupRequest: 89,
            idCatStatus: 23,
            kindProcedure: 'Nuevo Tramite',
            relatedPersonResponseList: [
               {
                  idClient: '18649',
                  fullName: 'INDUSTRIALIZADORA INTEGRAL DEL AGAVE S A P I DE CV',
                  idRequest: 115,
                  idCatTypePerson: 1,
               },
            ],
         },
      ],
   },
   {
      idGroup: 91,
      groupName: 'SSANDIER S.A. DE C.V.',
      requestPerGroup: 1,
      branchOffice: 'LOMAS',
      arrivedMrDate: null,
      quorumReachedDate: null,
      requestAmount: 3400000,
      authorizationAmount: null,
      substatus: 'Cancelada',
      statusName: 'Cancelado',
      totalTime: '0 hrs',
      totalPages: 1,
      userCreate: 'userONE',
      idAnalyst: null,
      requestResponseList: [
         {
            idRequest: 117,
            idGroupRequest: 91,
            idCatStatus: 23,
            kindProcedure: 'Nuevo Tramite',
            relatedPersonResponseList: [
               {
                  idClient: '16422',
                  fullName: 'SSANDIER S.A. DE C.V.',
                  idRequest: 117,
                  idCatTypePerson: 1,
               },
               {
                  idClient: '103',
                  fullName: 'EDGAR  COLLADO VILLALOBOS',
                  idRequest: 117,
                  idCatTypePerson: 2,
               },
            ],
         },
      ],
   },
];

describe('Tracking Page', () => {
   let pushMock = jest.fn();
   let globalContextMock;

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         user: mockUsers.MR,
         expandedRows: [],
         pagination: {
            currentPage: 1,
            totalPages: 1,
         },
         actions: { setExpandedRows: jest.fn(), setPagination: jest.fn() },
      };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      useDetectClickOutside.mockReturnValue(false);
      useSortData.mockReturnValue(mockData)
      getTrackingGraph.mockResolvedValue({ status: 200, data: [] });
   });

   test('the filters must be present and the download button blocked', async () => {
      const {
         queries: { getByRole, getByText },
      } = await renderPage(TrackingPage);

      const btnKindProcedure = getByRole('button', { name: /Trámite/i });
      const btnPeriod = getByRole('button', { name: /Periodo/i });
      const btnBranch = getByRole('button', { name: /Sucursal/i });
      const btnDonwload = getByRole('button', { name: /Descargar/i });
      const inputSearch = getByRole('searchbox');

      expect(btnKindProcedure).toBeInTheDocument();
      expect(btnPeriod).toBeInTheDocument();
      expect(btnBranch).toBeInTheDocument();
      expect(btnDonwload).toBeInTheDocument();
      expect(btnDonwload).toBeDisabled();
      expect(getByText('No se encontraron registros')).toBeInTheDocument();
      expect(inputSearch).toBeInTheDocument();
   });

   test('shows a row for each element in the data array', async () => {
      getTrackingGraph.mockResolvedValueOnce({ status: 200, data: mockData });

      const {
         queries: { queryAllByRole },
      } = await renderPage(TrackingPage);

      const [, tableBody] = queryAllByRole('rowgroup');
      expect(within(tableBody).queryAllByRole('row').length).toBe(1);
   });
});
