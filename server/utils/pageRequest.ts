export default class PageRequest {
  constructor(readonly size: number, readonly number: number, readonly page: number = 1) {}
}
