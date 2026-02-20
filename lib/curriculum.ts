/**
 * Curriculum version helpers for AP Computer Science A
 *
 * Supports both:
 * - 4-unit 2025-26 College Board structure
 * - 9-unit legacy College Board structure
 */

import { AP_CSA_TOPICS, getTopicsByUnit as getTopics4Unit } from '@/data/topics';
import { AP_CSA_9UNIT_TOPICS, getTopicsByUnit as getTopics9Unit, UNIT_INFO_9UNIT } from '@/data/topics-9unit';
import type { Topic } from '@/types';
import { UNIT_INFO } from '@/types/course';

export type CurriculumVersion = '4-unit' | '9-unit';

export interface UnitInfo {
  number: number;
  name: string;
  shortName: string;
  color: string;
  topicCount: number;
}

/**
 * Get all topics for a specific curriculum version
 */
export function getTopicsForCurriculum(version: CurriculumVersion): Topic[] {
  return version === '9-unit' ? AP_CSA_9UNIT_TOPICS : AP_CSA_TOPICS;
}

/**
 * Get topics by unit number for a specific curriculum version
 */
export function getTopicsByUnitForCurriculum(
  version: CurriculumVersion,
  unitNumber: number
): Topic[] {
  return version === '9-unit'
    ? getTopics9Unit(unitNumber)
    : getTopics4Unit(unitNumber);
}

/**
 * Get unit info array for a specific curriculum version
 */
export function getUnitsForCurriculum(version: CurriculumVersion): UnitInfo[] {
  const unitInfo = version === '9-unit' ? UNIT_INFO_9UNIT : UNIT_INFO;
  const topics = getTopicsForCurriculum(version);

  return unitInfo.map((unit) => ({
    number: unit.number,
    name: unit.name,
    shortName: unit.shortName,
    color: unit.color,
    topicCount: topics.filter((t) => t.unitNumber === unit.number).length,
  }));
}

/**
 * Get the number of units for a curriculum version
 */
export function getUnitCount(version: CurriculumVersion): number {
  return version === '9-unit' ? 9 : 4;
}

/**
 * Get a topic by ID across curriculum versions
 */
export function getTopicById(
  topicId: string,
  version?: CurriculumVersion
): Topic | undefined {
  // If version specified, search that curriculum
  if (version) {
    const topics = getTopicsForCurriculum(version);
    return topics.find((t) => t.id === topicId);
  }

  // Otherwise search both
  const topic4Unit = AP_CSA_TOPICS.find((t) => t.id === topicId);
  if (topic4Unit) return topic4Unit;

  return AP_CSA_9UNIT_TOPICS.find((t) => t.id === topicId);
}

/**
 * Calculate how many assessment questions based on current unit
 * For 9-unit: 3 questions per unit up to current unit
 * For 4-unit: 5 questions per unit up to current unit
 */
export function getAssessmentQuestionCount(
  version: CurriculumVersion,
  currentUnit: number
): number {
  const questionsPerUnit = version === '9-unit' ? 3 : 5;
  const unitCount = Math.min(currentUnit, getUnitCount(version));
  return questionsPerUnit * unitCount;
}

/**
 * Map unit number from 9-unit to approximate 4-unit equivalent
 * Useful for progress visualization
 */
export function mapUnitTo4Unit(nineUnitNumber: number): number {
  // Units 1 = Unit 1 (Primitive Types)
  // Units 2-4 = Unit 2 (Objects, Boolean, Iteration)
  // Units 5-6 = Unit 3 (Classes, Arrays)
  // Units 7-9 = Unit 4 (Advanced)
  if (nineUnitNumber <= 1) return 1;
  if (nineUnitNumber <= 4) return 2;
  if (nineUnitNumber <= 6) return 3;
  return 4;
}

/**
 * Map unit number from 4-unit to approximate 9-unit start
 */
export function mapUnitTo9Unit(fourUnitNumber: number): number {
  // Unit 1 = 1
  // Unit 2 = 2
  // Unit 3 = 5
  // Unit 4 = 7
  const mapping: Record<number, number> = {
    1: 1,
    2: 2,
    3: 5,
    4: 7,
  };
  return mapping[fourUnitNumber] || 1;
}
