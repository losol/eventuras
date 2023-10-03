import { composeStories } from '@storybook/testing-react';
import React from 'react';

import * as stories from './Card.stories';

const { Default, WithImage } = composeStories(stories);

describe('<Default />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Default />);
  });
});

describe('<WithImage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<WithImage />);
  });
});
