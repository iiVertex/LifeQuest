import { useState } from 'react';
import { useUser } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, TrendingDown, TrendingUp, ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimulationResult {
  scenarios: string[];
  recommended_plans: RecommendedPlan[];
  best_plan: RecommendedPlan | null;
  narrative: string;
  lifescore_impact: number;
  severity_score: number;
  risk_level: 'low' | 'medium' | 'high';
  protection_points_spent: number;
  simulated_at: string;
}

interface RecommendedPlan {
  plan_id: string;
  plan_name: string;
  insurance_type: string;
  relevance_score: number;
  scenario_logic: string;
  plan_scenarios: PlanScenario[];
}

interface PlanScenario {
  scenario: string;
  feature: string;
  lifescore_with_coverage: number;
  lifescore_without_coverage: number;
  severity: number;
}

const QUICK_SCENARIOS = [
  { label: 'Road trip (car)', category: 'motor', text: 'Family road trip to Salwa in June; new SUV within 3 years, want agency repairs and GCC cover.' },
  { label: 'Schengen winter (travel)', category: 'travel', text: 'Planning a Schengen trip in May; need visa-compliant cover and baggage protection.' },
  { label: 'New apartment (home)', category: 'home', text: 'Moving to new apartment, need contents coverage for furniture and electronics.' },
  { label: 'Umrah trip', category: 'travel', text: 'Planning Umrah trip in December, need medical coverage and trip cancellation insurance.' },
];

export function AISimulator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  
  const userId = authUser?.email || "";
  const { data: user } = useUser(userId);
  
  const [scenarioText, setScenarioText] = useState('');
  const [category, setCategory] = useState('auto');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const simulateMutation = useMutation({
    mutationFn: async (payload: { userId: string; scenarioDescription: string; category?: string }) => {
      const response = await fetch('/api/smart-advisor/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Simulation failed');
      }

      const data = await response.json();
      return data.data as SimulationResult;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: 'Simulation Complete',
        description: `${data.protection_points_spent} PP spent • ${data.scenarios.length} scenarios analyzed`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Simulation Failed',
        description: error.message,
      });
    },
  });

  const handleSimulate = () => {
    if (!userId || !scenarioText.trim()) return;
    
    simulateMutation.mutate({
      userId: userId,
      scenarioDescription: scenarioText,
      category: category === 'auto' ? undefined : category,
    });
  };

  const handleQuickFill = (scenario: typeof QUICK_SCENARIOS[0]) => {
    setScenarioText(scenario.text);
    setCategory(scenario.category);
  };

  const extractLifeScoreImpact = (scenario: string): number => {
    const match = scenario.match(/-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Describe your insurance scenario and get personalized recommendations
          </p>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="motor">Car Insurance</SelectItem>
                <SelectItem value="travel">Travel Insurance</SelectItem>
                <SelectItem value="health">Health Insurance</SelectItem>
                <SelectItem value="home">Home Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Describe your scenario or plan</label>
            <Textarea
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              placeholder="e.g., Planning a Schengen trip in May; need visa-compliant cover and baggage protection."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_SCENARIOS.map((scenario, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill(scenario)}
              >
                {scenario.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSimulate}
            disabled={!scenarioText.trim() || simulateMutation.isPending}
            className="w-full"
          >
            {simulateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Simulate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Scenarios */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-green-600" />
                Real-Life Scenarios: How This Protects You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.scenarios.map((scenario, idx) => {
                const cleanScenario = scenario.replace(/- LifeScore impact:.*$/i, '').trim();
                const impact = extractLifeScoreImpact(scenario);
                
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          {idx + 1}. Accident Scenario (null-Relevant)
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mb-3">
                          {cleanScenario}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mb-3">
                          Savings: Not specified. Without insurance, you'd face substantial out-of-pocket expenses.
                        </div>
                        
                        {result.best_plan?.plan_scenarios?.[idx] && (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-green-600 dark:text-green-400 mb-1">With Coverage:</div>
                              <div className="flex items-center gap-1 text-green-700 dark:text-green-300 font-semibold">
                                <TrendingUp className="w-4 h-4" />
                                +{result.best_plan.plan_scenarios[idx].lifescore_with_coverage}
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400">Protected from loss</div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Without Coverage:</div>
                              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                                <TrendingDown className="w-4 h-4" />
                                {result.best_plan.plan_scenarios[idx].lifescore_without_coverage}
                              </div>
                              <div className="text-xs text-red-600 dark:text-red-400">Potential loss</div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-green-600 dark:text-green-400 mb-1">Net Benefit:</div>
                              <div className="flex items-center gap-1 text-green-700 dark:text-green-300 font-bold text-lg">
                                +{result.best_plan.plan_scenarios[idx].lifescore_with_coverage + 
                                   Math.abs(result.best_plan.plan_scenarios[idx].lifescore_without_coverage)}
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400">LifeScore saved</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Best Plan */}
          {result.best_plan && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Recommended Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-bold text-lg mb-2">{result.best_plan.plan_name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {result.best_plan.scenario_logic}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Add to Cart
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Get Quote
                    </Button>
                    <Button size="sm" variant="ghost">
                      Explore
                    </Button>
                  </div>
                </div>

                {result.narrative && (
                  <p className="text-sm text-muted-foreground italic border-l-4 border-primary pl-4">
                    {result.narrative}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
