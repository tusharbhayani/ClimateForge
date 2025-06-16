import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { environmentalDataService, EnvironmentalData } from '@/services/environmentalDataService';
import { communityService, CommunityProject, CommunityStats } from '@/services/communityService';
import { locationService, LocationData } from '@/services/locationService';
import { supabaseService, UserProfile, UserAction } from '@/services/supabaseService';

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'moderate' | 'high';
  title: string;
  message: string;
  timestamp: string;
  color: string;
}

interface EmergencyKitItem {
  id: string;
  item: string;
  status: 'complete' | 'incomplete';
  quantity: string;
  expires: string | null;
  lastUpdated: string;
}

interface MonthlyGoal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  completed: boolean;
  month_year: string;
}

interface ClimateContextType {
  environmentalData: EnvironmentalData | null;
  communityProjects: CommunityProject[];
  communityStats: CommunityStats | null;
  alerts: Alert[];
  userProfile: UserProfile | null;
  userActions: UserAction[];
  emergencyKit: EmergencyKitItem[];
  monthlyGoals: MonthlyGoal[];
  joinedProjects: string[];
  isOnboarded: boolean;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  joinProject: (projectId: string) => Promise<boolean>;
  leaveProject: (projectId: string) => Promise<boolean>;
  dismissAlert: (alertId: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  initializeUser: (name: string) => Promise<void>;
  addUserAction: (action: Omit<UserAction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  getAIRecommendations: () => Promise<string[]>;
  updateEmergencyKit: (itemId: string, updates: any) => Promise<boolean>;
  getJoinedProjects: () => string[];
  addProject: (projectData: any) => Promise<boolean>;
  updateMonthlyGoals: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const ClimateContext = createContext<ClimateContextType | undefined>(undefined);

export function ClimateProvider({ children }: { children: ReactNode }) {
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [communityProjects, setCommunityProjects] = useState<CommunityProject[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userActions, setUserActions] = useState<UserAction[]>([]);
  const [emergencyKit, setEmergencyKit] = useState<EmergencyKitItem[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<string[]>([]);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent infinite loops with refs
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);
  const initializationRef = useRef(false);

  const generateAlertsFromEnvironmentalData = useCallback((data: EnvironmentalData): Alert[] => {
    const newAlerts: Alert[] = [];
    const now = new Date().toISOString();

    // Air quality alerts
    if (data.airQuality.aqi > 150) {
      newAlerts.push({
        id: `aqi_unhealthy_${Date.now()}`,
        type: 'air-quality',
        severity: 'high',
        title: 'Unhealthy Air Quality',
        message: `AQI is ${data.airQuality.aqi}. ${data.airQuality.healthRecommendation}`,
        timestamp: now,
        color: '#ef4444'
      });
    } else if (data.airQuality.aqi > 100) {
      newAlerts.push({
        id: `aqi_moderate_${Date.now()}`,
        type: 'air-quality',
        severity: 'moderate',
        title: 'Air Quality Advisory',
        message: `AQI is ${data.airQuality.aqi}. Sensitive individuals should limit outdoor activities.`,
        timestamp: now,
        color: '#f59e0b'
      });
    }

    // Weather alerts
    if (data.weather.temperature > 95) {
      newAlerts.push({
        id: `heat_warning_${Date.now()}`,
        type: 'weather',
        severity: 'high',
        title: 'Extreme Heat Warning',
        message: `Temperature is ${data.weather.temperature}°F. Stay hydrated and avoid prolonged sun exposure.`,
        timestamp: now,
        color: '#ef4444'
      });
    }

    // Climate risk alerts
    if (data.risks.wildfire > 7) {
      newAlerts.push({
        id: `wildfire_risk_${Date.now()}`,
        type: 'emergency',
        severity: 'high',
        title: 'High Wildfire Risk',
        message: 'Wildfire conditions are dangerous. Prepare emergency kit and know evacuation routes.',
        timestamp: now,
        color: '#ef4444'
      });
    }

    return newAlerts;
  }, []);

  const updateMonthlyGoals = useCallback(async () => {
    if (!userProfile) return;

    try {
      setMonthlyGoals(prev => prev.map(goal => {
        let currentValue = goal.current_value;

        switch (goal.goal_type) {
          case 'actions_completed':
            currentValue = userProfile.actions_completed;
            break;
          case 'volunteer_hours':
            currentValue = userProfile.volunteer_hours;
            break;
          case 'carbon_saved':
            currentValue = userProfile.carbon_saved;
            break;
        }

        return {
          ...goal,
          current_value: currentValue,
          completed: currentValue >= goal.target_value
        };
      }));
    } catch (error) {
      console.error('Error updating monthly goals:', error);
    }
  }, [userProfile]);

  const initializeUser = useCallback(async (name: string) => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      setLoading(true);
      setError(null);

      console.log('Initializing user:', name);

      // Initialize Supabase connection
      const connected = await supabaseService.initializeConnection();
      console.log('Supabase connection status:', connected);

      // Get current location
      const location = await locationService.getCurrentLocation();

      // Create user profile
      const newProfile = await supabaseService.createUserProfile({
        name,
        location: location?.address || 'Unknown Location',
        join_date: new Date().toISOString().split('T')[0],
        actions_completed: 0,
        volunteer_hours: 0,
        carbon_saved: 0,
        level: 1,
        achievements: ['Welcome to ClimateGuard!'],
      });

      if (newProfile) {
        setUserProfile(newProfile);

        // Load user actions
        const actions = await supabaseService.getUserActions(newProfile.id);
        setUserActions(actions);

        // Initialize emergency kit
        await initializeEmergencyKit(newProfile.id);

        // Initialize monthly goals
        await initializeMonthlyGoals(newProfile.id);

        // Load environmental data
        await refreshData();

        // Mark as onboarded
        setIsOnboarded(true);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      setError('Failed to initialize user profile. Please try again.');
      throw error;
    } finally {
      setLoading(false);
      initializationRef.current = false;
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      setIsOnboarded(true);
      // Store onboarding status in local storage or Supabase
      if (userProfile) {
        await supabaseService.updateUserProfile(userProfile.id, {
          onboarding_completed: true
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [userProfile]);

  const initializeEmergencyKit = useCallback(async (userId: string) => {
    try {
      const existingKit = await supabaseService.getEmergencyKit(userId);

      if (existingKit.length === 0) {
        // Create default emergency kit
        const defaultKit = [
          { id: 'kit_1', item: 'Water (1 gallon/person/day)', status: 'complete' as const, expires: null, quantity: '3 gallons', lastUpdated: new Date().toISOString() },
          { id: 'kit_2', item: 'Non-perishable food (3 days)', status: 'incomplete' as const, expires: null, quantity: '0 days', lastUpdated: new Date().toISOString() },
          { id: 'kit_3', item: 'Battery-powered radio', status: 'complete' as const, expires: null, quantity: '1 unit', lastUpdated: new Date().toISOString() },
          { id: 'kit_4', item: 'Flashlight', status: 'complete' as const, expires: '2025-03-15', quantity: '2 units', lastUpdated: new Date().toISOString() },
          { id: 'kit_5', item: 'First aid kit', status: 'incomplete' as const, expires: '2024-12-20', quantity: '1 kit (expired)', lastUpdated: new Date().toISOString() },
          { id: 'kit_6', item: 'Medications', status: 'complete' as const, expires: '2025-06-30', quantity: '30 days supply', lastUpdated: new Date().toISOString() },
        ];
        setEmergencyKit(defaultKit);
      } else {
        setEmergencyKit(existingKit.map(item => ({
          id: item.id,
          item: item.item_name,
          status: item.status,
          quantity: item.quantity,
          expires: item.expires,
          lastUpdated: item.last_updated
        })));
      }
    } catch (error) {
      console.error('Error initializing emergency kit:', error);
    }
  }, []);

  const initializeMonthlyGoals = useCallback(async (userId: string) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      const defaultGoals = [
        {
          id: 'goal_1',
          goal_type: 'actions_completed',
          target_value: 10,
          current_value: 0,
          unit: 'actions',
          completed: false,
          month_year: currentMonth,
        },
        {
          id: 'goal_2',
          goal_type: 'volunteer_hours',
          target_value: 20,
          current_value: 0,
          unit: 'hours',
          completed: false,
          month_year: currentMonth,
        },
        {
          id: 'goal_3',
          goal_type: 'carbon_saved',
          target_value: 50,
          current_value: 0,
          unit: 'lbs CO₂',
          completed: false,
          month_year: currentMonth,
        },
      ];

      setMonthlyGoals(defaultGoals);
    } catch (error) {
      console.error('Error initializing monthly goals:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      console.log('Refresh already in progress, skipping...');
      return;
    }

    // Throttle refreshes to prevent loops
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 5000) { // 5 second minimum between refreshes
      console.log('Refresh throttled, too soon since last refresh');
      return;
    }

    isRefreshingRef.current = true;
    lastRefreshTimeRef.current = now;

    try {
      setLoading(true);
      setError(null);

      console.log('Starting data refresh...');

      // Fetch environmental data
      try {
        const envData = await environmentalDataService.fetchEnvironmentalData();
        setEnvironmentalData(envData);
        console.log('Environmental data loaded successfully');

        // Generate alerts based on environmental data
        const newAlerts = generateAlertsFromEnvironmentalData(envData);
        setAlerts(newAlerts);
      } catch (envError) {
        console.error('Environmental data fetch failed:', envError);
        setError('Unable to load current environmental conditions. Using cached data.');
      }

      // Fetch community data
      try {
        const [projects, stats] = await Promise.allSettled([
          communityService.getCommunityProjects(),
          communityService.getCommunityStats()
        ]);

        if (projects.status === 'fulfilled') {
          setCommunityProjects(projects.value);

          // Update joined projects status
          if (userProfile) {
            const userJoinedProjects = await supabaseService.getGroupMemberships(userProfile.id);
            setJoinedProjects(userJoinedProjects);
          }
        }

        if (stats.status === 'fulfilled') {
          setCommunityStats(stats.value);
        }
      } catch (communityError) {
        console.error('Community data fetch failed:', communityError);
      }

    } catch (err) {
      console.error('Error refreshing data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
      isRefreshingRef.current = false;
    }
  }, [generateAlertsFromEnvironmentalData, userProfile]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    try {
      const updatedProfile = await supabaseService.updateUserProfile(userProfile.id, updates);
      if (updatedProfile) {
        setUserProfile(updatedProfile);

        // Update monthly goals if relevant fields changed
        if (updates.actions_completed || updates.volunteer_hours || updates.carbon_saved) {
          await updateMonthlyGoals();
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }, [userProfile, updateMonthlyGoals]);

  const joinProject = useCallback(async (projectId: string): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const success = await Promise.all([
        communityService.joinProject(projectId),
        supabaseService.joinProject(userProfile.id, projectId)
      ]);

      if (success[0] && success[1]) {
        // Update local state
        setCommunityProjects(prev =>
          prev.map(project =>
            project.id === projectId
              ? { ...project, participants: project.participants + 1, isJoined: true }
              : project
          )
        );

        // Add to joined projects
        setJoinedProjects(prev => [...prev, projectId]);

        // Update user profile
        const updatedProfile = {
          actions_completed: userProfile.actions_completed + 1,
          volunteer_hours: userProfile.volunteer_hours + 3
        };

        await updateUserProfile(updatedProfile);

        // Add action record
        const project = communityProjects.find(p => p.id === projectId);
        if (project) {
          await addUserAction({
            action_type: project.type as any,
            description: `Joined project: ${project.title}`,
            impact_value: 1,
            impact_unit: 'project joined',
            location: project.location,
            date_completed: new Date().toISOString().split('T')[0],
            project_id: projectId,
            verified: false,
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error joining project:', error);
      return false;
    }
  }, [userProfile, communityProjects, updateUserProfile]);

  const leaveProject = useCallback(async (projectId: string): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const success = await Promise.all([
        communityService.leaveProject(projectId),
        supabaseService.leaveProject(userProfile.id, projectId)
      ]);

      if (success[0] && success[1]) {
        // Update local state
        setCommunityProjects(prev =>
          prev.map(project =>
            project.id === projectId
              ? { ...project, participants: Math.max(0, project.participants - 1), isJoined: false }
              : project
          )
        );

        // Remove from joined projects
        setJoinedProjects(prev => prev.filter(id => id !== projectId));

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error leaving project:', error);
      return false;
    }
  }, [userProfile]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const addUserAction = useCallback(async (action: Omit<UserAction, 'id' | 'user_id' | 'created_at'>) => {
    if (!userProfile) return;

    try {
      const newAction = await supabaseService.addUserAction({
        ...action,
        user_id: userProfile.id,
      });

      if (newAction) {
        setUserActions(prev => [newAction, ...prev]);

        // Update user stats
        const carbonImpact = action.action_type === 'tree_planting' ? action.impact_value : 0;
        await updateUserProfile({
          actions_completed: userProfile.actions_completed + 1,
          carbon_saved: userProfile.carbon_saved + carbonImpact,
        });
      }
    } catch (error) {
      console.error('Error adding user action:', error);
    }
  }, [userProfile, updateUserProfile]);

  const updateEmergencyKit = useCallback(async (itemId: string, updates: any): Promise<boolean> => {
    try {
      if (userProfile) {
        const success = await supabaseService.updateEmergencyKit(userProfile.id, itemId, updates);
        if (success) {
          setEmergencyKit(prev =>
            prev.map(item =>
              item.id === itemId
                ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
                : item
            )
          );
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating emergency kit:', error);
      return false;
    }
  }, [userProfile]);

  const getJoinedProjects = useCallback((): string[] => {
    return joinedProjects;
  }, [joinedProjects]);

  const addProject = useCallback(async (projectData: any): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const newProject = await supabaseService.addProject({
        ...projectData,
        organizer_id: userProfile.id,
        status: 'active' as const,
        current_participants: 0,
      });

      if (newProject) {
        setCommunityProjects(prev => [newProject, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding project:', error);
      return false;
    }
  }, [userProfile]);

  const getAIRecommendations = useCallback(async (): Promise<string[]> => {
    if (!userProfile || !environmentalData) return [];

    try {
      return await supabaseService.getAIRecommendations(userProfile.id, environmentalData);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    }
  }, [userProfile, environmentalData]);

  // Check if user is onboarded on app start
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (initializationRef.current) return;
      initializationRef.current = true;

      try {
        setLoading(true);

        console.log('Checking onboarding status...');

        // Initialize Supabase connection
        const connected = await supabaseService.initializeConnection();
        console.log('Initial Supabase connection:', connected);

        // Check for stored user profile
        const storedProfile = await supabaseService.getUserProfile();

        if (storedProfile) {
          setUserProfile(storedProfile);
          setIsOnboarded(true);

          // Load user actions
          const actions = await supabaseService.getUserActions(storedProfile.id);
          setUserActions(actions);

          // Load emergency kit
          await initializeEmergencyKit(storedProfile.id);

          // Load monthly goals
          await initializeMonthlyGoals(storedProfile.id);

          // Load joined projects
          const userJoinedProjects = await supabaseService.getGroupMemberships(storedProfile.id);
          setJoinedProjects(userJoinedProjects);

          // Load environmental data
          await refreshData();
        } else {
          setIsOnboarded(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboarded(false);
        setError('Failed to load user data. Using demo mode.');
      } finally {
        setLoading(false);
        initializationRef.current = false;
      }
    };

    checkOnboardingStatus();
  }, []); // Empty dependency array to run only once

  return (
    <ClimateContext.Provider value={{
      environmentalData,
      communityProjects,
      communityStats,
      alerts,
      userProfile,
      userActions,
      emergencyKit,
      monthlyGoals,
      joinedProjects,
      isOnboarded,
      loading,
      error,
      refreshData,
      joinProject,
      leaveProject,
      dismissAlert,
      updateUserProfile,
      initializeUser,
      addUserAction,
      getAIRecommendations,
      updateEmergencyKit,
      getJoinedProjects,
      addProject,
      updateMonthlyGoals,
      completeOnboarding
    }}>
      {children}
    </ClimateContext.Provider>
  );
}

export function useClimate() {
  const context = useContext(ClimateContext);
  if (context === undefined) {
    throw new Error('useClimate must be used within a ClimateProvider');
  }
  return context;
}