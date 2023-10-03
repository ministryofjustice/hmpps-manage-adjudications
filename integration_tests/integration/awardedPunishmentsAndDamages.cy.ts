import moment from 'moment/moment'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AwardedPunishmentsAndDamagesPage from '../pages/awardedPunishmentsAndDamages'
import FinancialAwardedPunishmentsAndDamagesPage from '../pages/financialAwardedPunishmentsAndDamages'
import AdditionalDaysAwardedPunishmentsPage from '../pages/additionalDaysAwardedPunishments'
import Page from '../pages/page'
import HomepagePage from '../pages/home'
import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { HearingOutcomeCode, OutcomeCode } from '../../server/data/HearingAndOutcomeResult'
import { PunishmentType } from '../../server/data/PunishmentResult'

const testData = new TestData()
const today = moment()
// why month is zero based is beyond me :)
const month = today.month() + 1

context('Awarded punishments and damages', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUsersLocations', testData.residentialLocations())
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: today.format('YYYY-MM-DD'),
      response: {
        hearings: [
          {
            ...testData.singleHearing({
              dateTimeOfHearing: '2023-08-26T10:00:00',
              id: 1,
            }),
            dateTimeOfHearing: '2023-08-26T10:00:00',
            chargeNumber: '12345',
            prisonerNumber: 'G6345BY',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
          },
          {
            ...testData.singleHearing({
              dateTimeOfHearing: '2023-08-26T10:00:00',
              id: 1,
            }),
            dateTimeOfDiscovery: '2023-11-03T10:00:00',
            chargeNumber: '12346',
            prisonerNumber: 'P3785CP',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
          },
          {
            ...testData.singleHearing({
              dateTimeOfHearing: '2023-08-26T10:50:00',
              id: 1,
            }),
            dateTimeOfHearing: '2023-08-26T10:50:00',
            chargeNumber: '12347',
            prisonerNumber: 'G6345BY',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
          },
          {
            ...testData.singleHearing({
              dateTimeOfHearing: '2023-08-26T10:50:00',
              id: 1,
            }),
            dateTimeOfHearing: '2023-08-26T10:50:00',
            chargeNumber: '12348',
            prisonerNumber: 'G6345BY',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
          },
        ],
      },
    })
    cy.task('stubGetBatchPrisonerDetails', [
      testData.simplePrisoner('G6345BY', 'DAVID', 'SMITH', 'MDI-1-001'),
      testData.simplePrisoner('P3785CP', 'TONY', 'RAY', 'A-2-001'),
    ])
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '12345',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6345BY',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                }),
              },
            },
          ],
          punishments: [
            {
              id: 1,
              redisId: 'xyz',
              type: PunishmentType.DAMAGES_OWED,
              schedule: {
                days: 0,
              },
              damagesOwedAmount: 100,
            },
            {
              id: 2,
              redisId: 'xyz',
              type: PunishmentType.DAMAGES_OWED,
              schedule: {
                days: 0,
              },
              damagesOwedAmount: 100,
            },
            {
              id: 3,
              redisId: 'xyz',
              type: PunishmentType.PRIVILEGE,
              schedule: {
                days: 0,
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({ createdByUserId: 'USER1' })],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12346,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '12346',
          status: ReportedAdjudicationStatus.DISMISSED,
          prisonerNumber: 'P3785CP',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                }),
              },
            },
          ],
          punishments: [],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12347,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '12347',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6345BY',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                }),
              },
            },
          ],
          punishments: [
            {
              id: 1,
              redisId: 'xyz',
              type: PunishmentType.CAUTION,
              schedule: {
                days: 0,
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({ createdByUserId: 'USER1' })],
        }),
      },
    })
    // this one should be filtered out because it is not of the correct status
    cy.task('stubGetReportedAdjudication', {
      id: 12348,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '12347',
          status: ReportedAdjudicationStatus.ACCEPTED,
          prisonerNumber: 'G6345BY',
          outcomes: [],
          punishments: [],
        }),
      },
    })

    cy.signIn()
  })

  it('should have the required elements on the page', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.awardedPunishmentsAndDamagesLink().click()
    const awardedPunishmentsAndDamagesPage: AwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      AwardedPunishmentsAndDamagesPage
    )
    awardedPunishmentsAndDamagesPage.allAwardedPunishmentsAndDamagesTab().should('exist')
    awardedPunishmentsAndDamagesPage.financialAwardedPunishmentsAndDamagesTab().should('exist')
    awardedPunishmentsAndDamagesPage.additionalDaysAwardedPunishmentsTab().should('exist')
    awardedPunishmentsAndDamagesPage.datePicker().should('exist')
    awardedPunishmentsAndDamagesPage.selectLocation().should('exist')
    awardedPunishmentsAndDamagesPage.leftArrow().should('exist')
    awardedPunishmentsAndDamagesPage.rightArrow().should('exist')
    awardedPunishmentsAndDamagesPage.applyButton().should('exist')
    awardedPunishmentsAndDamagesPage.clearLink().should('exist')
    awardedPunishmentsAndDamagesPage.resultsTable().should('exist')
    awardedPunishmentsAndDamagesPage.noResultsMessage().should('not.exist')
  })

  it('should have the correct details showing in the table', () => {
    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.root)
    const awardedPunishmentsAndDamagesPage: AwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      AwardedPunishmentsAndDamagesPage
    )
    awardedPunishmentsAndDamagesPage
      .resultsTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Charge number')
        expect($headings.get(1).innerText).to.contain('Name and prison number')
        expect($headings.get(2).innerText).to.contain('Location')
        expect($headings.get(3).innerText).to.contain('Hearing date and time')
        expect($headings.get(4).innerText).to.contain('Status')
        expect($headings.get(5).innerText).to.contain('Caution')
        expect($headings.get(6).innerText).to.contain('Punishments awarded')
        expect($headings.get(7).innerText).to.contain('Damages')
        expect($headings.get(8).innerText).to.contain('')
        expect($headings.get(9).innerText).to.contain('')
      })

    awardedPunishmentsAndDamagesPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('12345')
        expect($data.get(1).innerText).to.contain('Smith, David - G6345BY')
        expect($data.get(2).innerText).to.contain('MDI-1-001')
        expect($data.get(3).innerText).to.contain('26 August 2023 - 10:00')
        expect($data.get(4).innerText).to.contain('Charge proved')
        expect($data.get(5).innerText).to.contain('No')
        expect($data.get(6).innerText).to.contain('3')
        expect($data.get(7).innerText).to.contain('£200')
        expect($data.get(8).innerText).to.contain('Print DIS7')
        expect($data.get(9).innerText).to.contain('View punishments')

        expect($data.get(10).innerText).to.contain('12346')
        expect($data.get(11).innerText).to.contain('Ray, Tony - P3785CP')
        expect($data.get(12).innerText).to.contain('A-2-001')
        expect($data.get(13).innerText).to.contain('26 August 2023 - 10:00')
        expect($data.get(14).innerText).to.contain('Dismissed')
        expect($data.get(15).innerText).to.contain('No')
        expect($data.get(16).innerText).to.contain('0')
        expect($data.get(17).innerText).to.contain('-')
        expect($data.get(18).innerText).to.contain('Print DIS7')
        expect($data.get(19).innerText).to.contain('View punishments')

        expect($data.get(20).innerText).to.contain('12347')
        expect($data.get(21).innerText).to.contain('Smith, David - G6345BY')
        expect($data.get(22).innerText).to.contain('MDI-1-001')
        expect($data.get(23).innerText).to.contain('26 August 2023 - 10:50')
        expect($data.get(24).innerText).to.contain('Charge proved')
        expect($data.get(25).innerText).to.contain('Yes')
        expect($data.get(26).innerText).to.contain('1')
        expect($data.get(27).innerText).to.contain('-')
        expect($data.get(28).innerText).to.contain('Print DIS7')
        expect($data.get(29).innerText).to.contain('View punishments')
      })

    awardedPunishmentsAndDamagesPage
      .viewReportLink(1)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.printPdf.urls.dis7('12345')}`)
    awardedPunishmentsAndDamagesPage
      .viewPunishmentsLink(1)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.punishmentsAndDamages.urls.review('12345')}`)

    awardedPunishmentsAndDamagesPage
      .viewReportLink(2)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.printPdf.urls.dis7('12346')}`)
    awardedPunishmentsAndDamagesPage
      .viewPunishmentsLink(2)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.punishmentsAndDamages.urls.review('12346')}`)

    awardedPunishmentsAndDamagesPage
      .viewReportLink(3)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.printPdf.urls.dis7('12347')}`)
    awardedPunishmentsAndDamagesPage
      .viewPunishmentsLink(3)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.punishmentsAndDamages.urls.review('12347')}`)
  })

  it('should show the no hearings message if there are no scheduled hearings on that day', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: today.format('YYYY-MM-DD'),
      response: {
        hearings: [],
      },
    })

    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.root)
    const awardedPunishmentsAndDamagesPage: AwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      AwardedPunishmentsAndDamagesPage
    )
    awardedPunishmentsAndDamagesPage.noResultsMessage().should('exist')
  })

  it('should accept user-chosen filtering', () => {
    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.root)
    const awardedPunishmentsAndDamagesPage: AwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      AwardedPunishmentsAndDamagesPage
    )
    awardedPunishmentsAndDamagesPage.forceHearingDate(today.date(), month, today.year())
    awardedPunishmentsAndDamagesPage.selectLocation().select('Houseblock 1')
    awardedPunishmentsAndDamagesPage.applyButton().click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.awardedPunishmentsAndDamages.urls.start())
      expect(loc.search).to.eq(
        `?hearingDate=${`${today.date()}`.padStart(2, '0')}%2F${`${month}`.padStart(
          2,
          '0'
        )}%2F${today.year()}&locationId=25538`
      )
    })
    // P3785CP should be filtered out based on the locationId
    awardedPunishmentsAndDamagesPage.resultsTable().find('tr').should('have.length', 3)
  })

  it('should clear the filter when the link is clicked', () => {
    cy.visit(
      adjudicationUrls.awardedPunishmentsAndDamages.urls.filter({
        hearingDate: today.format('DD/MM/YYYY'),
        locationId: '27102',
      })
    )
    const awardedPunishmentsAndDamagesPage: AwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      AwardedPunishmentsAndDamagesPage
    )
    awardedPunishmentsAndDamagesPage.clearLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.awardedPunishmentsAndDamages.urls.start())
      expect(loc.search).to.eq('')
    })
  })
})

context('Awarded punishments and damages - Financial', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUsersLocations', testData.residentialLocations())
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: today.format('YYYY-MM-DD'),
      response: {
        hearings: [
          {
            ...testData.singleHearing({
              dateTimeOfHearing: '2023-08-26T10:00:00',
              id: 1,
            }),
            dateTimeOfHearing: '2023-08-26T10:00:00',
            chargeNumber: '12345',
            prisonerNumber: 'G6345BY',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
          },
          {
            ...testData.singleHearing({
              dateTimeOfHearing: '2023-08-26T10:00:00',
              id: 1,
            }),
            dateTimeOfDiscovery: '2023-11-03T10:00:00',
            chargeNumber: '12346',
            prisonerNumber: 'P3785CP',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
          },
        ],
      },
    })
    cy.task('stubGetBatchPrisonerDetails', [
      testData.simplePrisoner('G6345BY', 'DAVID', 'SMITH', 'MDI-1-001'),
      testData.simplePrisoner('P3785CP', 'TONY', 'RAY', 'A-2-001'),
    ])
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '12345',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6345BY',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                }),
              },
            },
          ],
          punishments: [
            {
              id: 1,
              redisId: 'xyz',
              type: PunishmentType.DAMAGES_OWED,
              schedule: {
                days: 0,
              },
              damagesOwedAmount: 100,
            },
            {
              id: 2,
              redisId: 'xyz',
              type: PunishmentType.EARNINGS,
              schedule: {
                days: 0,
              },
              damagesOwedAmount: 100,
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({ createdByUserId: 'USER1' })],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12346,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '12346',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'P3785CP',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                }),
              },
            },
          ],
          punishments: [
            {
              id: 1,
              redisId: 'xyz',
              type: PunishmentType.EARNINGS,
              schedule: {
                days: 0,
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({ createdByUserId: 'USER1' })],
        }),
      },
    })

    cy.signIn()
  })

  it('should have the required elements on the page', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.awardedPunishmentsAndDamagesLink().click()
    const awardedPunishmentsAndDamagesPage: AwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      AwardedPunishmentsAndDamagesPage
    )
    awardedPunishmentsAndDamagesPage.financialAwardedPunishmentsAndDamagesTab().click()

    const financialAwardedPunishmentsAndDamagesPage: FinancialAwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      FinancialAwardedPunishmentsAndDamagesPage
    )
    financialAwardedPunishmentsAndDamagesPage.allAwardedPunishmentsAndDamagesTab().should('exist')
    financialAwardedPunishmentsAndDamagesPage.financialAwardedPunishmentsAndDamagesTab().should('exist')
    financialAwardedPunishmentsAndDamagesPage.additionalDaysAwardedPunishmentsTab().should('exist')
    financialAwardedPunishmentsAndDamagesPage.financialGuidanceMessage().should('exist')
    financialAwardedPunishmentsAndDamagesPage.datePicker().should('exist')
    financialAwardedPunishmentsAndDamagesPage.selectLocation().should('exist')
    financialAwardedPunishmentsAndDamagesPage.leftArrow().should('exist')
    financialAwardedPunishmentsAndDamagesPage.rightArrow().should('exist')
    financialAwardedPunishmentsAndDamagesPage.applyButton().should('exist')
    financialAwardedPunishmentsAndDamagesPage.clearLink().should('exist')
    financialAwardedPunishmentsAndDamagesPage.resultsTable().should('exist')
    financialAwardedPunishmentsAndDamagesPage.noResultsMessage().should('not.exist')
  })

  it('should have the correct details showing in the table', () => {
    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())

    const financialAwardedPunishmentsAndDamagesPage: FinancialAwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      FinancialAwardedPunishmentsAndDamagesPage
    )
    financialAwardedPunishmentsAndDamagesPage
      .resultsTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Charge number')
        expect($headings.get(1).innerText).to.contain('Name and prison number')
        expect($headings.get(2).innerText).to.contain('Location')
        expect($headings.get(3).innerText).to.contain('Hearing date and time')
        expect($headings.get(4).innerText).to.contain('Status')
        expect($headings.get(5).innerText).to.contain('Financial punishments')
        expect($headings.get(6).innerText).to.contain('Damages')
        expect($headings.get(7).innerText).to.contain('')
      })

    financialAwardedPunishmentsAndDamagesPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('12345')
        expect($data.get(1).innerText).to.contain('Smith, David - G6345BY')
        expect($data.get(2).innerText).to.contain('MDI-1-001')
        expect($data.get(3).innerText).to.contain('26 August 2023 - 10:00')
        expect($data.get(4).innerText).to.contain('Charge proved')
        expect($data.get(5).innerText).to.contain('2')
        expect($data.get(6).innerText).to.contain('£200')
        expect($data.get(7).innerText).to.contain('View punishments')

        expect($data.get(8).innerText).to.contain('12346')
        expect($data.get(9).innerText).to.contain('Ray, Tony - P3785CP')
        expect($data.get(10).innerText).to.contain('A-2-001')
        expect($data.get(11).innerText).to.contain('26 August 2023 - 10:00')
        expect($data.get(12).innerText).to.contain('Charge proved')
        expect($data.get(13).innerText).to.contain('1')
        expect($data.get(14).innerText).to.contain('-')
        expect($data.get(15).innerText).to.contain('View punishments')
      })

    financialAwardedPunishmentsAndDamagesPage
      .viewPunishmentsLink(1)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.punishmentsAndDamages.urls.review('12345')}`)

    financialAwardedPunishmentsAndDamagesPage
      .viewPunishmentsLink(2)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.punishmentsAndDamages.urls.review('12346')}`)
  })

  it('should show the no hearings message if there are no scheduled hearings on that day', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: today.format('YYYY-MM-DD'),
      response: {
        hearings: [],
      },
    })

    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())
    const financialAwardedPunishmentsAndDamagesPage: FinancialAwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      FinancialAwardedPunishmentsAndDamagesPage
    )
    financialAwardedPunishmentsAndDamagesPage.noResultsMessage().should('exist')
  })

  it('should accept user-chosen filtering', () => {
    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())
    const financialAwardedPunishmentsAndDamagesPage: FinancialAwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      FinancialAwardedPunishmentsAndDamagesPage
    )
    financialAwardedPunishmentsAndDamagesPage.forceHearingDate(today.date(), month, today.year())
    financialAwardedPunishmentsAndDamagesPage.selectLocation().select('Houseblock 1')
    financialAwardedPunishmentsAndDamagesPage.applyButton().click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())
      expect(loc.search).to.eq(
        `?hearingDate=${`${today.date()}`.padStart(2, '0')}%2F${`${month}`.padStart(
          2,
          '0'
        )}%2F${today.year()}&locationId=25538`
      )
    })
    // P3785CP should be filtered out based on the locationId
    financialAwardedPunishmentsAndDamagesPage.resultsTable().find('tr').should('have.length', 2)
  })

  it('should clear the filter when the link is clicked', () => {
    cy.visit(
      adjudicationUrls.awardedPunishmentsAndDamages.urls.financialFilter({
        hearingDate: today.format('DD/MM/YYYY'),
        locationId: '27102',
      })
    )
    const financialAwardedPunishmentsAndDamagesPage: FinancialAwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      FinancialAwardedPunishmentsAndDamagesPage
    )
    financialAwardedPunishmentsAndDamagesPage.clearLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.awardedPunishmentsAndDamages.urls.financial())
      expect(loc.search).to.eq('')
    })
  })
})

context('Awarded punishments and damages - Additional days', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUsersLocations', testData.residentialLocations())
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: today.format('YYYY-MM-DD'),
      response: {
        hearings: [
          {
            ...testData.singleHearing({
              dateTimeOfHearing: '2023-08-26T10:00:00',
              id: 1,
            }),
            dateTimeOfHearing: '2023-08-26T10:00:00',
            chargeNumber: '12345',
            prisonerNumber: 'G6345BY',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
          },
          {
            ...testData.singleHearing({
              dateTimeOfHearing: '2023-08-26T10:00:00',
              id: 1,
            }),
            dateTimeOfDiscovery: '2023-11-03T10:00:00',
            chargeNumber: '12346',
            prisonerNumber: 'P3785CP',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
          },
        ],
      },
    })
    cy.task('stubGetBatchPrisonerDetails', [
      testData.simplePrisoner('G6345BY', 'DAVID', 'SMITH', 'MDI-1-001'),
      testData.simplePrisoner('P3785CP', 'TONY', 'RAY', 'A-2-001'),
    ])
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '12345',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6345BY',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                }),
              },
            },
          ],
          punishments: [
            {
              id: 1,
              redisId: 'xyz',
              type: PunishmentType.ADDITIONAL_DAYS,
              schedule: {
                days: 14,
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({ createdByUserId: 'USER1' })],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12346,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '12346',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'P3785CP',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                }),
              },
            },
          ],
          punishments: [
            {
              id: 1,
              redisId: 'xyz',
              type: PunishmentType.PROSPECTIVE_DAYS,
              schedule: {
                days: 7,
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({ createdByUserId: 'USER1' })],
        }),
      },
    })

    cy.signIn()
  })

  it('should have the required elements on the page', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.awardedPunishmentsAndDamagesLink().click()
    const awardedPunishmentsAndDamagesPage: AwardedPunishmentsAndDamagesPage = Page.verifyOnPage(
      AwardedPunishmentsAndDamagesPage
    )
    awardedPunishmentsAndDamagesPage.additionalDaysAwardedPunishmentsTab().click()

    const additionalDaysAwardedPunishmentsPage: AdditionalDaysAwardedPunishmentsPage = Page.verifyOnPage(
      AdditionalDaysAwardedPunishmentsPage
    )
    additionalDaysAwardedPunishmentsPage.allAwardedPunishmentsAndDamagesTab().should('exist')
    additionalDaysAwardedPunishmentsPage.financialAwardedPunishmentsAndDamagesTab().should('exist')
    additionalDaysAwardedPunishmentsPage.additionalDaysAwardedPunishmentsTab().should('exist')
    additionalDaysAwardedPunishmentsPage.datePicker().should('exist')
    additionalDaysAwardedPunishmentsPage.selectLocation().should('exist')
    additionalDaysAwardedPunishmentsPage.leftArrow().should('exist')
    additionalDaysAwardedPunishmentsPage.rightArrow().should('exist')
    additionalDaysAwardedPunishmentsPage.applyButton().should('exist')
    additionalDaysAwardedPunishmentsPage.clearLink().should('exist')
    additionalDaysAwardedPunishmentsPage.resultsTable().should('exist')
    additionalDaysAwardedPunishmentsPage.noResultsMessage().should('not.exist')
  })

  it('should have the correct details showing in the table', () => {
    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays())

    const additionalDaysAwardedPunishmentsPage: AdditionalDaysAwardedPunishmentsPage = Page.verifyOnPage(
      AdditionalDaysAwardedPunishmentsPage
    )
    additionalDaysAwardedPunishmentsPage
      .resultsTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Charge number')
        expect($headings.get(1).innerText).to.contain('Name and prison number')
        expect($headings.get(2).innerText).to.contain('Location')
        expect($headings.get(3).innerText).to.contain('Hearing date and time')
        expect($headings.get(4).innerText).to.contain('Status')
        expect($headings.get(5).innerText).to.contain('Additional days')
        expect($headings.get(6).innerText).to.contain('Prospective additional days')
        expect($headings.get(7).innerText).to.contain('')
      })

    additionalDaysAwardedPunishmentsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('12345')
        expect($data.get(1).innerText).to.contain('Smith, David - G6345BY')
        expect($data.get(2).innerText).to.contain('MDI-1-001')
        expect($data.get(3).innerText).to.contain('26 August 2023 - 10:00')
        expect($data.get(4).innerText).to.contain('Charge proved')
        expect($data.get(5).innerText).to.contain('14')
        expect($data.get(6).innerText).to.contain('0')
        expect($data.get(7).innerText).to.contain('View punishments')

        expect($data.get(8).innerText).to.contain('12346')
        expect($data.get(9).innerText).to.contain('Ray, Tony - P3785CP')
        expect($data.get(10).innerText).to.contain('A-2-001')
        expect($data.get(11).innerText).to.contain('26 August 2023 - 10:00')
        expect($data.get(12).innerText).to.contain('Charge proved')
        expect($data.get(13).innerText).to.contain('0')
        expect($data.get(14).innerText).to.contain('7')
        expect($data.get(15).innerText).to.contain('View punishments')
      })

    additionalDaysAwardedPunishmentsPage
      .viewPunishmentsLink(1)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.punishmentsAndDamages.urls.review('12345')}`)

    additionalDaysAwardedPunishmentsPage
      .viewPunishmentsLink(2)
      .should('have.attr', 'href')
      .and('include', `${adjudicationUrls.punishmentsAndDamages.urls.review('12346')}`)
  })

  it('should show the no hearings message if there are no scheduled hearings on that day', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: today.format('YYYY-MM-DD'),
      response: {
        hearings: [],
      },
    })

    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays())
    const additionalDaysAwardedPunishmentsPage: AdditionalDaysAwardedPunishmentsPage = Page.verifyOnPage(
      AdditionalDaysAwardedPunishmentsPage
    )
    additionalDaysAwardedPunishmentsPage.noResultsMessage().should('exist')
  })

  it('should accept user-chosen filtering', () => {
    cy.visit(adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays())
    const additionalDaysAwardedPunishmentsPage: AdditionalDaysAwardedPunishmentsPage = Page.verifyOnPage(
      AdditionalDaysAwardedPunishmentsPage
    )
    additionalDaysAwardedPunishmentsPage.forceHearingDate(today.date(), month, today.year())
    additionalDaysAwardedPunishmentsPage.selectLocation().select('Houseblock 1')
    additionalDaysAwardedPunishmentsPage.applyButton().click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays())
      expect(loc.search).to.eq(
        `?hearingDate=${`${today.date()}`.padStart(2, '0')}%2F${`${month}`.padStart(
          2,
          '0'
        )}%2F${today.year()}&locationId=25538`
      )
    })
    // P3785CP should be filtered out based on the locationId
    additionalDaysAwardedPunishmentsPage.resultsTable().find('tr').should('have.length', 2)
  })

  it('should clear the filter when the link is clicked', () => {
    cy.visit(
      adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDaysFilter({
        hearingDate: today.format('DD/MM/YYYY'),
        locationId: '27102',
      })
    )
    const additionalDaysAwardedPunishmentsPage: AdditionalDaysAwardedPunishmentsPage = Page.verifyOnPage(
      AdditionalDaysAwardedPunishmentsPage
    )
    additionalDaysAwardedPunishmentsPage.clearLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.awardedPunishmentsAndDamages.urls.additionalDays())
      expect(loc.search).to.eq('')
    })
  })
})
