import { Request, Response, NextFunction } from 'express'
import GotenbergClient, { PdfOptions } from '../data/gotenbergClient'
import logger from '../../logger'

export type PdfPageData = { url: string } & Record<string, unknown>

export function pdfRenderer(client: GotenbergClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderPdf = (
      view: string,
      pageData: PdfPageData,
      options: { filename: string; pdfOptions: PdfOptions } = { filename: 'document.pdf', pdfOptions: {} }
    ) => {
      res.render(view, pageData, (error: Error, html: string) => {
        if (error) {
          throw error
        }

        res.header('Content-Type', 'application/pdf')
        res.header('Content-Transfer-Encoding', 'binary')
        res.header('Content-Disposition', `inline; filename=${options.filename}`)

        client
          .renderPdfFromHtml(html, options?.pdfOptions)
          .then(buffer => res.send(buffer))
          .catch(reason => {
            logger.error(reason)
          })
      })
    }
    next()
  }
}
