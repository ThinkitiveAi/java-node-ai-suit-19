import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      </div>

      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Construction className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{description}</p>
          <p className="text-sm text-muted-foreground">
            This page is currently under development. Please continue prompting to help build out this feature.
          </p>
          <Link to="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
