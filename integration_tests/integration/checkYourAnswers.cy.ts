import { DamageCode, EvidenceCode, PrisonerGender } from '../../server/data/DraftAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import CheckYourAnswers from '../pages/checkYourAnswers'
import Page from '../pages/page'

const testData = new TestData()

context('Check Your Answers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        gender: 'Unknown',
      }),
    })
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'James',
        lastName: 'Jones',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'Paul',
        lastName: 'Wright',
      }),
    })

    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: [
        {
          locationId: 234,
          agencyId: 'MDI',
          userDescription: 'Workshop 19 - Braille',
        },
        {
          locationId: 27008,
          agencyId: 'MDI',
          userDescription: 'Workshop 2',
        },
        {
          locationId: 27009,
          agencyId: 'MDI',
          userDescription: 'Workshop 3 - Plastics',
        },
        {
          locationId: 27010,
          agencyId: 'MDI',
          userDescription: 'Workshop 4 - PICTA',
        },
      ],
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'USER1',
        token: 'token-1',
        authSource: 'auth',
      },
    })
  })
  context('YOI offences', () => {
    beforeEach(() => {
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            gender: PrisonerGender.MALE,
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:42',
              dateTimeOfDiscovery: '2021-11-04T12:09:42',
              handoverDeadline: '2021-11-05T11:09:42',
              locationId: 234,
            },
            incidentStatement: {
              id: 23,
              statement: 'This is my statement',
              completed: true,
            },
            startedByUserId: 'USER1',
            isYouthOffender: true,
            incidentRole: {
              associatedPrisonersNumber: 'T3356FU',
              roleCode: '25c',
              offenceRule: {
                paragraphNumber: '25(c)',
                paragraphDescription:
                  'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
              },
            },
            offenceDetails: {
              offenceCode: 1001,
              offenceRule: {
                paragraphNumber: '1',
                paragraphDescription: 'Commits any assault',
              },
              victimPrisonersNumber: 'G5512G',
            },
            damages: [
              {
                code: DamageCode.CLEANING,
                reporter: 'TESTER_GEN',
                details: 'Some test info',
              },
            ],
            evidence: [
              {
                code: EvidenceCode.PHOTO,
                reporter: 'TESTER_GEN',
                details: 'some test info',
              },
            ],
            witnesses: [],
          },
        },
      })
      cy.task('stubSubmitCompleteDraftAdjudication', {
        id: 3456,
        response: {
          adjudicationNumber: 234,
          gender: PrisonerGender.MALE,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            dateTimeOfDiscovery: '2021-11-05:09:42',
            locationId: 234,
          },
          incidentStatement: {
            id: 23,
            statement: 'This is my statement',
            completed: true,
          },
          prisonerNumber: 'G6415GD',
          isYouthOffender: true,
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage.genderDetailsSummary().should('exist')
      checkYourAnswersPage.incidentDetailsSummary().should('exist')
      checkYourAnswersPage.offenceDetailsSummary().should('exist')
      checkYourAnswersPage.damageSummary().should('exist')
      checkYourAnswersPage.damagesAbsentText().should('not.exist')
      checkYourAnswersPage.damagesChangeLink().should('exist')
      checkYourAnswersPage.photoVideoEvidenceSummary().should('exist')
      checkYourAnswersPage.baggedAndTaggedEvidenceSummary().should('not.exist')
      checkYourAnswersPage.evidenceAbsentText().should('not.exist')
      checkYourAnswersPage.evidenceChangeLink().should('exist')
      checkYourAnswersPage.witnessesSummary().should('not.exist')
      checkYourAnswersPage.witnessesAbsentText().should('exist')
      checkYourAnswersPage.witnessesChangeLink().should('exist')
      checkYourAnswersPage.incidentStatement().should('exist')
      checkYourAnswersPage.submitButton().should('exist')
      checkYourAnswersPage.submitButton().contains('Accept and place on report')
      checkYourAnswersPage.exitButton().contains('Exit')
      checkYourAnswersPage.exitButton().should('exist')
    })
    it('should contain the correct gender, change link and go to the correct destination', () => {
      cy.visit(`${adjudicationUrls.checkYourAnswers.urls.start(3456)}`)
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage
        .genderDetailsSummary()
        .find('dt')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('What is the gender of the prisoner?')
        })
      checkYourAnswersPage
        .genderDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Male')
          expect($summaryData.get(1).innerText).to.contain('Change')
        })
      cy.get('[data-qa="change-link"').click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.selectGender.url.edit('G6415GD', 3456))
      })
    })
    it('should contain the correct incident details', () => {
      cy.visit(`${adjudicationUrls.checkYourAnswers.urls.start(3456)}`)
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reporting Officer')
          expect($summaryLabels.get(1).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(3).innerText).to.contain('Location')
          expect($summaryLabels.get(4).innerText).to.contain('Date of discovery')
          expect($summaryLabels.get(5).innerText).to.contain('Time of discovery')
        })

      checkYourAnswersPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain('3 November 2021')
          expect($summaryData.get(2).innerText).to.contain('11:09')
          expect($summaryData.get(3).innerText).to.contain('Workshop 19 - Braille')
          expect($summaryData.get(4).innerText).to.contain('4 November 2021')
          expect($summaryData.get(5).innerText).to.contain('12:09')
        })
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
          expect($summaryLabels.get(1).innerText).to.contain(
            'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
          )
          expect($summaryLabels.get(2).innerText).to.contain('What did the incident involve?')
          expect($summaryLabels.get(3).innerText).to.contain('Who did John Smith assist James Jones to assault?')
          expect($summaryLabels.get(4).innerText).to.contain('Was the incident a racially aggravated assault?')
          expect($summaryLabels.get(5).innerText).to.contain('This offence broke')
        })

      checkYourAnswersPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('YOI offences\n\nPrison rule 55')
          expect($summaryData.get(1).innerText).to.contain(
            'Assault, fighting, or endangering the health or personal safety of others'
          )
          expect($summaryData.get(2).innerText).to.contain('Assaulting someone')
          expect($summaryData.get(3).innerText).to.contain('Another prisoner - Paul Wright')
          expect($summaryData.get(4).innerText).to.contain('Yes')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 55, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 55, paragraph 1\n\nCommits any assault'
          )
        })
    })
    it('should contain the correct damages', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage
        .damageSummary()
        .find('th')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Type of repair needed')
          expect($summaryData.get(1).innerText).to.contain('Description of damage')
        })

      checkYourAnswersPage
        .damageSummary()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Cleaning')
          expect($summaryData.get(1).innerText).to.contain('Some test info')
        })

      checkYourAnswersPage.damagesChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfDamages.urls.start(3456))
      })
    })
    it('should contain the correct evidence', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage
        .photoVideoEvidenceSummary()
        .find('th')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Type')
          expect($summaryData.get(1).innerText).to.contain('Description')
        })

      checkYourAnswersPage
        .photoVideoEvidenceSummary()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Photo')
          expect($summaryData.get(1).innerText).to.contain('some test info')
        })

      checkYourAnswersPage.baggedAndTaggedEvidenceSummary().should('not.exist')
      checkYourAnswersPage.evidenceChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfEvidence.urls.start(3456))
      })
    })
    it('should contain the correct witnesses', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.witnessesSummary().should('not.exist')
      checkYourAnswersPage.witnessesAbsentText().contains('None')
      checkYourAnswersPage.witnessesChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfWitnesses.urls.start(3456))
      })
    })
    it('should contain the correct incident statement', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage.incidentStatement().should('contain.text', 'This is my statement')
    })
    it('should go to the completion page if the user submits', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.confirmedOnReport.urls.start(234))
      })
    })
    it('should go to the task page if the user exits without submitting', () => {
      cy.visit(`${adjudicationUrls.checkYourAnswers.urls.start(3456)}`)
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.exitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(3456))
      })
    })
    it('should go to the incident details page if the incident details change link is clicked', () => {
      cy.visit(`${adjudicationUrls.checkYourAnswers.urls.start(3456)}`)
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.incidentDetailsChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 3456))
      })
    })
    it('should go to the correct page if the offence details change link is clicked - to reenter new offences', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.offenceDetailsChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.start(3456))
      })
    })
    it('should go to the incident statement page if the incident statement change link is clicked', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.incidentStatementChangeLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentStatement.urls.start(3456))
      })
    })
  })
  context('Adult offences', () => {
    beforeEach(() => {
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            gender: PrisonerGender.MALE,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:42',
              dateTimeOfDiscovery: '2021-11-06T11:09:42',
              handoverDeadline: '2021-11-05T11:09:42',
              locationId: 234,
            },
            incidentStatement: {
              id: 23,
              statement: 'This is my statement',
              completed: true,
            },
            startedByUserId: 'USER1',
            isYouthOffender: false,
            incidentRole: {
              associatedPrisonersNumber: 'T3356FU',
              roleCode: '25c',
              offenceRule: {
                paragraphNumber: '25(c)',
                paragraphDescription:
                  'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
              },
            },
            offenceDetails: {
              offenceCode: 1001,
              offenceRule: {
                paragraphNumber: '1',
                paragraphDescription: 'Commits any assault',
              },
              victimPrisonersNumber: 'G5512G',
            },
          },
        },
      })
      cy.task('stubSubmitCompleteDraftAdjudication', {
        id: 3456,
        response: {
          adjudicationNumber: 234,
          gender: PrisonerGender.MALE,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            dateTimeOfDiscovery: '2021-11-07T11:09:42',
            locationId: 234,
          },
          incidentStatement: {
            id: 23,
            statement: 'This is my statement',
            completed: true,
          },
          prisonerNumber: 'G6415GD',
          isYouthOffender: false,
        },
      })
      cy.signIn()
    })

    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

      checkYourAnswersPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
          )
        })
    })
  })
  context('Gender - already known on profile', () => {
    beforeEach(() => {
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'H6415GD',
        response: {
          offenderNo: 'H6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
          physicalAttributes: { gender: PrisonerGender.MALE },
          assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
        },
      })
      cy.task('stubGetDraftAdjudication', {
        id: 5678,
        response: {
          draftAdjudication: {
            id: 5678,
            gender: PrisonerGender.MALE,
            prisonerNumber: 'H6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:42',
              dateTimeOfDiscovery: '2021-11-06T11:09:42',
              handoverDeadline: '2021-11-05T11:09:42',
              locationId: 234,
            },
            incidentStatement: {
              id: 23,
              statement: 'This is my statement',
              completed: true,
            },
            startedByUserId: 'USER1',
            isYouthOffender: false,
            incidentRole: {
              associatedPrisonersNumber: 'T3356FU',
              roleCode: '25c',
              offenceRule: {
                paragraphNumber: '25(c)',
                paragraphDescription:
                  'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
              },
            },
            offenceDetails: {
              offenceCode: 1001,
              offenceRule: {
                paragraphNumber: '1',
                paragraphDescription: 'Commits any assault',
              },
              victimPrisonersNumber: 'G5512G',
            },
          },
        },
      })
      cy.signIn()
    })

    it('should not show the gender section if a gender is set on the prisoner profile', () => {
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(5678))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.genderDetailsSummary().should('not.exist')
    })
  })
})
