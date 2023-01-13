import TaskList from '../pages/taskList'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

context('Task list', () => {
  context('Just incident details completed', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G6415GD',
        response: testData.prisonerResultSummary({
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
        }),
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: testData.draftAdjudication({
            id: 3456,
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2021-11-03T11:09:00',
            offenceDetails: null,
            incidentStatement: null,
          }),
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)

      taskListPage.taskList().should('exist')
      taskListPage.incidentDetailsLink().should('exist')
      taskListPage.incidentStatementLink().should('exist')
      taskListPage.acceptDetailsText().should('exist')
      taskListPage.acceptDetailsLink().should('not.exist')
      taskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('NOT STARTED')
          expect($cells.get(4).innerText).to.contain('Damages')
          expect($cells.get(5).innerText).to.contain('NOT STARTED')
          expect($cells.get(6).innerText).to.contain('Evidence')
          expect($cells.get(7).innerText).to.contain('NOT STARTED')
          expect($cells.get(8).innerText).to.contain('Witnesses')
          expect($cells.get(9).innerText).to.contain('NOT STARTED')
          expect($cells.get(10).innerText).to.contain('Incident statement')
          expect($cells.get(11).innerText).to.contain('NOT STARTED')
          expect($cells.get(12).innerText).to.contain('Accept details and place on report')
          expect($cells.get(13).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .expirationNotice()
        .should(
          'contain.text',
          'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
        )
    })
    it('should route to the incident page if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage.incidentDetailsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 3456))
      })
    })
    it('should route to the incident statement if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage.incidentStatementLink().click()
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
        response: testData.prisonerResultSummary({
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
        }),
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: testData.draftAdjudication({
            id: 3456,
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2021-11-03T11:09:00',
            offenceDetails: null,
            incidentStatement: null,
          }),
        },
      })
      cy.signIn()
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('NOT STARTED')
          expect($cells.get(4).innerText).to.contain('Damages')
          expect($cells.get(5).innerText).to.contain('NOT STARTED')
          expect($cells.get(6).innerText).to.contain('Evidence')
          expect($cells.get(7).innerText).to.contain('NOT STARTED')
          expect($cells.get(8).innerText).to.contain('Witnesses')
          expect($cells.get(9).innerText).to.contain('NOT STARTED')
          expect($cells.get(10).innerText).to.contain('Incident statement')
          expect($cells.get(11).innerText).to.contain('NOT STARTED')
          expect($cells.get(12).innerText).to.contain('Accept details and place on report')
          expect($cells.get(13).innerText).to.contain('NOT STARTED')
        })
    })
    it('should not have an active accept details link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage.acceptDetailsLink().should('not.exist')
    })
    it('should route to the applicable rules page if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage.offenceDetailsLink().click()
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
        response: testData.prisonerResultSummary({
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
        }),
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: testData.draftAdjudication({
            id: 3456,
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2021-11-03T11:09:00',
            offenceDetails: {
              offenceCode: 3,
              offenceRule: {
                paragraphDescription: 'Committed an assault',
                paragraphNumber: '25(a)',
              },
            },
            incidentStatement: {
              statement: 'This is my statement',
              completed: false,
            },
            otherData: {
              damagesSaved: true,
              evidenceSaved: true,
              witnessesSaved: true,
            },
          }),
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)

      taskListPage.taskList().should('exist')
      taskListPage.incidentDetailsLink().should('exist')
      taskListPage.incidentStatementLink().should('exist')
      taskListPage.acceptDetailsText().should('exist')
      taskListPage.acceptDetailsLink().should('not.exist')
      taskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('COMPLETED')
          expect($cells.get(4).innerText).to.contain('Damages')
          expect($cells.get(5).innerText).to.contain('COMPLETED')
          expect($cells.get(6).innerText).to.contain('Evidence')
          expect($cells.get(7).innerText).to.contain('COMPLETED')
          expect($cells.get(8).innerText).to.contain('Witnesses')
          expect($cells.get(9).innerText).to.contain('COMPLETED')
          expect($cells.get(10).innerText).to.contain('Incident statement')
          expect($cells.get(11).innerText).to.contain('IN PROGRESS')
          expect($cells.get(12).innerText).to.contain('Accept details and place on report')
          expect($cells.get(13).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .expirationNotice()
        .should(
          'contain.text',
          'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
        )
    })
    it('should route to the offenders details page if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage.offenceDetailsLink().click()
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
        response: testData.prisonerResultSummary({
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
        }),
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: testData.draftAdjudication({
            id: 3456,
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2021-11-03T11:09:00',
            offenceDetails: {
              offenceCode: 3,
              offenceRule: {
                paragraphDescription: 'Committed an assault',
                paragraphNumber: '25(a)',
              },
            },
            incidentStatement: {
              statement: 'This is my statement',
              completed: true,
            },
            otherData: {
              damagesSaved: true,
              evidenceSaved: true,
              witnessesSaved: true,
            },
          }),
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)

      taskListPage.taskList().should('exist')
      taskListPage.incidentDetailsLink().should('exist')
      taskListPage.incidentStatementLink().should('exist')
      taskListPage.acceptDetailsLink().should('exist')
      taskListPage.acceptDetailsText().should('not.exist')
      taskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('COMPLETED')
          expect($cells.get(4).innerText).to.contain('Damages')
          expect($cells.get(5).innerText).to.contain('COMPLETED')
          expect($cells.get(6).innerText).to.contain('Evidence')
          expect($cells.get(7).innerText).to.contain('COMPLETED')
          expect($cells.get(8).innerText).to.contain('Witnesses')
          expect($cells.get(9).innerText).to.contain('COMPLETED')
          expect($cells.get(10).innerText).to.contain('Incident statement')
          expect($cells.get(11).innerText).to.contain('COMPLETED')
          expect($cells.get(12).innerText).to.contain('Accept details and place on report')
          expect($cells.get(13).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .expirationNotice()
        .should(
          'contain.text',
          'You need to provide John Smith with a printed copy of this report by 11:09 on 5 November 2021.'
        )
    })
    it('should route to the check your answers page if you click the link', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage.acceptDetailsLink().click()
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
        response: testData.prisonerResultSummary({
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
        }),
      })
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: testData.draftAdjudication({
            id: 792,
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2022-02-01T10:11:00',
            incidentStatement: {
              statement: 'This is my statement',
              completed: true,
            },
            otherData: {
              damagesSaved: true,
              evidenceSaved: true,
              witnessesSaved: true,
            },
          }),
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)

      taskListPage.taskList().should('exist')
      taskListPage.incidentDetailsLink().should('exist')
      taskListPage.incidentStatementLink().should('exist')
      taskListPage.acceptDetailsLink().should('not.exist')
      taskListPage.acceptDetailsText().should('exist')
      taskListPage.expirationNotice().should('exist')
    })
    it('should have the correct statuses', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .taskList()
        .find('td')
        .then($cells => {
          expect($cells.get(0).innerText).to.contain('Incident details')
          expect($cells.get(1).innerText).to.contain('COMPLETED')
          expect($cells.get(2).innerText).to.contain('Offence details')
          expect($cells.get(3).innerText).to.contain('NOT STARTED')
          expect($cells.get(4).innerText).to.contain('Damages')
          expect($cells.get(5).innerText).to.contain('COMPLETED')
          expect($cells.get(6).innerText).to.contain('Evidence')
          expect($cells.get(7).innerText).to.contain('COMPLETED')
          expect($cells.get(8).innerText).to.contain('Witnesses')
          expect($cells.get(9).innerText).to.contain('COMPLETED')
          expect($cells.get(10).innerText).to.contain('Incident statement')
          expect($cells.get(11).innerText).to.contain('COMPLETED')
          expect($cells.get(12).innerText).to.contain('Accept details and place on report')
          expect($cells.get(13).innerText).to.contain('NOT STARTED')
        })
    })
    it('should have the correct expiration date and time', () => {
      cy.visit(adjudicationUrls.taskList.urls.start(3456))
      const taskListPage: TaskList = Page.verifyOnPage(TaskList)
      taskListPage
        .expirationNotice()
        .should(
          'contain.text',
          'You need to provide John Smith with a printed copy of this report by 10:11 on 3 February 2022.'
        )
    })
  })
  context(
    'Witnesses added but no damages and evidence added. Evidence page not visited so should say not started',
    () => {
      beforeEach(() => {
        cy.task('reset')
        cy.task('stubSignIn')
        cy.task('stubAuthUser')
        cy.task('stubGetPrisonerDetails', {
          prisonerNumber: 'G6415GD',
          response: testData.prisonerResultSummary({
            offenderNo: 'G6415GD',
            firstName: 'JOHN',
            lastName: 'SMITH',
          }),
        })
        cy.task('stubGetDraftAdjudication', {
          id: 3456,
          response: {
            draftAdjudication: testData.draftAdjudication({
              id: 792,
              prisonerNumber: 'G6415GD',
              dateTimeOfIncident: '2021-11-03T11:09:00',
              incidentStatement: {
                statement: 'This is my statement',
                completed: true,
              },
              witnesses: [testData.singleWitness({}), testData.singleWitness({})],
              otherData: {
                damagesSaved: true,
                witnessesSaved: true,
              },
            }),
          },
        })

        cy.signIn()
      })
      it('should have the correct statuses', () => {
        cy.visit(adjudicationUrls.taskList.urls.start(3456))
        const taskListPage: TaskList = Page.verifyOnPage(TaskList)
        taskListPage
          .taskList()
          .find('td')
          .then($cells => {
            expect($cells.get(6).innerText).to.contain('Evidence')
            expect($cells.get(7).innerText).to.contain('NOT STARTED')
          })
      })
      it('should have an active link to the damages page', () => {
        cy.visit(adjudicationUrls.taskList.urls.start(3456))
        const taskListPage: TaskList = Page.verifyOnPage(TaskList)
        taskListPage.damagesLink().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.start(3456))
        })
      })
      it('should have an active link to the evidence page', () => {
        cy.visit(adjudicationUrls.taskList.urls.start(3456))
        const taskListPage: TaskList = Page.verifyOnPage(TaskList)
        taskListPage.evidenceLink().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.start(3456))
        })
      })
      it('should have an active link to the witnesses page', () => {
        cy.visit(adjudicationUrls.taskList.urls.start(3456))
        const taskListPage: TaskList = Page.verifyOnPage(TaskList)
        taskListPage.witnessesLink().click()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.start(3456))
        })
      })
    }
  )
})
