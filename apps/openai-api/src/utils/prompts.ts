export const translate = (text: string, language = 'chinese', type = 'text') => {
  return `Please help me translate this ${type} into ${language}, this is the text: ${text}`
}

export const summarize = (text: string) => {
  return `用2-4个字概括以下内容属于什么领域：\n ${text}`
}

export const recommendInitQuestion = () => {
  return `随机输出5个吸引眼球的生活问题，这些问题可以展示你在以上方面的专业能力，同时对我有实际帮助，用以下格式输出，只输出问题，不带领域，不换行\n["问题1","问题2","问题3","问题4","问题5"]`
}

export const recommendQuestionByKeyWord = (keywords: string[]) => {
  return `随机从这几个领域中“${keywords.join('/')}”输出5个有趣的问题，这些问题可以展示你在以上方面的专业能力，同时对我有实际帮助，用以下格式输出，只输出问题，不带领域，不换行\n["问题1","问题2","问题3","问题4","问题5"]`
}

export const recommendQuestionByQuestion = (question: string) => {
  return `请根据这个问题“${question}”输出5个对我有帮助的相关问题，用以下格式输出，只输出问题，不带领域，不换行\n["问题1","问题2","问题3","问题4","问题5"]`
}