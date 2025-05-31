
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRound, Mail, DollarSign, Sparkles, Save, Settings, PiggyBank, Bell, Check, HelpCircle, CreditCard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [savingsRate, setSavingsRate] = useState("");
  const [financialLiteracyLevel, setFinancialLiteracyLevel] = useState("beginner");
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [currency, setCurrency] = useState("USD");

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [saveTransactionDrafts, setSaveTransactionDrafts] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await User.me();
        setUserData(user);

        // Initialize form with user data
        if (user) {
          const nameparts = user.full_name ? user.full_name.split(' ') : ['', ''];
          setFirstName(user.first_name || nameparts[0] || '');
          setLastName(user.last_name || nameparts.slice(1).join(' ') || '');
          setMonthlyIncome(user.monthly_income?.toString() || '');
          setSavingsRate(user.savings_rate?.toString() || '10');
          setFinancialLiteracyLevel(user.financial_literacy_level || 'beginner');
          setRiskTolerance(user.risk_tolerance || 'moderate');
          setCurrency(user.currency || 'USD');

          // Preferences
          setEmailNotifications(user.preferences?.email_notifications !== false);
          setWeeklyReports(user.preferences?.weekly_reports !== false);
          setSaveTransactionDrafts(user.preferences?.save_transaction_drafts !== false);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Build user data update object
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        monthly_income: parseFloat(monthlyIncome) || 0,
        savings_rate: parseFloat(savingsRate) || 10,
        financial_literacy_level: financialLiteracyLevel,
        risk_tolerance: riskTolerance,
        currency,
        preferences: {
          email_notifications: emailNotifications,
          weekly_reports: weeklyReports,
          save_transaction_drafts: saveTransactionDrafts
        }
      };

      // Update user data
      await User.updateMyUserData(updateData);

      // Update local state
      setUserData(prev => ({
        ...prev,
        ...updateData
      }));

      // Show success message
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const initials = userData?.full_name
    ? userData.full_name.split(' ').map(name => name[0]).join('')
    : "U";

  return (
    <div className="max-w-3xl mx-auto p-6 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="text-gray-500">{userData?.email}</p>
          </div>
        </div>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info" className="gap-2">
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">Personal Info</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financial Profile</span>
            <span className="sm:hidden">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
            <span className="sm:hidden">Prefs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="text-gray-500 h-4 w-4" />
                  <span className="text-gray-700">{userData?.email}</span>
                </div>
                <p className="text-sm text-gray-500">Email address cannot be changed</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Set details about your financial situation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Income & Savings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly-income">Monthly Income (After Tax)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <Input
                        id="monthly-income"
                        type="number"
                        min="0"
                        placeholder="Enter your monthly income"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="savings-rate">Monthly Savings Target (%)</Label>
                    <div className="relative">
                      <PiggyBank className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <Input
                        id="savings-rate"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Percentage of income to save"
                        value={savingsRate}
                        onChange={(e) => setSavingsRate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Recommended: 15-20% of your income</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                        <SelectItem value="AUD">AUD ($)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Profile</h3>
                <p className="text-sm text-gray-500">This information helps us personalize recommendations for you</p>

                <div className="space-y-2">
                  <Label htmlFor="financial-literacy">Financial Literacy Level</Label>
                  <Select
                    value={financialLiteracyLevel}
                    onValueChange={setFinancialLiteracyLevel}
                  >
                    <SelectTrigger id="financial-literacy">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        <div className="flex items-center">
                          <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Beginner</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center">
                          <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                          <span>Intermediate</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center">
                          <Sparkles className="mr-2 h-4 w-4 text-emerald-500" />
                          <span>Advanced</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Risk Tolerance</Label>
                  <RadioGroup
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conservative" id="conservative" />
                      <Label htmlFor="conservative" className="font-normal">Conservative - I prefer stability over higher returns</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate" />
                      <Label htmlFor="moderate" className="font-normal">Moderate - I seek a balance between stability and growth</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="aggressive" id="aggressive" />
                      <Label htmlFor="aggressive" className="font-normal">Aggressive - I prioritize growth and can tolerate volatility</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize how Finance Flow works for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive important alerts and updates via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-reports" className="text-base">Weekly Financial Reports</Label>
                      <p className="text-sm text-gray-500">Get a summary of your finances each week</p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={weeklyReports}
                      onCheckedChange={setWeeklyReports}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data & Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="save-drafts" className="text-base">Save Transaction Drafts</Label>
                      <p className="text-sm text-gray-500">Automatically save partially completed transactions</p>
                    </div>
                    <Switch
                      id="save-drafts"
                      checked={saveTransactionDrafts}
                      onCheckedChange={setSaveTransactionDrafts}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account</h3>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="justify-start gap-2 text-left">
                    <HelpCircle className="h-4 w-4" />
                    Get Help
                  </Button>
                  <Button variant="outline" className="justify-start gap-2 text-left">
                    <CreditCard className="h-4 w-4" />
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
