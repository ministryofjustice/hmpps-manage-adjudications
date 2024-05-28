import { Request, Response, NextFunction } from 'express'
import GotenbergClient, { PdfMargins } from '../data/gotenbergClient'

export type PdfPageData = { adjudicationsUrl: string } & Record<string, unknown> & Record<string, unknown>
export type PdfHeaderData = Record<string, unknown>
export type PdfFooterData = Record<string, unknown>

export function pdfRenderer(client: GotenbergClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderPdf = (
      pageView: string,
      pageData: PdfPageData,
      headerView: string,
      headerData: PdfHeaderData,
      footerView: string,
      footerData: PdfFooterData,
      options: { filename: string; pdfMargins: PdfMargins }
    ) => {
      res.render(headerView, headerData, (headerError: Error, headerHtml: string) => {
        if (headerError) {
          throw headerError
        }
        res.render(footerView, footerData, (footerError: Error, footerHtml: string) => {
          if (footerError) {
            throw footerError
          }
          res.render(pageView, pageData, (bodyError: Error, pageHtml: string) => {
            if (bodyError) {
              throw bodyError
            }

            res.header('Content-Type', 'application/pdf')
            res.header('Content-Transfer-Encoding', 'binary')
            res.header('Content-Disposition', `inline; filename=${options.filename}`)

            client
              .renderPdfFromHtml(pageHtml, headerHtml, footerHtml, options?.pdfMargins)
              .then(buffer => res.send(buffer))
          })
        })
      })
    }
    next()
  }
}
