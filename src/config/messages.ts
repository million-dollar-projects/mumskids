export const getEncouragements = (name: string = '小朋友') => [
  `🎉 太棒了${name}！真聪明！`,
  `👏 答对啦${name}！你好厉害！`,
  `🌟 超级棒${name}！继续加油！`,
  `💖 做得很好${name}！真是小天才！`,
  `🎊 太厉害了${name}！`,
  `🏆 ${name}真是数学小能手！`,
  `✨ 完全正确${name}！好样的！`,
  `🎈 ${name}答得真好！很棒！`
];

export const getConsolations = (name: string = '小朋友') => [
  `💪 没关系${name}，继续努力！`,
  `🌈 ${name}下次一定能答对！`,
  `🤗 ${name}不要放弃，你可以的！`,
  `☀️ 加油${name}！相信自己！`,
  `🦋 ${name}每一次尝试都很棒！`,
  `🌸 继续加油${name}，你很棒！`
];

export const getFinalMessage = (accuracy: number, correctAnswers: number, name: string = '小朋友') => {
  if (accuracy === 100) {
    return `太棒了${name}！你答对了全部 ${correctAnswers} 道题！`;
  } else if (accuracy >= 90) {
    return `真棒${name}！你答对了 ${correctAnswers} 道题！`;
  } else if (accuracy >= 70) {
    return `做得不错${name}！你答对了 ${correctAnswers} 道题！`;
  } else {
    return `继续加油${name}！你答对了 ${correctAnswers} 道题！`;
  }
};