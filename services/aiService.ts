export interface AIMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

export interface AIResponse {
  message: string;
  suggestions: string[];
  actionRecommendations?: string[];
}

class AIService {
  private generateContextualResponse(
    userMessage: string,
    environmentalData?: any,
    userProfile?: any
  ): AIResponse {
    const lowerMessage = userMessage.toLowerCase();

    // Enhanced AI responses with user context
    if (
      lowerMessage.includes('air quality') ||
      lowerMessage.includes('pollution') ||
      lowerMessage.includes('aqi')
    ) {
      const aqiLevel = environmentalData?.airQuality?.aqi || 75;
      const location = environmentalData?.location?.city || 'your area';
      let response = '';
      let suggestions = [];

      if (aqiLevel <= 50) {
        response = `Excellent news! Air quality in ${location} is outstanding today with an AQI of ${aqiLevel}. This is perfect weather for outdoor activities like walking, jogging, cycling, or participating in environmental projects. Consider taking advantage of this clean air by spending time in parks or organizing outdoor community events.`;
        suggestions = [
          'Find tree planting projects nearby',
          'Plan an outdoor workout session',
          'Organize a community walk',
          'Join outdoor environmental activities',
        ];
      } else if (aqiLevel <= 100) {
        response = `Air quality in ${location} is moderate today with an AQI of ${aqiLevel}. Most people can enjoy outdoor activities, but sensitive individuals should be cautious. Consider shorter outdoor sessions and avoid intense exercise during peak pollution hours (typically 6-10 AM and 4-8 PM).`;
        suggestions = [
          'Check hourly air quality updates',
          'Find indoor air purifying plants',
          'Join air quality monitoring projects',
          'Plan activities for cleaner air times',
        ];
      } else {
        response = `Air quality in ${location} is unhealthy today with an AQI of ${aqiLevel}. I recommend limiting outdoor activities, especially for children, elderly, and those with respiratory conditions. This is a great time to focus on indoor environmental actions or advocate for cleaner air policies.`;
        suggestions = [
          'Find indoor environmental projects',
          'Learn about air purifiers',
          'Join advocacy for cleaner air',
          'Support public transportation initiatives',
        ];
      }

      return { message: response, suggestions };
    }

    // Weather and Climate Responses with location context
    if (
      lowerMessage.includes('weather') ||
      lowerMessage.includes('temperature') ||
      lowerMessage.includes('hot') ||
      lowerMessage.includes('cold')
    ) {
      const temp = environmentalData?.weather?.temperature || 75;
      const humidity = environmentalData?.weather?.humidity || 60;
      const location = environmentalData?.location?.city || 'your area';
      const uvIndex = environmentalData?.weather?.uvIndex || 5;

      let response = `Current conditions in ${location}: ${temp}°F with ${humidity}% humidity and UV index of ${uvIndex}. `;
      let suggestions = [];

      if (temp > 90) {
        response +=
          "It's quite hot today! High temperatures stress local ecosystems and increase energy demand. This is perfect timing for urban cooling initiatives like tree planting, which can reduce local temperatures by 2-8°F, or energy conservation projects.";
        suggestions = [
          'Find urban cooling projects',
          'Join tree planting initiatives',
          'Learn about energy conservation',
          'Support cooling center initiatives',
        ];
      } else if (temp < 40) {
        response +=
          "It's cold today! Cold weather increases energy usage for heating. This is an excellent time to focus on weatherization projects, energy efficiency improvements, and helping vulnerable community members stay warm.";
        suggestions = [
          'Find weatherization projects',
          'Learn about energy efficiency',
          'Join heating assistance programs',
          'Support vulnerable neighbors',
        ];
      } else {
        response +=
          'Weather conditions are comfortable for most outdoor activities. This is perfect for environmental projects and community engagement. Take advantage of these ideal conditions!';
        suggestions = [
          'Find outdoor environmental projects',
          'Join community cleanups',
          'Participate in nature restoration',
          'Organize neighborhood initiatives',
        ];
      }

      if (uvIndex > 7) {
        response += ` Note: UV levels are high (${uvIndex}), so use SPF 30+ sunscreen and seek shade during peak hours (10am-4pm).`;
      }

      return { message: response, suggestions };
    }

    // Personalized Carbon Footprint advice
    if (
      lowerMessage.includes('carbon') ||
      lowerMessage.includes('footprint') ||
      lowerMessage.includes('emissions') ||
      lowerMessage.includes('sustainable')
    ) {
      const userActions = userProfile?.actions_completed || 0;
      const carbonSaved = userProfile?.carbon_saved || 0;
      const userLevel = userProfile?.level || 1;

      let response = `Outstanding work! You've already saved ${carbonSaved} lbs of CO₂ through ${userActions} environmental actions as a Level ${userLevel} Eco Warrior. `;

      if (carbonSaved < 100) {
        response +=
          'Here are high-impact ways to boost your carbon savings: using public transport saves 2.6 tons CO₂/year, switching to LED bulbs saves 450 lbs CO₂/year, reducing meat consumption 2-3 days/week saves 1,200 lbs CO₂/year, and proper home insulation can save 2,000 lbs CO₂/year.';
      } else if (carbonSaved < 500) {
        response +=
          "You're making excellent progress! To reach the next level, consider home energy audits (potential 20% savings), supporting renewable energy projects, organizing community carpooling initiatives, or starting a neighborhood composting program.";
      } else {
        response +=
          "You're a carbon-saving champion! Consider mentoring others, leading community initiatives, advocating for policy changes, or starting your own environmental organization to amplify your impact exponentially.";
      }

      return {
        message: response,
        suggestions: [
          'Calculate your current carbon footprint',
          'Find local renewable energy projects',
          'Join transportation alternatives',
          'Start a home energy audit',
        ],
      };
    }

    // Enhanced Community Action with user level
    if (
      lowerMessage.includes('volunteer') ||
      lowerMessage.includes('community') ||
      lowerMessage.includes('action') ||
      lowerMessage.includes('help')
    ) {
      const userLevel = userProfile?.level || 1;
      const location = environmentalData?.location?.city || 'your area';
      const userActions = userProfile?.actions_completed || 0;

      let response = `As a Level ${userLevel} Eco Warrior in ${location} with ${userActions} completed actions, you have access to amazing community opportunities! `;

      if (userLevel === 1) {
        response +=
          "Start with beginner-friendly projects like park cleanups, tree planting, or educational workshops. Each action builds your experience, impact, and unlocks new opportunities. You're just getting started on an amazing journey!";
      } else if (userLevel < 5) {
        response +=
          "You're ready for more challenging projects! Consider leading small teams, organizing neighborhood initiatives, or mentoring newcomers. Your experience is valuable - share it with others!";
      } else {
        response +=
          "You're an experienced environmental leader! Consider mentoring newcomers, starting your own community projects, partnering with local organizations, or even running for local environmental positions.";
      }

      return {
        message: response,
        suggestions: [
          'Find projects matching your level',
          'Connect with local environmental groups',
          'Start a neighborhood initiative',
          'Mentor other eco-warriors',
        ],
      };
    }

    // Location-specific recommendations
    if (
      lowerMessage.includes('local') ||
      lowerMessage.includes('nearby') ||
      lowerMessage.includes('area')
    ) {
      const location = environmentalData?.location?.city || 'your area';
      const risks = environmentalData?.risks;

      let response = `Based on current conditions in ${location}, here are location-specific recommendations: `;
      let suggestions = [];

      if (risks?.heat > 3) {
        response +=
          'High heat risk detected - urban cooling projects like tree planting and green roof installations are especially valuable here. ';
        suggestions.push('Find urban cooling initiatives');
      }

      if (risks?.wildfire > 6) {
        response +=
          'Wildfire risk is elevated - defensible space creation and vegetation management projects are critical for community safety. ';
        suggestions.push('Join fire prevention programs');
      }

      if (risks?.flood === 'High') {
        response +=
          'Flood risk detected - stormwater management and green infrastructure projects are important for resilience. ';
        suggestions.push('Find flood mitigation projects');
      }

      if (suggestions.length === 0) {
        response +=
          'Your area has relatively low climate risks - perfect for proactive environmental projects!';
        suggestions = [
          'Explore all local projects',
          'Connect with city environmental office',
          'Join neighborhood associations',
          'Start preventive initiatives',
        ];
      }

      return { message: response, suggestions };
    }

    // Emergency Preparedness with local risks
    if (
      lowerMessage.includes('emergency') ||
      lowerMessage.includes('prepare') ||
      lowerMessage.includes('disaster') ||
      lowerMessage.includes('kit')
    ) {
      const risks = environmentalData?.risks;
      const location = environmentalData?.location?.city || 'your area';

      let response = `Climate preparedness is essential for ${location}! Build an emergency kit with: water (1 gallon/person/day for 3 days), non-perishable food (3-day supply), battery-powered radio, flashlight, first aid supplies, medications, and important documents in waterproof container. `;

      if (risks?.heat > 3) {
        response +=
          'Your area has elevated heat risk - include cooling supplies, know local cooling centers, and have a heat emergency plan. ';
      }
      if (risks?.wildfire > 6) {
        response +=
          'Wildfire risk is high - prepare evacuation routes, go-bags, and create defensible space around your home. ';
      }
      if (risks?.flood === 'High') {
        response +=
          'Flood risk detected - know evacuation routes, waterproof important documents, and have emergency contacts. ';
      }

      return {
        message: response,
        suggestions: [
          'Build your emergency kit checklist',
          'Learn local evacuation routes',
          'Join community preparedness groups',
          'Create family emergency plan',
        ],
      };
    }

    // AI-powered project recommendations
    if (
      lowerMessage.includes('recommend') ||
      lowerMessage.includes('suggest') ||
      lowerMessage.includes('what should')
    ) {
      const aqiLevel = environmentalData?.airQuality?.aqi || 75;
      const temp = environmentalData?.weather?.temperature || 75;
      const userLevel = userProfile?.level || 1;
      const location = environmentalData?.location?.city || 'your area';

      let recommendations = [];

      if (aqiLevel > 100) {
        recommendations.push(
          'Air quality improvement projects (tree planting, clean transportation advocacy)'
        );
      }

      if (temp > 85) {
        recommendations.push(
          'Urban cooling initiatives (shade trees, green roofs, cool pavement)'
        );
      }

      if (userLevel >= 3) {
        recommendations.push(
          'Leadership opportunities (project organizing, mentoring, policy advocacy)'
        );
      } else {
        recommendations.push(
          'Skill-building activities (workshops, training sessions, certification programs)'
        );
      }

      const response = `Based on your Level ${userLevel} status and current environmental conditions in ${location}, I recommend: ${recommendations.join(
        ', '
      )}. These align perfectly with both your experience level and local environmental needs, maximizing your impact!`;

      return {
        message: response,
        suggestions: [
          'View recommended projects',
          'Check your skill level matches',
          'Find training opportunities',
          'Connect with project organizers',
        ],
      };
    }

    // Default comprehensive response with personalization
    const userName = userProfile?.name || 'there';
    const userLevel = userProfile?.level || 1;
    const location = environmentalData?.location?.city || 'your area';
    const userActions = userProfile?.actions_completed || 0;

    return {
      message: `Hi ${userName}! As a Level ${userLevel} Eco Warrior in ${location} with ${userActions} completed actions, I'm here to help you make an even bigger environmental impact. I can provide personalized recommendations based on your local conditions, suggest projects matching your experience level, help you track your climate action journey, and connect you with like-minded community members. What would you like to explore today?`,
      suggestions: [
        `What's the air quality in ${location}?`,
        'Find projects for my level',
        'How can I increase my impact?',
        'Connect me with local groups',
      ],
    };
  }

  async sendMessage(
    message: string,
    conversationHistory: AIMessage[] = [],
    environmentalData?: any,
    userProfile?: any
  ): Promise<AIResponse> {
    try {
      // Enhanced AI with user and environmental context
      return this.generateContextualResponse(
        message,
        environmentalData,
        userProfile
      );
    } catch (error) {
      console.error('AI Service error:', error);
      return this.generateContextualResponse(
        message,
        environmentalData,
        userProfile
      );
    }
  }

  async getPersonalizedRecommendations(
    environmentalData: any,
    userProfile?: any
  ): Promise<string[]> {
    try {
      const { airQuality, weather, risks, location } = environmentalData;
      const userLevel = userProfile?.level || 1;
      const userActions = userProfile?.actions_completed || 0;

      const recommendations: string[] = [];

      // AI-powered recommendations based on user level and environmental conditions
      if (airQuality.aqi > 100) {
        if (userLevel >= 3) {
          recommendations.push(
            'Lead an air quality advocacy campaign in your community'
          );
        } else {
          recommendations.push(
            'Join tree planting projects to improve local air quality'
          );
        }
      } else if (airQuality.aqi > 50) {
        recommendations.push(
          'Participate in air quality monitoring initiatives'
        );
      } else {
        recommendations.push(
          'Perfect air quality for outdoor environmental projects!'
        );
      }

      // Weather-based recommendations
      if (weather.temperature > 90) {
        recommendations.push(
          'High temperatures - join urban cooling projects (tree planting reduces temps by 2-8°F)'
        );
      }

      if (weather.uvIndex > 7) {
        recommendations.push(
          'High UV levels - indoor environmental activities recommended'
        );
      }

      // Risk-based recommendations with user level consideration
      if (risks.heat > 3) {
        if (userLevel >= 4) {
          recommendations.push('Organize community cooling center initiatives');
        } else {
          recommendations.push(
            'Join heat island reduction projects in your area'
          );
        }
      }

      if (risks.wildfire > 6) {
        recommendations.push(
          'Critical: Join defensible space and fire prevention programs'
        );
      }

      if (risks.flood === 'High') {
        recommendations.push(
          'Participate in green infrastructure and stormwater management projects'
        );
      }

      // User progression recommendations
      if (userActions < 5) {
        recommendations.push(
          'Complete 5 actions to unlock advanced project opportunities'
        );
      } else if (userActions < 20) {
        recommendations.push(
          "You're doing great! Consider mentoring newcomers to the platform"
        );
      } else {
        recommendations.push(
          'Experienced eco-warrior! Ready to lead your own community projects'
        );
      }

      // Seasonal and location-specific recommendations
      const month = new Date().getMonth();
      if (month >= 5 && month <= 8) {
        // Summer
        recommendations.push(
          'Summer focus: Water conservation and energy efficiency projects'
        );
      } else if (month >= 11 || month <= 2) {
        // Winter
        recommendations.push(
          'Winter focus: Energy efficiency and indoor air quality projects'
        );
      }

      // Always include general action recommendations
      recommendations.push(
        'Use public transportation or bike to reduce emissions'
      );
      recommendations.push(
        'Support local farmers markets for fresh, low-carbon food'
      );

      return recommendations.slice(0, 6); // Return top 6 recommendations
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return [
        'Check air quality before outdoor activities',
        'Use energy-efficient appliances to reduce consumption',
        'Participate in local environmental community events',
        'Prepare an emergency kit for climate-related events',
        'Choose sustainable transportation options when possible',
      ];
    }
  }

  // Generate AI-driven tips based on environmental conditions
  async generateDynamicTips(
    environmentalData: any,
    userProfile?: any
  ): Promise<string[]> {
    try {
      const tips: string[] = [];
      const { airQuality, weather, risks, location } = environmentalData;
      const userLevel = userProfile?.level || 1;

      // Air quality tips
      if (airQuality.aqi > 100) {
        tips.push(
          `Air quality in ${location.city} is unhealthy (AQI: ${airQuality.aqi}). Stay indoors and use air purifiers if available.`
        );
        tips.push(
          'Consider wearing N95 masks when going outside during poor air quality days.'
        );
      } else {
        tips.push(
          `Great air quality in ${location.city} today! Perfect for outdoor environmental activities.`
        );
      }

      // Weather-based tips
      if (weather.temperature > 90) {
        tips.push(
          'Extreme heat detected! Stay hydrated, seek shade, and check on elderly neighbors.'
        );
        tips.push(
          'High temperatures increase energy demand - consider reducing AC usage during peak hours.'
        );
      } else if (weather.temperature < 40) {
        tips.push(
          'Cold weather increases heating costs - seal windows and doors to improve efficiency.'
        );
      }

      // UV protection tips
      if (weather.uvIndex > 7) {
        tips.push(
          `High UV index (${weather.uvIndex}) - use SPF 30+ sunscreen and seek shade between 10am-4pm.`
        );
      }

      // Risk-based tips
      if (risks.wildfire > 6) {
        tips.push(
          'High wildfire risk - create defensible space around your home and prepare evacuation plans.'
        );
        tips.push(
          'Keep emergency supplies ready: water, flashlight, battery radio, and important documents.'
        );
      }

      if (risks.heat > 3) {
        tips.push(
          'Heat island effect detected - plant trees and create shade to cool your neighborhood.'
        );
      }

      // User level-specific tips
      if (userLevel >= 3) {
        tips.push(
          'As an experienced eco-warrior, consider mentoring newcomers in your community.'
        );
        tips.push(
          'Your leadership can amplify impact - organize neighborhood environmental initiatives.'
        );
      } else {
        tips.push(
          'Build your environmental knowledge by attending local workshops and training sessions.'
        );
      }

      // General sustainability tips
      tips.push(
        'Use public transportation, bike, or walk to reduce your carbon footprint.'
      );
      tips.push(
        'Support local farmers markets for fresh, seasonal, and low-carbon food options.'
      );
      tips.push(
        'Switch to LED bulbs - they use 75% less energy and last 25 times longer.'
      );

      return tips.slice(0, 8); // Return top 8 tips
    } catch (error) {
      console.error('Error generating dynamic tips:', error);
      return [
        'Check local air quality before outdoor activities',
        'Use energy-efficient appliances to reduce consumption',
        'Participate in community environmental events',
        'Prepare an emergency kit for climate events',
        'Choose sustainable transportation options',
      ];
    }
  }

  // Generate personalized insights for the insights screen
  async generatePersonalizedInsights(
    environmentalData: any,
    userProfile: any,
    userActions: any[]
  ): Promise<string[]> {
    try {
      const insights: string[] = [];
      const { airQuality, weather, risks, location } = environmentalData;
      const { level, actions_completed, carbon_saved, volunteer_hours } =
        userProfile;

      // Performance insights
      const monthlyActions = actions_completed / 12; // Assuming 1 year of activity
      if (monthlyActions > 5) {
        insights.push(
          `You're exceeding expectations with ${monthlyActions.toFixed(
            1
          )} actions per month! Your consistency is driving real environmental change in ${
            location.city
          }.`
        );
      } else if (monthlyActions > 2) {
        insights.push(
          `Your steady pace of ${monthlyActions.toFixed(
            1
          )} actions per month is building meaningful impact. Consider increasing frequency to amplify your environmental influence.`
        );
      } else {
        insights.push(
          `Opportunity for growth: Aim for 3+ actions per month to maximize your environmental impact and level progression.`
        );
      }

      // Efficiency insights
      const carbonPerHour =
        volunteer_hours > 0 ? carbon_saved / volunteer_hours : 0;
      if (carbonPerHour > 10) {
        insights.push(
          `Exceptional efficiency! You're saving ${carbonPerHour.toFixed(
            1
          )} lbs CO₂ per volunteer hour - among the top performers in your community.`
        );
      } else if (carbonPerHour > 5) {
        insights.push(
          `Good impact efficiency at ${carbonPerHour.toFixed(
            1
          )} lbs CO₂ per hour. Focus on high-impact projects to increase this ratio.`
        );
      }

      // Environmental condition insights
      if (airQuality.aqi > 100) {
        insights.push(
          `Poor air quality (AQI: ${airQuality.aqi}) in ${location.city} creates urgency for air quality improvement projects. Your tree planting efforts are especially valuable now.`
        );
      }

      if (weather.temperature > 85) {
        insights.push(
          `High temperatures (${weather.temperature}°F) make urban cooling projects critical. Tree planting and green infrastructure can reduce local temperatures by 2-8°F.`
        );
      }

      // Level progression insights
      const actionsToNextLevel = (level + 1) * 10 - actions_completed;
      if (actionsToNextLevel <= 5) {
        insights.push(
          `You're close to Level ${
            level + 1
          }! Just ${actionsToNextLevel} more actions to unlock advanced project opportunities and leadership roles.`
        );
      }

      // Community impact insights
      const communityImpact = carbon_saved * 0.1; // Assume 10% community multiplier
      insights.push(
        `Your ${carbon_saved} lbs CO₂ savings inspire others, creating an estimated ${communityImpact.toFixed(
          0
        )} lbs additional community impact through social influence.`
      );

      // Seasonal insights
      const month = new Date().getMonth();
      if (month >= 5 && month <= 8) {
        // Summer
        insights.push(
          'Summer presents peak opportunities for tree planting and water conservation projects. Your actions during this season have amplified environmental benefits.'
        );
      } else if (month >= 11 || month <= 2) {
        // Winter
        insights.push(
          'Winter focus on energy efficiency projects can yield significant carbon savings. Indoor air quality improvements are also highly impactful during this season.'
        );
      }

      return insights.slice(0, 6);
    } catch (error) {
      console.error('Error generating personalized insights:', error);
      return [
        'Your environmental actions are making a measurable difference in your community.',
        'Consistent participation in climate projects builds long-term environmental impact.',
        'Your level progression demonstrates growing expertise in environmental action.',
        'Community engagement amplifies individual environmental efforts significantly.',
        'Seasonal timing of environmental actions can maximize ecological benefits.',
      ];
    }
  }

  // New method for AI-powered project filtering
  async getAIProjectRecommendations(
    projects: any[],
    environmentalData: any,
    userProfile: any
  ): Promise<any[]> {
    try {
      const { airQuality, weather, risks } = environmentalData;
      const userLevel = userProfile?.level || 1;

      // Score projects based on AI analysis
      const scoredProjects = projects.map((project) => {
        let score = 0;

        // Environmental condition scoring
        if (airQuality.aqi > 100 && project.type === 'tree-planting')
          score += 5;
        if (weather.temperature > 85 && project.type === 'tree-planting')
          score += 3;
        if (risks.wildfire > 6 && project.type === 'cleanup') score += 4;
        if (
          risks.heat > 3 &&
          (project.type === 'tree-planting' || project.type === 'energy')
        )
          score += 3;

        // User level matching
        if (project.difficulty === 'Easy' && userLevel <= 2) score += 2;
        if (
          project.difficulty === 'Moderate' &&
          userLevel >= 2 &&
          userLevel <= 4
        )
          score += 2;
        if (project.difficulty === 'Hard' && userLevel >= 4) score += 2;

        // Distance scoring (closer is better)
        if (project.distance) {
          if (project.distance <= 5) score += 3;
          else if (project.distance <= 10) score += 2;
          else if (project.distance <= 20) score += 1;
        }

        // Urgency scoring based on environmental conditions
        if (airQuality.aqi > 150) score += 2; // High urgency for any environmental action
        if (weather.temperature > 95) score += 2; // Extreme heat urgency

        return { ...project, aiScore: score };
      });

      // Sort by AI score (highest first)
      return scoredProjects.sort((a, b) => b.aiScore - a.aiScore);
    } catch (error) {
      console.error('Error in AI project recommendations:', error);
      return projects;
    }
  }
}

export const aiService = new AIService();
