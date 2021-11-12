export default class PageRequest {
  constructor(readonly pageSize: number, readonly pageNumber: number, readonly firstPage: number = 1) {}
}
