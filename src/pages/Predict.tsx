import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { predictDisease, getSeverityBgColor } from '@/lib/mockPrediction';
import { 
  Upload, 
  Camera, 
  Thermometer, 
  Droplets, 
  CloudRain,
  Layers,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

const CROP_TYPES = ['Tomato', 'Rice', 'Wheat', 'Maize', 'Cotton'];
const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky'];

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

export default function Predict() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropType, setCropType] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(25);
  const [humidity, setHumidity] = useState<number>(60);
  const [rainfall, setRainfall] = useState<number>(20);
  const [soilType, setSoilType] = useState<string>('');
  const [soilMoisture, setSoilMoisture] = useState<number>(40);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePredict = async () => {
    if (!cropType) {
      toast({
        title: "Missing information",
        description: "Please select a crop type.",
        variant: "destructive",
      });
      return;
    }

    if (!soilType) {
      toast({
        title: "Missing information",
        description: "Please select a soil type.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate ML processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get mock prediction
    const prediction = predictDisease(
      cropType,
      selectedFile,
      { temperature, humidity, rainfall },
      { soilType, moisture: soilMoisture }
    );

    setResult(prediction);

    // Save to database
    if (user) {
      const { error } = await supabase.from('predictions').insert({
        user_id: user.id,
        crop_type: cropType,
        disease_name: prediction.diseaseName,
        confidence: prediction.confidence,
        severity: prediction.severity,
        temperature,
        humidity,
        rainfall,
        soil_type: soilType,
        soil_moisture: soilMoisture,
        recommendations: prediction.recommendations,
      });

      if (error) {
        console.error('Error saving prediction:', error);
      }
    }

    setIsAnalyzing(false);
  };

  const resetForm = () => {
    setResult(null);
    setSelectedFile(null);
    setImagePreview(null);
    setCropType('');
    setSoilType('');
    setTemperature(25);
    setHumidity(60);
    setRainfall(20);
    setSoilMoisture(40);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Disease Prediction</h1>
          <p className="text-muted-foreground">
            Upload a crop leaf image and provide environmental data for analysis.
          </p>
        </div>

        {!result ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Crop Image
                </CardTitle>
                <CardDescription>
                  Upload a clear photo of the affected leaf
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Crop preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-sm font-medium">Click to upload image</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                )}

                {/* Crop Type Selection */}
                <div className="mt-6 space-y-2">
                  <Label>Crop Type</Label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_TYPES.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Data */}
            <div className="space-y-6">
              {/* Weather Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudRain className="h-5 w-5" />
                    Weather Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Temperature
                      </Label>
                      <span className="text-sm font-medium">{temperature}°C</span>
                    </div>
                    <Slider
                      value={[temperature]}
                      onValueChange={([v]) => setTemperature(v)}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Humidity
                      </Label>
                      <span className="text-sm font-medium">{humidity}%</span>
                    </div>
                    <Slider
                      value={[humidity]}
                      onValueChange={([v]) => setHumidity(v)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4" />
                        Rainfall
                      </Label>
                      <span className="text-sm font-medium">{rainfall} mm</span>
                    </div>
                    <Slider
                      value={[rainfall]}
                      onValueChange={([v]) => setRainfall(v)}
                      min={0}
                      max={200}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Soil Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Soil Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Soil Type</Label>
                    <Select value={soilType} onValueChange={setSoilType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOIL_TYPES.map((soil) => (
                          <SelectItem key={soil} value={soil}>
                            {soil}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Moisture Level</Label>
                      <span className="text-sm font-medium">{soilMoisture}%</span>
                    </div>
                    <Slider
                      value={[soilMoisture]}
                      onValueChange={([v]) => setSoilMoisture(v)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {result.diseaseName === 'Healthy' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                    Analysis Result
                  </CardTitle>
                  <Badge className={getSeverityBgColor(result.severity)}>
                    {result.severity} Severity
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Disease</p>
                    <p className="text-2xl font-semibold mt-1">{result.diseaseName}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-2xl font-semibold mt-1">{result.confidence.toFixed(1)}%</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Crop</p>
                    <p className="text-2xl font-semibold mt-1">{cropType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preventive Measures</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.preventive.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-success shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organic Treatment</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.organic.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-success shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chemical Treatment</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.chemical.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.bestPractices.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-success shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {result ? (
            <>
              <Button variant="outline" onClick={resetForm}>
                New Prediction
              </Button>
              <Button onClick={() => navigate('/history')}>
                View History
              </Button>
            </>
          ) : (
            <Button onClick={handlePredict} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Predict Disease'
              )}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
