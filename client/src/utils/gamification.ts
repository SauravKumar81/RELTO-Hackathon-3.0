export const POINTS = {
  POST_ITEM: 50,
  CLAIM_ITEM: 100,
  CONFIRM_RETURN: 200,
} as const;

export const calculateLevel = (points: number): number => {
  return Math.floor(points / 500) + 1;
};

export const pointsToNextLevel = (currentPoints: number): number => {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevelPoints = currentLevel * 500;
  return nextLevelPoints - currentPoints;
};

export const getRankTitle = (level: number): string => {
  if (level >= 20) return 'Legend';
  if (level >= 15) return 'Master';
  if (level >= 10) return 'Expert';
  if (level >= 5) return 'Helper';
  return 'Beginner';
};

export const checkLevelUp = (oldPoints: number, newPoints: number): boolean => {
  const oldLevel = calculateLevel(oldPoints);
  const newLevel = calculateLevel(newPoints);
  return newLevel > oldLevel;
};
