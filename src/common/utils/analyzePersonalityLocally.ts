export function analyzePersonalityLocally(comment: string) {
    const traits = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };
  
    const text = comment.toLowerCase();
  
    if (text.includes("creative") || text.includes("new idea")) traits.openness += 1;
    if (text.includes("organized") || text.includes("structured")) traits.conscientiousness += 1;
    if (text.includes("talkative") || text.includes("energetic")) traits.extraversion += 1;
    if (text.includes("kind") || text.includes("nice") || text.includes("respect")) traits.agreeableness += 1;
    if (text.includes("anxious") || text.includes("stressed")) traits.neuroticism += 1;
  
    return traits;
  }
  