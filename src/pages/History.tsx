import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getSeverityBgColor } from '@/lib/mockPrediction';
import { 
  Search, 
  Filter, 
  Leaf, 
  Thermometer,
  Droplets,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface Prediction {
  id: string;
  crop_type: string;
  disease_name: string;
  confidence: number;
  severity: string;
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  soil_type: string | null;
  soil_moisture: number | null;
  recommendations: {
    preventive?: string[];
    organic?: string[];
    chemical?: string[];
    bestPractices?: string[];
  } | null;
  created_at: string;
}

const CROP_TYPES = ['All', 'Tomato', 'Rice', 'Wheat', 'Maize', 'Cotton'];
const SEVERITY_LEVELS = ['All', 'Low', 'Medium', 'High'];

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchPredictions();
  }, [user]);

  async function fetchPredictions() {
    if (!user) return;

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching predictions:', error);
    } else {
      setPredictions(data as Prediction[]);
    }
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('predictions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete prediction.",
        variant: "destructive",
      });
    } else {
      setPredictions(predictions.filter(p => p.id !== id));
      toast({
        title: "Deleted",
        description: "Prediction removed from history.",
      });
    }
  };

  const filteredPredictions = predictions.filter(p => {
    const matchesSearch = 
      p.disease_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.crop_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = cropFilter === 'All' || p.crop_type === cropFilter;
    const matchesSeverity = severityFilter === 'All' || p.severity === severityFilter;
    return matchesSearch && matchesCrop && matchesSeverity;
  });

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Prediction History</h1>
          <p className="text-muted-foreground">
            View and manage your past disease predictions.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by disease or crop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={cropFilter} onValueChange={setCropFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Crop type" />
                </SelectTrigger>
                <SelectContent>
                  {CROP_TYPES.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {filteredPredictions.length} prediction{filteredPredictions.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredPredictions.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {predictions.length === 0 
                    ? "No predictions yet. Start by analyzing a crop image."
                    : "No predictions match your filters."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPredictions.map((prediction) => (
                  <Collapsible
                    key={prediction.id}
                    open={expandedRow === prediction.id}
                    onOpenChange={(open) => setExpandedRow(open ? prediction.id : null)}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <Leaf className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{prediction.disease_name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(prediction.created_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{prediction.crop_type}</Badge>
                            <span className="text-sm font-medium">{prediction.confidence.toFixed(1)}%</span>
                            <Badge className={getSeverityBgColor(prediction.severity as 'Low' | 'Medium' | 'High')}>
                              {prediction.severity}
                            </Badge>
                            {expandedRow === prediction.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="border-t p-4 bg-muted/30 space-y-4">
                          {/* Environmental Data */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <div className="text-center p-3 rounded-lg bg-background">
                              <Thermometer className="h-4 w-4 mx-auto text-muted-foreground" />
                              <p className="text-xs text-muted-foreground mt-1">Temperature</p>
                              <p className="font-medium">{prediction.temperature}°C</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-background">
                              <Droplets className="h-4 w-4 mx-auto text-muted-foreground" />
                              <p className="text-xs text-muted-foreground mt-1">Humidity</p>
                              <p className="font-medium">{prediction.humidity}%</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-background">
                              <p className="text-xs text-muted-foreground">Rainfall</p>
                              <p className="font-medium">{prediction.rainfall} mm</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-background">
                              <p className="text-xs text-muted-foreground">Soil Type</p>
                              <p className="font-medium">{prediction.soil_type}</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-background">
                              <p className="text-xs text-muted-foreground">Soil Moisture</p>
                              <p className="font-medium">{prediction.soil_moisture}%</p>
                            </div>
                          </div>

                          {/* Recommendations Preview */}
                          {prediction.recommendations && (
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium mb-2">Preventive Measures</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {prediction.recommendations.preventive?.slice(0, 2).map((item, i) => (
                                    <li key={i}>• {item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Organic Treatment</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {prediction.recommendations.organic?.slice(0, 2).map((item, i) => (
                                    <li key={i}>• {item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(prediction.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
