import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export function renderComponent(ui, { userOptions, ...renderOptions } = {}) {
   const user = userEvent.setup(userOptions);
   return { user, ...render(ui, renderOptions) };
}
