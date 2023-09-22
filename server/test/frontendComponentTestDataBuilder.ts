export const frontEndComponentHeader = () => {
  return {
    headerHtml: '<div>Header</div>',
    cssIncludes: ['https://frontend-componenents-dev/headerStyles.css'],
    jsIncludes: ['https://frontend-componenents-dev/headerScripts.js'],
  }
}

export const frontEndComponentFooter = () => {
  return {
    footerHtml: '<div>Footer</div>',
    cssIncludes: ['https://frontend-componenents-dev/footerStyles.css'],
    jsIncludes: ['https://frontend-componenents-dev/footerScripts.js'],
  }
}

export default { frontEndComponentHeader, frontEndComponentFooter }
