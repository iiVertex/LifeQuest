import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Calendar, TrendingDown, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SavedBundle {
  id: string;
  bundle_name: string;
  selected_products: Array<{
    id: number;
    name: string;
    category: string;
    price: string;
  }>;
  original_price: string;
  bundle_discount_percent: string;
  bundle_discount_amount: string;
  pp_discount_percent: string;
  pp_discount_amount: string;
  pp_points_used: number;
  final_price: string;
  created_at: string;
  status: string;
}

const categoryIcons: Record<string, string> = {
  motor: "🚗",
  travel: "✈️",
  health: "🏥",
  home: "🏠",
  marine: "⛵",
};

export function SavedBundles() {
  const { user } = useAuth();

  const { data: bundles = [], isLoading } = useQuery<SavedBundle[]>({
    queryKey: [`/api/bundles/user/${user?.email}`],
    enabled: !!user?.email,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Saved Bundles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading bundles...</p>
        </CardContent>
      </Card>
    );
  }

  if (bundles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Saved Bundles
          </CardTitle>
          <CardDescription>
            Save insurance bundles to track your protection plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              No saved bundles yet. Create your first bundle above to get started!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Your Saved Bundles
        </CardTitle>
        <CardDescription>
          {bundles.length} bundle{bundles.length > 1 ? 's' : ''} saved
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bundles.map((bundle) => (
          <Card key={bundle.id} className="bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{bundle.bundle_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(bundle.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={bundle.status === 'active' ? 'default' : 'secondary'}
                    className={bundle.status === 'active' ? 'bg-green-600' : ''}
                  >
                    {bundle.status}
                  </Badge>
                </div>

                {/* Products */}
                <div className="flex flex-wrap gap-2">
                  {bundle.selected_products.map((product, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      <span className="mr-1">{categoryIcons[product.category]}</span>
                      {product.name}
                    </Badge>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original Price:</span>
                    <span className="line-through">{parseFloat(bundle.original_price).toFixed(0)} QAR</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      Bundle Discount ({parseFloat(bundle.bundle_discount_percent).toFixed(0)}%):
                    </span>
                    <span>-{parseFloat(bundle.bundle_discount_amount).toFixed(0)} QAR</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-purple-600">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      PP Discount ({parseFloat(bundle.pp_discount_percent).toFixed(0)}%):
                    </span>
                    <span>-{parseFloat(bundle.pp_discount_amount).toFixed(0)} QAR</span>
                  </div>
                  
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-semibold">Final Price:</span>
                    <span className="text-xl font-bold text-purple-600">
                      {parseFloat(bundle.final_price).toFixed(0)} QAR
                    </span>
                  </div>
                  
                  <div className="text-xs text-center text-muted-foreground pt-1">
                    Used {bundle.pp_points_used} Protection Points
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
