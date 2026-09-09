import { Alert, AmenityProvider, CropRecommendation, LedgerEntry, Mandi, Scheme } from './types';

export const DEMO_USER = {
  id: 'u1',
  name: 'Arjun Kumar',
  phone: '+91 9876543210',
  role: 'farmer' as const,
};

export const DEMO_FARM = {
  district: 'Chengalpattu',
  state: 'Tamil Nadu',
  lat: 12.6819,
  lng: 79.9754,
  landSize: 3,
  soilType: 'Red Laterite',
  crops: ['Paddy', 'Groundnut'],
  irrigationType: 'Borewell',
  isComplete: true,
};

export const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
  'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal',
  'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet',
  'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni',
  'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur',
  'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Villupuram',
  'Virudhunagar',
];

export const DISTRICT_PRICES: Record<string, number> = {
  'Chengalpattu': 2150, 'Kancheepuram': 2080, 'Chennai': 2250,
  'Vellore': 2020, 'Salem': 1980, 'Trichy': 2100, 'Madurai': 2180,
  'Coimbatore': 2050, 'Tirunelveli': 2130, 'Thanjavur': 2200,
  'Erode': 1960, 'Tiruvallur': 2090, 'Dindigul': 2070,
  'Cuddalore': 2160, 'Villupuram': 2040, 'Dharmapuri': 1990,
};

export const CROP_RECOMMENDATIONS: CropRecommendation[] = [
  {
    id: 'c1', name: 'Paddy', nameTa: 'நெல்', nameHi: 'धान', emoji: '🌾',
    suitabilityScore: 92,
    suitabilityReason: 'Ideal for red laterite soil with borewell irrigation. High demand in local mandis.',
    expectedYield: 1800, marketPrice: 21.5, estimatedRevenue: 38700,
    waterRequirement: 'high', duration: 120, riskLevel: 'low',
    tags: ['Staple', 'High Demand'],
  },
  {
    id: 'c2', name: 'Groundnut', nameTa: 'நிலக்கடலை', nameHi: 'मूंगफली', emoji: '🥜',
    suitabilityScore: 88,
    suitabilityReason: 'Excellent for sandy-red laterite soils. Well-suited to borewell irrigation cycle.',
    expectedYield: 900, marketPrice: 55, estimatedRevenue: 49500,
    waterRequirement: 'medium', duration: 100, riskLevel: 'low',
    tags: ['Oil Crop', 'Proven'],
  },
  {
    id: 'c3', name: 'Finger Millet', nameTa: 'கேழ்வரகு', nameHi: 'रागी', emoji: '🌿',
    suitabilityScore: 84,
    suitabilityReason: 'Drought-resistant. Low input cost. Growing health food market demand.',
    expectedYield: 1200, marketPrice: 32, estimatedRevenue: 38400,
    waterRequirement: 'low', duration: 90, riskLevel: 'low',
    tags: ['Drought-Resistant', 'Health Food'],
  },
  {
    id: 'c4', name: 'Maize', nameTa: 'மக்காச்சோளம்', nameHi: 'मक्का', emoji: '🌽',
    suitabilityScore: 82,
    suitabilityReason: 'Strong poultry feed demand. Quick growing cycle allows double crop.',
    expectedYield: 2200, marketPrice: 18, estimatedRevenue: 39600,
    waterRequirement: 'medium', duration: 80, riskLevel: 'medium',
    tags: ['Feed Crop', 'Double Crop'],
  },
  {
    id: 'c5', name: 'Turmeric', nameTa: 'மஞ்சள்', nameHi: 'हल्दी', emoji: '🟡',
    suitabilityScore: 79,
    suitabilityReason: 'High value spice. Premium prices in export markets. Needs well-drained soil.',
    expectedYield: 2500, marketPrice: 85, estimatedRevenue: 212500,
    waterRequirement: 'medium', duration: 270, riskLevel: 'medium',
    tags: ['Spice', 'Export', 'High Value'],
  },
  {
    id: 'c6', name: 'Sorghum', nameTa: 'சோளம்', nameHi: 'ज्वार', emoji: '🌱',
    suitabilityScore: 77,
    suitabilityReason: 'Excellent drought tolerance. Low input cost. Suitable for dryland farming.',
    expectedYield: 1400, marketPrice: 22, estimatedRevenue: 30800,
    waterRequirement: 'low', duration: 95, riskLevel: 'low',
    tags: ['Dryland', 'Low Input'],
  },
  {
    id: 'c7', name: 'Sunflower', nameTa: 'சூரியகாந்தி', nameHi: 'सूरजमुखी', emoji: '🌻',
    suitabilityScore: 72,
    suitabilityReason: 'Oil crop with stable prices. Can be intercropped with groundnut.',
    expectedYield: 700, marketPrice: 60, estimatedRevenue: 42000,
    waterRequirement: 'medium', duration: 100, riskLevel: 'medium',
    tags: ['Oil Crop', 'Intercrop'],
  },
  {
    id: 'c8', name: 'Sesame', nameTa: 'எள்ளு', nameHi: 'तिल', emoji: '✨',
    suitabilityScore: 71,
    suitabilityReason: 'Low water requirement. Premium oil crop with export demand.',
    expectedYield: 450, marketPrice: 110, estimatedRevenue: 49500,
    waterRequirement: 'low', duration: 85, riskLevel: 'high',
    tags: ['Oil Crop', 'Low Water'],
  },
  {
    id: 'c9', name: 'Tomato', nameTa: 'தக்காளி', nameHi: 'टमाटर', emoji: '🍅',
    suitabilityScore: 68,
    suitabilityReason: 'High returns but price volatile. Requires careful pest management.',
    expectedYield: 8000, marketPrice: 12, estimatedRevenue: 96000,
    waterRequirement: 'high', duration: 70, riskLevel: 'high',
    tags: ['Vegetable', 'High Return', 'Volatile'],
  },
  {
    id: 'c10', name: 'Cotton', nameTa: 'பருத்தி', nameHi: 'कपास', emoji: '☁️',
    suitabilityScore: 65,
    suitabilityReason: 'Good MSP support. Requires deep soil and moderate irrigation.',
    expectedYield: 600, marketPrice: 75, estimatedRevenue: 45000,
    waterRequirement: 'medium', duration: 160, riskLevel: 'medium',
    tags: ['Fiber Crop', 'MSP Supported'],
  },
];

export const MANDIS: Record<string, Mandi[]> = {
  'Chengalpattu': [
    {
      id: 'm1', name: 'Chengalpattu APMC', district: 'Chengalpattu',
      price: 2150, trend: 'up', distance: 8, commission: 2, transportCost: 45, netProfit: 2037,
      isBestMatch: true, facilities: ['Weighing', 'Warehouse', 'Parking', 'Cold Storage'],
      contact: '+91 9876500001',
      priceHistory: [
        { date: 'Sep 3', price: 2050 }, { date: 'Sep 4', price: 2080 }, { date: 'Sep 5', price: 2100 },
        { date: 'Sep 6', price: 2130 }, { date: 'Sep 7', price: 2120 }, { date: 'Sep 8', price: 2140 },
        { date: 'Sep 9', price: 2150 },
      ],
    },
    {
      id: 'm2', name: 'Maraimalai Nagar Mandi', district: 'Chengalpattu',
      price: 2100, trend: 'stable', distance: 15, commission: 2.5, transportCost: 60, netProfit: 1987,
      isBestMatch: false, facilities: ['Weighing', 'Parking'],
      contact: '+91 9876500002',
      priceHistory: [
        { date: 'Sep 3', price: 2090 }, { date: 'Sep 4', price: 2100 }, { date: 'Sep 5', price: 2095 },
        { date: 'Sep 6', price: 2105 }, { date: 'Sep 7', price: 2100 }, { date: 'Sep 8', price: 2098 },
        { date: 'Sep 9', price: 2100 },
      ],
    },
  ],
  'Chennai': [
    {
      id: 'm3', name: 'Koyambedu Wholesale Market', district: 'Chennai',
      price: 2250, trend: 'up', distance: 52, commission: 3, transportCost: 120, netProfit: 2062,
      isBestMatch: false, facilities: ['Weighing', 'Warehouse', 'Cold Storage', 'Loading'],
      contact: '+91 9876500003',
      priceHistory: [
        { date: 'Sep 3', price: 2150 }, { date: 'Sep 4', price: 2180 }, { date: 'Sep 5', price: 2200 },
        { date: 'Sep 6', price: 2220 }, { date: 'Sep 7', price: 2230 }, { date: 'Sep 8', price: 2245 },
        { date: 'Sep 9', price: 2250 },
      ],
    },
  ],
  'Vellore': [
    {
      id: 'm4', name: 'Vellore APMC', district: 'Vellore',
      price: 2020, trend: 'down', distance: 95, commission: 2, transportCost: 180, netProfit: 1799,
      isBestMatch: false, facilities: ['Weighing', 'Warehouse'],
      contact: '+91 9876500004',
      priceHistory: [
        { date: 'Sep 3', price: 2100 }, { date: 'Sep 4', price: 2080 }, { date: 'Sep 5', price: 2060 },
        { date: 'Sep 6', price: 2040 }, { date: 'Sep 7', price: 2035 }, { date: 'Sep 8', price: 2025 },
        { date: 'Sep 9', price: 2020 },
      ],
    },
  ],
  'Thanjavur': [
    {
      id: 'm5', name: 'Thanjavur Rice Market', district: 'Thanjavur',
      price: 2200, trend: 'up', distance: 220, commission: 1.5, transportCost: 380, netProfit: 1787,
      isBestMatch: false, facilities: ['Weighing', 'Warehouse', 'Grading'],
      contact: '+91 9876500005',
      priceHistory: [
        { date: 'Sep 3', price: 2120 }, { date: 'Sep 4', price: 2140 }, { date: 'Sep 5', price: 2160 },
        { date: 'Sep 6', price: 2175 }, { date: 'Sep 7', price: 2185 }, { date: 'Sep 8', price: 2195 },
        { date: 'Sep 9', price: 2200 },
      ],
    },
  ],
};

export const AMENITY_PROVIDERS: AmenityProvider[] = [
  {
    id: 'p1', name: 'Kumar Agro Supplies', type: 'inputs',
    rating: 4.7, reliability: 96, isVerified: true, jobs: 312, disputes: 2,
    location: 'Chengalpattu Town', distance: 3.2,
    initials: 'KA', color: '#2E7D32',
    contact: '+91 9876501001',
    services: [
      { id: 's1', name: 'NPK Fertilizer (50kg)', unit: 'bag', price: 1250, available: true },
      { id: 's2', name: 'Paddy Seeds (10kg)', unit: 'pack', price: 280, available: true },
      { id: 's3', name: 'Pesticide Spray Kit', unit: 'kit', price: 450, available: false },
    ],
  },
  {
    id: 'p2', name: 'Tamil Seeds Co.', type: 'inputs',
    rating: 4.5, reliability: 94, isVerified: true, jobs: 189, disputes: 1,
    location: 'Vandalur', distance: 6.8,
    initials: 'TS', color: '#00695C',
    contact: '+91 9876501002',
    services: [
      { id: 's4', name: 'Hybrid Paddy Seeds (5kg)', unit: 'pack', price: 320, available: true },
      { id: 's5', name: 'Urea (50kg)', unit: 'bag', price: 680, available: true },
      { id: 's6', name: 'Bio-Pesticide (1L)', unit: 'bottle', price: 340, available: true },
    ],
  },
  {
    id: 'p3', name: 'Rajan Tractors', type: 'machinery',
    rating: 4.8, reliability: 98, isVerified: true, jobs: 587, disputes: 0,
    location: 'Guduvancherry', distance: 5.1,
    initials: 'RT', color: '#8D6E63',
    contact: '+91 9876501003',
    services: [
      { id: 's7', name: 'Tractor + Driver (8hr)', unit: 'day', price: 2200, available: true },
      { id: 's8', name: 'Power Tiller (4hr)', unit: 'half-day', price: 900, available: true },
      { id: 's9', name: 'Harvester (1 acre)', unit: 'acre', price: 1800, available: true },
    ],
  },
  {
    id: 'p4', name: 'KR Farm Equipment', type: 'machinery',
    rating: 4.4, reliability: 91, isVerified: false, jobs: 123, disputes: 3,
    location: 'Chengalpattu', distance: 9.5,
    initials: 'KR', color: '#D97706',
    contact: '+91 9876501004',
    services: [
      { id: 's10', name: 'Boom Sprayer (1 acre)', unit: 'acre', price: 350, available: true },
      { id: 's11', name: 'Rotavator (8hr)', unit: 'day', price: 1600, available: false },
    ],
  },
  {
    id: 'p5', name: 'Murugan Labour Services', type: 'labour',
    rating: 4.6, reliability: 93, isVerified: true, jobs: 445, disputes: 4,
    location: 'Perungalathur', distance: 7.3,
    initials: 'ML', color: '#6D28D9',
    contact: '+91 9876501005',
    services: [
      { id: 's12', name: 'Transplanting Labour', unit: 'person/day', price: 550, available: true },
      { id: 's13', name: 'Harvesting Labour', unit: 'person/day', price: 600, available: true },
      { id: 's14', name: 'Field Preparation', unit: 'person/day', price: 520, available: true },
    ],
  },
  {
    id: 'p6', name: 'Green Helpers', type: 'labour',
    rating: 4.3, reliability: 89, isVerified: false, jobs: 98, disputes: 2,
    location: 'Tambaram', distance: 12.0,
    initials: 'GH', color: '#0277BD',
    contact: '+91 9876501006',
    services: [
      { id: 's15', name: 'Weeding Labour', unit: 'person/day', price: 480, available: true },
      { id: 's16', name: 'Spraying Labour', unit: 'person/day', price: 500, available: true },
    ],
  },
];

export const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'l1', type: 'expense', category: 'Fertilizer', amount: 3750,
    description: 'NPK 3 bags for paddy field', date: '2026-09-02',
  },
  {
    id: 'l2', type: 'expense', category: 'Labour', amount: 4400,
    description: 'Transplanting - 8 labourers × 1 day', date: '2026-09-01',
  },
  {
    id: 'l3', type: 'income', category: 'Crop Sale', amount: 18000,
    description: 'Groundnut sale - 20 bags to Chengalpattu mandi', date: '2026-08-28',
  },
  {
    id: 'l4', type: 'expense', category: 'Seeds', amount: 840,
    description: 'Hybrid paddy seeds 3 packs', date: '2026-08-25',
  },
  {
    id: 'l5', type: 'income', category: 'Subsidy', amount: 2500,
    description: 'PM-KISAN second installment', date: '2026-08-20',
  },
  {
    id: 'l6', type: 'expense', category: 'Machinery', amount: 6600,
    description: 'Tractor hire 3 days for ploughing', date: '2026-08-18',
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'a1', type: 'weather', priority: 'high',
    title: 'Heavy Rain Warning',
    message: 'IMD forecasts 80-100mm rainfall in Chengalpattu over next 48 hours. Protect paddy crop from lodging.',
    timestamp: '2026-09-09T06:00:00', isRead: false,
    actionScreen: 'home', actionLabel: 'View Advisory',
  },
  {
    id: 'a2', type: 'market', priority: 'high',
    title: 'Paddy Prices Up 5%',
    message: 'Paddy prices in Chengalpattu APMC rose to ₹2,150/quintal. Consider selling in the next 3-5 days.',
    timestamp: '2026-09-09T07:30:00', isRead: false,
    actionScreen: 'smart-sell', actionLabel: 'Smart Sell Now',
  },
  {
    id: 'a3', type: 'scheme', priority: 'medium',
    title: 'PM-KISAN: Apply for Next Cycle',
    message: "Next PM-KISAN installment application closes Sep 30. You're eligible for ₹2,000.",
    timestamp: '2026-09-08T10:00:00', isRead: false,
    actionScreen: 'schemes', actionLabel: 'View Scheme',
  },
  {
    id: 'a4', type: 'disease', priority: 'medium',
    title: 'Blast Disease Alert',
    message: 'Paddy leaf blast reported in 3 nearby farms. Spray tricyclazole preventively if humidity > 80%.',
    timestamp: '2026-09-08T09:00:00', isRead: true,
    actionScreen: 'disease', actionLabel: 'Learn More',
  },
  {
    id: 'a5', type: 'reminder', priority: 'low',
    title: 'Fertilizer Application Due',
    message: '2nd dose of urea application recommended for your paddy field. Optimal timing: Day 30 post-transplant.',
    timestamp: '2026-09-07T08:00:00', isRead: true,
  },
];

export const SCHEMES: Scheme[] = [
  {
    id: 'sc1', name: 'PM-KISAN', type: 'scheme',
    amount: '₹6,000/year', deadline: 'Sep 30, 2026',
    description: 'Direct income support of ₹6,000 per year to small and marginal farmers in three equal installments.',
    eligibility: ['Landowner farmer', 'Less than 2 hectares', 'Not a government employee'],
    benefits: ['₹2,000 per installment', 'Direct bank transfer', 'No intermediaries'],
    isEligible: true,
  },
  {
    id: 'sc2', name: 'TNAU Crop Insurance (PMFBY)', type: 'scheme',
    amount: 'Up to ₹75,000/hectare', deadline: 'Oct 15, 2026',
    description: 'Comprehensive crop insurance covering all stages from pre-sowing to post-harvest losses.',
    eligibility: ['Enrolled farmer', 'Insured notified crops', 'Premium as low as 2%'],
    benefits: ['Full yield loss coverage', 'Post-harvest losses', 'Prevented sowing losses'],
    isEligible: true,
  },
  {
    id: 'sc3', name: 'Kisan Credit Card (KCC)', type: 'loan',
    amount: '₹3 Lakh at 4% p.a.', deadline: 'Ongoing',
    description: 'Flexible credit facility for short-term crop production needs including inputs, machinery, and allied activities.',
    eligibility: ['Active farmer', 'No loan default', 'Valid land document'],
    benefits: ['Interest subvention of 2%', 'Flexible repayment', 'No processing fee up to ₹3L'],
    isEligible: true,
  },
  {
    id: 'sc4', name: 'Tamil Nadu Farmer Support Scheme', type: 'scheme',
    amount: '₹1,000/acre/season', deadline: 'Nov 30, 2026',
    description: 'State government direct benefit scheme for small farmers growing notified food crops.',
    eligibility: ['TN resident farmer', 'Paddy or pulses cultivation', 'Less than 5 acres'],
    benefits: ['Seasonal direct payment', 'Per acre calculation', 'Bank transfer'],
    isEligible: true,
  },
  {
    id: 'sc5', name: 'NABARD Drip Irrigation Loan', type: 'loan',
    amount: '₹1 Lakh – ₹10 Lakh', deadline: 'Ongoing',
    description: 'Subsidized loan for installation of micro-irrigation systems including drip and sprinkler.',
    eligibility: ['Minimum 0.5 acre land', 'No previous irrigation loan default', 'Valid land document'],
    benefits: ['55% subsidy on system cost', '3-year repayment holiday', '7% interest rate'],
    isEligible: false,
  },
];

export const PLANNER_TASKS = [
  { id: 't1', title: 'Apply 2nd dose Urea', due: 'Today', done: false, priority: 'high' },
  { id: 't2', title: 'Check paddy for blast signs', due: 'Tomorrow', done: false, priority: 'high' },
  { id: 't3', title: 'Book harvester for Oct 15', due: 'Sep 20', done: false, priority: 'medium' },
  { id: 't4', title: 'Submit PM-KISAN application', due: 'Sep 30', done: false, priority: 'medium' },
  { id: 't5', title: 'Weeding completed – Field A', due: 'Sep 5', done: true, priority: 'low' },
];
