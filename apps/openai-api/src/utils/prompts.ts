export const translate = (text: string,language = 'chinese', type = 'text') => {
  return `Please help me translate this ${type} into ${language}, this is the text: ${text}`
}
