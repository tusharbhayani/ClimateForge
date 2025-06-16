import { createClient } from '@supabase/supabase-js';

// These are demo credentials - you'll need to replace with your actual Supabase project details
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Check if we have valid Supabase credentials
const hasValidCredentials =
  SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
  SUPABASE_ANON_KEY !== 'your-anon-key' &&
  SUPABASE_URL.includes('supabase.co');

// Only create client if we have valid credentials
const supabase = hasValidCredentials
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  location: string;
  join_date: string;
  actions_completed: number;
  volunteer_hours: number;
  carbon_saved: number;
  level: number;
  achievements: string[];
  notifications_enabled?: boolean;
  location_sharing?: boolean;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAction {
  id: string;
  user_id: string;
  action_type:
    | 'tree_planting'
    | 'cleanup'
    | 'energy_saving'
    | 'conservation'
    | 'education';
  description: string;
  impact_value: number;
  impact_unit: string;
  location: string;
  date_completed: string;
  project_id?: string;
  verified: boolean;
  rating?: number;
  created_at: string;
}

export interface CommunityProject {
  id: string;
  title: string;
  description: string;
  type: string;
  organizer_id: string;
  organizer_name?: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string;
  time: string;
  max_participants: number;
  current_participants: number;
  requirements: string[];
  impact_goal: string;
  status: 'active' | 'completed' | 'cancelled';
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
  duration?: string;
  imageUrl?: string;
  distance?: number;
  isJoined?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectParticipation {
  id: string;
  user_id: string;
  project_id: string;
  joined_at: string;
  completed: boolean;
  rating?: number;
  feedback?: string;
}

export interface EmergencyKitItem {
  id: string;
  user_id: string;
  item_name: string;
  status: 'complete' | 'incomplete';
  quantity: string;
  expires: string | null;
  last_updated: string;
}

export interface GroupMembership {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
}

export interface RecentAction {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  created_at: string;
}

export interface MonthlyGoal {
  id: string;
  user_id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  month_year: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

class SupabaseService {
  private isConnected = false;
  private connectionPromise: Promise<boolean> | null = null;
  private currentUserId: string | null = null;

  // Enhanced mock data with more realistic user profiles
  private mockUsers: Map<string, UserProfile> = new Map();
  private mockUserActions: Map<string, UserAction[]> = new Map();
  private mockProjects: CommunityProject[] = [];
  private mockParticipations: ProjectParticipation[] = [];
  private mockEmergencyKits: Map<string, EmergencyKitItem[]> = new Map();
  private mockGroupMemberships: Map<string, GroupMembership[]> = new Map();
  private mockRecentActions: Map<string, RecentAction[]> = new Map();
  private mockMonthlyGoals: Map<string, MonthlyGoal[]> = new Map();

  async initializeConnection(): Promise<boolean> {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._initializeConnection();
    return this.connectionPromise;
  }

  private async _initializeConnection(): Promise<boolean> {
    // If we don't have valid credentials, skip connection attempt
    if (!hasValidCredentials || !supabase) {
      console.log(
        'Supabase credentials not configured, using enhanced mock data'
      );
      this.isConnected = false;
      this.initializeEnhancedMockData();
      return false;
    }

    try {
      // Try to connect to Supabase with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      const connectionPromise = supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      const { data, error } = await Promise.race([
        connectionPromise,
        timeoutPromise,
      ]);

      if (!error) {
        this.isConnected = true;
        console.log('Successfully connected to Supabase');
        return true;
      }
    } catch (error) {
      console.log(
        'Supabase connection failed, using enhanced mock data:',
        error
      );
    }

    // Use enhanced mock data if Supabase is not available
    this.isConnected = false;
    this.initializeEnhancedMockData();
    return false;
  }

  private initializeEnhancedMockData() {
    // Create multiple realistic user profiles
    const users = [
      {
        id: this.generateUUID(),
        name: 'Alex Johnson',
        email: 'alex@example.com',
        location: 'San Francisco, CA',
        join_date: '2024-03-15',
        actions_completed: 47,
        volunteer_hours: 28,
        carbon_saved: 156,
        level: 3,
        achievements: [
          'First Action',
          'Tree Hugger',
          'Air Quality Guardian',
          'Community Builder',
        ],
        notifications_enabled: true,
        location_sharing: true,
        onboarding_completed: true,
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-12-14T10:00:00Z',
      },
      {
        id: this.generateUUID(),
        name: 'Maria Garcia',
        email: 'maria@example.com',
        location: 'Oakland, CA',
        join_date: '2024-02-20',
        actions_completed: 23,
        volunteer_hours: 15,
        carbon_saved: 89,
        level: 2,
        achievements: ['First Action', 'Tree Hugger'],
        notifications_enabled: true,
        location_sharing: false,
        onboarding_completed: true,
        created_at: '2024-02-20T10:00:00Z',
        updated_at: '2024-12-14T10:00:00Z',
      },
      {
        id: this.generateUUID(),
        name: 'David Chen',
        email: 'david@example.com',
        location: 'Berkeley, CA',
        join_date: '2024-01-10',
        actions_completed: 78,
        volunteer_hours: 45,
        carbon_saved: 234,
        level: 5,
        achievements: [
          'First Action',
          'Tree Hugger',
          'Air Quality Guardian',
          'Community Builder',
          'Climate Champion',
        ],
        notifications_enabled: true,
        location_sharing: true,
        onboarding_completed: true,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-12-14T10:00:00Z',
      },
    ];

    // Store users in map
    users.forEach((user) => {
      this.mockUsers.set(user.id, user);

      // Generate actions for each user
      const actions = this.generateUserActions(user.id, user.actions_completed);
      this.mockUserActions.set(user.id, actions);

      // Generate emergency kit for each user
      const emergencyKit = this.generateEmergencyKit(user.id);
      this.mockEmergencyKits.set(user.id, emergencyKit);

      // Generate recent actions
      const recentActions = this.generateRecentActions(user.id);
      this.mockRecentActions.set(user.id, recentActions);

      // Generate monthly goals
      const monthlyGoals = this.generateMonthlyGoals(user.id, user);
      this.mockMonthlyGoals.set(user.id, monthlyGoals);
    });

    // Set the first user as current user for demo
    this.currentUserId = users[0].id;

    // Generate community projects
    this.mockProjects = this.generateCommunityProjects(users);
  }

  private generateMonthlyGoals(
    userId: string,
    user: UserProfile
  ): MonthlyGoal[] {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    return [
      {
        id: this.generateUUID(),
        user_id: userId,
        goal_type: 'actions_completed',
        target_value: 10,
        current_value: Math.min(user.actions_completed, 10),
        unit: 'actions',
        month_year: currentMonth,
        completed: user.actions_completed >= 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: this.generateUUID(),
        user_id: userId,
        goal_type: 'volunteer_hours',
        target_value: 20,
        current_value: Math.min(user.volunteer_hours, 20),
        unit: 'hours',
        month_year: currentMonth,
        completed: user.volunteer_hours >= 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: this.generateUUID(),
        user_id: userId,
        goal_type: 'carbon_saved',
        target_value: 50,
        current_value: Math.min(user.carbon_saved, 50),
        unit: 'lbs CO₂',
        month_year: currentMonth,
        completed: user.carbon_saved >= 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  private generateEmergencyKit(userId: string): EmergencyKitItem[] {
    return [
      {
        id: this.generateUUID(),
        user_id: userId,
        item_name: 'Water (1 gallon/person/day)',
        status: 'complete',
        quantity: '3 gallons',
        expires: null,
        last_updated: new Date().toISOString(),
      },
      {
        id: this.generateUUID(),
        user_id: userId,
        item_name: 'Non-perishable food (3 days)',
        status: 'incomplete',
        quantity: '0 days',
        expires: null,
        last_updated: new Date().toISOString(),
      },
      {
        id: this.generateUUID(),
        user_id: userId,
        item_name: 'Battery-powered radio',
        status: 'complete',
        quantity: '1 unit',
        expires: null,
        last_updated: new Date().toISOString(),
      },
      {
        id: this.generateUUID(),
        user_id: userId,
        item_name: 'Flashlight',
        status: 'complete',
        quantity: '2 units',
        expires: '2025-03-15',
        last_updated: new Date().toISOString(),
      },
      {
        id: this.generateUUID(),
        user_id: userId,
        item_name: 'First aid kit',
        status: 'incomplete',
        quantity: '1 kit (expired)',
        expires: '2024-12-20',
        last_updated: new Date().toISOString(),
      },
      {
        id: this.generateUUID(),
        user_id: userId,
        item_name: 'Medications',
        status: 'complete',
        quantity: '30 days supply',
        expires: '2025-06-30',
        last_updated: new Date().toISOString(),
      },
    ];
  }

  private generateRecentActions(userId: string): RecentAction[] {
    const actions = [
      'Joined tree planting project',
      'Completed air quality monitoring',
      'Participated in beach cleanup',
      'Attended climate workshop',
      'Installed energy-efficient bulbs',
      'Created pollinator garden',
      'Organized neighborhood cleanup',
      'Mentored new volunteer',
    ];

    return actions.slice(0, 5).map((action, index) => ({
      id: this.generateUUID(),
      user_id: userId,
      action_type: 'general',
      description: action,
      created_at: new Date(
        Date.now() - index * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));
  }

  private generateUserActions(userId: string, count: number): UserAction[] {
    const actionTypes: UserAction['action_type'][] = [
      'tree_planting',
      'cleanup',
      'energy_saving',
      'conservation',
      'education',
    ];
    const actions: UserAction[] = [];

    for (let i = 0; i < Math.min(count, 10); i++) {
      const actionType =
        actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Random date in last 90 days

      actions.push({
        id: this.generateUUID(),
        user_id: userId,
        action_type: actionType,
        description: this.getActionDescription(actionType),
        impact_value: Math.floor(Math.random() * 500) + 50,
        impact_unit: this.getImpactUnit(actionType),
        location: this.getRandomLocation(),
        date_completed: date.toISOString().split('T')[0],
        verified: Math.random() > 0.2, // 80% verified
        rating:
          Math.random() > 0.3 ? Math.floor(Math.random() * 2) + 4 : undefined, // 70% have ratings 4-5
        created_at: date.toISOString(),
      });
    }

    return actions.sort(
      (a, b) =>
        new Date(b.date_completed).getTime() -
        new Date(a.date_completed).getTime()
    );
  }

  private getActionDescription(type: UserAction['action_type']): string {
    const descriptions = {
      tree_planting: [
        'Planted native oak trees in community park',
        'Participated in urban forest restoration',
        'Helped establish new tree canopy in neighborhood',
        'Planted fruit trees in community garden',
      ],
      cleanup: [
        'Beach cleanup - removed plastic waste',
        'Park restoration and litter removal',
        'River cleanup and debris collection',
        'Neighborhood street cleaning initiative',
      ],
      energy_saving: [
        'Installed LED bulbs throughout home',
        'Upgraded to energy-efficient appliances',
        'Added smart thermostat for energy savings',
        'Installed solar panels on rooftop',
      ],
      conservation: [
        'Installed rain garden for stormwater management',
        'Created native plant habitat',
        'Implemented water conservation system',
        'Built pollinator-friendly garden',
      ],
      education: [
        'Led workshop on sustainable living',
        'Taught composting techniques to neighbors',
        'Organized climate action presentation',
        'Mentored new environmental volunteers',
      ],
    };

    const options = descriptions[type];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getImpactUnit(type: UserAction['action_type']): string {
    const units = {
      tree_planting: 'lbs CO₂/year',
      cleanup: 'lbs waste removed',
      energy_saving: 'lbs CO₂/year saved',
      conservation: 'gallons saved annually',
      education: 'people educated',
    };
    return units[type];
  }

  private getRandomLocation(): string {
    const locations = [
      'Central Park, San Francisco',
      'Golden Gate Park, SF',
      'Ocean Beach, San Francisco',
      'Mission District, SF',
      'Oakland Community Garden',
      'Berkeley Hills, CA',
      'Alameda County Park',
      'Marin Headlands, CA',
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private generateCommunityProjects(users: UserProfile[]): CommunityProject[] {
    const projectTypes = [
      'tree-planting',
      'cleanup',
      'education',
      'energy',
      'conservation',
    ];
    const projects: CommunityProject[] = [];

    for (let i = 0; i < 15; i++) {
      const organizer = users[Math.floor(Math.random() * users.length)];
      const type =
        projectTypes[Math.floor(Math.random() * projectTypes.length)];
      const futureDate = new Date();
      futureDate.setDate(
        futureDate.getDate() + Math.floor(Math.random() * 30) + 1
      );

      projects.push({
        id: this.generateUUID(),
        title: this.getProjectTitle(type),
        description: this.getProjectDescription(type),
        type,
        organizer_id: organizer.id,
        organizer_name: organizer.name,
        location: this.getRandomLocation(),
        coordinates: {
          latitude: 37.7749 + (Math.random() - 0.5) * 0.2,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.2,
        },
        date: futureDate.toISOString().split('T')[0],
        time: this.getRandomTime(),
        max_participants: Math.floor(Math.random() * 50) + 20,
        current_participants: Math.floor(Math.random() * 30),
        requirements: this.getProjectRequirements(type),
        impact_goal: this.getImpactGoal(type),
        status: 'active',
        difficulty: this.getRandomDifficulty(),
        duration: this.getRandomDuration(),
        imageUrl: this.getProjectImage(type),
        distance: Math.round(Math.random() * 25 * 10) / 10,
        isJoined: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return projects;
  }

  private getProjectTitle(type: string): string {
    const titles = {
      'tree-planting': [
        'Urban Forest Initiative',
        'Neighborhood Tree Planting',
        'Green Canopy Project',
      ],
      cleanup: [
        'River Cleanup Drive',
        'Beach Restoration',
        'Park Cleanup Initiative',
      ],
      education: [
        'Climate Action Workshop',
        'Sustainable Living Seminar',
        'Green Building Tour',
      ],
      energy: [
        'Solar Panel Installation',
        'Energy Audit Program',
        'Community Solar Garden',
      ],
      conservation: [
        'Native Plant Garden',
        'Water Conservation Project',
        'Pollinator Habitat Creation',
      ],
    };
    const options = titles[type as keyof typeof titles] || [
      'Community Environmental Project',
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getProjectDescription(type: string): string {
    const descriptions = {
      'tree-planting':
        'Help plant native trees to combat urban heat island effect and improve air quality.',
      cleanup:
        'Remove litter and debris from local waterways to protect aquatic ecosystems.',
      education:
        'Learn practical strategies for reducing your carbon footprint and living sustainably.',
      energy:
        'Help install renewable energy systems to reduce community carbon emissions.',
      conservation:
        'Create habitats and conservation areas to support local wildlife and biodiversity.',
    };
    return (
      descriptions[type as keyof typeof descriptions] ||
      'Join us for this important environmental initiative.'
    );
  }

  private getProjectRequirements(type: string): string[] {
    const common = ['Comfortable clothing', 'Water bottle', 'Sun protection'];
    const specific = {
      'tree-planting': [
        'Work gloves',
        'Closed-toe shoes',
        'Small shovel (if available)',
      ],
      cleanup: ['Work gloves', 'Reusable bags', 'Closed-toe shoes'],
      education: ['Notebook', 'Pen/pencil', 'Open mind'],
      energy: ['Work gloves', 'Safety glasses', 'Basic tools (if available)'],
      conservation: [
        'Work gloves',
        'Knee pads (optional)',
        'Garden tools (if available)',
      ],
    };
    return [...common, ...(specific[type as keyof typeof specific] || [])];
  }

  private getImpactGoal(type: string): string {
    const goals = {
      'tree-planting': '2.5 tons CO₂/year per tree',
      cleanup: '500 lbs waste removed',
      education: 'Educational outreach',
      energy: '10 kW clean energy',
      conservation: '20 native species planted',
    };
    return goals[type as keyof typeof goals] || 'Positive environmental impact';
  }

  private getRandomDifficulty(): 'Easy' | 'Moderate' | 'Hard' {
    const difficulties: ('Easy' | 'Moderate' | 'Hard')[] = [
      'Easy',
      'Moderate',
      'Hard',
    ];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }

  private getRandomDuration(): string {
    const durations = [
      '1.5 hours',
      '2 hours',
      '3 hours',
      '4 hours',
      'Half day',
      'Full day',
      '2-3 hours',
    ];
    return durations[Math.floor(Math.random() * durations.length)];
  }

  private getProjectImage(type: string): string {
    const imageUrls = {
      'tree-planting':
        'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=400',
      cleanup:
        'https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg?auto=compress&cs=tinysrgb&w=400',
      education:
        'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400',
      energy:
        'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=400',
      conservation:
        'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=400',
    };

    return (
      imageUrls[type as keyof typeof imageUrls] || imageUrls['tree-planting']
    );
  }

  private getRandomTime(): string {
    const hours = [8, 9, 10, 14, 15, 16, 17, 18];
    const hour = hours[Math.floor(Math.random() * hours.length)];
    const minutes = ['00', '30'][Math.floor(Math.random() * 2)];
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Enhanced user management methods
  async createUserProfile(
    userData: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    if (this.isConnected && supabase) {
      try {
        const profileData = {
          ...userData,
          id: this.generateUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: true,
        };

        const { data, error } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single();

        if (error) {
          console.error('Supabase error creating profile:', error);
          throw error;
        }

        this.currentUserId = data.id;
        return data;
      } catch (error) {
        console.error('Error creating user profile:', error);
        return this.createMockUserProfile(userData);
      }
    } else {
      return this.createMockUserProfile(userData);
    }
  }

  private createMockUserProfile(userData: Partial<UserProfile>): UserProfile {
    const newProfile: UserProfile = {
      id: this.generateUUID(),
      name: userData.name || 'User',
      location: userData.location || 'Unknown',
      join_date: new Date().toISOString().split('T')[0],
      actions_completed: 0,
      volunteer_hours: 0,
      carbon_saved: 0,
      level: 1,
      achievements: ['Welcome to ClimateGuard!'],
      notifications_enabled: true,
      location_sharing: true,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...userData,
    };

    this.mockUsers.set(newProfile.id, newProfile);
    this.mockUserActions.set(newProfile.id, []);
    this.mockEmergencyKits.set(
      newProfile.id,
      this.generateEmergencyKit(newProfile.id)
    );
    this.mockRecentActions.set(
      newProfile.id,
      this.generateRecentActions(newProfile.id)
    );
    this.mockMonthlyGoals.set(
      newProfile.id,
      this.generateMonthlyGoals(newProfile.id, newProfile)
    );
    this.currentUserId = newProfile.id;
    return newProfile;
  }

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    const targetUserId = userId || this.currentUserId || 'demo-user-id';

    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return (
          this.mockUsers.get(targetUserId) ||
          Array.from(this.mockUsers.values())[0] ||
          null
        );
      }
    } else {
      return (
        this.mockUsers.get(targetUserId) ||
        Array.from(this.mockUsers.values())[0] ||
        null
      );
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating user profile:', error);
        const existingProfile = this.mockUsers.get(userId);
        if (existingProfile) {
          const updatedProfile = { ...existingProfile, ...updates };
          this.mockUsers.set(userId, updatedProfile);
          return updatedProfile;
        }
        return null;
      }
    } else {
      const existingProfile = this.mockUsers.get(userId);
      if (existingProfile) {
        const updatedProfile = { ...existingProfile, ...updates };
        this.mockUsers.set(userId, updatedProfile);
        return updatedProfile;
      }
      return null;
    }
  }

  async getUserActions(userId: string): Promise<UserAction[]> {
    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_actions')
          .select('*')
          .eq('user_id', userId)
          .order('date_completed', { ascending: false })
          .limit(50);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching user actions:', error);
        return this.mockUserActions.get(userId) || [];
      }
    } else {
      return this.mockUserActions.get(userId) || [];
    }
  }

  async addUserAction(
    action: Omit<UserAction, 'id' | 'created_at'>
  ): Promise<UserAction | null> {
    if (this.isConnected && supabase) {
      try {
        const actionData = {
          ...action,
          id: this.generateUUID(),
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('user_actions')
          .insert([actionData])
          .select()
          .single();

        if (error) throw error;

        // Add to recent actions
        await this.addRecentAction(action.user_id, {
          action_type: action.action_type,
          description: action.description,
        });

        return data;
      } catch (error) {
        console.error('Error adding user action:', error);
        return this.addMockUserAction(action);
      }
    } else {
      return this.addMockUserAction(action);
    }
  }

  private addMockUserAction(
    action: Omit<UserAction, 'id' | 'created_at'>
  ): UserAction {
    const newAction: UserAction = {
      id: this.generateUUID(),
      created_at: new Date().toISOString(),
      ...action,
    };

    const userActions = this.mockUserActions.get(action.user_id) || [];
    userActions.unshift(newAction);
    this.mockUserActions.set(action.user_id, userActions);

    // Add to recent actions
    this.addMockRecentAction(action.user_id, {
      action_type: action.action_type,
      description: action.description,
    });

    return newAction;
  }

  async joinProject(userId: string, projectId: string): Promise<boolean> {
    if (this.isConnected && supabase) {
      try {
        const { error } = await supabase.from('project_participations').insert([
          {
            id: this.generateUUID(),
            user_id: userId,
            project_id: projectId,
            joined_at: new Date().toISOString(),
            completed: false,
          },
        ]);

        if (error) {
          if (error.code === '23505') {
            return false;
          }
          throw error;
        }

        // Add to group memberships
        await supabase.from('group_memberships').insert([
          {
            id: this.generateUUID(),
            user_id: userId,
            group_id: projectId,
            joined_at: new Date().toISOString(),
            is_active: true,
          },
        ]);

        return true;
      } catch (error) {
        console.error('Error joining project:', error);
        return this.joinMockProject(userId, projectId);
      }
    } else {
      return this.joinMockProject(userId, projectId);
    }
  }

  private joinMockProject(userId: string, projectId: string): boolean {
    const participation: ProjectParticipation = {
      id: this.generateUUID(),
      user_id: userId,
      project_id: projectId,
      joined_at: new Date().toISOString(),
      completed: false,
    };

    const alreadyJoined = this.mockParticipations.some(
      (p) => p.user_id === userId && p.project_id === projectId
    );

    if (!alreadyJoined) {
      this.mockParticipations.push(participation);

      // Add to group memberships
      const membership: GroupMembership = {
        id: this.generateUUID(),
        user_id: userId,
        group_id: projectId,
        joined_at: new Date().toISOString(),
      };

      const userMemberships = this.mockGroupMemberships.get(userId) || [];
      userMemberships.push(membership);
      this.mockGroupMemberships.set(userId, userMemberships);

      return true;
    }
    return false;
  }

  async leaveProject(userId: string, projectId: string): Promise<boolean> {
    if (this.isConnected && supabase) {
      try {
        const { error } = await supabase
          .from('project_participations')
          .delete()
          .eq('user_id', userId)
          .eq('project_id', projectId);

        if (error) throw error;

        // Remove from group memberships
        await supabase
          .from('group_memberships')
          .delete()
          .eq('user_id', userId)
          .eq('group_id', projectId);

        return true;
      } catch (error) {
        console.error('Error leaving project:', error);
        return this.leaveMockProject(userId, projectId);
      }
    } else {
      return this.leaveMockProject(userId, projectId);
    }
  }

  private leaveMockProject(userId: string, projectId: string): boolean {
    const initialLength = this.mockParticipations.length;
    this.mockParticipations = this.mockParticipations.filter(
      (p) => !(p.user_id === userId && p.project_id === projectId)
    );

    // Remove from group memberships
    const userMemberships = this.mockGroupMemberships.get(userId) || [];
    const filteredMemberships = userMemberships.filter(
      (m) => m.group_id !== projectId
    );
    this.mockGroupMemberships.set(userId, filteredMemberships);

    return this.mockParticipations.length < initialLength;
  }

  async getUserParticipations(userId: string): Promise<ProjectParticipation[]> {
    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('project_participations')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching user participations:', error);
        return this.mockParticipations.filter((p) => p.user_id === userId);
      }
    } else {
      return this.mockParticipations.filter((p) => p.user_id === userId);
    }
  }

  async updateEmergencyKit(
    userId: string,
    itemId: string,
    updates: Partial<EmergencyKitItem>
  ): Promise<boolean> {
    if (this.isConnected && supabase) {
      try {
        const { error } = await supabase
          .from('emergency_kits')
          .update({ ...updates, last_updated: new Date().toISOString() })
          .eq('id', itemId)
          .eq('user_id', userId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error updating emergency kit:', error);
        return this.updateMockEmergencyKit(userId, itemId, updates);
      }
    } else {
      return this.updateMockEmergencyKit(userId, itemId, updates);
    }
  }

  private updateMockEmergencyKit(
    userId: string,
    itemId: string,
    updates: Partial<EmergencyKitItem>
  ): boolean {
    const userKit = this.mockEmergencyKits.get(userId) || [];
    const itemIndex = userKit.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      userKit[itemIndex] = {
        ...userKit[itemIndex],
        ...updates,
        last_updated: new Date().toISOString(),
      };
      this.mockEmergencyKits.set(userId, userKit);
      return true;
    }
    return false;
  }

  async getEmergencyKit(userId: string): Promise<EmergencyKitItem[]> {
    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('emergency_kits')
          .select('*')
          .eq('user_id', userId)
          .order('last_updated', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching emergency kit:', error);
        return this.mockEmergencyKits.get(userId) || [];
      }
    } else {
      return this.mockEmergencyKits.get(userId) || [];
    }
  }

  async getGroupMemberships(userId: string): Promise<string[]> {
    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('group_memberships')
          .select('group_id')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (error) throw error;
        return data?.map((m) => m.group_id) || [];
      } catch (error) {
        console.error('Error fetching group memberships:', error);
        const userMemberships = this.mockGroupMemberships.get(userId) || [];
        return userMemberships.map((m) => m.group_id);
      }
    } else {
      const userMemberships = this.mockGroupMemberships.get(userId) || [];
      return userMemberships.map((m) => m.group_id);
    }
  }

  async addRecentAction(
    userId: string,
    actionData: { action_type: string; description: string }
  ): Promise<boolean> {
    if (this.isConnected && supabase) {
      try {
        const { error } = await supabase.from('recent_actions').insert([
          {
            id: this.generateUUID(),
            user_id: userId,
            action_type: actionData.action_type,
            description: actionData.description,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error adding recent action:', error);
        return this.addMockRecentAction(userId, actionData);
      }
    } else {
      return this.addMockRecentAction(userId, actionData);
    }
  }

  private addMockRecentAction(
    userId: string,
    actionData: { action_type: string; description: string }
  ): boolean {
    const recentAction: RecentAction = {
      id: this.generateUUID(),
      user_id: userId,
      action_type: actionData.action_type,
      description: actionData.description,
      created_at: new Date().toISOString(),
    };

    const userRecentActions = this.mockRecentActions.get(userId) || [];
    userRecentActions.unshift(recentAction);
    this.mockRecentActions.set(userId, userRecentActions.slice(0, 10)); // Keep only 10 most recent

    return true;
  }

  async getRecentActions(userId: string): Promise<RecentAction[]> {
    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('recent_actions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching recent actions:', error);
        return this.mockRecentActions.get(userId) || [];
      }
    } else {
      return this.mockRecentActions.get(userId) || [];
    }
  }

  async getMonthlyGoals(userId: string): Promise<MonthlyGoal[]> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('monthly_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('month_year', currentMonth);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching monthly goals:', error);
        return this.mockMonthlyGoals.get(userId) || [];
      }
    } else {
      return this.mockMonthlyGoals.get(userId) || [];
    }
  }

  async updateMonthlyGoal(
    userId: string,
    goalId: string,
    updates: Partial<MonthlyGoal>
  ): Promise<boolean> {
    if (this.isConnected && supabase) {
      try {
        const { error } = await supabase
          .from('monthly_goals')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', goalId)
          .eq('user_id', userId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error updating monthly goal:', error);
        return this.updateMockMonthlyGoal(userId, goalId, updates);
      }
    } else {
      return this.updateMockMonthlyGoal(userId, goalId, updates);
    }
  }

  private updateMockMonthlyGoal(
    userId: string,
    goalId: string,
    updates: Partial<MonthlyGoal>
  ): boolean {
    const userGoals = this.mockMonthlyGoals.get(userId) || [];
    const goalIndex = userGoals.findIndex((goal) => goal.id === goalId);

    if (goalIndex !== -1) {
      userGoals[goalIndex] = {
        ...userGoals[goalIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.mockMonthlyGoals.set(userId, userGoals);
      return true;
    }
    return false;
  }

  // Enhanced project management methods
  async addProject(
    projectData: Omit<CommunityProject, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CommunityProject | null> {
    if (this.isConnected && supabase) {
      try {
        const newProject = {
          ...projectData,
          id: this.generateUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('community_projects')
          .insert([newProject])
          .select()
          .single();

        if (error) throw error;

        // Add organizer name from user profile
        const organizer = await this.getUserProfile(data.organizer_id);
        if (organizer) {
          data.organizer_name = organizer.name;
        }

        return data;
      } catch (error) {
        console.error('Error adding project:', error);
        return this.addMockProject(projectData);
      }
    } else {
      return this.addMockProject(projectData);
    }
  }

  private addMockProject(
    projectData: Omit<CommunityProject, 'id' | 'created_at' | 'updated_at'>
  ): CommunityProject {
    const organizer = this.mockUsers.get(projectData.organizer_id);

    const newProject: CommunityProject = {
      ...projectData,
      id: this.generateUUID(),
      organizer_name: organizer?.name || 'Unknown Organizer',
      difficulty: projectData.difficulty || this.getRandomDifficulty(),
      duration: projectData.duration || this.getRandomDuration(),
      imageUrl: projectData.imageUrl || this.getProjectImage(projectData.type),
      distance:
        projectData.distance || Math.round(Math.random() * 25 * 10) / 10,
      isJoined: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.mockProjects.unshift(newProject);
    return newProject;
  }

  async getCommunityProjects(): Promise<CommunityProject[]> {
    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('community_projects')
          .select(
            `
            *,
            organizer:user_profiles!organizer_id(name)
          `
          )
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to include organizer name
        const projects = (data || []).map((project) => ({
          ...project,
          organizer_name: project.organizer?.name || 'Unknown Organizer',
          difficulty: project.difficulty || this.getRandomDifficulty(),
          duration: project.duration || this.getRandomDuration(),
          imageUrl: project.imageUrl || this.getProjectImage(project.type),
          distance:
            project.distance || Math.round(Math.random() * 25 * 10) / 10,
          isJoined: false,
        }));

        return projects;
      } catch (error) {
        console.error('Error fetching community projects:', error);
        return this.mockProjects;
      }
    } else {
      return this.mockProjects;
    }
  }

  async getAIRecommendations(
    userId: string,
    environmentalData: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    try {
      if (environmentalData?.airQuality?.aqi > 100) {
        recommendations.push(
          'Air quality is poor - consider indoor activities and air purifiers'
        );
        recommendations.push('Join local air quality monitoring initiatives');
        recommendations.push('Plant trees to help improve local air quality');
      } else if (environmentalData?.airQuality?.aqi > 50) {
        recommendations.push(
          'Air quality is moderate - perfect for outdoor environmental projects'
        );
        recommendations.push('Consider organizing a tree planting event');
      } else {
        recommendations.push(
          'Excellent air quality today - great time for outdoor activities!'
        );
        recommendations.push(
          'Perfect conditions for community environmental projects'
        );
      }

      if (environmentalData?.weather?.temperature > 85) {
        recommendations.push(
          'High temperatures - participate in urban cooling projects'
        );
        recommendations.push('Plant shade trees in your neighborhood');
        recommendations.push(
          'Join energy efficiency initiatives to reduce cooling costs'
        );
      } else if (environmentalData?.weather?.temperature < 40) {
        recommendations.push(
          'Cold weather - focus on energy efficiency projects'
        );
        recommendations.push(
          'Weatherize homes for vulnerable community members'
        );
      }

      if (environmentalData?.risks?.wildfire > 6) {
        recommendations.push(
          'High wildfire risk - create defensible space around buildings'
        );
        recommendations.push('Join community fire prevention programs');
        recommendations.push(
          'Organize neighborhood emergency preparedness meetings'
        );
      }

      if (environmentalData?.risks?.heat > 3) {
        recommendations.push('Heat risk elevated - check on elderly neighbors');
        recommendations.push(
          'Advocate for more cooling centers in your community'
        );
      }

      recommendations.push('Use public transportation to reduce emissions');
      recommendations.push('Start composting to reduce waste');
      recommendations.push('Switch to LED bulbs for energy efficiency');
      recommendations.push(
        'Support local farmers markets for fresh, low-carbon food'
      );

      return recommendations.slice(0, 6);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return [
        'Check air quality before outdoor activities',
        'Use energy-efficient appliances to reduce consumption',
        'Participate in local environmental community events',
        'Prepare an emergency kit for climate-related events',
        'Choose sustainable transportation options when possible',
      ];
    }
  }

  // New methods for enhanced user interaction
  async getAllUsers(): Promise<UserProfile[]> {
    if (this.isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('level', { ascending: false })
          .limit(50);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching all users:', error);
        return Array.from(this.mockUsers.values());
      }
    } else {
      return Array.from(this.mockUsers.values());
    }
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  isConnectionActive(): boolean {
    return this.isConnected;
  }

  getConnectionInfo(): {
    connected: boolean;
    hasCredentials: boolean;
    userCount: number;
  } {
    return {
      connected: this.isConnected,
      hasCredentials: hasValidCredentials,
      userCount: this.mockUsers.size,
    };
  }

  // Enhanced project search with geolocation
  async searchProjectsByLocation(
    userLatitude: number,
    userLongitude: number,
    radiusKm: number = 50
  ): Promise<CommunityProject[]> {
    try {
      const allProjects = await this.getCommunityProjects();

      // Filter projects within radius
      const nearbyProjects = allProjects.filter((project) => {
        if (!project.coordinates) return false;

        const distance = this.calculateDistance(
          userLatitude,
          userLongitude,
          project.coordinates.latitude,
          project.coordinates.longitude
        );

        // Update project with calculated distance
        project.distance = Math.round(distance * 10) / 10;

        return distance <= radiusKm;
      });

      // Sort by distance
      return nearbyProjects.sort(
        (a, b) => (a.distance || 0) - (b.distance || 0)
      );
    } catch (error) {
      console.error('Error searching projects by location:', error);
      return [];
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Enhanced project validation
  async validateProject(projectId: string): Promise<boolean> {
    try {
      if (this.isConnected && supabase) {
        const { data, error } = await supabase
          .from('community_projects')
          .select('id, status')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error(
            `Project validation failed for ID ${projectId}:`,
            error
          );
          return false;
        }

        return data && data.status === 'active';
      } else {
        // Check mock projects
        const project = this.mockProjects.find((p) => p.id === projectId);
        return project ? project.status === 'active' : false;
      }
    } catch (error) {
      console.error(`Error validating project ${projectId}:`, error);
      return false;
    }
  }

  // Batch project operations for better performance
  async batchUpdateProjects(
    updates: Array<{ id: string; updates: Partial<CommunityProject> }>
  ): Promise<boolean> {
    try {
      if (this.isConnected && supabase) {
        const promises = updates.map(({ id, updates: projectUpdates }) =>
          supabase
            .from('community_projects')
            .update({ ...projectUpdates, updated_at: new Date().toISOString() })
            .eq('id', id)
        );

        const results = await Promise.allSettled(promises);
        const allSuccessful = results.every(
          (result) => result.status === 'fulfilled'
        );

        if (!allSuccessful) {
          console.error(
            'Some batch updates failed:',
            results.filter((r) => r.status === 'rejected')
          );
        }

        return allSuccessful;
      } else {
        // Update mock projects
        updates.forEach(({ id, updates: projectUpdates }) => {
          const projectIndex = this.mockProjects.findIndex((p) => p.id === id);
          if (projectIndex !== -1) {
            this.mockProjects[projectIndex] = {
              ...this.mockProjects[projectIndex],
              ...projectUpdates,
              updated_at: new Date().toISOString(),
            };
          }
        });
        return true;
      }
    } catch (error) {
      console.error('Error in batch update projects:', error);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
