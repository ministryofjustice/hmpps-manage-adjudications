import moment from 'moment'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HomepagePage from '../pages/home'
import Page from '../pages/page'

context('Home page - not reviewer', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', ['ROLE_NOT_REVIEWER'])
    cy.task('stubAuthUser')
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.signIn()
  })

  it('should only see some tiles without the reviewer role', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.startANewReportLink().should('exist')
    homepage.continueAReportLink().should('exist')
    homepage.viewYourCompletedReportsLink().should('exist')
    homepage.viewAllReportsCard('Moorland (HMP & YOI)').should('not.exist')
    homepage.manageHearingsCard().should('not.exist')
    homepage.sectionBreak().should('exist')
    homepage.printCompletedDisFormsLink().should('exist')
    homepage.confirmDisHasBeenIssuedLink().should('exist')
    homepage.enterOutcomesCard().should('not.exist')
  })
})

context('Home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.signIn()
  })

  it('should see all the tiles with the reviewer role', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.startANewReportLink().should('exist')
    homepage.continueAReportLink().should('exist')
    homepage.viewYourCompletedReportsLink().should('exist')
    homepage.viewAllReportsCard('Moorland (HMP & YOI)').should('exist')
    homepage.manageHearingsCard().should('exist')
    homepage.transfersInCard().should('exist')
    homepage.transfersOutCard().should('exist')
    homepage.enterOutcomesCard().should('exist')
    homepage.sectionBreak().should('exist')
    homepage.printCompletedDisFormsLink().should('exist')
    homepage.confirmDisHasBeenIssuedLink().should('exist')
    homepage.reviewReportsLink().should('contain.text', 'Awaiting review (2)')
  })

  it('should link to the correct location - view all reports (main link)', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.viewAllReportsCard('Moorland (HMP & YOI)').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.urls.start())
    })
  })
  it('should link to the correct location - view all reports (review reports link)', () => {
    const filterString = `?fromDate=${moment().subtract(7, 'days').format('DD/MM/YYYY')}&toDate=${moment().format(
      'DD/MM/YYYY'
    )}&status=AWAITING_REVIEW`
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.reviewReportsLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq(filterString.replace(/\//g, '%2F'))
    })
  })
  it('should link to the correct location - view all reports (schedule reports link)', () => {
    const filterString = `?fromDate=01%2F01%2F2024&toDate=${moment().format(
      'DD/MM/YYYY'
    )}&status=UNSCHEDULED&status=ADJOURNED&status=REFER_INAD&status=REFER_GOV&status=REFER_POLICE`
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.scheduleHearingsLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq(filterString.replace(/\//g, '%2F'))
    })
  })
  it('should link to the correct location - Manage hearings and enter outcomes', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.manageHearingsCard().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.viewScheduledHearings.urls.start())
    })
  })
  it('should link to the correct location - start new report', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.startANewReportLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.isPrisonerStillInEstablishment.root)
    })
  })
  it('should link to the correct location - continue report', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.continueAReportLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.continueReport.root)
    })
  })
  it('should link to the correct location - view your completed report', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.viewYourCompletedReportsLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
    })
  })
  it('should link to the correct location - print completed dis forms', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.printCompletedDisFormsLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.printCompletedDisForms.root)
    })
  })
  it('should link to the correct location - confirm dis has been issued', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.confirmDisHasBeenIssuedLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.confirmDISFormsIssued.root)
    })
  })
  it('should link to the correct location - data insights', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.dataInsightsLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.dataInsights.root)
    })
  })
})
