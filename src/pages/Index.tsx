import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Camera, 
  BarChart3, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const FEATURES = [
  {
    icon: Camera,
    title: 'Image Analysis',
    description: 'Upload crop leaf images for instant disease detection using AI.',
  },
  {
    icon: BarChart3,
    title: 'Environmental Factors',
    description: 'Combine weather and soil data for accurate predictions.',
  },
  {
    icon: Shield,
    title: 'Actionable Recommendations',
    description: 'Get treatment suggestions and preventive measures.',
  },
];

const BENEFITS = [
  'Early disease detection to minimize crop loss',
  'Personalized recommendations based on your region',
  'Track prediction history and trends',
  'Mobile-friendly interface for field use',
];

export default function Index() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">CropGuard</span>
          </div>
          
          <div className="flex items-center gap-4">
            {loading ? null : user ? (
              <Button asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
            <Leaf className="h-4 w-4" />
            AI-Powered Crop Protection
          </div>
          
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance">
            Detect crop diseases before they spread
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Upload a photo of your crop leaves and get instant disease predictions 
            with treatment recommendations. Protect your harvest with AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to={user ? "/predict" : "/auth"}>
                Start Analyzing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="container py-24">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple, fast, and accurate disease detection in three steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="relative p-6 rounded-lg border bg-background hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              Protect your crops with confidence
            </h2>
            <p className="text-muted-foreground">
              Our AI system analyzes multiple factors including leaf appearance, 
              weather conditions, and soil data to provide accurate disease predictions 
              and actionable recommendations.
            </p>
            <ul className="space-y-3">
              {BENEFITS.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button asChild>
              <Link to={user ? "/dashboard" : "/auth"}>
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="relative aspect-square rounded-lg border bg-muted/50 flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Leaf className="h-10 w-10 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Supporting Rice, Wheat, Maize, Cotton, and Tomato crops
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="container py-16 text-center space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Ready to protect your crops?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Join farmers using AI to detect and prevent crop diseases early.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Leaf className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">CropGuard</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 CropGuard. AI-Driven Crop Disease Prediction System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
