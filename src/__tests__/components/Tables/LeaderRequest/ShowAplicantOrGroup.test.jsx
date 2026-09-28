import { screen } from '@testing-library/react';

import { ShowAplicantOrGroup } from '../../../../components/Tables/LeaderRequest/ShowAplicantOrGroup';
import { renderComponent } from '../../../utils/render';

const requests = [
   { idRequest: 100, relatedPersonResponseList: [{ idCatTypePerson: 1, fullName: 'ana lopez' }] },
   { idRequest: 200, relatedPersonResponseList: [{ idCatTypePerson: 1, fullName: 'luis perez' }] },
];

const renderShow = (props = {}) =>
   renderComponent(
      <ShowAplicantOrGroup
         isGroup
         groupName='grupo alfa'
         requests={requests}
         onSelectRequest={jest.fn()}
         {...props}
      />
   );

describe('ShowAplicantOrGroup', () => {
   test('only shows the name when the request is not a group', () => {
      renderShow({ isGroup: false });

      expect(screen.getByText('grupo alfa')).toBeInTheDocument();
      expect(screen.queryByTestId('dropdown-applicant')).not.toBeInTheDocument();
   });

   test('shows the group name when no request is selected', () => {
      renderShow();

      expect(screen.getByTestId('name-applicant')).toHaveTextContent('grupo alfa');
   });

   test('shows the applicant name of the selected request', () => {
      renderShow({ idRequestSelected: 200 });

      expect(screen.getByTestId('name-applicant')).toHaveTextContent('luis perez');
   });

   test('reports the chosen applicant request', async () => {
      const onSelectRequest = jest.fn();
      const { user } = renderShow({ onSelectRequest });

      await user.click(screen.getByTestId('name-applicant'));
      await user.click(screen.getByTestId('option-luis-perez'));

      expect(onSelectRequest).toHaveBeenCalledWith(200);
   });

   test('reports an empty id when the group option is chosen', async () => {
      const onSelectRequest = jest.fn();
      const { user } = renderShow({ onSelectRequest, idRequestSelected: 100 });

      await user.click(screen.getByTestId('name-applicant'));
      // El testid de esta opción se construye con el objeto { groupName } y no con el nombre.
      await user.click(screen.getByTestId('option-[object Object]'));

      expect(onSelectRequest).toHaveBeenCalledWith('');
   });

   test('does not propagate clicks to a parent row', async () => {
      const onParentClick = jest.fn();
      const { user } = renderComponent(
         <div onClick={onParentClick}>
            <ShowAplicantOrGroup isGroup groupName='grupo alfa' requests={requests} onSelectRequest={jest.fn()} />
         </div>
      );

      await user.click(screen.getByTestId('name-applicant'));
      await user.click(screen.getByTestId('option-ana-lopez'));

      expect(onParentClick).not.toHaveBeenCalled();
   });

   test('closes the list when the user clicks outside', async () => {
      const { user } = renderShow();
      await user.click(screen.getByTestId('name-applicant'));
      const list = screen.getByTestId('option-ana-lopez').parentElement;
      expect(list).not.toHaveClass('hidden');

      await user.click(document.body);

      expect(list).toHaveClass('hidden');
   });
});
