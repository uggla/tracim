describe('navigate :: workspace > create_new > thread', function () {
  before(() => {
    cy.resetDB()
    cy.setupBaseDB()
  })

  beforeEach(function () {
    cy.loginAs('users')
    cy.visit('/ui/workspaces/1/contents')
  })
  it('allcontent > button', function () {
    cy.get('.pageTitleGeneric__title__icon').should('be.visible')
    cy.get('#dropdownCreateBtn.workspace__header__btnaddcontent__label').should('be.visible')
    cy.get('#dropdownCreateBtn.workspace__header__btnaddcontent__label').click()
    cy.get('.show .subdropdown__link__thread__icon').should('be.visible')
  })
})
