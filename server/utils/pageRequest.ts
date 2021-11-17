export default class PageRequest {
  constructor(readonly size: number, readonly number: number, readonly firstPage: number = 1) {}

  changeIndex(newFirstPage: number): PageRequest {
    const offset = this.firstPage - newFirstPage
    return new PageRequest(this.size, this.number - offset, newFirstPage)
  }
}
