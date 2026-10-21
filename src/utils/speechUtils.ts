import { PronunciationResult } from '../types';

/**
 * Clean string for comparison (removes punctuation, lowercases, trims whitespace)
 */
export function cleanText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standard Levenshtein Distance for pronunciation similarity calculation
 */
export function calculateLevenshtein(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  return (longer.length - costs[shorter.length]) / longer.length;
}

/**
 * Evaluates spoken text against the target sentence
 */
export function evaluateSpeechAccuracy(spoken: string, target: string): PronunciationResult {
  const cleanedSpoken = cleanText(spoken);
  const cleanedTarget = cleanText(target);

  const overallSimilarity = calculateLevenshtein(cleanedSpoken, cleanedTarget);
  const similarityScore = Math.round(overallSimilarity * 100);

  const targetWords = cleanedTarget.split(' ').filter(Boolean);
  const spokenWords = cleanedSpoken.split(' ').filter(Boolean);

  const wordEvaluations = targetWords.map((tWord) => {
    let bestMatchScore = 0;
    for (const sWord of spokenWords) {
      const sim = calculateLevenshtein(sWord, tWord);
      if (sim > bestMatchScore) {
        bestMatchScore = sim;
      }
    }
    return {
      word: tWord,
      matched: bestMatchScore >= 0.7,
      accuracy: Math.round(bestMatchScore * 100),
    };
  });

  let passed = similarityScore >= 70;
  let earnedStars = 0;
  let feedbackMessage = '';
  let tips = '';

  // Phonetic advice for Vietnamese kids
  const needsFinalS = target.toLowerCase().includes('s') || target.toLowerCase().includes('is');
  const needsT = target.toLowerCase().endsWith('t') || target.toLowerCase().includes('it');

  if (similarityScore >= 85) {
    passed = true;
    earnedStars = 3;
    feedbackMessage = '🌟 Xuất sắc! Phát âm rất chuẩn và tự tin!';
    tips = 'Giỏi lắm! Con đã phát âm tròn vành rõ chữ chuẩn bản ngữ!';
  } else if (similarityScore >= 65) {
    passed = true;
    earnedStars = 2;
    feedbackMessage = '👍 Rất tốt! Gần như hoàn hảo rồi!';
    tips = needsFinalS
      ? 'Mẹo Cô Tâm: Con chú ý phát âm nhẹ âm đuôi /s/ để câu chuẩn hơn nhé!'
      : 'Mẹo Cô Tâm: Nghe lại một lần nữa và nhại theo ngữ điệu lên xuống tự nhiên nhé!';
  } else if (similarityScore >= 40) {
    passed = false;
    earnedStars = 1;
    feedbackMessage = '💪 Cố gắng lên nhé! Con đang tiến bộ từng ngày!';
    tips = needsT
      ? 'Mẹo Cô Tâm: Chú ý bật âm gió nhẹ ở cuối từ (như /t/, /k/) nhé!'
      : 'Mẹo Cô Tâm: Bấm vào biểu tượng tai nghe 🎧 để nghe chậm và nhắc lại nào!';
  } else {
    passed = false;
    earnedStars = 0;
    feedbackMessage = '🌱 Chưa nhận diện rõ. Hãy nói to và gần micro hơn nhé!';
    tips = 'Con nhớ ngồi ở nơi yên tĩnh, giữ micro gần miệng và nói dõng dạc nhé!';
  }

  return {
    spokenText: spoken,
    targetText: target,
    similarityScore,
    passed,
    wordEvaluations,
    feedbackMessage,
    tips,
    earnedStars,
  };
}

/**
 * Text-to-Speech synthesis with adjustable playback rate
 */
export function playEnglishAudio(
  text: string,
  rate = 0.85,
  pitch = 1.05,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate; // 0.85 is ideal for Vietnamese elementary kids
  utterance.pitch = pitch;

  // Prefer natural English voices if available
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (enVoice) {
    utterance.voice = enVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}
