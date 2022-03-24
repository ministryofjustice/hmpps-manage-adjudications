import { Request, Response, NextFunction } from 'express'
import GotenbergClient, { PdfOptions } from '../data/gotenbergClient'

export type PdfPageData = { adjudicationsUrl: string } & Record<string, unknown>
export type PdfHeaderData = Record<string, unknown>
export type PdfFooterData = Record<string, unknown>

export function pdfRenderer(client: GotenbergClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderPdf = (
      page: string,
      pageData: PdfPageData,
      header: string,
      headerData: PdfHeaderData,
      footer: string,
      footerData: PdfFooterData,
      options: { filename: string; pdfOptions: PdfOptions }
    ) => {
      res.render(header, headerData, (headerError: Error, headerHtml: string) => {
        if (headerError) {
          throw headerError
        }
        res.render(footer, footerData, (footerError: Error, footerHtml: string) => {
          if (footerError) {
            throw footerError
          }
          res.render(page, pageData, (bodyError: Error, pageHtml: string) => {
            if (bodyError) {
              throw bodyError
            }

            res.header('Content-Type', 'application/pdf')
            res.header('Content-Transfer-Encoding', 'binary')
            res.header('Content-Disposition', `inline; filename=${options.filename}`)

            client
              .renderPdfFromHtml(pageHtml, headerHtml, footerHtml, options?.pdfOptions)
              .then(buffer => res.send(buffer))
          })
        })
      })
    }
    next()
  }
}
