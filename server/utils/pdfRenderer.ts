import { Request, Response, NextFunction } from 'express'
import GotenbergClient, { PdfOptions } from '../data/gotenbergClient'

export type PdfPageData = { adjudicationsUrl: string } & Record<string, unknown>
export type PdfHeaderData = Record<string, unknown>

export function pdfRenderer(client: GotenbergClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderPdf = (
      page: string,
      pageData: PdfPageData,
      header: string,
      headerData: PdfHeaderData,
      options: { filename: string; pdfOptions: PdfOptions }
    ) => {
      res.render(header, pageData, (headerError: Error, headerHtml: string) => {
        if (headerError) {
          throw headerError
        }
        res.render(page, pageData, (bodyError: Error, html: string) => {
          if (bodyError) {
            throw bodyError
          }

          res.header('Content-Type', 'application/pdf')
          res.header('Content-Transfer-Encoding', 'binary')
          res.header('Content-Disposition', `inline; filename=${options.filename}`)

          client.renderPdfFromHtml(html, headerHtml, options?.pdfOptions).then(buffer => res.send(buffer))
        })
      })
    }
    next()
  }
}
