export interface ClimateNews {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string;
  category: string;
  location?: string;
  severity: 'info' | 'warning' | 'critical';
  published_at: string;
  created_at: string;
}

export interface NewsFilter {
  category?: string;
  severity?: string;
  location?: string;
  limit?: number;
}

class ClimateNewsService {
  private mockNews: ClimateNews[] = [
    {
      id: '1',
      title: 'Local Air Quality Improvement Initiative Launched',
      content:
        'City announces new program to plant 10,000 trees and reduce urban heat islands through community partnerships. The initiative will focus on low-income neighborhoods and areas with high pollution levels.',
      source: 'City Environmental Department',
      category: 'local_action',
      location: 'San Francisco, CA',
      severity: 'info',
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Heat Wave Warning Issued for Bay Area',
      content:
        'Temperatures expected to reach 95°F+ this week. Cooling centers open, residents advised to stay hydrated and check on elderly neighbors. Peak heat expected Tuesday-Thursday.',
      source: 'National Weather Service',
      category: 'weather_alert',
      location: 'Bay Area, CA',
      severity: 'warning',
      published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Community Solar Project Reaches 50% Funding Goal',
      content:
        'Local renewable energy initiative gains momentum with 200+ household participants. Project expected to reduce neighborhood emissions by 25% and provide energy savings to residents.',
      source: 'Green Energy Collective',
      category: 'renewable_energy',
      location: 'Oakland, CA',
      severity: 'info',
      published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'New Study Shows Urban Gardens Reduce Local Temperature',
      content:
        'Research indicates community gardens can lower surrounding air temperature by 2-5°F during summer months. Study followed 50 urban gardens across California for 2 years.',
      source: 'Environmental Science Journal',
      category: 'research',
      location: 'California',
      severity: 'info',
      published_at: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Wildfire Risk Assessment Updated for Region',
      content:
        'Fire danger elevated due to dry conditions. Residents encouraged to create defensible space and review evacuation plans. Red flag warning in effect through weekend.',
      source: 'Fire Department',
      category: 'safety_alert',
      location: 'Northern California',
      severity: 'warning',
      published_at: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Electric Vehicle Charging Network Expansion Announced',
      content:
        'City plans to install 500 new EV charging stations by 2025, focusing on underserved communities and apartment complexes. Initiative aims to accelerate clean transportation adoption.',
      source: 'Transportation Authority',
      category: 'clean_transport',
      location: 'San Francisco, CA',
      severity: 'info',
      published_at: new Date(
        Date.now() - 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '7',
      title: 'Coastal Flooding Advisory for Weekend High Tides',
      content:
        'King tides combined with storm surge may cause minor coastal flooding. Low-lying areas and parking lots near the bay should expect water accumulation.',
      source: 'Coastal Management Office',
      category: 'weather_alert',
      location: 'Bay Area Coast',
      severity: 'warning',
      published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '8',
      title: 'Green Building Incentive Program Launches',
      content:
        'New rebate program offers up to $5,000 for energy-efficient home improvements including insulation, windows, and heat pumps. Applications open through city website.',
      source: 'Building Department',
      category: 'energy_efficiency',
      location: 'San Francisco, CA',
      severity: 'info',
      published_at: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  async getClimateNews(filter: NewsFilter = {}): Promise<ClimateNews[]> {
    try {
      // In a real app, this would fetch from Supabase or external API
      let filteredNews = [...this.mockNews];

      // Apply filters
      if (filter.category) {
        filteredNews = filteredNews.filter(
          (news) => news.category === filter.category
        );
      }

      if (filter.severity) {
        filteredNews = filteredNews.filter(
          (news) => news.severity === filter.severity
        );
      }

      if (filter.location) {
        filteredNews = filteredNews.filter((news) =>
          news.location?.toLowerCase().includes(filter.location!.toLowerCase())
        );
      }

      // Sort by published date (newest first)
      filteredNews.sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      );

      // Apply limit
      if (filter.limit) {
        filteredNews = filteredNews.slice(0, filter.limit);
      }

      return filteredNews;
    } catch (error) {
      console.error('Error fetching climate news:', error);
      return [];
    }
  }

  async getNewsByCategory(category: string): Promise<ClimateNews[]> {
    return this.getClimateNews({ category, limit: 10 });
  }

  async getUrgentNews(): Promise<ClimateNews[]> {
    return this.getClimateNews({ severity: 'warning', limit: 5 });
  }

  async getLocalNews(location: string): Promise<ClimateNews[]> {
    return this.getClimateNews({ location, limit: 8 });
  }

  getNewsCategories(): string[] {
    return [
      'local_action',
      'weather_alert',
      'renewable_energy',
      'research',
      'safety_alert',
      'clean_transport',
      'energy_efficiency',
    ];
  }

  getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      local_action: 'Local Action',
      weather_alert: 'Weather Alerts',
      renewable_energy: 'Renewable Energy',
      research: 'Research & Studies',
      safety_alert: 'Safety Alerts',
      clean_transport: 'Clean Transportation',
      energy_efficiency: 'Energy Efficiency',
    };
    return categoryNames[category] || category;
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#3b82f6';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  }
}

export const climateNewsService = new ClimateNewsService();
