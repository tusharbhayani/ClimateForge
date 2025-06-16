import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  address: string;
}

class LocationService {
  private currentLocation: LocationData | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private isInitialized = false;

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return true; // Skip permissions on web
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.log('Error requesting location permissions:', error);
      return false;
    }
  }

  async getLocationFromBrowser(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Browser geolocation timeout'));
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = position.coords;

          try {
            // Use reverse geocoding
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (response.ok) {
              const data = await response.json();
              const locationData: LocationData = {
                latitude,
                longitude,
                city: data.city || data.locality || 'San Francisco',
                state: data.principalSubdivision || 'CA',
                country: data.countryName || 'United States',
                address: `${data.city || 'San Francisco'}, ${
                  data.principalSubdivision || 'CA'
                }`,
              };
              resolve(locationData);
            } else {
              // Fallback without geocoding
              resolve({
                latitude,
                longitude,
                city: 'Current Location',
                state: 'Unknown',
                country: 'Unknown',
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              });
            }
          } catch (geocodeError) {
            // Fallback without geocoding
            resolve({
              latitude,
              longitude,
              city: 'Current Location',
              state: 'Unknown',
              country: 'Unknown',
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            });
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  async getLocationFromIP(): Promise<LocationData> {
    // Simplified IP geolocation with single reliable service
    try {
      console.log('Getting location from IP...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        'https://api.bigdatacloud.net/data/client-ip',
        {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        const locationData: LocationData = {
          latitude: data.location?.latitude || 37.7749,
          longitude: data.location?.longitude || -122.4194,
          city: data.location?.city || 'San Francisco',
          state: data.location?.principalSubdivision || 'CA',
          country: data.location?.countryName || 'United States',
          address: `${data.location?.city || 'San Francisco'}, ${
            data.location?.principalSubdivision || 'CA'
          }`,
        };

        console.log('IP location obtained:', locationData);
        this.currentLocation = locationData;
        return locationData;
      }
    } catch (error) {
      console.log('IP geolocation failed:', error);
    }

    // Final fallback to San Francisco
    console.log('Using default location: San Francisco');
    const defaultLocation: LocationData = {
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      address: 'San Francisco, CA',
    };

    this.currentLocation = defaultLocation;
    return defaultLocation;
  }

  async getCurrentLocation(): Promise<LocationData> {
    // Return cached location if available and recent
    if (this.currentLocation && this.isInitialized) {
      return this.currentLocation;
    }

    try {
      console.log('Getting current location...');

      // Try browser geolocation first on web
      if (Platform.OS === 'web') {
        try {
          const browserLocation = await this.getLocationFromBrowser();
          this.currentLocation = browserLocation;
          this.isInitialized = true;
          return browserLocation;
        } catch (browserError) {
          console.log('Browser geolocation failed, trying IP location');
        }
      } else {
        // Try GPS on mobile
        const hasPermission = await this.requestPermissions();
        if (hasPermission) {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeout: 8000,
            });

            const { latitude, longitude } = location.coords;

            // Simple reverse geocoding
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );

              if (response.ok) {
                const data = await response.json();

                this.currentLocation = {
                  latitude,
                  longitude,
                  city: data.city || data.locality || 'Current Location',
                  state: data.principalSubdivision || 'Unknown',
                  country: data.countryName || 'Unknown',
                  address: `${data.city || 'Current Location'}, ${
                    data.principalSubdivision || 'Unknown'
                  }`,
                };

                this.isInitialized = true;
                return this.currentLocation;
              }
            } catch (geocodeError) {
              console.log('Reverse geocoding failed, using coordinates');
              this.currentLocation = {
                latitude,
                longitude,
                city: 'Current Location',
                state: 'Unknown',
                country: 'Unknown',
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              };
              this.isInitialized = true;
              return this.currentLocation;
            }
          } catch (gpsError) {
            console.log('GPS location failed, falling back to IP location');
          }
        }
      }

      // Fallback to IP-based location
      const ipLocation = await this.getLocationFromIP();
      this.isInitialized = true;
      return ipLocation;
    } catch (error) {
      console.log('All location methods failed, using default:', error);

      // Final fallback
      this.currentLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        address: 'San Francisco, CA',
      };
      this.isInitialized = true;
      return this.currentLocation;
    }
  }

  async startLocationTracking(
    callback: (location: LocationData) => void
  ): Promise<void> {
    try {
      // Get initial location
      const initialLocation = await this.getCurrentLocation();
      callback(initialLocation);

      // Set up periodic updates (every 10 minutes)
      const updateInterval = setInterval(async () => {
        try {
          const updatedLocation = await this.getCurrentLocation();
          callback(updatedLocation);
        } catch (error) {
          console.log('Location update failed:', error);
        }
      }, 600000); // 10 minutes

      // Store interval for cleanup
      (this as any).updateInterval = updateInterval;
    } catch (error) {
      console.log('Error starting location tracking:', error);
      // Provide fallback location
      const fallbackLocation: LocationData = {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        address: 'San Francisco, CA',
      };
      callback(fallbackLocation);
    }
  }

  stopLocationTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if ((this as any).updateInterval) {
      clearInterval((this as any).updateInterval);
      (this as any).updateInterval = null;
    }
  }

  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }
}

export const locationService = new LocationService();
