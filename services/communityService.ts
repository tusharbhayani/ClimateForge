import { locationService } from './locationService';
import { supabaseService } from './supabaseService';

export interface CommunityProject {
  id: string;
  title: string;
  description: string;
  type: 'tree-planting' | 'cleanup' | 'education' | 'energy' | 'conservation';
  participants: number;
  maxParticipants: number;
  date: string;
  time: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  impact: string;
  organizer: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  duration: string;
  requirements: string[];
  imageUrl: string;
  isJoined: boolean;
  distance?: number;
}

export interface CommunityStats {
  totalProjects: number;
  activeVolunteers: number;
  carbonSaved: number;
  treesPlanted: number;
  wasteCollected: number;
}

class CommunityService {
  private projects: CommunityProject[] = [];
  private userJoinedProjects: Set<string> = new Set();
  private isInitialized = false;
  private lastSyncTime = 0;
  private readonly SYNC_INTERVAL = 300000; // 5 minutes

  private generateRealisticProjects(userLocation: {
    latitude: number;
    longitude: number;
  }): CommunityProject[] {
    const projectTemplates = [
      {
        type: 'tree-planting' as const,
        titles: [
          'Urban Forest Initiative',
          'Neighborhood Tree Planting',
          'Park Restoration Project',
          'Street Tree Installation',
          'Community Orchard Development',
          'Green Canopy Expansion',
          'Native Species Restoration',
        ],
        descriptions: [
          'Help plant native trees to combat urban heat island effect and improve air quality in our community.',
          'Join us in creating green corridors throughout the neighborhood to support local wildlife.',
          'Restore degraded parkland with native vegetation and create habitat for local species.',
          'Install shade trees along busy streets to reduce heat and improve pedestrian comfort.',
          'Develop a community food forest with fruit trees and edible plants for local residents.',
          'Expand tree canopy coverage to reduce urban temperatures and improve air quality.',
          'Plant native species to restore natural ecosystems and support biodiversity.',
        ],
        impacts: [
          '2.5 tons CO₂/year per tree',
          '15% temperature reduction',
          '500 lbs CO₂ absorbed annually',
          '20% air quality improvement',
          '1 ton CO₂ offset per tree',
          '30% cooling effect',
          '50 species supported',
        ],
      },
      {
        type: 'cleanup' as const,
        titles: [
          'River Cleanup Drive',
          'Beach Restoration',
          'Park Cleanup Initiative',
          'Neighborhood Litter Removal',
          'Waterway Protection Project',
          'Coastal Conservation Effort',
          'Urban Waste Reduction',
        ],
        descriptions: [
          'Remove litter and debris from local waterways to protect aquatic ecosystems.',
          'Clean up coastal areas and remove plastic pollution threatening marine life.',
          'Restore community parks by removing invasive plants and collecting trash.',
          'Organize systematic cleanup of streets, sidewalks, and public spaces.',
          'Protect local streams and rivers from pollution through community action.',
          'Preserve coastal habitats by removing harmful debris and pollutants.',
          'Reduce urban waste and improve neighborhood aesthetics through collective action.',
        ],
        impacts: [
          '500 lbs waste removed',
          '2 miles of coastline cleaned',
          '1000 lbs debris collected',
          '50 bags of litter removed',
          '300 lbs plastic prevented from ocean',
          '5 acres restored',
          '100 wildlife habitats protected',
        ],
      },
      {
        type: 'education' as const,
        titles: [
          'Climate Action Workshop',
          'Sustainable Living Seminar',
          'Renewable Energy Fair',
          'Composting Workshop',
          'Green Building Tour',
          'Environmental Science Lab',
          'Eco-Friendly Lifestyle Class',
        ],
        descriptions: [
          'Learn practical strategies for reducing your carbon footprint and living sustainably.',
          'Discover how to make your home more energy-efficient and environmentally friendly.',
          'Explore solar, wind, and other renewable energy options for your community.',
          'Master the art of composting to reduce waste and create nutrient-rich soil.',
          'Tour LEED-certified buildings and learn about sustainable construction practices.',
          'Hands-on experiments to understand environmental science and climate change.',
          'Comprehensive guide to adopting eco-friendly practices in daily life.',
        ],
        impacts: [
          'Educational outreach',
          '50+ people educated',
          'Community awareness',
          'Skill development',
          'Knowledge sharing',
          '100 students reached',
          '25 families trained',
        ],
      },
      {
        type: 'energy' as const,
        titles: [
          'Solar Panel Installation',
          'Energy Audit Program',
          'LED Bulb Exchange',
          'Weatherization Project',
          'Community Solar Garden',
          'Smart Grid Initiative',
          'Renewable Energy Co-op',
        ],
        descriptions: [
          'Help install solar panels on community buildings to reduce energy costs.',
          'Conduct home energy audits to identify efficiency improvements for residents.',
          'Exchange old incandescent bulbs for energy-efficient LED alternatives.',
          'Weatherize homes for low-income families to reduce heating and cooling costs.',
          'Build a shared solar installation to provide clean energy for the neighborhood.',
          'Implement smart energy management systems for optimal efficiency.',
          'Establish a community-owned renewable energy cooperative.',
        ],
        impacts: [
          '10 kW clean energy',
          '30% energy savings',
          '500 kWh saved annually',
          '25% heating cost reduction',
          '50 homes powered',
          '75% grid efficiency',
          '100 members served',
        ],
      },
      {
        type: 'conservation' as const,
        titles: [
          'Water Conservation Project',
          'Native Plant Garden',
          'Pollinator Habitat Creation',
          'Rain Garden Installation',
          'Wildlife Corridor Development',
          'Biodiversity Restoration',
          'Ecosystem Protection Initiative',
        ],
        descriptions: [
          'Install water-saving devices and educate residents about conservation techniques.',
          'Create beautiful gardens using drought-resistant native plants.',
          'Build habitats to support declining bee and butterfly populations.',
          'Install rain gardens to manage stormwater and prevent flooding.',
          'Connect fragmented habitats to support wildlife movement and biodiversity.',
          'Restore natural ecosystems and protect endangered species.',
          'Comprehensive ecosystem protection and restoration efforts.',
        ],
        impacts: [
          '1000 gallons saved daily',
          '20 native species planted',
          '500 pollinators supported',
          '80% stormwater captured',
          '2 miles habitat connected',
          '15 species protected',
          '10 acres conserved',
        ],
      },
    ];

    const locations = [
      'Central Park',
      'Riverside Trail',
      'Community Center',
      'Downtown Plaza',
      'Neighborhood Park',
      'City Hall',
      'Library Gardens',
      'School Campus',
      'Recreation Center',
      'Waterfront Park',
      'Main Street',
      'Heritage Square',
      'Civic Center',
      'Memorial Park',
      'Town Square',
      'Botanical Garden',
      'Nature Reserve',
      'Community Garden',
      'Sports Complex',
      'Cultural Center',
    ];

    const organizers = [
      'Green City Initiative',
      'EcoVolunteers',
      'Climate Action Network',
      'Sustainable Communities',
      'Environmental Alliance',
      'Earth Guardians',
      'Clean Energy Coalition',
      'Nature Conservancy',
      'Urban Green Space',
      'Community Environmental Group',
      'Eco Warriors',
      'Planet Protectors',
      'Green Future Foundation',
      'Climate Champions',
      'Sustainable Living Society',
    ];

    const projects: CommunityProject[] = [];
    const now = new Date();

    // Generate 25-30 realistic projects
    for (let i = 0; i < 28; i++) {
      const template =
        projectTemplates[Math.floor(Math.random() * projectTemplates.length)];
      const titleIndex = Math.floor(Math.random() * template.titles.length);
      const descIndex = Math.floor(
        Math.random() * template.descriptions.length
      );
      const impactIndex = Math.floor(Math.random() * template.impacts.length);

      // Generate date within next 45 days
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + Math.floor(Math.random() * 45) + 1);

      // Generate coordinates within 25 miles of user location
      const latOffset = (Math.random() - 0.5) * 0.8; // ~25 miles
      const lonOffset = (Math.random() - 0.5) * 0.8;
      const projectLat = userLocation.latitude + latOffset;
      const projectLon = userLocation.longitude + lonOffset;

      // Calculate distance from user
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        projectLat,
        projectLon
      );

      const maxParticipants = Math.floor(Math.random() * 100) + 20; // 20-120 participants
      const currentParticipants = Math.floor(
        Math.random() * (maxParticipants * 0.85)
      ); // Up to 85% full

      projects.push({
        id: `project_${i + 1}_${Date.now()}`,
        title: template.titles[titleIndex],
        description: template.descriptions[descIndex],
        type: template.type,
        participants: currentParticipants,
        maxParticipants,
        date: futureDate.toISOString().split('T')[0],
        time: this.generateRandomTime(),
        location: locations[Math.floor(Math.random() * locations.length)],
        coordinates: {
          latitude: projectLat,
          longitude: projectLon,
        },
        impact: template.impacts[impactIndex],
        organizer: organizers[Math.floor(Math.random() * organizers.length)],
        difficulty: ['Easy', 'Moderate', 'Hard'][
          Math.floor(Math.random() * 3)
        ] as 'Easy' | 'Moderate' | 'Hard',
        duration: this.generateRandomDuration(),
        requirements: this.generateRequirements(template.type),
        imageUrl: this.getProjectImage(template.type),
        isJoined: false,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      });
    }

    return projects.sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by distance
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
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

  private generateRandomTime(): string {
    const hours = [8, 9, 10, 11, 14, 15, 16, 17, 18, 19];
    const hour = hours[Math.floor(Math.random() * hours.length)];
    const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  }

  private generateRandomDuration(): string {
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

  private generateRequirements(type: CommunityProject['type']): string[] {
    const commonRequirements = [
      'Comfortable clothing',
      'Water bottle',
      'Sun protection',
    ];

    const typeSpecificRequirements = {
      'tree-planting': [
        'Work gloves',
        'Closed-toe shoes',
        'Small shovel (if available)',
        'Hat',
      ],
      cleanup: [
        'Work gloves',
        'Reusable bags',
        'Closed-toe shoes',
        'Trash picker (provided)',
      ],
      education: ['Notebook', 'Pen/pencil', 'Open mind', 'Laptop (optional)'],
      energy: [
        'Work gloves',
        'Safety glasses',
        'Basic tools (if available)',
        'Hard hat (provided)',
      ],
      conservation: [
        'Work gloves',
        'Knee pads (optional)',
        'Garden tools (if available)',
        'Pruning shears',
      ],
    };

    return [...commonRequirements, ...typeSpecificRequirements[type]];
  }

  private getProjectImage(type: CommunityProject['type']): string {
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

    return imageUrls[type];
  }

  // Enhanced method to sync with Supabase and handle offline/online states
  private async syncWithSupabase(): Promise<CommunityProject[]> {
    try {
      const now = Date.now();

      // Check if we need to sync (every 5 minutes)
      if (now - this.lastSyncTime < this.SYNC_INTERVAL) {
        console.log('Using cached projects, sync not needed yet');
        return this.projects;
      }

      console.log('Syncing projects with Supabase...');

      // Get projects from Supabase
      const supabaseProjects = await supabaseService.getCommunityProjects();

      // Convert Supabase projects to CommunityProject format
      const convertedSupabaseProjects: CommunityProject[] =
        supabaseProjects.map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          type: project.type as CommunityProject['type'],
          participants: project.current_participants,
          maxParticipants: project.max_participants,
          date: project.date,
          time: project.time,
          location: project.location,
          coordinates: project.coordinates,
          impact: project.impact_goal,
          organizer: project.organizer_name || 'Unknown Organizer',
          difficulty: project.difficulty || 'Moderate',
          duration: project.duration || '2-3 hours',
          requirements: project.requirements,
          imageUrl:
            project.imageUrl ||
            this.getProjectImage(project.type as CommunityProject['type']),
          isJoined: project.isJoined || false,
          distance: project.distance,
        }));

      // Update last sync time
      this.lastSyncTime = now;

      console.log(
        `Synced ${convertedSupabaseProjects.length} projects from Supabase`
      );
      return convertedSupabaseProjects;
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
      // Return empty array on sync failure, will fall back to local projects
      return [];
    }
  }

  async getCommunityProjects(): Promise<CommunityProject[]> {
    try {
      // Try to sync with Supabase first
      const supabaseProjects = await this.syncWithSupabase();

      // Generate default projects if not already loaded or if we need fresh data
      if (this.projects.length === 0 || !this.isInitialized) {
        const userLocation = await locationService.getCurrentLocation();
        if (userLocation) {
          console.log('Generating default community projects...');
          this.projects = this.generateRealisticProjects({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          });
          this.isInitialized = true;
        }
      }

      // Merge Supabase projects with default projects
      const allProjects = [...supabaseProjects, ...this.projects];

      // Remove duplicates based on id, prioritizing Supabase projects
      const uniqueProjectIds = new Set();
      const uniqueProjects = allProjects.filter((project) => {
        if (uniqueProjectIds.has(project.id)) {
          return false;
        }
        uniqueProjectIds.add(project.id);
        return true;
      });

      // Update joined status based on user's joined projects
      const finalProjects = uniqueProjects.map((project) => ({
        ...project,
        isJoined: this.userJoinedProjects.has(project.id),
      }));

      // Sort by distance if available, then by date
      finalProjects.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      return finalProjects;
    } catch (error) {
      console.error('Error fetching community projects:', error);

      // Return fallback projects for demo
      if (this.projects.length === 0) {
        try {
          const userLocation = await locationService.getCurrentLocation();
          if (userLocation) {
            this.projects = this.generateRealisticProjects({
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            });
          } else {
            this.projects = this.generateRealisticProjects({
              latitude: 37.7749, // San Francisco
              longitude: -122.4194,
            });
          }
          this.isInitialized = true;
        } catch (locError) {
          console.error(
            'Error getting location for fallback projects:',
            locError
          );
          this.projects = this.generateRealisticProjects({
            latitude: 37.7749, // San Francisco
            longitude: -122.4194,
          });
          this.isInitialized = true;
        }
      }

      return this.projects.map((project) => ({
        ...project,
        isJoined: this.userJoinedProjects.has(project.id),
      }));
    }
  }

  // Enhanced project validation with Supabase integration
  async validateProject(projectId: string): Promise<boolean> {
    try {
      // First check Supabase
      const isValidInSupabase = await supabaseService.validateProject(
        projectId
      );
      if (isValidInSupabase) {
        return true;
      }

      // Then check local projects
      const project = this.projects.find((p) => p.id === projectId);
      return project !== undefined;
    } catch (error) {
      console.error(`Error validating project ${projectId}:`, error);

      // Fallback to local validation only
      const project = this.projects.find((p) => p.id === projectId);
      return project !== undefined;
    }
  }

  async joinProject(projectId: string): Promise<boolean> {
    try {
      // Validate project exists first
      const isValid = await this.validateProject(projectId);
      if (!isValid) {
        console.error(`Project not found: ${projectId}`);
        return false;
      }

      const projectIndex = this.projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) {
        // Project might be in Supabase but not in local cache
        // Try to join via Supabase directly
        const success = await supabaseService.joinProject('', projectId);
        if (success) {
          this.userJoinedProjects.add(projectId);
          // Force refresh on next getCommunityProjects call
          this.lastSyncTime = 0;
          return true;
        }
        return false;
      }

      const project = this.projects[projectIndex];

      if (project.participants >= project.maxParticipants) {
        throw new Error('Project is full');
      }

      if (this.userJoinedProjects.has(projectId)) {
        throw new Error('Already joined this project');
      }

      // Update project participants
      this.projects[projectIndex] = {
        ...project,
        participants: project.participants + 1,
        isJoined: true,
      };

      // Track user's joined projects
      this.userJoinedProjects.add(projectId);

      console.log('Successfully joined project:', project.title);
      return true;
    } catch (error) {
      console.error('Error joining project:', error);
      return false;
    }
  }

  async leaveProject(projectId: string): Promise<boolean> {
    try {
      const projectIndex = this.projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) {
        // Project might be in Supabase but not in local cache
        // Try to leave via Supabase directly
        const success = await supabaseService.leaveProject('', projectId);
        if (success) {
          this.userJoinedProjects.delete(projectId);
          // Force refresh on next getCommunityProjects call
          this.lastSyncTime = 0;
          return true;
        }
        console.error('Project not found:', projectId);
        return false;
      }

      const project = this.projects[projectIndex];

      if (!this.userJoinedProjects.has(projectId)) {
        throw new Error('Not joined to this project');
      }

      // Update project participants
      this.projects[projectIndex] = {
        ...project,
        participants: Math.max(0, project.participants - 1),
        isJoined: false,
      };

      // Remove from user's joined projects
      this.userJoinedProjects.delete(projectId);

      console.log('Successfully left project:', project.title);
      return true;
    } catch (error) {
      console.error('Error leaving project:', error);
      return false;
    }
  }

  async getCommunityStats(): Promise<CommunityStats> {
    try {
      // In a real app, this would come from a backend API
      // For now, generate realistic stats based on current projects
      const projects = await this.getCommunityProjects();

      const totalParticipants = projects.reduce(
        (sum, project) => sum + project.participants,
        0
      );
      const treePlantingProjects = projects.filter(
        (p) => p.type === 'tree-planting'
      );
      const cleanupProjects = projects.filter((p) => p.type === 'cleanup');

      return {
        totalProjects: projects.length,
        activeVolunteers: Math.floor(totalParticipants * 0.75), // Assume 75% are active
        carbonSaved: Math.floor(treePlantingProjects.length * 2.5 * 150), // Enhanced calculation
        treesPlanted: treePlantingProjects.reduce(
          (sum, project) => sum + project.participants * 6,
          0
        ),
        wasteCollected: cleanupProjects.reduce(
          (sum, project) => sum + project.participants * 35,
          0
        ), // lbs
      };
    } catch (error) {
      console.error('Error fetching community stats:', error);
      return {
        totalProjects: 28,
        activeVolunteers: 1847,
        carbonSaved: 3240,
        treesPlanted: 542,
        wasteCollected: 7680,
      };
    }
  }

  getUserJoinedProjects(): string[] {
    return Array.from(this.userJoinedProjects);
  }

  // Method to refresh projects (useful for testing)
  refreshProjects(): void {
    this.projects = [];
    this.isInitialized = false;
    this.lastSyncTime = 0; // Force sync on next request
  }

  // Enhanced method to add a new project with Supabase integration
  async addProject(projectData: {
    title: string;
    description: string;
    type: string;
    location: string;
    date: string;
    time: string;
    maxParticipants: number;
    requirements: string[];
    impactGoal: string;
    coordinates?: { latitude: number; longitude: number };
  }): Promise<boolean> {
    try {
      // Get current user
      const currentUser = await supabaseService.getUserProfile();
      if (!currentUser) {
        console.error('No current user found');
        return false;
      }

      // Get user location if coordinates not provided
      let coordinates = projectData.coordinates;
      if (!coordinates) {
        try {
          const userLocation = await locationService.getCurrentLocation();
          coordinates = {
            latitude: userLocation?.latitude || 37.7749,
            longitude: userLocation?.longitude || -122.4194,
          };
        } catch (locError) {
          console.error('Error getting location for project:', locError);
          coordinates = {
            latitude: 37.7749,
            longitude: -122.4194,
          };
        }
      }

      // Prepare project data for Supabase
      const supabaseProjectData = {
        title: projectData.title,
        description: projectData.description,
        type: projectData.type,
        organizer_id: currentUser.id,
        location: projectData.location,
        coordinates,
        date: projectData.date,
        time: projectData.time,
        max_participants: projectData.maxParticipants,
        current_participants: 0,
        requirements: projectData.requirements,
        impact_goal: projectData.impactGoal,
        status: 'active' as const,
      };

      // Try to add to Supabase first
      const supabaseProject = await supabaseService.addProject(
        supabaseProjectData
      );

      if (supabaseProject) {
        console.log(
          'Successfully added project to Supabase:',
          supabaseProject.title
        );

        // Force refresh on next getCommunityProjects call
        this.lastSyncTime = 0;

        // Add to local projects as well for immediate display
        const newLocalProject: CommunityProject = {
          id: supabaseProject.id,
          title: supabaseProject.title,
          description: supabaseProject.description,
          type: supabaseProject.type as CommunityProject['type'],
          participants: 0,
          maxParticipants: supabaseProject.max_participants,
          date: supabaseProject.date,
          time: supabaseProject.time,
          location: supabaseProject.location,
          coordinates: supabaseProject.coordinates,
          impact: supabaseProject.impact_goal,
          organizer: currentUser.name,
          difficulty: 'Moderate',
          duration: '2-3 hours',
          requirements: supabaseProject.requirements,
          imageUrl: this.getProjectImage(
            supabaseProject.type as CommunityProject['type']
          ),
          isJoined: true, // User automatically joins their own project
        };

        this.projects.unshift(newLocalProject);
        this.userJoinedProjects.add(newLocalProject.id);

        return true;
      } else {
        // Fallback to local storage
        const newProject: CommunityProject = {
          id: `user_project_${Date.now()}`,
          title: projectData.title,
          description: projectData.description,
          type: projectData.type as CommunityProject['type'],
          participants: 0,
          maxParticipants: projectData.maxParticipants,
          date: projectData.date,
          time: projectData.time,
          location: projectData.location,
          coordinates,
          impact: projectData.impactGoal,
          organizer: currentUser.name,
          difficulty: 'Moderate',
          duration: '2-3 hours',
          requirements: projectData.requirements,
          imageUrl: this.getProjectImage(
            projectData.type as CommunityProject['type']
          ),
          isJoined: true, // User automatically joins their own project
        };

        this.projects.unshift(newProject); // Add to beginning of array
        this.userJoinedProjects.add(newProject.id); // User automatically joins their own project
        console.log(
          'Successfully added new project locally:',
          newProject.title
        );
        return true;
      }
    } catch (error) {
      console.error('Error adding project:', error);

      // Last resort fallback - create a minimal local project
      try {
        const fallbackProject: CommunityProject = {
          id: `fallback_project_${Date.now()}`,
          title: projectData.title || 'New Environmental Project',
          description:
            projectData.description ||
            'Join this community environmental initiative',
          type:
            (projectData.type as CommunityProject['type']) || 'tree-planting',
          participants: 0,
          maxParticipants: projectData.maxParticipants || 20,
          date:
            projectData.date ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          time: projectData.time || '10:00 AM',
          location: projectData.location || 'Local Community Center',
          coordinates: projectData.coordinates || {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          impact: projectData.impactGoal || 'Environmental impact',
          organizer: 'You',
          difficulty: 'Moderate',
          duration: '2-3 hours',
          requirements: projectData.requirements || [
            'Comfortable clothing',
            'Water bottle',
            'Sun protection',
          ],
          imageUrl: this.getProjectImage(
            (projectData.type as CommunityProject['type']) || 'tree-planting'
          ),
          isJoined: true,
        };

        this.projects.unshift(fallbackProject);
        this.userJoinedProjects.add(fallbackProject.id);
        console.log('Created fallback project as last resort');
        return true;
      } catch (fallbackError) {
        console.error('Even fallback project creation failed:', fallbackError);
        return false;
      }
    }
  }

  // Enhanced search with geolocation
  async searchProjectsByLocation(
    userLatitude: number,
    userLongitude: number,
    radiusKm: number = 50,
    filters?: {
      type?: string;
      difficulty?: string;
      maxParticipants?: number;
    }
  ): Promise<CommunityProject[]> {
    try {
      const allProjects = await this.getCommunityProjects();

      // Filter projects within radius
      let nearbyProjects = allProjects.filter((project) => {
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

      // Apply additional filters
      if (filters) {
        if (filters.type) {
          nearbyProjects = nearbyProjects.filter(
            (p) => p.type === filters.type
          );
        }
        if (filters.difficulty) {
          nearbyProjects = nearbyProjects.filter(
            (p) => p.difficulty === filters.difficulty
          );
        }
        if (filters.maxParticipants) {
          nearbyProjects = nearbyProjects.filter(
            (p) => p.maxParticipants <= filters.maxParticipants
          );
        }
      }

      // Sort by distance
      return nearbyProjects.sort(
        (a, b) => (a.distance || 0) - (b.distance || 0)
      );
    } catch (error) {
      console.error('Error searching projects by location:', error);
      return [];
    }
  }

  // Performance optimization: batch operations
  async batchJoinProjects(
    projectIds: string[]
  ): Promise<{ successful: string[]; failed: string[] }> {
    const successful: string[] = [];
    const failed: string[] = [];

    for (const projectId of projectIds) {
      try {
        const success = await this.joinProject(projectId);
        if (success) {
          successful.push(projectId);
        } else {
          failed.push(projectId);
        }
      } catch (error) {
        console.error(`Error joining project ${projectId}:`, error);
        failed.push(projectId);
      }
    }

    return { successful, failed };
  }

  // Get project recommendations based on user preferences and location
  async getRecommendedProjects(
    userLatitude: number,
    userLongitude: number,
    userPreferences?: {
      preferredTypes?: string[];
      maxDistance?: number;
      difficulty?: string;
    }
  ): Promise<CommunityProject[]> {
    try {
      const maxDistance = userPreferences?.maxDistance || 25; // Default 25km
      const nearbyProjects = await this.searchProjectsByLocation(
        userLatitude,
        userLongitude,
        maxDistance
      );

      let recommended = nearbyProjects;

      // Filter by preferred types
      if (
        userPreferences?.preferredTypes &&
        userPreferences.preferredTypes.length > 0
      ) {
        recommended = recommended.filter((p) =>
          userPreferences.preferredTypes!.includes(p.type)
        );
      }

      // Filter by difficulty
      if (userPreferences?.difficulty) {
        recommended = recommended.filter(
          (p) => p.difficulty === userPreferences.difficulty
        );
      }

      // Sort by a combination of distance and available spots
      recommended.sort((a, b) => {
        const aAvailability =
          (a.maxParticipants - a.participants) / a.maxParticipants;
        const bAvailability =
          (b.maxParticipants - b.participants) / b.maxParticipants;
        const aScore = (1 / (a.distance || 1)) * aAvailability;
        const bScore = (1 / (b.distance || 1)) * bAvailability;
        return bScore - aScore;
      });

      return recommended.slice(0, 10); // Return top 10 recommendations
    } catch (error) {
      console.error('Error getting recommended projects:', error);
      return [];
    }
  }
}

export const communityService = new CommunityService();
