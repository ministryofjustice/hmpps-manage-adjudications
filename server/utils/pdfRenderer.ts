import { Request, Response, NextFunction } from 'express'
import GotenbergClient, { PdfMargins } from '../data/gotenbergClient'

export type PdfPageData = { adjudicationsUrl: string } & Record<string, unknown> & Record<string, unknown>
export type PdfHeaderData = Record<string, unknown>
export type PdfFooterData = Record<string, unknown>

export function pdfRenderer(client: GotenbergClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderPdf = async (
      pageView,
      pageData,
      headerView,
      headerData,
      footerView,
      footerData,
      options: { filename: string; pdfMargins: PdfMargins }
    ) => {
      try {
        const headerHtml = await new Promise<string>((resolve, reject) => {
          res.render(headerView, headerData, (err, html) => (err ? reject(err) : resolve(html)))
        })

        const footerHtml = await new Promise<string>((resolve, reject) => {
          res.render(footerView, footerData, (err, html) => (err ? reject(err) : resolve(html)))
        })

        const pageHtml = await new Promise<string>((resolve, reject) => {
          res.render(pageView, pageData, (err, html) => (err ? reject(err) : resolve(html)))
        })

        res.header('Content-Type', 'application/pdf')
        res.header('Content-Transfer-Encoding', 'binary')
        res.header('Content-Disposition', `inline; filename=${options.filename}`)

        const buffer = await client.renderPdfFromHtml(pageHtml, headerHtml, footerHtml, options.pdfMargins)
        res.send(buffer)
      } catch (error) {
        next(error)
      }
    }
    next()
  }
}
