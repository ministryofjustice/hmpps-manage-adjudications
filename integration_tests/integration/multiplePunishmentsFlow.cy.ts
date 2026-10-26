import Page from '../pages/page'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import PunishmentPage from '../pages/punishment'
import PunishmentSameDurationPage from '../pages/punishmentSameDuration'
import PunishmentDurationPage from '../pages/punishmentDuration'
import PunishmentSchedulePage from '../pages/punishmentSchedule'
import AwardPunishmentsPage from '../pages/awardPunishments'
import WhichPunishmentsHaveRehabilitativeActivitiesPage from '../pages/whichPunishmentsHaveRehabilitativeActivities'
import SameRehabilitativeActivityPage from '../pages/sameRehabilitativeActivity'
import HasRehabilitativeActivitesDetailsPage from '../pages/hasRehabilitativeActivitiesDetailsPage'
import RehabilitativeActivityDetailsPage from '../pages/rehabilitativeActivityDetails'
import RehabilitativeActivitiesSchedulePage from '../pages/rehabilitativeActivitiesSchedule'
import CheckPunishmentsPage from '../pages/checkPunishments'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDays'

const testData = new TestData()

// The journey is switched on for Leeds only (feature.env), so these tests sign in with Leeds as the active caseload
const switchedOnPrison = { caseLoadId: 'LEI', description: 'Leeds (HMP)' }

const stubReport = (chargeNumber: string, isYouthOffender = false) =>
  cy.task('stubGetReportedAdjudication', {
    id: chargeNumber,
    response: {
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber,
        prisonerNumber: 'G6123VU',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        isYouthOffender,
        hearings: [testData.singleHearing({ dateTimeOfHearing: '2026-08-17T10:00:00', id: 68 })],
        punishments: [],
      }),
    },
  })

const choosePrivileges = (...privileges: PrivilegeType[]) => {
  const punishmentPage = Page.verifyOnPage(PunishmentPage)
  punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
  privileges.forEach(privilege => punishmentPage.privilegeCheckboxes().find(`input[value="${privilege}"]`).check())
  if (privileges.includes(PrivilegeType.OTHER)) punishmentPage.otherPrivilege().type('Library')
  punishmentPage.submitButton().click()
}

const answerDuration = (days: string, startMode: 'IMMEDIATE' | 'LATER' | 'SUSPENDED', date?: string) => {
  const durationPage = Page.verifyOnPage(PunishmentDurationPage)
  durationPage.days().clear().type(days)
  durationPage.startMode().find(`input[value="${startMode}"]`).check()
  if (startMode === 'LATER') durationPage.startDate().clear().type(date)
  if (startMode === 'SUSPENDED') durationPage.suspendedUntil().clear().type(date)
  durationPage.submitButton().click()
}

type SentPunishment = Record<string, unknown> & { rehabilitativeActivities: Record<string, unknown>[] }

// The fields of each punishment the user answered, from the one POST made for the charge
// (the app also sends its own session fields, such as the redisId, which vary per run)
const sentPunishments = (chargeNumber: string) =>
  cy.task('getSentPunishments', { chargeNumber }).then(sent => {
    expect(sent as unknown[]).to.have.length(1)
    return ((sent as SentPunishment[][])[0] || []).map(punishment => {
      const answered: Record<string, unknown> = {}
      ;['type', 'privilegeType', 'otherPrivilege', 'duration', 'startDate', 'endDate', 'suspendedUntil'].forEach(
        key => {
          if (punishment[key] !== null && punishment[key] !== undefined) answered[key] = punishment[key]
        },
      )
      answered.rehabilitativeActivities = punishment.rehabilitativeActivities.map(
        ({ details, monitor, endDate, totalSessions }) => ({ details, monitor, endDate, totalSessions }),
      )
      return answered
    })
  })

context('Award several punishments in one journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubFeComponents', switchedOnPrison)
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', { username: 'USER1', response: testData.userFromUsername() })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6123VU',
      response: testData.prisonerResultSummary({ offenderNo: 'G6123VU', firstName: 'JOHN', lastName: 'SMITH' }),
    })
    stubReport('100')
    stubReport('101', true)
    cy.task('stubCreatePunishments', {
      chargeNumber: '100',
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
        }),
      },
    })
    cy.signIn()
  })

  it('adds several privileges one at a time, then a rehabilitative activity, and submits them together', () => {
    cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
    Page.verifyOnPage(AwardPunishmentsPage).newPunishment().click()
    choosePrivileges(PrivilegeType.CANTEEN, PrivilegeType.TV, PrivilegeType.OTHER)

    const samePage = Page.verifyOnPage(PunishmentSameDurationPage)
    samePage.submitButton().click()
    samePage.errorSummary().contains('Select yes if they all have the same duration and start date')
    samePage.sameForAll().find('input[value="NO"]').check()
    samePage.submitButton().click()

    const durationPage = Page.verifyOnPage(PunishmentDurationPage)
    durationPage.caption().should('contain', 'Punishment 1 of 3')
    durationPage.heading().should('contain', 'Loss of canteen: duration and start date')
    durationPage.submitButton().click()
    durationPage.errorSummary().contains('Enter how many days the punishment will last')
    durationPage.errorSummary().contains('Select when this punishment will take effect')
    answerDuration('21', 'IMMEDIATE')

    Page.verifyOnPage(PunishmentDurationPage).caption().should('contain', 'Punishment 2 of 3')
    answerDuration('14', 'LATER', '01/09/2026')

    Page.verifyOnPage(PunishmentDurationPage).heading().should('contain', 'Loss of library')
    answerDuration('21', 'SUSPENDED', '16/09/2026')

    const schedulePage = Page.verifyOnPage(PunishmentSchedulePage)
    schedulePage.punishmentName(1).should('contain', 'Loss of canteen')
    schedulePage.schedule(1).should('contain', '17 August 2026').and('contain', '6 September 2026')
    schedulePage.schedule(2).should('contain', '1 September 2026').and('contain', '14 September 2026')
    schedulePage.punishmentName(3).should('contain', 'Loss of library')
    schedulePage.schedule(3).should('contain', 'Suspended until').and('contain', '16 September 2026')
    schedulePage.submitButton().click()

    const awardPage = Page.verifyOnPage(AwardPunishmentsPage)
    awardPage.successBanner().should('contain', '3 punishments added')
    awardPage.punishmentsTable().find('tbody tr').should('have.length', 3)
    awardPage.addRehabilitativeActivity().click()

    const whichPage = Page.verifyOnPage(WhichPunishmentsHaveRehabilitativeActivitiesPage)
    whichPage.punishments().find('input[type="checkbox"]').should('have.length', 1)
    whichPage.punishments().should('contain', 'Loss of library').and('contain', 'Suspended until 16 September 2026')
    whichPage.submitButton().click()
    whichPage.errorSummary().contains('Select which punishments have a rehabilitative activity condition')
    whichPage.punishments().find('input[type="checkbox"]').check()
    whichPage.submitButton().click()

    const hasDetailsPage = Page.verifyOnPage(HasRehabilitativeActivitesDetailsPage)
    cy.get('h1').should('contain', 'rehabilitative activities for loss of library?')
    hasDetailsPage.detailsChoice().find('input[value="YES"]').check()
    hasDetailsPage.numberOfActivities().type('1')
    hasDetailsPage.submitButton().click()

    const activityPage = Page.verifyOnPage(RehabilitativeActivityDetailsPage)
    activityPage.activityDescription().type('Cleaning cells')
    activityPage.monitorName().type('Thomas Brown')
    activityPage.endDate().type('20/09/2026')
    activityPage.numberOfSessions().type('2')
    activityPage.submitButton().click()
    activityPage
      .errorSummary()
      .contains('Completion date must be on or before 16 September 2026, the date the punishment is suspended until')
    activityPage.endDate().clear().type('15/09/2026')
    activityPage.submitButton().click()

    const rehabSchedulePage = Page.verifyOnPage(RehabilitativeActivitiesSchedulePage)
    rehabSchedulePage
      .schedule(1)
      .should('contain', 'Loss of library')
      .and('contain', 'Cleaning cells')
      .and('contain', 'Thomas Brown')
      .and('contain', '15 September 2026')
    rehabSchedulePage.submitButton().click()

    Page.verifyOnPage(AwardPunishmentsPage).successBanner().should('contain', 'Rehabilitative activity added')
    awardPage.activitiesTable().should('contain', 'Cleaning cells')
    awardPage.continue().click()

    Page.verifyOnPage(CheckPunishmentsPage).submitButton().click()

    sentPunishments('100').should('deep.equal', [
      {
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.CANTEEN,
        duration: 21,
        startDate: '2026-08-17',
        endDate: '2026-09-06',
        rehabilitativeActivities: [],
      },
      {
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.TV,
        duration: 14,
        startDate: '2026-09-01',
        endDate: '2026-09-14',
        rehabilitativeActivities: [],
      },
      {
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'Library',
        duration: 21,
        suspendedUntil: '2026-09-16',
        rehabilitativeActivities: [
          { details: 'Cleaning cells', monitor: 'Thomas Brown', endDate: '2026-09-15', totalSessions: 2 },
        ],
      },
    ])
  })

  it('applies one answer to several punishments and one activity to several suspended punishments', () => {
    cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
    Page.verifyOnPage(AwardPunishmentsPage).newPunishment().click()
    choosePrivileges(PrivilegeType.GYM, PrivilegeType.ASSOCIATION)

    const samePage = Page.verifyOnPage(PunishmentSameDurationPage)
    samePage.sameForAll().find('input[value="YES"]').check()
    samePage.submitButton().click()

    const durationPage = Page.verifyOnPage(PunishmentDurationPage)
    durationPage.heading().should('contain', 'Duration and start date for all 2 punishments')
    durationPage.appliesTo().should('contain', 'Loss of association, Loss of gym')
    answerDuration('7', 'SUSPENDED', '30/11/2026')

    Page.verifyOnPage(PunishmentSchedulePage).submitButton().click()
    Page.verifyOnPage(AwardPunishmentsPage).successBanner().should('contain', '2 punishments added')
    Page.verifyOnPage(AwardPunishmentsPage).addRehabilitativeActivity().click()

    const whichPage = Page.verifyOnPage(WhichPunishmentsHaveRehabilitativeActivitiesPage)
    whichPage.punishments().find('input[type="checkbox"]').check()
    whichPage.submitButton().click()

    const sameActivityPage = Page.verifyOnPage(SameRehabilitativeActivityPage)
    sameActivityPage.sameForAll().find('input[value="YES"]').check()
    sameActivityPage.submitButton().click()

    const hasDetailsPage = Page.verifyOnPage(HasRehabilitativeActivitesDetailsPage)
    hasDetailsPage.appliesTo().should('contain', 'Loss of association').and('contain', 'Loss of gym')
    hasDetailsPage.detailsChoice().find('input[value="NO"]').check()
    hasDetailsPage.submitButton().click()

    const rehabSchedulePage = Page.verifyOnPage(RehabilitativeActivitiesSchedulePage)
    rehabSchedulePage.schedule(1).should('contain', 'Not entered')
    rehabSchedulePage.schedule(2).should('contain', 'Not entered')
    rehabSchedulePage.submitButton().click()

    const awardPage = Page.verifyOnPage(AwardPunishmentsPage)
    awardPage.activitiesTable().find('tbody tr').should('have.length', 2)
    awardPage.continue().click()
    Page.verifyOnPage(CheckPunishmentsPage).submitButton().click()

    const placeholder = { details: undefined, monitor: undefined, endDate: undefined, totalSessions: undefined }
    sentPunishments('100').should('deep.equal', [
      {
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.ASSOCIATION,
        duration: 7,
        suspendedUntil: '2026-11-30',
        rehabilitativeActivities: [placeholder],
      },
      {
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.GYM,
        duration: 7,
        suspendedUntil: '2026-11-30',
        rehabilitativeActivities: [placeholder],
      },
    ])
  })

  it('sends a single day-based punishment through the same pages, and keeps answers when leaving a loop', () => {
    cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
    Page.verifyOnPage(AwardPunishmentsPage).newPunishment().click()
    const punishmentPage = Page.verifyOnPage(PunishmentPage)
    punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
    punishmentPage.submitButton().click()

    const durationPage = Page.verifyOnPage(PunishmentDurationPage)
    durationPage.heading().should('contain', 'Cellular confinement: duration and start date')
    durationPage.caption().should('not.exist')
    answerDuration('5', 'IMMEDIATE')
    Page.verifyOnPage(PunishmentSchedulePage).submitButton().click()
    Page.verifyOnPage(AwardPunishmentsPage).successBanner().should('contain', 'Cellular confinement added')

    // two privileges, the first answered, then leave
    Page.verifyOnPage(AwardPunishmentsPage).newPunishment().click()
    choosePrivileges(PrivilegeType.CANTEEN, PrivilegeType.TV)
    Page.verifyOnPage(PunishmentSameDurationPage).sameForAll().find('input[value="NO"]').check()
    Page.verifyOnPage(PunishmentSameDurationPage).submitButton().click()
    answerDuration('10', 'IMMEDIATE')
    Page.verifyOnPage(PunishmentDurationPage).cancel().click()

    const awardPage = Page.verifyOnPage(AwardPunishmentsPage)
    awardPage.successBanner().should('not.exist')
    awardPage.punishmentsTable().should('contain', 'Cellular confinement').and('contain', 'Loss of canteen')
    awardPage.punishmentsTable().should('not.contain', 'Loss of TV')

    // change the canteen row through the type page and the duration page
    awardPage.editPunishment().eq(1).click()
    const editTypePage = Page.verifyOnPage(PunishmentPage)
    editTypePage.privilege().find('input[value="CANTEEN"]').should('be.checked')
    editTypePage.submitButton().click()
    const editDurationPage = Page.verifyOnPage(PunishmentDurationPage)
    editDurationPage.days().should('have.value', '10')
    answerDuration('12', 'IMMEDIATE')
    Page.verifyOnPage(AwardPunishmentsPage).punishmentsTable().find('tbody tr').eq(1).should('contain', '12 days')
  })

  it('applies the YOI maximum on the duration page', () => {
    cy.visit(adjudicationUrls.awardPunishments.urls.start('101'))
    Page.verifyOnPage(AwardPunishmentsPage).newPunishment().click()
    const punishmentPage = Page.verifyOnPage(PunishmentPage)
    punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
    punishmentPage.submitButton().click()
    answerDuration('11', 'IMMEDIATE')
    Page.verifyOnPage(PunishmentDurationPage)
      .errorSummary()
      .contains('Cellular confinement cannot be more than 10 days for an offence under YOI rules')
  })

  it('keeps today’s journey for a prison that is not switched on', () => {
    cy.task('stubFeComponents', {})
    cy.visit(adjudicationUrls.punishment.urls.start('100'))
    const punishmentPage = Page.verifyOnPage(PunishmentPage)
    punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
    punishmentPage.privilege().should('exist')
    punishmentPage.saveAndExit().should('not.exist')
    punishmentPage.privilege().find('input[value="TV"]').check()
    punishmentPage.submitButton().click()
    Page.verifyOnPage(PunishmentNumberOfDaysPage)
  })
})
