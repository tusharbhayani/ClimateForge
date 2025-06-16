export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  badge_icon: string;
  points: number;
  requirement: {
    type: string;
    value: number;
    unit?: string;
  };
  earned?: boolean;
  earned_at?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  earned_at: string;
  points_awarded: number;
  badge_icon: string;
}

class AchievementService {
  private achievements: Achievement[] = [
    {
      id: 'first_action',
      type: 'milestone',
      name: 'First Action',
      description: 'Complete your first environmental action',
      badge_icon: '🌱',
      points: 10,
      requirement: { type: 'actions_completed', value: 1 },
    },
    {
      id: 'eco_warrior',
      type: 'milestone',
      name: 'Eco Warrior',
      description: 'Complete 10 environmental actions',
      badge_icon: '🏆',
      points: 50,
      requirement: { type: 'actions_completed', value: 10 },
    },
    {
      id: 'climate_champion',
      type: 'milestone',
      name: 'Climate Champion',
      description: 'Complete 50 environmental actions',
      badge_icon: '👑',
      points: 200,
      requirement: { type: 'actions_completed', value: 50 },
    },
    {
      id: 'carbon_saver',
      type: 'impact',
      name: 'Carbon Saver',
      description: 'Save 100+ lbs of CO₂ emissions',
      badge_icon: '🌍',
      points: 75,
      requirement: { type: 'carbon_saved', value: 100, unit: 'lbs' },
    },
    {
      id: 'tree_hugger',
      type: 'action_specific',
      name: 'Tree Hugger',
      description: 'Participate in 5 tree planting projects',
      badge_icon: '🌳',
      points: 60,
      requirement: { type: 'tree_planting_actions', value: 5 },
    },
    {
      id: 'cleanup_hero',
      type: 'action_specific',
      name: 'Cleanup Hero',
      description: 'Participate in 5 cleanup projects',
      badge_icon: '🧹',
      points: 60,
      requirement: { type: 'cleanup_actions', value: 5 },
    },
    {
      id: 'energy_saver',
      type: 'action_specific',
      name: 'Energy Saver',
      description: 'Complete 5 energy saving actions',
      badge_icon: '⚡',
      points: 60,
      requirement: { type: 'energy_saving_actions', value: 5 },
    },
    {
      id: 'volunteer_hero',
      type: 'time_based',
      name: 'Volunteer Hero',
      description: 'Volunteer for 50+ hours',
      badge_icon: '⏰',
      points: 100,
      requirement: { type: 'volunteer_hours', value: 50, unit: 'hours' },
    },
    {
      id: 'community_builder',
      type: 'social',
      name: 'Community Builder',
      description: 'Join 3 community projects',
      badge_icon: '👥',
      points: 40,
      requirement: { type: 'projects_joined', value: 3 },
    },
    {
      id: 'mentor',
      type: 'leadership',
      name: 'Mentor',
      description: 'Help 5 new users get started',
      badge_icon: '🎓',
      points: 80,
      requirement: { type: 'users_mentored', value: 5 },
    },
    {
      id: 'streak_master',
      type: 'consistency',
      name: 'Streak Master',
      description: 'Complete actions for 7 consecutive days',
      badge_icon: '🔥',
      points: 90,
      requirement: { type: 'daily_streak', value: 7, unit: 'days' },
    },
    {
      id: 'impact_tracker',
      type: 'measurement',
      name: 'Impact Tracker',
      description: 'Log 20 impact measurements',
      badge_icon: '📊',
      points: 30,
      requirement: { type: 'measurements_logged', value: 20 },
    },
  ];

  getAllAchievements(): Achievement[] {
    return this.achievements;
  }

  getAchievementsByType(type: string): Achievement[] {
    return this.achievements.filter((achievement) => achievement.type === type);
  }

  checkEligibleAchievements(userStats: any): Achievement[] {
    const eligible: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (this.isAchievementEarned(achievement, userStats)) {
        eligible.push(achievement);
      }
    }

    return eligible;
  }

  private isAchievementEarned(
    achievement: Achievement,
    userStats: any
  ): boolean {
    const { requirement } = achievement;
    const userValue = userStats[requirement.type] || 0;
    return userValue >= requirement.value;
  }

  calculateTotalPoints(userAchievements: UserAchievement[]): number {
    return userAchievements.reduce(
      (total, achievement) => total + achievement.points_awarded,
      0
    );
  }

  getNextAchievement(
    userStats: any,
    earnedAchievements: string[]
  ): Achievement | null {
    const unearned = this.achievements.filter(
      (achievement) => !earnedAchievements.includes(achievement.id)
    );

    // Find the closest achievement to completion
    let closest: Achievement | null = null;
    let smallestGap = Infinity;

    for (const achievement of unearned) {
      const userValue = userStats[achievement.requirement.type] || 0;
      const gap = achievement.requirement.value - userValue;

      if (gap > 0 && gap < smallestGap) {
        smallestGap = gap;
        closest = achievement;
      }
    }

    return closest;
  }

  getProgressToNextLevel(
    userStats: any,
    earnedAchievements: string[]
  ): {
    nextAchievement: Achievement | null;
    progress: number;
    remaining: number;
  } {
    const nextAchievement = this.getNextAchievement(
      userStats,
      earnedAchievements
    );

    if (!nextAchievement) {
      return { nextAchievement: null, progress: 100, remaining: 0 };
    }

    const userValue = userStats[nextAchievement.requirement.type] || 0;
    const targetValue = nextAchievement.requirement.value;
    const progress = Math.min((userValue / targetValue) * 100, 100);
    const remaining = Math.max(targetValue - userValue, 0);

    return { nextAchievement, progress, remaining };
  }

  getAchievementCategories(): { [key: string]: string } {
    return {
      milestone: 'Milestones',
      impact: 'Environmental Impact',
      action_specific: 'Action Types',
      time_based: 'Time Commitment',
      social: 'Community',
      leadership: 'Leadership',
      consistency: 'Consistency',
      measurement: 'Data Tracking',
    };
  }

  formatRequirement(achievement: Achievement): string {
    const { requirement } = achievement;
    const unit = requirement.unit ? ` ${requirement.unit}` : '';

    switch (requirement.type) {
      case 'actions_completed':
        return `Complete ${requirement.value} actions`;
      case 'carbon_saved':
        return `Save ${requirement.value}${unit} of CO₂`;
      case 'volunteer_hours':
        return `Volunteer for ${requirement.value}${unit}`;
      case 'projects_joined':
        return `Join ${requirement.value} projects`;
      case 'daily_streak':
        return `${requirement.value} day streak`;
      default:
        return `Reach ${requirement.value}${unit}`;
    }
  }

  // Mock function to simulate earning achievements
  async awardAchievement(
    userId: string,
    achievementId: string
  ): Promise<UserAchievement | null> {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement) return null;

    const userAchievement: UserAchievement = {
      id: `user_achievement_${Date.now()}`,
      user_id: userId,
      achievement_type: achievement.type,
      achievement_name: achievement.name,
      description: achievement.description,
      earned_at: new Date().toISOString(),
      points_awarded: achievement.points,
      badge_icon: achievement.badge_icon,
    };

    // In a real app, this would save to Supabase
    console.log('Achievement awarded:', userAchievement);
    return userAchievement;
  }
}

export const achievementService = new AchievementService();
