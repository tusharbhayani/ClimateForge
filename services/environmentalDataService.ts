import { locationService, LocationData } from './locationService';

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  status: string;
  color: string;
  healthRecommendation: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  condition: string;
  description: string;
  pressure: number;
  visibility: number;
  feelsLike: number;
}

export interface ClimateRisks {
  heat: number;
  flood: string;
  drought: number;
  wildfire: number;
  airQuality: string;
}

export interface EnvironmentalData {
  airQuality: AirQualityData;
  weather: WeatherData;
  risks: ClimateRisks;
  location: LocationData;
  lastUpdated: Date;
}

class EnvironmentalDataService {
  private cachedData: EnvironmentalData | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 300000; // 5 minutes

  private getAQIStatus(aqi: number): {
    status: string;
    color: string;
    healthRecommendation: string;
  } {
    if (aqi <= 50) {
      return {
        status: 'Good',
        color: '#10b981',
        healthRecommendation:
          'Air quality is satisfactory. Enjoy outdoor activities!',
      };
    } else if (aqi <= 100) {
      return {
        status: 'Moderate',
        color: '#f59e0b',
        healthRecommendation:
          'Air quality is acceptable for most people. Sensitive individuals should consider limiting prolonged outdoor exertion.',
      };
    } else if (aqi <= 150) {
      return {
        status: 'Unhealthy for Sensitive Groups',
        color: '#f97316',
        healthRecommendation:
          'Members of sensitive groups may experience health effects. Limit outdoor activities if you experience symptoms.',
      };
    } else if (aqi <= 200) {
      return {
        status: 'Unhealthy',
        color: '#ef4444',
        healthRecommendation:
          'Everyone may begin to experience health effects. Avoid outdoor activities.',
      };
    } else {
      return {
        status: 'Very Unhealthy',
        color: '#991b1b',
        healthRecommendation:
          'Health alert: everyone may experience serious health effects. Stay indoors.',
      };
    }
  }

  private calculateAQIFromPM25(pm25: number): number {
    // Convert PM2.5 to AQI using EPA formula
    if (pm25 <= 12.0) {
      return Math.round((50 / 12.0) * pm25);
    } else if (pm25 <= 35.4) {
      return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
    } else if (pm25 <= 55.4) {
      return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
    } else if (pm25 <= 150.4) {
      return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
    } else if (pm25 <= 250.4) {
      return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
    } else {
      return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
    }
  }

  private calculateClimateRisks(
    weather: WeatherData,
    airQuality: AirQualityData
  ): ClimateRisks {
    // Heat risk calculation based on temperature and humidity
    const heatIndex = weather.feelsLike;
    let heatRisk = 1;
    if (heatIndex > 90) heatRisk = 3;
    if (heatIndex > 100) heatRisk = 4;
    if (heatIndex > 110) heatRisk = 5;

    // Flood risk based on humidity and pressure
    let floodRisk = 'Low';
    if (weather.humidity > 80 && weather.pressure < 1000) {
      floodRisk = 'Moderate';
    }
    if (weather.humidity > 90 && weather.pressure < 990) {
      floodRisk = 'High';
    }

    // Drought risk based on humidity and temperature
    let droughtRisk = 1;
    if (weather.humidity < 30 && weather.temperature > 85) {
      droughtRisk = 2;
    }
    if (weather.humidity < 20 && weather.temperature > 95) {
      droughtRisk = 3;
    }

    // Wildfire risk based on temperature, humidity, and wind
    let wildfireRisk = 2;
    if (
      weather.temperature > 80 &&
      weather.humidity < 40 &&
      weather.windSpeed > 15
    ) {
      wildfireRisk = 6;
    }
    if (
      weather.temperature > 90 &&
      weather.humidity < 30 &&
      weather.windSpeed > 20
    ) {
      wildfireRisk = 8;
    }

    return {
      heat: heatRisk,
      flood: floodRisk,
      drought: droughtRisk,
      wildfire: wildfireRisk,
      airQuality: airQuality.status,
    };
  }

  private generateRealisticData(location: LocationData): {
    airQuality: AirQualityData;
    weather: WeatherData;
  } {
    // Generate realistic data based on location and season
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();
    const isWinter = month >= 11 || month <= 2;
    const isSummer = month >= 5 && month <= 8;

    // Base temperature on season and location
    let baseTemp = 70;
    if (location.city.toLowerCase().includes('san francisco')) {
      baseTemp = isWinter ? 55 : isSummer ? 75 : 65;
    } else if (location.state === 'CA') {
      baseTemp = isWinter ? 60 : isSummer ? 85 : 75;
    } else {
      baseTemp = isWinter ? 40 : isSummer ? 80 : 65;
    }

    // Add daily variation
    const dailyVariation = Math.sin(((hour - 6) * Math.PI) / 12) * 15;
    const temperature = Math.round(
      baseTemp + dailyVariation + (Math.random() - 0.5) * 10
    );

    // Generate air quality based on location
    let baseAQI = 45;
    if (location.city.toLowerCase().includes('los angeles')) {
      baseAQI = 85;
    } else if (location.city.toLowerCase().includes('san francisco')) {
      baseAQI = 55;
    } else if (location.city.toLowerCase().includes('new york')) {
      baseAQI = 65;
    }

    const aqi = Math.max(
      15,
      Math.min(200, baseAQI + (Math.random() - 0.5) * 40)
    );
    const pm25 = aqi / 4 + Math.random() * 10;
    const statusInfo = this.getAQIStatus(aqi);

    const airQuality: AirQualityData = {
      aqi: Math.round(aqi),
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round((pm25 * 1.5 + Math.random() * 5) * 10) / 10,
      o3: Math.round(30 + Math.random() * 40),
      no2: Math.round(20 + Math.random() * 30),
      so2: Math.round(2 + Math.random() * 10),
      co: Math.round((0.3 + Math.random() * 0.7) * 10) / 10,
      ...statusInfo,
    };

    const humidity = Math.round(40 + Math.random() * 40);
    const feelsLike =
      temperature + (humidity > 70 ? 5 : 0) + (Math.random() - 0.5) * 8;

    const weather: WeatherData = {
      temperature,
      humidity,
      windSpeed: Math.round(5 + Math.random() * 15),
      windDirection: Math.round(Math.random() * 360),
      uvIndex: Math.max(
        1,
        Math.min(11, Math.round(2 + (hour - 6) / 2 + Math.random() * 3))
      ),
      condition: isSummer ? 'Clear' : isWinter ? 'Cloudy' : 'Partly Cloudy',
      description: isSummer
        ? 'clear sky'
        : isWinter
        ? 'overcast clouds'
        : 'partly cloudy',
      pressure: Math.round(1000 + Math.random() * 40),
      visibility: Math.round(8 + Math.random() * 5),
      feelsLike: Math.round(feelsLike),
    };

    return { airQuality, weather };
  }

  async fetchEnvironmentalData(): Promise<EnvironmentalData> {
    try {
      // Check cache first
      const now = Date.now();
      if (this.cachedData && now - this.lastFetchTime < this.CACHE_DURATION) {
        return this.cachedData;
      }

      // Get location
      const location = await locationService.getCurrentLocation();
      console.log('Location obtained for environmental data:', location.city);

      // Generate realistic data based on location
      const { airQuality, weather } = this.generateRealisticData(location);
      const risks = this.calculateClimateRisks(weather, airQuality);

      const environmentalData: EnvironmentalData = {
        airQuality,
        weather,
        risks,
        location,
        lastUpdated: new Date(),
      };

      // Cache the data
      this.cachedData = environmentalData;
      this.lastFetchTime = now;

      console.log('Environmental data generated successfully');
      return environmentalData;
    } catch (error) {
      console.error('Error fetching environmental data:', error);

      // Return fallback data
      const fallbackLocation: LocationData = {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        address: 'San Francisco, CA',
      };

      const { airQuality, weather } =
        this.generateRealisticData(fallbackLocation);
      const risks = this.calculateClimateRisks(weather, airQuality);

      return {
        airQuality,
        weather,
        risks,
        location: fallbackLocation,
        lastUpdated: new Date(),
      };
    }
  }

  async getHistoricalData(days: number = 7): Promise<any[]> {
    try {
      const location = await locationService.getCurrentLocation();

      // Generate historical data
      const data = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const { airQuality, weather } = this.generateRealisticData(location);

        data.push({
          date: date.toISOString().split('T')[0],
          aqi: airQuality.aqi,
          temperature: weather.temperature,
          humidity: weather.humidity,
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);

      // Fallback historical data
      const data = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        data.push({
          date: date.toISOString().split('T')[0],
          aqi: Math.floor(Math.random() * 100) + 25,
          temperature: Math.floor(Math.random() * 30) + 60,
          humidity: Math.floor(Math.random() * 40) + 40,
        });
      }

      return data;
    }
  }
}

export const environmentalDataService = new EnvironmentalDataService();
