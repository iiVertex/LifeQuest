import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

interface InsurancePlan {
  id: number;
  name: string;
  category: string;
  base_price: string;
  description: string;
}

interface BundleQuote {
  products: InsurancePlan[];
  originalPrice: number;
  bundleDiscountPercent: number;
  bundleDiscountAmount: number;
  priceAfterBundleDiscount: number;
  ppDiscountPercent: number;
  ppDiscountAmount: number;
  ppPointsToUse: number;
  finalPrice: number;
  userProtectionScore: number;
}

export function BundleCalculator() {
  const { user: authUser } = useAuth();
  const { data: user } = useUser(authUser?.email || "");
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Fetch insurance plans
  const { data: insurancePlans = [], isLoading: plansLoading } = useQuery<InsurancePlan[]>({
    queryKey: ["/api/bundles/insurance-plans"],
  });

  const handleProductToggle = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleGetEstimate = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one insurance product.",
        variant: "destructive",
      });
      return;
    }

    // Get selected products
    const selectedPlans = insurancePlans.filter((plan: InsurancePlan) => 
      selectedProducts.includes(plan.id)
    );

    // Generate CSV with better formatting
    const csvRows = [
      ["Bundle & Save Estimate - LifeQuest by QIC", "", ""],
      ["", "", ""],
      ["SELECTED PRODUCTS", "", ""],
      ["Product Name", "", "Price (QAR/mo)"],
      ...selectedPlans.map(p => [p.name, "", p.base_price]),
      ["", "", ""],
      ["", "", ""],
      ["PRICING BREAKDOWN", "", ""],
      ["", "", ""],
      ["Subtotal:", "", `${subtotal.toFixed(0)} QAR/mo`],
      ["", "", ""],
      ["Bundle Discount:", "", `${bundleDiscountPercent}%`],
      ["Points Discount:", "", `${pointsDiscountPercent}%`],
      ["Total Discount:", "", `${totalDiscount}%`],
      ["", "", ""],
      ["", "", ""],
      ["SAVINGS BREAKDOWN", "", ""],
      ["", "", ""],
      ["Bundle savings:", "", `${bundleSavings.toFixed(0)} QAR/month`],
      ["Points savings:", "", `${pointsSavings.toFixed(0)} QAR/month`],
      ["Total savings:", "", `${totalSavings.toFixed(0)} QAR/month`],
      ["", "", ""],
      ["", "", ""],
      ["FINAL PRICE", "", ""],
      ["Total after savings:", "", `${totalAfterSavings.toFixed(0)} QAR/mo`],
      ["", "", ""],
      ["", "", ""],
      ["YOUR ACCOUNT", "", ""],
      ["Protection Score:", "", `${userProtectionScore} points`],
      ["", "", ""],
      ["", "", ""],
      [`Generated on ${new Date().toLocaleString()}`, "", ""],
    ];

    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bundle-estimate-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Estimate Generated",
      description: "Your bundle estimate has been downloaded as CSV.",
    });
  };

  const handleSaveBundle = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one insurance product.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate points to deduct (10 points per 1% discount)
    const pointsToDeduct = pointsDiscountPercent * 10;
    
    toast({
      title: "Bundle Saved!",
      description: `Saved with ${totalDiscount}% discount. ${pointsToDeduct} Protection Points deducted.`,
    });
  };

  // Calculate pricing
  const subtotal = insurancePlans
    .filter((plan: InsurancePlan) => selectedProducts.includes(plan.id))
    .reduce((sum, plan) => sum + parseFloat(plan.base_price), 0);

  const productCount = selectedProducts.length;

  // Bundle discount based on number of products
  let bundleDiscountPercent = 0;
  if (productCount === 2) bundleDiscountPercent = 10;
  else if (productCount === 3) bundleDiscountPercent = 15;
  else if (productCount >= 4) bundleDiscountPercent = 20;

  // Points discount (1% per 10 points, max 20%)
  const userProtectionScore = (user as any)?.life_protection_score || 0;
  const pointsDiscountPercent = Math.min(Math.floor(userProtectionScore / 10), 20);

  console.log('Bundle Calculator - Protection Score:', userProtectionScore, 'Points Discount:', pointsDiscountPercent + '%');

  // Calculate savings
  const bundleSavings = (subtotal * bundleDiscountPercent) / 100;
  const pointsSavings = (subtotal * pointsDiscountPercent) / 100;
  const totalSavings = bundleSavings + pointsSavings;
  const totalDiscount = bundleDiscountPercent + pointsDiscountPercent;
  const totalAfterSavings = subtotal - totalSavings;

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-xl">💰</span>
          <div>
            <h3 className="font-semibold text-yellow-900">Transform Your Protection Points Into Real Value</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Your effort deserves real rewards. Redeem your hard-earned protection points for exclusive discounts, bundle deals, and special offers on QIC insurance products. Create custom insurance bundles that match your needs while saving money—every point you earn brings you closer to comprehensive protection that fits your lifestyle and budget. Start saving today!
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Bundle & Save</h2>
          
          {plansLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <div className="space-y-3">
              {insurancePlans.map((plan: InsurancePlan) => (
                <div key={plan.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`plan-${plan.id}`}
                    checked={selectedProducts.includes(plan.id)}
                    onCheckedChange={() => handleProductToggle(plan.id)}
                  />
                  <Label
                    htmlFor={`plan-${plan.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {plan.name} — {parseFloat(plan.base_price).toFixed(0)} QAR/mo
                  </Label>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">{subtotal.toFixed(0)} QAR/mo</span>
            </div>

            {selectedProducts.length > 0 && (
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bundle Discount:</span>
                  <span>{bundleDiscountPercent}%</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span>Points Discount:</span>
                  <span>{pointsDiscountPercent}%</span>
                </div>
                <div className="flex justify-between font-semibold text-yellow-600">
                  <span>Total Discount:</span>
                  <span>{totalDiscount}%</span>
                </div>
                
                <div className="border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bundle savings:</span>
                    <span>{bundleSavings.toFixed(0)} QAR/month</span>
                  </div>
                  <div className="flex justify-between text-yellow-600">
                    <span>Points savings:</span>
                    <span>{pointsSavings.toFixed(0)} QAR/month</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total savings:</span>
                    <span>{totalSavings.toFixed(0)} QAR/month</span>
                  </div>
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total after savings:</span>
                    <span>{totalAfterSavings.toFixed(0)} QAR/mo</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                disabled={selectedProducts.length === 0}
                onClick={handleGetEstimate}
              >
                Get Estimate
              </Button>
              <Button
                disabled={selectedProducts.length === 0}
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSaveBundle}
              >
                Save {totalDiscount}%
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
