import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getSeverityBgColor } from '@/lib/mockPrediction';
import { 
  Camera, 
  History, 
  AlertTriangle, 
  TrendingUp,
  Leaf,
  Droplets,
  Thermometer,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

interface Prediction {
  id: string;
  crop_type: string;
  disease_name: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  created_at: string;
}

interface Alert {
  id: string;
  region: string;
  crop_type: string;
  alert_type: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    healthyCrops: 0,
    diseasesDetected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // Fetch recent predictions
      const { data: predictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (predictions) {
        setRecentPredictions(predictions as Prediction[]);
        
        // Calculate stats from all predictions
        const { count: totalCount } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: healthyCount } = await supabase
          .from('predictions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('disease_name', 'Healthy');

        setStats({
          totalPredictions: totalCount || 0,
          healthyCrops: healthyCount || 0,
          diseasesDetected: (totalCount || 0) - (healthyCount || 0),
        });
      }

      // Fetch active alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .limit(3);

      if (alertsData) {
        setAlerts(alertsData as Alert[]);
      }

      setLoading(false);
    }

    fetchData();
  }, [user]);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your crops and manage disease predictions.
          </p>
        </div>

        {/* Quick Action */}
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Analyze Crop Health</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a leaf image to detect diseases
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/predict">
                Start Prediction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPredictions}</div>
              <p className="text-xs text-muted-foreground">All-time analyses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Healthy Crops</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.healthyCrops}</div>
              <p className="text-xs text-muted-foreground">No disease detected</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Diseases Detected</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.diseasesDetected}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </CardTitle>
              <CardDescription>Regional disease and weather warnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityBgColor(alert.severity)}`}
                >
                  <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{alert.alert_type}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.region}
                      </Badge>
                      {alert.crop_type && (
                        <Badge variant="secondary" className="text-xs">
                          {alert.crop_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Predictions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>Your latest disease analysis results</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : recentPredictions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No predictions yet. Start by analyzing a crop image.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/predict">Make First Prediction</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPredictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background">
                        <Leaf className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{prediction.disease_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {prediction.crop_type} • {format(new Date(prediction.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {prediction.confidence.toFixed(1)}%
                      </span>
                      <Badge className={getSeverityBgColor(prediction.severity)}>
                        {prediction.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
