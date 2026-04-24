export const POINTS = {
  POST_ITEM: 10,
  CLAIM_ITEM: 5,
  CONFIRM_RETURN: 20
};

export const getRankTitle = (level: number): string => {
  if (level >= 20) return 'Legendary';
  if (level >= 15) return 'Master';
  if (level >= 10) return 'Expert';
  if (level >= 5) return 'Advanced';
  return 'Novice';
};

export const checkLevelUp = (oldPoints: number, newPoints: number): boolean => {
  const oldLevel = Math.floor(oldPoints / 500) + 1;
  const newLevel = Math.floor(newPoints / 500) + 1;
  return newLevel > oldLevel;
};
