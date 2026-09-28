import { useState } from 'react';
import { screen } from '@testing-library/react';

import { ProfileSummaryView } from '../../../components/PCD/ProfileSummaryView';
import { templateDerivatives } from '../../../helpers';
import { renderComponent } from '../../utils/render';

const buildInfo = (overrides = {}) => ({ ...structuredClone(templateDerivatives.profileResume), ...overrides });

// El componente es controlado: entrega el perfil completo y el padre lo devuelve como info.
function Harness({ start, onUpdate, ...props }) {
   const [info, setInfo] = useState(start);
   const handleUpdate = (key, next) => {
      onUpdate(key, next);
      setInfo(next);
   };
   return <ProfileSummaryView info={info} onUpdateData={handleUpdate} isDisabled={false} {...props} />;
}

function setup({ info = buildInfo(), ...props } = {}) {
   const onUpdate = jest.fn();
   const utils = renderComponent(<Harness start={info} onUpdate={onUpdate} {...props} />);
   return { onUpdate, ...utils };
}

const lastInfo = (onUpdate) => onUpdate.mock.calls.at(-1)[1];

const textFields = [
   'mainBusinessActivity',
   'whoTargetYouServicesOrProducts',
   'productsAndServicesSold',
   'brands',
   'mainCustomers',
   'mainSuppliers',
   'bussinesCyclicality',
   'strategicAlliancesOrPartners',
   'whoVisitedName',
   'whoVisitedPosition',
   'physicalConditionOfTheFacilities',
   'physicalContionOfInventoriesAndObsolescences',
   'industryRisksDetected',
   'competitiveAdvantageOrDifferentiator',
   'additionalCommentsOrProjectsInThePipeline',
   'perceptionOfTheCompanysManagement',
   'whyYouDOrecommendTheCompany',
];

describe('ProfileSummaryView', () => {
   test('shows the title, the instructions and the visit section', () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Perfil del Cliente' })).toBeInTheDocument();
      expect(screen.getByText('Completa la información referente al Cliente')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Resultados de la visita' })).toBeInTheDocument();
      expect(screen.getByText('Pregunta 11.')).toBeInTheDocument();
   });

   describe('incomplete section alert', () => {
      test('is shown when the section was saved with pending fields', () => {
         setup({ isSave: true, isComplete: false });

         expect(screen.getByText(/campos obligatorios/)).toBeInTheDocument();
      });

      test.each([
         [{ isSave: false, isComplete: false }],
         [{ isSave: true, isComplete: true }],
      ])('is hidden for %j', (props) => {
         setup(props);

         expect(screen.queryByText(/campos obligatorios/)).not.toBeInTheDocument();
      });
   });

   describe.each(textFields.map((name) => [name]))('field %s', (name) => {
      test('shows the value captured', () => {
         setup({ info: buildInfo({ [name]: 'Texto capturado' }) });

         expect(screen.getByTestId(name)).toHaveValue('Texto capturado');
      });

      test('captures the text typed', async () => {
         const { onUpdate, user } = setup();

         await user.type(screen.getByTestId(name), 'Ab');

         expect(lastInfo(onUpdate)[name]).toBe('Ab');
         expect(screen.getByTestId(name)).toHaveValue('Ab');
      });

      test('is locked when disabled', () => {
         setup({ isDisabled: true });

         expect(screen.getByTestId(name)).toBeDisabled();
      });

      test('is marked as mandatory once the section was saved', () => {
         setup({ isSave: true });

         expect(screen.getByTestId(name)).toHaveClass('mandatory');
      });
   });

   describe.each([
      ['presence', ['local', 'regional', 'national', 'international']],
      ['numberOfEmployees', ['small', 'middle', 'big']],
   ])('%s options', (attribute, options) => {
      test('shows every option unchecked when nothing was answered', () => {
         setup();

         options.forEach((id) => expect(screen.getByTestId(id)).not.toBeChecked());
      });

      test('shows the answer captured as checked', () => {
         setup({ info: buildInfo({ [attribute]: options[1] }) });

         expect(screen.getByTestId(options[1])).toBeChecked();
         expect(screen.getByTestId(options[0])).not.toBeChecked();
      });

      test('captures the option selected under the attribute without the group suffix', async () => {
         const { onUpdate, user } = setup();

         await user.click(screen.getByTestId(options[2] ?? options[1]));

         expect(lastInfo(onUpdate)[attribute]).toBe(options[2] ?? options[1]);
      });

      test('locks the options when disabled', () => {
         setup({ isDisabled: true });

         options.forEach((id) => expect(screen.getByTestId(id)).toBeDisabled());
      });
   });

   describe('perception of the management', () => {
      test('offers who gives the perception', () => {
         setup();

         expect(
            Array.from(screen.getByTestId('whosePerceptionIsCollected').options).map((o) => o.textContent)
         ).toEqual(['- Seleccionar -', 'Administrador único', 'Empresa familiar', 'Consejo de administración']);
      });

      test('captures the selected option', async () => {
         const { onUpdate, user } = setup();

         await user.selectOptions(screen.getByTestId('whosePerceptionIsCollected'), 'familyCompany');

         expect(lastInfo(onUpdate).whosePerceptionIsCollected).toBe('familyCompany');
      });
   });

   describe('embedded sections', () => {
      test('stores the visitors captured under their attribute', async () => {
         const { onUpdate, user } = setup();

         await user.type(screen.getByTestId('visitorName-0'), 'A');

         expect(lastInfo(onUpdate).whoMadeTheVisit).toEqual([{ visitorName: 'A' }]);
      });

      test('shows the visitors already captured', () => {
         setup({ info: buildInfo({ whoMadeTheVisit: [{ visitorName: 'Ana' }, { visitorName: 'Luis' }] }) });

         expect(screen.getByTestId('visitorName-0')).toHaveValue('Ana');
         expect(screen.getByTestId('visitorName-1')).toHaveValue('Luis');
      });

      test('stores the news captured under the news attribute', async () => {
         const { onUpdate, user } = setup();

         await user.type(screen.getByTestId('description-positives-0'), 'Bien');

         expect(lastInfo(onUpdate).news).toEqual({
            positives: [{ description: 'Bien' }],
            negatives: [],
            noNewsWereFound: false,
         });
      });

      test('hides the news entries when there are no news to report', async () => {
         const { onUpdate, user } = setup();

         await user.click(screen.getByRole('checkbox', { name: 'No se encontraron noticias' }));

         expect(lastInfo(onUpdate).news).toEqual({ noNewsWereFound: true, negatives: [], positives: [] });
         expect(screen.queryByTestId('description-positives-0')).not.toBeInTheDocument();
      });
   });
});
