import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Users,
  Copy,
  Share2,
  Trophy,
  Crown,
  Award,
  Gift,
  Coins,
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUser, useReferralInfo, useLeaderboard, useRedeemPoints } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/translation-provider";
import { BundleCalculator } from "@/components/bundle-calculator";

const tierConfig = {
  bronze: {
    icon: Award,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  silver: {
    icon: Trophy,
    color: "text-gray-600",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/20",
  },
  gold: {
    icon: Crown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  platinum: {
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
};

export default function Rewards() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [showAllReferrals, setShowAllReferrals] = useState(false);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<"global" | "friends">("global");
  const [redeemAmount, setRedeemAmount] = useState(50);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState<"rewards" | "social">("rewards");

  const userId = authUser?.email || "user-123";
  const { data: user } = useUser(userId);
  const { data: referralData, isLoading: referralLoading } = useReferralInfo(userId);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard(selectedLeaderboard, userId);
  const redeemMutation = useRedeemPoints();
  
  // Get the actual user ID for comparison
  const currentUserId = (user as any)?.id;

  const handleCopyCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    }
  };

  const handleShare = () => {
    const shareText = `Join LifeQuest with my referral code ${referralData?.referralCode} and we both get bonus points!`;
    if (navigator.share) {
      navigator.share({ title: "Join LifeQuest", text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: "Copied!", description: "Share message copied to clipboard" });
    }
  };

  if (referralLoading) {
    return (
      <div className="min-h-screen pb-24 p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentPP = (user as any)?.life_protection_score || 0;
  const pointsAfterRedeem = currentPP - redeemAmount;
  const coinsToReceive = redeemAmount * 2;

  const handleRedeem = () => {
    if (!currentPP || currentPP < redeemAmount) {
      toast({
        title: "Insufficient Points",
        description: `You need ${redeemAmount} PP to redeem this reward`,
        variant: "destructive",
      });
      return;
    }

    redeemMutation.mutate(
      { userId, points: redeemAmount },
      {
        onSuccess: (data) => {
          toast({
            title: "Success!",
            description: `Redeemed ${redeemAmount} PP for ${data.coinsAwarded} QIC Coins!`,
          });
        },
        onError: () => {
          toast({
            title: "Redemption Failed",
            description: "Please try again later",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getTierIcon = (tier: string) => {
    const config = tierConfig[tier as keyof typeof tierConfig];
    if (!config) return Award;
    return config.icon;
  };

  const getTierColor = (tier: string) => {
    const config = tierConfig[tier as keyof typeof tierConfig];
    if (!config) return "text-gray-600";
    return config.color;
  };

  return (
    <div className="min-h-screen pb-24 p-4 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header with PP Balance */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Rewards
          </h1>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90 mb-2">Your Protection Points</p>
            <p className="text-5xl font-bold">{currentPP} PP</p>
            <p className="text-sm opacity-75 mt-2">Use points for discounts & rewards</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "rewards" | "social")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">
              <Gift className="h-4 w-4 mr-2" />
              My Rewards
            </TabsTrigger>
            <TabsTrigger value="social">
              <Users className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Rewards Tab (Bundle, Redeem) */}
          <TabsContent value="rewards" className="space-y-6 mt-6">
            {/* Bundle & Save Section */}
            <BundleCalculator />

        {/* Redeem Points Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-bold">Redeem Points</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[50, 100, 200].map((amount) => (
                <Card
                  key={amount}
                  className={`p-4 cursor-pointer transition-all ${
                    redeemAmount === amount
                      ? "border-primary bg-primary/5 shadow-md"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setRedeemAmount(amount as 50 | 100 | 200)}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold">{amount} PP</div>
                    <div className="text-xs text-muted-foreground">↓</div>
                    <div className="text-lg font-semibold text-yellow-600">{amount * 2} Coins</div>
                    {redeemAmount === amount && (
                      <Check className="h-5 w-5 mx-auto text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current PP:</span>
                <span className="font-medium">{currentPP}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Redeeming:</span>
                <span className="font-medium text-red-600">-{redeemAmount}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">After Redemption:</span>
                <span className="font-bold">{pointsAfterRedeem} PP</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium text-yellow-600">You'll Receive:</span>
                <span className="font-bold text-yellow-600">{coinsToReceive} QIC Coins</span>
              </div>
            </div>

            <Button
              onClick={handleRedeem}
              className="w-full"
              disabled={currentPP < redeemAmount || redeemMutation.isPending}
            >
              {redeemMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Redeem {redeemAmount} PP for {coinsToReceive} Coins
                </>
              )}
            </Button>

            {currentPP < redeemAmount && (
              <Alert>
                <AlertDescription className="text-center">
                  You need {redeemAmount - currentPP} more PP to redeem this reward
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
          </TabsContent>

          {/* Social Tab (Invite Friends, Leaderboard) */}
          <TabsContent value="social" className="space-y-6 mt-6">
        {/* Referral Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Invite Friends</h2>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center space-y-3">
              <div className="text-3xl font-bold tracking-wider text-primary">
                {referralData?.referralCode || "LOADING..."}
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleCopyCode} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button onClick={handleShare} variant="default" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Referral Rewards Info */}
            <Alert className="bg-blue-50 border-blue-200">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>Earn Referral Points:</strong> First friend = 50 PP, then 5 PP for each additional friend
              </AlertDescription>
            </Alert>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{referralData?.referralCount || 0}</div>
                <div className="text-sm text-muted-foreground">Friends Referred</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {referralData?.referralCount ? (50 + (referralData.referralCount - 1) * 5) : 0} PP
                </div>
                <div className="text-sm text-muted-foreground">Referral Points Earned</div>
              </Card>
            </div>

            {/* Referred Friends List */}
            {referralData?.referredUsers && referralData.referredUsers.length > 0 && (
              <Collapsible open={showAllReferrals} onOpenChange={setShowAllReferrals}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Your Friends</h3>
                    {referralData.referredUsers.length > 5 && (
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {showAllReferrals ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Show More
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>

                  <div className="space-y-2">
                    {referralData.referredUsers.slice(0, 5).map((friend: any) => {
                      const TierIcon = getTierIcon(friend.tier);
                      const tierColor = getTierColor(friend.tier);
                      return (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{friend.name}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TierIcon className={`h-3 w-3 ${tierColor}`} />
                                <span className="capitalize">{friend.tier}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">{friend.points} PP</div>
                          </div>
                        </div>
                      );
                    })}

                    <CollapsibleContent>
                      {referralData.referredUsers.slice(5).map((friend: any) => {
                        const TierIcon = getTierIcon(friend.tier);
                        const tierColor = getTierColor(friend.tier);
                        return (
                          <div
                            key={friend.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mt-2"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{friend.name}</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <TierIcon className={`h-3 w-3 ${tierColor}`} />
                                  <span className="capitalize">{friend.tier}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">{friend.points} PP</div>
                            </div>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </div>
                </div>
              </Collapsible>
            )}
          </div>
        </Card>

          {/* Leaderboard Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-bold">Leaderboard</h2>
            </div>

            <Tabs value={selectedLeaderboard} onValueChange={(v) => setSelectedLeaderboard(v as "global" | "friends")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="global">Qatar Top 5</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
              </TabsList>

              <TabsContent value="global" className="space-y-2 mt-4">
                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : !leaderboardData?.topUsers || leaderboardData.topUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No users on the leaderboard yet.</p>
                    <p className="text-sm mt-1">Be the first to earn points!</p>
                  </div>
                ) : (
                  <>
                    {leaderboardData.topUsers.slice(0, showAllLeaderboard ? undefined : 5).map((entry: any, index: number) => {
                      const TierIcon = getTierIcon(entry.tier);
                      const tierColor = getTierColor(entry.tier);
                      const isCurrentUser = entry.id === currentUserId;
                      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;

                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            isCurrentUser 
                              ? "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border-2 border-primary shadow-md" 
                              : "bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 text-center font-bold">
                              {medal || `#${index + 1}`}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {entry.name}
                                {isCurrentUser && <Badge variant="secondary" className="text-xs bg-primary text-white">You</Badge>}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TierIcon className={`h-3 w-3 ${tierColor}`} />
                                <span className="capitalize">{entry.tier}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">{entry.points} PP</div>
                          </div>
                        </div>
                      );
                    })}

                    {leaderboardData.topUsers.length > 5 && (
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                      >
                        {showAllLeaderboard ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show More ({leaderboardData.topUsers.length - 5} more)
                          </>
                        )}
                      </Button>
                    )}

                    {leaderboardData?.userRank && leaderboardData.userRank > 20 && (
                      <Alert className="mt-4">
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          You're ranked #{leaderboardData.userRank} in Qatar. Keep earning points to reach the top 20!
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="friends" className="space-y-2 mt-4">
                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : leaderboardData?.topUsers && leaderboardData.topUsers.length > 0 ? (
                  leaderboardData.topUsers.map((entry: any, index: number) => {
                    const TierIcon = getTierIcon(entry.tier);
                    const tierColor = getTierColor(entry.tier);
                    const isCurrentUser = entry.id === currentUserId;

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          isCurrentUser 
                            ? "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border-2 border-primary shadow-md" 
                            : "bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 text-center font-bold">#{index + 1}</div>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {entry.name}
                              {isCurrentUser && <Badge variant="secondary" className="text-xs bg-primary text-white">You</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <TierIcon className={`h-3 w-3 ${tierColor}`} />
                              <span className="capitalize">{entry.tier}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{entry.points} PP</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      No friends yet. Share your referral code to invite friends!
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
