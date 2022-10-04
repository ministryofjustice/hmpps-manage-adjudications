export default abstract class DamagesEvidenceWitnessHelper {
  abstract displayAPIData(): boolean

  abstract displaySessionData(): boolean

  abstract displayAPIDataSubmitted(): boolean

  abstract displaySessionDataSubmitted(): boolean

  isSubmittedEdit() {
    return this.displayAPIDataSubmitted() || this.displaySessionDataSubmitted()
  }

  isShowingAPIData() {
    return this.displayAPIData() || this.displayAPIDataSubmitted()
  }

  isShowingAPIDataAndPageVisited(apiCalled: boolean) {
    return (this.displayAPIData() && apiCalled) || this.displayAPIDataSubmitted()
  }

  isShowingSessionData() {
    return this.displaySessionData() || this.displaySessionDataSubmitted()
  }
}
