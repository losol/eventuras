// import { mount } from '@cypress/react';
import { composeStories } from '@storybook/testing-react';
import React from 'react';

// import Image from './Image';
import * as stories from './Image.stories';

const { DefaultImage } = composeStories(stories);

describe('<Image />', () => {
  it('renders', () => {
    cy.mount(<DefaultImage />);
  });
});
