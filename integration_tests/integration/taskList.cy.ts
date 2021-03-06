import TaskList from '../pages/taskList'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'

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
            startedByUserId: 'TEST_GEN',
          },
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)

      TaskListPage.taskList().should('exist')
      TaskListPage.incidentDetailsLink().should('exist')
      TaskListPage.incidentStatementLink().should('exist')
      TaskListPage.acceptDetailsText().should('exist')
      TaskListPage.acceptDetailsLink().should('not.exist')
      TaskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('NOT STARTED')
          expect($cells.get(4).innerText).to.contain('Incident statement')
          expect($cells.get(5).innerText).to.contain('NOT STARTED')
          expect($cells.get(6).innerText).to.contain('Accept details and place on report')
          expect($cells.get(7).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.expirationNotice().should(
        'contain.text',
        'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
      )
    })
    it('should route to the incident page if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.incidentDetailsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 3456))
      })
    })
    it('should route to the incident statement if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.incidentStatementLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentStatement.urls.start(3456))
      })
    })
  })
  context('Offence details not started', () => {
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
            startedByUserId: 'TEST_GEN',
          },
        },
      })
      cy.signIn()
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('NOT STARTED')
          expect($cells.get(4).innerText).to.contain('Incident statement')
          expect($cells.get(5).innerText).to.contain('NOT STARTED')
          expect($cells.get(6).innerText).to.contain('Accept details and place on report')
          expect($cells.get(7).innerText).to.contain('NOT STARTED')
        })
    })
    it('should not have an active accept details link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.acceptDetailsLink().should('not.exist')
    })
    it('should route to the applicable rules page if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.offenceDetailsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.start(3456))
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
            startedByUserId: 'TEST_GEN',
            incidentRole: {
              associatedPrisonersNumber: 'G2996UX',
              offenceRule: {
                paragraphDescription: 'Committed an assault',
                paragraphNumber: '25(a)',
              },
              roleCode: '25a',
            },
            isYouthOffender: false,
            offenceDetails: [
              {
                offenceCode: 3,
                offenceRule: {
                  paragraphDescription: 'Committed an assault',
                  paragraphNumber: '25(a)',
                },
                victimOtherPersonsName: 'Bob Hope',
                victimPrisonersNumber: 'G2996UX',
                victimStaffUsername: 'ABC12D',
              },
            ],
          },
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)

      TaskListPage.taskList().should('exist')
      TaskListPage.incidentDetailsLink().should('exist')
      TaskListPage.incidentStatementLink().should('exist')
      TaskListPage.acceptDetailsText().should('exist')
      TaskListPage.acceptDetailsLink().should('not.exist')
      TaskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('COMPLETED')
          expect($cells.get(4).innerText).to.contain('Incident statement')
          expect($cells.get(5).innerText).to.contain('IN PROGRESS')
          expect($cells.get(6).innerText).to.contain('Accept details and place on report')
          expect($cells.get(7).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.expirationNotice().should(
        'contain.text',
        'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
      )
    })
    it('should route to the offenders details page if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.offenceDetailsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfOffence.urls.start(3456))
      })
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
            isYouthOffender: false,
            incidentStatement: {
              id: 23,
              statement: 'This is my statement',
              completed: true,
            },
            startedByUserId: 'TEST_GEN',
            incidentRole: {
              associatedPrisonersNumber: 'G2996UX',
              offenceRule: {
                paragraphDescription: 'Committed an assault',
                paragraphNumber: '25(a)',
              },
              roleCode: '25a',
            },
            offenceDetails: [
              {
                offenceCode: 3,
                offenceRule: {
                  paragraphDescription: 'Committed an assault',
                  paragraphNumber: '25(a)',
                },
                victimOtherPersonsName: 'Bob Hope',
                victimPrisonersNumber: 'G2996UX',
                victimStaffUsername: 'ABC12D',
              },
            ],
          },
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)

      TaskListPage.taskList().should('exist')
      TaskListPage.incidentDetailsLink().should('exist')
      TaskListPage.incidentStatementLink().should('exist')
      TaskListPage.acceptDetailsLink().should('exist')
      TaskListPage.acceptDetailsText().should('not.exist')
      TaskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('COMPLETED')
          expect($cells.get(4).innerText).to.contain('Incident statement')
          expect($cells.get(5).innerText).to.contain('COMPLETED')
          expect($cells.get(6).innerText).to.contain('Accept details and place on report')
          expect($cells.get(7).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.expirationNotice().should(
        'contain.text',
        'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
      )
    })
    it('should route to the check your answers page if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.acceptDetailsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.checkYourAnswers.urls.start(3456))
      })
    })
  })
  context('Incident details and statement complete, but offence details incomplete', () => {
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
            id: 792,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              locationId: 26150,
              dateTimeOfIncident: '2022-02-01T10:11:00',
              handoverDeadline: '2022-02-03T10:11:00',
            },
            incidentRole: {
              roleCode: '25b',
              offenceRule: {
                paragraphNumber: '25(b)',
                paragraphDescription: 'Incites another prisoner to commit any of the foregoing offences:',
              },
              associatedPrisonersNumber: 'G6415GD',
            },
            offenceDetails: [],
            incidentStatement: {
              statement: 'pangolin',
              completed: true,
            },
            startedByUserId: 'TEST_GEN',
          },
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)

      TaskListPage.taskList().should('exist')
      TaskListPage.incidentDetailsLink().should('exist')
      TaskListPage.incidentStatementLink().should('exist')
      TaskListPage.acceptDetailsLink().should('not.exist')
      TaskListPage.acceptDetailsText().should('exist')
      TaskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('NOT STARTED')
          expect($cells.get(4).innerText).to.contain('Incident statement')
          expect($cells.get(5).innerText).to.contain('COMPLETED')
          expect($cells.get(6).innerText).to.contain('Accept details and place on report')
          expect($cells.get(7).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const TaskListPage: TaskList = Page.verifyOnPage(TaskList)
      TaskListPage.expirationNotice().should(
        'contain.text',
        'You need to provide John Smith with a printed copy of this report by 10:11 on 3 February 2022.'
      )
    })
  })
})
