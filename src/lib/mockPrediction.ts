// Mock ML prediction logic for demo purposes
// Returns realistic predictions with confidence between 80-95%

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
}

interface SoilData {
  soilType: string;
  moisture: number;
}

interface PredictionResult {
  diseaseName: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  recommendations: {
    preventive: string[];
    organic: string[];
    chemical: string[];
    bestPractices: string[];
  };
}

const DISEASE_DATABASE: Record<string, { diseases: string[]; baseConfidence: number }> = {
  'Tomato': {
    diseases: ['Early Blight', 'Late Blight', 'Leaf Mold', 'Septoria Leaf Spot', 'Healthy'],
    baseConfidence: 85,
  },
  'Rice': {
    diseases: ['Brown Spot', 'Leaf Blast', 'Bacterial Blight', 'Sheath Blight', 'Healthy'],
    baseConfidence: 88,
  },
  'Wheat': {
    diseases: ['Rust', 'Powdery Mildew', 'Septoria', 'Tan Spot', 'Healthy'],
    baseConfidence: 86,
  },
  'Maize': {
    diseases: ['Northern Corn Leaf Blight', 'Common Rust', 'Gray Leaf Spot', 'Healthy'],
    baseConfidence: 84,
  },
  'Cotton': {
    diseases: ['Bacterial Blight', 'Alternaria Leaf Spot', 'Grey Mildew', 'Healthy'],
    baseConfidence: 87,
  },
};

const RECOMMENDATIONS: Record<string, PredictionResult['recommendations']> = {
  'Early Blight': {
    preventive: [
      'Rotate crops every 2-3 years',
      'Remove infected plant debris',
      'Ensure proper spacing for air circulation',
    ],
    organic: [
      'Neem oil spray (2-3 tablespoons per gallon)',
      'Copper-based fungicides',
      'Baking soda solution (1 tbsp per gallon)',
    ],
    chemical: [
      'Chlorothalonil - Apply every 7-10 days',
      'Mancozeb - Preventive application',
      'Azoxystrobin - Systemic protection',
    ],
    bestPractices: [
      'Water at base of plants early morning',
      'Apply mulch to prevent soil splash',
      'Plant resistant varieties like Mountain Merit',
    ],
  },
  'Late Blight': {
    preventive: [
      'Plant certified disease-free seeds',
      'Avoid overhead irrigation',
      'Remove volunteer potato plants nearby',
    ],
    organic: [
      'Copper hydroxide spray',
      'Bacillus subtilis products',
      'Compost tea foliar spray',
    ],
    chemical: [
      'Metalaxyl-based fungicides',
      'Cymoxanil application',
      'Phosphorous acid treatments',
    ],
    bestPractices: [
      'Monitor weather conditions closely',
      'Scout fields daily during humid periods',
      'Destroy infected plants immediately',
    ],
  },
  'Brown Spot': {
    preventive: [
      'Use certified disease-free seeds',
      'Maintain balanced fertilization',
      'Ensure proper water management',
    ],
    organic: [
      'Trichoderma-based products',
      'Pseudomonas fluorescens spray',
      'Neem cake application to soil',
    ],
    chemical: [
      'Propiconazole spray',
      'Tricyclazole treatment',
      'Carbendazim seed treatment',
    ],
    bestPractices: [
      'Maintain optimal plant nutrition',
      'Avoid drought stress conditions',
      'Treat seeds before planting',
    ],
  },
  'Leaf Blast': {
    preventive: [
      'Plant resistant varieties',
      'Avoid excessive nitrogen application',
      'Maintain proper plant spacing',
    ],
    organic: [
      'Bacillus subtilis applications',
      'Trichoderma viride treatment',
      'Silicon-based foliar spray',
    ],
    chemical: [
      'Tricyclazole - Most effective',
      'Isoprothiolane spray',
      'Carbendazim application',
    ],
    bestPractices: [
      'Monitor nursery beds carefully',
      'Apply balanced fertilizers',
      'Maintain proper water levels',
    ],
  },
  'Rust': {
    preventive: [
      'Plant rust-resistant varieties',
      'Avoid late planting',
      'Eliminate volunteer wheat plants',
    ],
    organic: [
      'Sulfur dust application',
      'Garlic extract spray',
      'Milk solution spray (40%)',
    ],
    chemical: [
      'Propiconazole fungicide',
      'Tebuconazole treatment',
      'Triadimefon spray',
    ],
    bestPractices: [
      'Monitor from jointing stage',
      'Apply fungicides at first sign',
      'Rotate with non-host crops',
    ],
  },
  'Powdery Mildew': {
    preventive: [
      'Plant resistant varieties',
      'Avoid dense planting',
      'Balance nitrogen application',
    ],
    organic: [
      'Sulfur-based fungicides',
      'Potassium bicarbonate spray',
      'Milk spray solution (40%)',
    ],
    chemical: [
      'Triadimefon application',
      'Propiconazole spray',
      'Tebuconazole treatment',
    ],
    bestPractices: [
      'Remove crop residue after harvest',
      'Ensure good air circulation',
      'Scout fields regularly',
    ],
  },
  'Healthy': {
    preventive: [
      'Continue current management practices',
      'Maintain regular monitoring schedule',
      'Keep fields clean and weed-free',
    ],
    organic: [
      'Apply compost for soil health',
      'Use cover crops in rotation',
      'Maintain beneficial insect populations',
    ],
    chemical: [
      'No chemical treatment needed',
      'Consider preventive applications during high-risk periods',
    ],
    bestPractices: [
      'Document successful practices',
      'Monitor weather for disease pressure',
      'Maintain optimal plant nutrition',
    ],
  },
};

// Default recommendations for diseases not in the database
const DEFAULT_RECOMMENDATIONS: PredictionResult['recommendations'] = {
  preventive: [
    'Implement crop rotation',
    'Use disease-free planting material',
    'Maintain proper field sanitation',
  ],
  organic: [
    'Apply neem-based products',
    'Use copper fungicides',
    'Implement biological control agents',
  ],
  chemical: [
    'Consult local agricultural extension',
    'Use registered fungicides as per label',
    'Follow integrated pest management',
  ],
  bestPractices: [
    'Monitor crops regularly',
    'Maintain records of disease incidence',
    'Consult with agricultural experts',
  ],
};

export function predictDisease(
  cropType: string,
  _imageFile: File | null,
  weather: WeatherData,
  soil: SoilData
): PredictionResult {
  const cropData = DISEASE_DATABASE[cropType] || DISEASE_DATABASE['Tomato'];
  
  // Simulate ML model inference with environmental factors
  let diseaseIndex = Math.floor(Math.random() * (cropData.diseases.length - 1));
  
  // Environmental factor adjustments
  // High humidity + warm temp = higher disease risk
  if (weather.humidity > 80 && weather.temperature > 25) {
    diseaseIndex = Math.min(diseaseIndex, cropData.diseases.length - 2); // Avoid healthy
  }
  
  // Low humidity and proper conditions = more likely healthy
  if (weather.humidity < 60 && weather.temperature >= 20 && weather.temperature <= 30) {
    if (Math.random() > 0.6) {
      diseaseIndex = cropData.diseases.length - 1; // Healthy
    }
  }
  
  // High rainfall increases fungal disease risk
  if (weather.rainfall > 50) {
    if (Math.random() > 0.5) {
      diseaseIndex = 0; // First disease in list (usually fungal)
    }
  }
  
  const diseaseName = cropData.diseases[diseaseIndex];
  
  // Calculate confidence based on conditions
  let confidence = cropData.baseConfidence + (Math.random() * 10 - 5);
  
  // Soil moisture affects confidence
  if (soil.moisture > 40 && soil.moisture < 70) {
    confidence += 2;
  }
  
  // Clamp confidence to 80-95 range
  confidence = Math.max(80, Math.min(95, confidence));
  confidence = Math.round(confidence * 100) / 100;
  
  // Determine severity based on confidence and environmental factors
  let severity: 'Low' | 'Medium' | 'High';
  if (diseaseName === 'Healthy') {
    severity = 'Low';
  } else if (confidence >= 90 || (weather.humidity > 85 && weather.temperature > 28)) {
    severity = 'High';
  } else if (confidence >= 85) {
    severity = 'Medium';
  } else {
    severity = 'Low';
  }
  
  // Get recommendations
  const recommendations = RECOMMENDATIONS[diseaseName] || DEFAULT_RECOMMENDATIONS;
  
  return {
    diseaseName,
    confidence,
    severity,
    recommendations,
  };
}

export function getSeverityColor(severity: 'Low' | 'Medium' | 'High'): string {
  switch (severity) {
    case 'Low':
      return 'text-success';
    case 'Medium':
      return 'text-warning';
    case 'High':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

export function getSeverityBgColor(severity: 'Low' | 'Medium' | 'High'): string {
  switch (severity) {
    case 'Low':
      return 'bg-success/10 text-success border-success/20';
    case 'Medium':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'High':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
}
