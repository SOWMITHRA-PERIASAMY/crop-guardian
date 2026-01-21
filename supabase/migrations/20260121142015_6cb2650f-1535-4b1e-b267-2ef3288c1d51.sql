
-- Create profiles table for farmer data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  location TEXT,
  primary_crop TEXT,
  farm_size TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictions table
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
  image_url TEXT,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  rainfall DECIMAL(5,2),
  soil_type TEXT,
  soil_moisture DECIMAL(5,2),
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop_disease_info table for reference data
CREATE TABLE public.crop_disease_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_type TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  description TEXT,
  symptoms TEXT[],
  preventive_measures TEXT[],
  organic_treatment TEXT[],
  chemical_treatment TEXT[],
  best_practices TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table for region-based alerts
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  crop_type TEXT,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_disease_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Predictions policies
CREATE POLICY "Users can view their own predictions" ON public.predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own predictions" ON public.predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions" ON public.predictions
  FOR DELETE USING (auth.uid() = user_id);

-- Crop disease info is public (read-only for authenticated users)
CREATE POLICY "Anyone can view crop disease info" ON public.crop_disease_info
  FOR SELECT USING (true);

-- Alerts are public (read-only)
CREATE POLICY "Anyone can view active alerts" ON public.alerts
  FOR SELECT USING (is_active = true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample crop disease data
INSERT INTO public.crop_disease_info (crop_type, disease_name, description, symptoms, preventive_measures, organic_treatment, chemical_treatment, best_practices) VALUES
('Tomato', 'Early Blight', 'Fungal disease caused by Alternaria solani', 
  ARRAY['Dark brown spots with concentric rings on leaves', 'Yellowing around spots', 'Lower leaves affected first'],
  ARRAY['Rotate crops every 2-3 years', 'Remove infected plant debris', 'Ensure proper spacing for air circulation'],
  ARRAY['Neem oil spray', 'Copper-based fungicides', 'Baking soda solution (1 tbsp per gallon)'],
  ARRAY['Chlorothalonil', 'Mancozeb', 'Azoxystrobin'],
  ARRAY['Water at base of plants', 'Mulch to prevent soil splash', 'Plant resistant varieties']),

('Tomato', 'Late Blight', 'Devastating disease caused by Phytophthora infestans',
  ARRAY['Water-soaked spots on leaves', 'White fuzzy growth on leaf undersides', 'Brown lesions on stems'],
  ARRAY['Plant resistant varieties', 'Avoid overhead irrigation', 'Remove volunteer potato plants'],
  ARRAY['Copper hydroxide', 'Bacillus subtilis products', 'Compost tea spray'],
  ARRAY['Metalaxyl', 'Cymoxanil', 'Phosphorous acid'],
  ARRAY['Monitor weather conditions', 'Scout fields regularly', 'Destroy infected plants immediately']),

('Tomato', 'Leaf Mold', 'Fungal disease favored by high humidity',
  ARRAY['Pale green to yellow spots on upper leaf surface', 'Olive-green to brown fuzzy mold on undersides', 'Leaves curl and wither'],
  ARRAY['Improve greenhouse ventilation', 'Reduce humidity below 85%', 'Space plants adequately'],
  ARRAY['Sulfur-based fungicides', 'Potassium bicarbonate', 'Neem oil'],
  ARRAY['Chlorothalonil', 'Mancozeb'],
  ARRAY['Prune lower leaves', 'Avoid wetting foliage', 'Use drip irrigation']),

('Rice', 'Brown Spot', 'Fungal disease caused by Bipolaris oryzae',
  ARRAY['Oval brown spots on leaves', 'Spots have gray or white centers', 'Grain discoloration'],
  ARRAY['Use certified disease-free seeds', 'Balanced fertilization', 'Proper water management'],
  ARRAY['Trichoderma-based products', 'Pseudomonas fluorescens', 'Neem cake application'],
  ARRAY['Propiconazole', 'Tricyclazole', 'Carbendazim'],
  ARRAY['Maintain optimal plant nutrition', 'Avoid drought stress', 'Seed treatment before planting']),

('Rice', 'Leaf Blast', 'Serious fungal disease caused by Magnaporthe oryzae',
  ARRAY['Diamond-shaped lesions on leaves', 'Gray-green centers with brown borders', 'Lesions may coalesce'],
  ARRAY['Plant resistant varieties', 'Avoid excessive nitrogen', 'Maintain proper plant spacing'],
  ARRAY['Bacillus subtilis', 'Trichoderma viride', 'Silicon-based treatments'],
  ARRAY['Tricyclazole', 'Isoprothiolane', 'Carbendazim'],
  ARRAY['Monitor nursery beds', 'Balanced fertilizer application', 'Proper water management']),

('Wheat', 'Rust', 'Fungal diseases including stem, leaf, and stripe rust',
  ARRAY['Orange-brown pustules on leaves and stems', 'Pustules release powdery spores', 'Premature leaf death'],
  ARRAY['Plant resistant varieties', 'Avoid late planting', 'Eliminate volunteer wheat'],
  ARRAY['Sulfur dust', 'Garlic extract spray', 'Milk solution spray'],
  ARRAY['Propiconazole', 'Tebuconazole', 'Triadimefon'],
  ARRAY['Monitor fields from jointing stage', 'Apply fungicides at first sign', 'Rotate with non-host crops']),

('Wheat', 'Powdery Mildew', 'Fungal disease caused by Blumeria graminis',
  ARRAY['White powdery coating on leaves', 'Yellow patches under mildew', 'Stunted growth'],
  ARRAY['Plant resistant varieties', 'Avoid dense planting', 'Balanced nitrogen application'],
  ARRAY['Sulfur-based fungicides', 'Potassium bicarbonate', 'Milk spray (40% solution)'],
  ARRAY['Triadimefon', 'Propiconazole', 'Tebuconazole'],
  ARRAY['Remove crop residue', 'Ensure good air circulation', 'Scout regularly']),

('Maize', 'Northern Corn Leaf Blight', 'Fungal disease caused by Exserohilum turcicum',
  ARRAY['Long, elliptical gray-green lesions', 'Lesions turn tan as they mature', 'Starts on lower leaves'],
  ARRAY['Plant resistant hybrids', 'Rotate crops', 'Till under crop residue'],
  ARRAY['Bacillus-based products', 'Trichoderma applications', 'Compost tea'],
  ARRAY['Azoxystrobin', 'Propiconazole', 'Pyraclostrobin'],
  ARRAY['Scout at V8 stage', 'Consider fungicide at tasseling', 'Maintain plant health']),

('Cotton', 'Bacterial Blight', 'Disease caused by Xanthomonas citri pv. malvacearum',
  ARRAY['Angular water-soaked spots on leaves', 'Spots turn brown and dry', 'Black arm symptoms on stems'],
  ARRAY['Use disease-free seeds', 'Acid-delint seeds', 'Avoid overhead irrigation'],
  ARRAY['Copper-based bactericides', 'Streptomycin sulfate', 'Bordeaux mixture'],
  ARRAY['Copper hydroxide', 'Copper oxychloride'],
  ARRAY['Remove infected plants', 'Rotate with non-host crops', 'Control insect vectors']);

-- Insert sample alerts
INSERT INTO public.alerts (region, crop_type, alert_type, message, severity, is_active, expires_at) VALUES
('North India', 'Wheat', 'Disease Warning', 'High risk of wheat rust due to favorable weather conditions. Monitor crops closely.', 'High', true, now() + interval '7 days'),
('South India', 'Rice', 'Weather Alert', 'Heavy rainfall expected. Ensure proper drainage to prevent fungal diseases.', 'Medium', true, now() + interval '3 days'),
('Central India', 'Cotton', 'Pest Alert', 'Increased bollworm activity reported. Implement integrated pest management.', 'Medium', true, now() + interval '5 days');
