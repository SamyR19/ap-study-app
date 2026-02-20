'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Loader2, Settings } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getTopicsByUnitForCurriculum, getUnitsForCurriculum, getTopicsForCurriculum } from '@/lib/curriculum';
import {
  getCourseOnboarding,
  getTopicProgress,
  getDueChallenges,
  getMilestones,
  getLatestAssessment,
} from '@/lib/course-service';
import type { AssessmentResultData } from '@/lib/course-service';
import type { TopicProgress, UnitProgress, Milestone, CodeChallenge, CodeChallengeProgress, CurriculumVersion } from '@/types/course';
import { UnitAccordion } from '@/components/course/UnitAccordion';
import { ProgressRoadmap } from '@/components/course/ProgressRoadmap';
import { SpacedRepetitionQueue } from '@/components/course/SpacedRepetitionQueue';
import { NextStepCard } from '@/components/course/NextStepCard';
import { AssessmentReview } from '@/components/course/AssessmentReview';

export default function CoursePage() {
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [curriculumVersion, setCurriculumVersion] = useState<CurriculumVersion>('4-unit');
  const [currentUnit, setCurrentUnit] = useState(1);
  const [topicProgressMap, setTopicProgressMap] = useState<Record<string, TopicProgress>>({});
  const [dueChallenges, setDueChallenges] = useState<Array<{
    challenge: CodeChallenge;
    progress: CodeChallengeProgress;
    dueIn: string;
  }>>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [painPointTopicIds, setPainPointTopicIds] = useState<string[]>([]);
  const [assessment, setAssessment] = useState<AssessmentResultData | null>(null);

  useEffect(() => {
    async function loadCourseData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Load onboarding status
        const onboarding = await getCourseOnboarding(user.id);
        if (onboarding) {
          setHasCompletedOnboarding(onboarding.has_completed_assessment);
          setCurriculumVersion(onboarding.curriculum_version as CurriculumVersion);
          setCurrentUnit(onboarding.current_unit);
        }

        // Load topic progress
        const progress = await getTopicProgress(user.id);
        setTopicProgressMap(progress);

        // Load due challenges
        const challenges = await getDueChallenges(user.id);
        setDueChallenges(challenges);

        // Load milestones
        const userMilestones = await getMilestones(user.id);
        setMilestones(userMilestones);

        // Load assessment results
        const latestAssessment = await getLatestAssessment(user.id);
        setAssessment(latestAssessment);
        if (latestAssessment) {
          setPainPointTopicIds(latestAssessment.weak_topics || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading course data:', error);
        setLoading(false);
      }
    }

    loadCourseData();
  }, []);

  // Get units and topics based on curriculum version
  const unitInfo = getUnitsForCurriculum(curriculumVersion);
  const allTopics = getTopicsForCurriculum(curriculumVersion);

  // Calculate unit progress
  const unitProgressList: UnitProgress[] = unitInfo.map((unit) => {
    const topics = getTopicsByUnitForCurriculum(curriculumVersion, unit.number);
    let mastered = 0;
    let inProgress = 0;
    let totalMastery = 0;

    topics.forEach((topic) => {
      const progress = topicProgressMap[topic.id];
      if (progress) {
        totalMastery += progress.mastery_percentage;
        if (progress.mastery_level === 'mastered') mastered++;
        else if (progress.mastery_level !== 'not_started') inProgress++;
      }
    });

    return {
      unit_number: unit.number,
      unit_name: unit.name,
      short_name: unit.shortName,
      topics_count: topics.length,
      topics_mastered: mastered,
      topics_in_progress: inProgress,
      topics_not_started: topics.length - mastered - inProgress,
      overall_mastery: topics.length > 0 ? Math.round(totalMastery / topics.length) : 0,
      color: unit.color,
    };
  });

  // Calculate overall progress
  const totalMastered = unitProgressList.reduce((sum, u) => sum + u.topics_mastered, 0);
  const totalTopics = unitProgressList.reduce((sum, u) => sum + u.topics_count, 0);
  const overallProgress = totalTopics > 0 ? Math.round((totalMastered / totalTopics) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user needs onboarding
  if (!hasCompletedOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Welcome to AP Computer Science A
          </h1>
          <p className="text-muted-foreground mb-6">
            Let&apos;s personalize your study experience. We&apos;ll ask you a few
            questions to identify your current level and create a custom study plan.
          </p>
          <Link
            href="/course/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                AP Computer Science A
              </h1>
              <p className="text-muted-foreground">
                {curriculumVersion === '9-unit' ? '9-Unit' : '2025-26'} Curriculum • {overallProgress}% Complete
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </motion.div>

      {/* Next Step - Primary Action */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <NextStepCard
          unitProgressList={unitProgressList}
          currentUnit={currentUnit}
          topicProgressMap={topicProgressMap}
          topics={allTopics}
          painPointTopicIds={painPointTopicIds}
        />
      </motion.section>

      {/* Progress Roadmap - Full Width */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProgressRoadmap
          unitProgressList={unitProgressList}
          currentUnit={currentUnit}
          milestones={milestones}
        />
      </motion.section>

      {/* Two Column: Code Practice Queue + Assessment Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SpacedRepetitionQueue dueChallenges={dueChallenges} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <AssessmentReview
            assessment={assessment}
            curriculumVersion={curriculumVersion}
          />
        </motion.div>
      </div>

      {/* Units section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Course Content
          </h2>
          <span className="text-sm text-muted-foreground">
            {totalMastered}/{totalTopics} topics mastered
          </span>
        </div>
        <div className="space-y-3">
          {unitInfo.map((unit, index) => {
            const unitProgress = unitProgressList[index];
            // Lock units that are more than 1 ahead of current and haven't been started
            const isLocked = unit.number > currentUnit + 1 && unitProgress.topics_in_progress === 0 && unitProgress.topics_mastered === 0;

            return (
              <UnitAccordion
                key={unit.number}
                unitProgress={unitProgress}
                topics={getTopicsByUnitForCurriculum(curriculumVersion, unit.number)}
                topicProgressMap={topicProgressMap}
                painPointTopicIds={painPointTopicIds}
                defaultOpen={unit.number === currentUnit}
                isLocked={isLocked}
              />
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
