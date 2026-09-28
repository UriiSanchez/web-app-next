import RequestReview from '../../../../pages/MRC/RequestsReview';

import { useRouter } from 'next/router';
import { useGlobalContext, useSourcePagination } from '../../../../hooks';
import { getQueryGraph } from '../../../../services';
import { constPageProcessType } from '../../../../helpers/config';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ __esModule: true, useSession: () => ({ data: {} }) }));
jest.mock('../../../../hooks', () => ({
   __esModule: true,
   useGlobalContext: jest.fn(),
   useSourcePagination: jest.fn(),
}));
jest.mock('../../../../services', () => ({ __esModule: true, getQueryGraph: jest.fn() }));

describe('RequestReview MRC Page', () => {
   const routerMock = jest.fn();

   beforeEach(() => {
      useRouter.mockReturnValue({ asPath: {}, push: routerMock });

      useGlobalContext.mockReturnValue({
         user: { userAD: 'testuser', path: 'MRC' },
         loader: {},
         showPDF: {},
         stepper: {},
         actions: { setPagination: jest.fn(), setExpandedRows: jest.fn() },
         pagination: { currentPage: 1 },
         expandedRows: [],
      });

      useSourcePagination.mockReturnValue({
         sourcePage: 0,
         setTotalPages: jest.fn(),
      });

      getQueryGraph.mockResolvedValue({
         data: [
            {
               idGroup: 1,
               idCatStatus: 2,
               idCatTypeProcedure: constPageProcessType.GET_CHECKLIST,
               groupName: 'Test Name',
               requestResponseList: [],
            },
         ],
         status: 200,
      });
   });

   test('should redirect to documentation page of the request clicked', async () => {
      const { user, queries, waitFor } = await renderPage(RequestReview, {}, { delay: null });

      await user.click(queries.getByRole('cell', { name: /Test Name/ }));

      await waitFor(() => expect(routerMock).toHaveBeenCalledWith('/MRC/Documentation/1'));
   });
});
