import TaskList from '../pages/taskList'
import Page from '../pages/page'

context('Task list', () => {
  context('Just incident details completed', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G6415GD',
        response: {
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
          assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
          categoryCode: 'C',
          alerts: [
            { alertType: 'T', alertCode: 'TCPA' },
            { alertType: 'X', alertCode: 'XCU' },
          ],
        },
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:00',
              handoverDeadline: '2021-11-05T11:09:00',
              locationId: 234,
            },
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-11-03T11:09:00',
          },
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)

      TaskListPage.taskList().should('exist')
      TaskListPage.incidentDetailsLink().should('exist')
      TaskListPage.incidentStatementLink().should('exist')
      TaskListPage.acceptDetailsText().should('exist')
      TaskListPage.acceptDetailsLink().should('not.exist')
      TaskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Incident statement')
          expect($cells.get(3).innerText).to.contain('NOT STARTED')
          expect($cells.get(4).innerText).to.contain('Accept details and place on report')
          expect($cells.get(5).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.expirationNotice().should(
        'contain.text',
        'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
      )
    })
    it('should route to the incident page if you click the link', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.incidentDetailsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq('/incident-details/G6415GD/3456/edit')
      })
    })
    it('should route to the incident statement if you click the link', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.incidentStatementLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq('/incident-statement/G6415GD/3456')
      })
    })
  })
  context('Statement started but incomplete', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G6415GD',
        response: {
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
          assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
          categoryCode: 'C',
          alerts: [
            { alertType: 'T', alertCode: 'TCPA' },
            { alertType: 'X', alertCode: 'XCU' },
          ],
        },
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:00',
              handoverDeadline: '2021-11-05T11:09:00',
              locationId: 234,
            },
            incidentStatement: {
              id: 23,
              statement: 'This is my statement',
              completed: false,
            },
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-11-03T11:09:00',
          },
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)

      TaskListPage.taskList().should('exist')
      TaskListPage.incidentDetailsLink().should('exist')
      TaskListPage.incidentStatementLink().should('exist')
      TaskListPage.acceptDetailsText().should('exist')
      TaskListPage.acceptDetailsLink().should('not.exist')
      TaskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Incident statement')
          expect($cells.get(3).innerText).to.contain('IN PROGRESS')
          expect($cells.get(4).innerText).to.contain('Accept details and place on report')
          expect($cells.get(5).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.expirationNotice().should(
        'contain.text',
        'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
      )
    })
  })
  context('Statement complete', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G6415GD',
        response: {
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
          assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
          categoryCode: 'C',
          alerts: [
            { alertType: 'T', alertCode: 'TCPA' },
            { alertType: 'X', alertCode: 'XCU' },
          ],
        },
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:00',
              handoverDeadline: '2021-11-05T11:09:00',
              locationId: 234,
            },
            incidentStatement: {
              id: 23,
              statement: 'This is my statement',
              completed: true,
            },
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-11-03T11:09:00',
          },
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)

      TaskListPage.taskList().should('exist')
      TaskListPage.incidentDetailsLink().should('exist')
      TaskListPage.incidentStatementLink().should('exist')
      TaskListPage.acceptDetailsLink().should('exist')
      TaskListPage.acceptDetailsText().should('not.exist')
      TaskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Incident statement')
          expect($cells.get(3).innerText).to.contain('COMPLETED')
          expect($cells.get(4).innerText).to.contain('Accept details and place on report')
          expect($cells.get(5).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.expirationNotice().should(
        'contain.text',
        'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
      )
    })
    it('should route to the check your answers page if you click the link', () => {
      cy.visit(`/place-the-prisoner-on-report/G6415GD/3456`)
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.acceptDetailsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq('/check-your-answers/G6415GD/3456')
      })
    })
  })
})
