describe('navigate :: workspace > create_new > thread', function () {
  before(() => {
    cy.resetDB()
    cy.setupBaseDB()
  })

  beforeEach(function () {
    cy.loginAs('users')
    cy.visit('/ui/workspaces/1/contents')
  })
  it('Checks if create button has a dropdown', function () {
    cy.get('.pageTitleGeneric__title__icon').should('be.visible')
    cy.get('[data-cy=dropdownCreateBtn]').should('be.visible').click()
    cy.get('.show .subdropdown__link__thread__icon').should('be.visible')
  })
})
