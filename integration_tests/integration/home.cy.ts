import moment from 'moment'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HomepagePage from '../pages/home'
import Page from '../pages/page'

context('Home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should see the feedback banner', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.feedbackBanner().should('exist')
  })

  it('should only see some tiles without the reviewer role', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.feedbackBanner().should('exist')
    homepage.startANewReportLink().should('exist')
    homepage.continueAReportLink().should('exist')
    homepage.viewYourCompletedReportsLink().should('exist')
    homepage.viewAllReportsCard().should('not.exist')
    homepage.viewScheduledHearingsCard().should('not.exist')
    homepage.sectionBreak().should('exist')
    homepage.printCompletedDisFormsLink().should('exist')
    homepage.confirmDisHasBeenIssuedLink().should('exist')
    homepage.enterOutcomesCard().should('not.exist')
  })

  it('should see all the tiles with the reviewer role', () => {
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.feedbackBanner().should('exist')
    homepage.startANewReportLink().should('exist')
    homepage.continueAReportLink().should('exist')
    homepage.viewYourCompletedReportsLink().should('exist')
    homepage.viewAllReportsCard().should('exist')
    homepage.viewScheduledHearingsCard().should('exist')
    homepage.enterOutcomesCard().should('exist')
    homepage.sectionBreak().should('exist')
    homepage.printCompletedDisFormsLink().should('exist')
    homepage.confirmDisHasBeenIssuedLink().should('exist')
  })

  it('should link to the correct location - view all reports (main link)', () => {
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.viewAllReportsCard().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.urls.start())
    })
  })
  it('should link to the correct location - view all reports (review reports link)', () => {
    const filterString = `?fromDate=${moment().subtract(7, 'days').format('DD/MM/YYYY')}&toDate=${moment().format(
      'DD/MM/YYYY'
    )}&status=AWAITING_REVIEW`
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.reviewReportsLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq(filterString.replace(/\//g, '%2F'))
    })
  })
  it('should link to the correct location - view all reports (schedule reports link)', () => {
    const filterString = `?fromDate=${moment().subtract(7, 'days').format('DD/MM/YYYY')}&toDate=${moment().format(
      'DD/MM/YYYY'
    )}&status=UNSCHEDULED&status=ADJOURNED&status=REFER_INAD`
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.scheduleHearingsLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq(filterString.replace(/\//g, '%2F'))
    })
  })
  it('should link to the correct location - view schedule hearings', () => {
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.viewScheduledHearingsCard().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.viewScheduledHearings.urls.start())
    })
  })
  it('should link to the correct location - start new report', () => {
    cy.visit(adjudicationUrls.homepage.root)
    const homepage: HomepagePage = Page.verifyOnPage(HomepagePage)
    homepage.startANewReportLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.searchForPrisoner.root)
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
})
