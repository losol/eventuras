/// <reference types="cypress" />
import { mount } from 'cypress/react18';

declare module 'cypress' {
  interface Chainable {
    mount: typeof mount;
  }
}

Cypress.Commands.add('mount', mount);
