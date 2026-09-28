import { useRouter } from 'next/router';

import RequestReview from '../../../../pages/ADC/RequestsReview';
import { useGlobalContext, useSourcePagination } from '../../../../hooks';
import { getRequestStatus } from '../../../../services';
import { constPageProcessType } from '../../../../helpers/config';
import mockUsers from '../../../../__mocks__/users';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ __esModule: true, useSession: () => ({ data: {} }) }));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useSourcePagination: jest.fn(),
}));
jest.mock('../../../../services', () => ({ __esModule: true, getRequestStatus: jest.fn() }));

describe('RequestReview ADC Page', () => {
   let pushMock = jest.fn();
   let globalContextMock;

   beforeEach(() => {
      jest.clearAllMocks();

      globalContextMock = {
         user: mockUsers.ADC,
         loader: {},
         showPDF: {},
         stepper: {},
         actions: { setPagination: jest.fn(), setExpandedRows: jest.fn() },
         pagination: { currentPage: 1 },
         expandedRows: [],
      };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);

      useSourcePagination.mockReturnValue({
         sourcePage: 0,
         setTotalPages: jest.fn(),
      });

      getRequestStatus.mockResolvedValue({
         data: [
            {
               idGroup: 1,
               idCatStatus: 4,
               idCatTypeProcedure: constPageProcessType.GET_CHECKLIST,
               groupName: 'Test Name',
               requestResponseList: [],
            },
         ],
         status: 200,
      });
   });

   test('should redirect to documentation page of the request clicked', async () => {
      const { user, queries, waitFor } = await renderPage(RequestReview);

      await user.click(queries.getByRole('cell', { name: /Test Name/ }));

      await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/ADC/Documentation/1'));
   });
});
