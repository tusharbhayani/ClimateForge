export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'emergency' | 'medical' | 'fire' | 'police' | 'utility' | 'family';
  location?: string;
  available24h: boolean;
  description?: string;
}

export interface EmergencyProtocol {
  id: string;
  type:
    | 'earthquake'
    | 'wildfire'
    | 'flood'
    | 'heat_wave'
    | 'air_quality'
    | 'power_outage';
  title: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  steps: string[];
  supplies_needed: string[];
  evacuation_info?: string;
  shelter_locations?: string[];
}

class EmergencyService {
  private emergencyContacts: EmergencyContact[] = [
    {
      id: '911',
      name: 'Emergency Services',
      phone: '911',
      type: 'emergency',
      available24h: true,
      description: 'Police, Fire, Medical emergencies',
    },
    {
      id: 'poison_control',
      name: 'Poison Control Center',
      phone: '1-800-222-1222',
      type: 'medical',
      available24h: true,
      description: 'Poison emergencies and information',
    },
    {
      id: 'red_cross',
      name: 'American Red Cross',
      phone: '1-800-733-2767',
      type: 'emergency',
      available24h: true,
      description: 'Disaster relief and emergency assistance',
    },
    {
      id: 'sf_fire',
      name: 'San Francisco Fire Department',
      phone: '(415) 558-3200',
      type: 'fire',
      location: 'San Francisco, CA',
      available24h: true,
      description: 'Non-emergency fire department services',
    },
    {
      id: 'sf_police',
      name: 'San Francisco Police (Non-Emergency)',
      phone: '(415) 553-0123',
      type: 'police',
      location: 'San Francisco, CA',
      available24h: true,
      description: 'Non-emergency police services',
    },
    {
      id: 'pge',
      name: 'PG&E Emergency Line',
      phone: '1-800-743-5000',
      type: 'utility',
      location: 'Northern California',
      available24h: true,
      description: 'Gas leaks, power outages, downed lines',
    },
    {
      id: 'sf_311',
      name: 'SF 311 Customer Service',
      phone: '311',
      type: 'utility',
      location: 'San Francisco, CA',
      available24h: false,
      description: 'City services and non-emergency issues',
    },
    {
      id: 'bay_area_211',
      name: 'Bay Area 211',
      phone: '211',
      type: 'emergency',
      location: 'Bay Area, CA',
      available24h: true,
      description: 'Community resources and assistance',
    },
  ];

  private emergencyProtocols: EmergencyProtocol[] = [
    {
      id: 'earthquake',
      type: 'earthquake',
      title: 'Earthquake Emergency Protocol',
      severity: 'high',
      steps: [
        'DROP to hands and knees immediately',
        'Take COVER under a sturdy desk or table',
        'HOLD ON to your shelter and protect your head',
        'Stay where you are until shaking stops',
        'If outdoors, move away from buildings and power lines',
        'If in a vehicle, pull over and stay inside',
        'After shaking stops, check for injuries and hazards',
        'Turn on battery-powered radio for emergency information',
        'Be prepared for aftershocks',
      ],
      supplies_needed: [
        'Emergency kit with water and food',
        'Battery-powered radio',
        'Flashlight and extra batteries',
        'First aid kit',
        'Whistle for signaling help',
        'Dust masks',
        'Plastic sheeting and duct tape',
      ],
      evacuation_info:
        'Know your evacuation routes. Have a family meeting point.',
      shelter_locations: [
        'Moscone Center - 747 Howard St',
        'Bill Graham Civic Auditorium - 99 Grove St',
        'Local schools designated as emergency shelters',
      ],
    },
    {
      id: 'wildfire',
      type: 'wildfire',
      title: 'Wildfire Emergency Protocol',
      severity: 'critical',
      steps: [
        'Monitor emergency alerts and evacuation orders',
        'Prepare to evacuate immediately if ordered',
        'Close all windows and doors',
        'Remove flammable materials from around house',
        'Connect garden hoses to water sources',
        'Place wet towels under doors to prevent smoke',
        'If trapped, call 911 and signal for help',
        'Stay low to avoid smoke inhalation',
        'Have emergency supplies ready to go',
      ],
      supplies_needed: [
        'Go-bag with essentials',
        'N95 masks for smoke protection',
        'Important documents in waterproof container',
        'Cash and credit cards',
        'Medications',
        'Phone chargers',
        'Change of clothes',
        'Pet supplies if applicable',
      ],
      evacuation_info:
        'Know multiple evacuation routes. Traffic will be heavy.',
      shelter_locations: [
        'Check local emergency management for current shelters',
        'Red Cross evacuation centers',
        'Community centers outside fire zones',
      ],
    },
    {
      id: 'heat_wave',
      type: 'heat_wave',
      title: 'Extreme Heat Emergency Protocol',
      severity: 'moderate',
      steps: [
        'Stay indoors during hottest parts of day (10am-6pm)',
        'Drink water regularly, even if not thirsty',
        'Wear lightweight, light-colored, loose-fitting clothing',
        'Take cool showers or baths',
        'Use fans and air conditioning if available',
        'Check on elderly neighbors and relatives',
        'Avoid alcohol and caffeine',
        'Never leave people or pets in parked vehicles',
        'Seek immediate medical attention for heat exhaustion symptoms',
      ],
      supplies_needed: [
        'Extra water (1 gallon per person per day)',
        'Electrolyte drinks',
        'Battery-powered fans',
        'Ice packs',
        'Light-colored clothing',
        'Sunscreen SPF 30+',
        'Wide-brimmed hats',
      ],
      shelter_locations: [
        'Public libraries with air conditioning',
        'Shopping malls',
        'Community cooling centers',
        'Senior centers',
      ],
    },
    {
      id: 'air_quality',
      type: 'air_quality',
      title: 'Poor Air Quality Protocol',
      severity: 'moderate',
      steps: [
        'Stay indoors with windows and doors closed',
        'Use air purifiers if available',
        'Avoid outdoor exercise and activities',
        'Wear N95 masks when going outside',
        'Keep medications for asthma/respiratory conditions handy',
        'Monitor air quality index (AQI) regularly',
        'Use HEPA filters in HVAC systems',
        'Avoid activities that create more particles (smoking, candles)',
        'Seek medical attention if experiencing breathing difficulties',
      ],
      supplies_needed: [
        'N95 or P100 masks',
        'Air purifiers with HEPA filters',
        'Respiratory medications',
        'Sealed windows and doors',
        'Indoor activities and entertainment',
      ],
    },
    {
      id: 'flood',
      type: 'flood',
      title: 'Flood Emergency Protocol',
      severity: 'high',
      steps: [
        'Move to higher ground immediately',
        'Avoid walking or driving through flood waters',
        'Turn off utilities if instructed by authorities',
        'Do not touch electrical equipment if wet',
        'Listen to emergency broadcasts',
        'Signal for help if trapped',
        'Stay away from downed power lines',
        'Boil water before drinking if advised',
        'Document damage with photos for insurance',
      ],
      supplies_needed: [
        'Waterproof emergency kit',
        'Battery-powered radio',
        'Waterproof flashlight',
        'Life jackets',
        'Rope for rescue',
        'Plastic bags for important items',
        'Water purification tablets',
      ],
      evacuation_info: 'Know flood evacuation routes. Avoid low-lying areas.',
      shelter_locations: [
        'Higher elevation community centers',
        'Schools on higher ground',
        'Emergency shelters announced by authorities',
      ],
    },
  ];

  getEmergencyContacts(location?: string): EmergencyContact[] {
    if (location) {
      return this.emergencyContacts.filter(
        (contact) =>
          !contact.location ||
          contact.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    return this.emergencyContacts;
  }

  getEmergencyContactsByType(
    type: EmergencyContact['type']
  ): EmergencyContact[] {
    return this.emergencyContacts.filter((contact) => contact.type === type);
  }

  getEmergencyProtocol(
    type: EmergencyProtocol['type']
  ): EmergencyProtocol | null {
    return (
      this.emergencyProtocols.find((protocol) => protocol.type === type) || null
    );
  }

  getAllProtocols(): EmergencyProtocol[] {
    return this.emergencyProtocols;
  }

  getProtocolsBySeverity(
    severity: EmergencyProtocol['severity']
  ): EmergencyProtocol[] {
    return this.emergencyProtocols.filter(
      (protocol) => protocol.severity === severity
    );
  }

  // Get relevant protocols based on current environmental conditions
  getRelevantProtocols(environmentalData: any): EmergencyProtocol[] {
    const relevant: EmergencyProtocol[] = [];

    if (environmentalData?.airQuality?.aqi > 150) {
      const airQualityProtocol = this.getEmergencyProtocol('air_quality');
      if (airQualityProtocol) relevant.push(airQualityProtocol);
    }

    if (environmentalData?.weather?.temperature > 95) {
      const heatProtocol = this.getEmergencyProtocol('heat_wave');
      if (heatProtocol) relevant.push(heatProtocol);
    }

    if (environmentalData?.risks?.wildfire > 7) {
      const wildfireProtocol = this.getEmergencyProtocol('wildfire');
      if (wildfireProtocol) relevant.push(wildfireProtocol);
    }

    // Always include earthquake protocol for California
    if (environmentalData?.location?.state === 'CA') {
      const earthquakeProtocol = this.getEmergencyProtocol('earthquake');
      if (earthquakeProtocol) relevant.push(earthquakeProtocol);
    }

    return relevant;
  }

  // Format phone number for calling
  formatPhoneForCalling(phone: string): string {
    // Remove all non-numeric characters except +
    return phone.replace(/[^\d+]/g, '');
  }

  // Check if contact is available now
  isContactAvailable(contact: EmergencyContact): boolean {
    if (contact.available24h) return true;

    const now = new Date();
    const hour = now.getHours();

    // Assume non-24h services are available 8am-6pm
    return hour >= 8 && hour < 18;
  }

  // Get emergency supplies checklist
  getEmergencySuppliesChecklist(): string[] {
    return [
      'Water (1 gallon per person per day for 3 days)',
      'Non-perishable food (3-day supply)',
      'Battery-powered or hand crank radio',
      'Flashlight and extra batteries',
      'First aid kit',
      'Whistle for signaling help',
      'Dust masks and plastic sheeting',
      'Moist towelettes and garbage bags',
      'Wrench or pliers to turn off utilities',
      'Manual can opener',
      'Local maps',
      'Cell phone with chargers and backup battery',
      'Cash and credit cards',
      'Emergency contact information',
      'Copies of important documents',
      'Sleeping bags and blankets',
      'Change of clothing and sturdy shoes',
      'Fire extinguisher',
      'Matches in waterproof container',
      'Feminine supplies and personal hygiene items',
      'Mess kits, paper cups, plates, utensils',
      'Paper and pencil',
      'Books, games, puzzles for children',
    ];
  }
}

export const emergencyService = new EmergencyService();
