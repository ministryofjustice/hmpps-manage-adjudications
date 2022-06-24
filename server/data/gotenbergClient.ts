import superagent from 'superagent'

export type PdfMargins = {
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
}

export default class GotenbergClient {
  private gotenbergHost: string

  constructor(gotenbergHost: string) {
    this.gotenbergHost = gotenbergHost
  }

  async renderPdfFromHtml(
    html: string,
    headerHtml: string,
    footerHtml: string,
    options: PdfMargins = {}
  ): Promise<Buffer> {
    const { marginBottom, marginLeft, marginRight, marginTop } = options
    const request = superagent
      .post(`${this.gotenbergHost}/forms/chromium//convert/html`)
      .set('Content-Type', 'multi-part/form-data')
      .buffer(true)
      .attach('files', Buffer.from(html), 'index.html')
      .attach('files', Buffer.from(headerHtml), 'header.html')
      .attach('files', Buffer.from(footerHtml), 'footer.html')
      .responseType('blob')

    // Gotenberg defaults to using A4 format. Page size and margins specified in inches
    if (marginTop) request.field('marginTop', marginTop)
    if (marginBottom) request.field('marginBottom', marginBottom)
    if (marginLeft) request.field('marginLeft', marginLeft)
    if (marginRight) request.field('marginRight', marginRight)

    // Execute the POST to the Gotenberg container
    const response = await request
    return response.body
  }
}
