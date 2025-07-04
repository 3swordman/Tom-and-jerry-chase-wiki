// Utility functions for skill-related operations

import type { Skill, FactionId } from '../data/types';

/**
 * Generate skill image URL based on character name, skill type, and skill name
 */
export const getSkillImageUrl = (
  characterName: string,
  skill: Skill,
  factionId: FactionId
): string => {
  if (skill.type === 'passive') {
    // Passive skills use faction-based naming: 被动-猫.png or 被动-鼠.png
    const factionName = factionId === 'cat' ? '猫' : '鼠';
    return `/images/${factionId}Skills/被动-${factionName}.png`;
  }

  // For active skills, use character name + skill number + skill name
  const skillNumber = getSkillNumber(skill.type);
  return `/images/${factionId}Skills/${characterName}${skillNumber}-${skill.name}.png`;
};

/**
 * Get skill number based on skill type
 */
const getSkillNumber = (skillType: 'active' | 'weapon1' | 'weapon2' | 'passive'): string => {
  switch (skillType) {
    case 'active':
      return '1';
    case 'weapon1':
      return '2';
    case 'weapon2':
      return '3';
    case 'passive':
      return '';
    default:
      return '';
  }
};

/**
 * Add image URLs to character skills
 */
export const addSkillImageUrls = (
  characterName: string,
  skills: Skill[],
  factionId: FactionId
): Skill[] => {
  return skills.map((skill) => ({
    ...skill,
    imageUrl: getSkillImageUrl(characterName, skill, factionId),
  }));
};
