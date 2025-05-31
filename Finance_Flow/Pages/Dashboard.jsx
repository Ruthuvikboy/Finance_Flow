
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Transaction } from "@/entities/Transaction";
import { FinancialGoal } from "@/entities/FinancialGoal";
import { FinancialInsight } from "@/entities/FinancialInsight";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Sparkles, Plus, ArrowRight, Bell, Wallet, ArrowUpRight, DollarSign } from "lucide-react";

// Components
import FinancialOverview from "../components/dashboard/FinancialOverview";
import SpendingByCategory from "../components/dashboard/SpendingByCategory";
import GoalProgressList from "../components/dashboard/GoalProgressList";
import TransactionList from "../components/dashboard/TransactionList";
import InsightCard from "../components/insights/InsightCard";
import AssistantChat from "../components/financial-assistant/AssistantChat";
import TransactionForm from "../components/transactions/TransactionForm";
import { formatCurrency } from "@/components/ui/currency-formatter";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        setUserData(currentUser);

        if (currentUser && currentUser.email) {
          const [transactionsResult, goalsResult, insightsResult] = await Promise.all([
            Transaction.filter({ created_by: currentUser.email }, "-date", 50),
            FinancialGoal.filter({ created_by: currentUser.email }, "-created_date"),
            FinancialInsight.filter({ created_by: currentUser.email }, "-date_generated", 3)
          ]);

          setTransactions(transactionsResult);
          setGoals(goalsResult);
          setInsights(insightsResult);
        } else {
          // Not authenticated or user email not available, clear data
          setTransactions([]);
          setGoals([]);
          setInsights([]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Errors (like not being logged in) should be handled by the Layout,
        // but clear data as a fallback.
        setTransactions([]);
        setGoals([]);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Financial calculations
  const getMonthlyIncome = () => {
    if (!userData?.monthly_income) return 5000; // Default value
    return userData.monthly_income;
  };

  const getMonthlyExpenses = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions
      .filter(t =>
        new Date(t.date) >= firstDayOfMonth &&
        t.amount < 0
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getMonthlyIncomeTrend = () => {
    // Get income from this month's transactions
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate total income from transactions (positive amounts)
    const actualIncome = transactions
      .filter(t =>
        new Date(t.date) >= firstDayOfMonth &&
        t.amount > 0
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Compare to monthly income setting
    const targetIncome = getMonthlyIncome();
    const percentage = ((actualIncome / targetIncome) * 100).toFixed(0);

    return {
      actual: actualIncome,
      target: targetIncome,
      percentage: percentage
    };
  };

  const getSavingsRate = () => {
    return userData?.savings_rate || 15; // Default saving rate
  };

  const getRecentTransactions = () => {
    return transactions.slice(0, 5);
  };

  const handleUpdateInsightStatus = async (id, status) => {
    try {
      await FinancialInsight.update(id, { status });
      // Update the local insights state
      setInsights(prevInsights =>
        prevInsights.map(insight =>
          insight.id === id ? { ...insight, status } : insight
        )
      );
    } catch (error) {
      console.error("Error updating insight status:", error);
    }
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      await Transaction.create(transactionData); // created_by is auto-added
      // Re-fetch user-specific transactions
      if (userData && userData.email) {
        const updatedTransactions = await Transaction.filter({ created_by: userData.email }, "-date", 50);
        setTransactions(updatedTransactions);
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  const incomeTrend = getMonthlyIncomeTrend();

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="animate-pulse flex space-x-4 items-center">
            <div className="rounded-full bg-slate-200 h-12 w-12"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 border-2 border-white mr-4">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-blue-400 text-white">
                  {userData?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {userData?.first_name || userData?.full_name?.split(' ')[0] || "there"}!
                </h1>
                <p className="mt-1 text-blue-100">
                  Here's an overview of your finances
                </p>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0">
              <Button
                className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setShowTransactionForm(true)}
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Financial overview */}
        <FinancialOverview
          monthlyIncome={getMonthlyIncome()}
          totalExpenses={getMonthlyExpenses()}
          savingsRate={getSavingsRate()}
          currency={userData?.currency || "USD"}
        />

        {/* Income Progress Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-medium mb-1">Monthly Income Progress</h3>
                <p className="text-sm text-gray-600 mb-4">Income recorded vs. expected monthly income</p>

                <div className="flex items-center mb-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-2" />
                  <span className="font-medium">{formatCurrency(incomeTrend.actual, userData?.currency)}</span>
                  <span className="mx-2 text-gray-400">of</span>
                  <span className="text-gray-600">{formatCurrency(incomeTrend.target, userData?.currency)} target</span>
                </div>

                <div className="h-2 bg-blue-100 rounded-full w-full mb-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{width: `${Math.min(100, incomeTrend.percentage)}%`}}
                  ></div>
                </div>

                <div className="text-sm text-gray-600">
                  {incomeTrend.percentage}% of expected income this month
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowTransactionForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Record Income
                </Button>

                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate(createPageUrl("Profile"))}
                >
                  <DollarSign className="h-4 w-4" />
                  Update Income Target
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            </TabsList>

            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => navigate(createPageUrl("Insights"))}
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
                {insights.filter(i => i.status === 'new').length > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {insights.filter(i => i.status === 'new').length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SpendingByCategory transactions={transactions} />
                <TransactionList
                  transactions={getRecentTransactions()}
                  onViewAllClick={() => navigate(createPageUrl("Transactions"))}
                  onAddClick={() => setShowTransactionForm(true)}
                />
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <GoalProgressList
                    goals={goals}
                    onViewAllClick={() => navigate(createPageUrl("Goals"))}
                  />
                </motion.div>

                {insights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-medium">Financial Insights</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(createPageUrl("Insights"))}
                            className="h-8 gap-1"
                          >
                            View All <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {insights.slice(0, 1).map(insight => (
                            <InsightCard
                              key={insight.id}
                              insight={insight}
                              onStatusChange={handleUpdateInsightStatus}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.length > 0 ? (
                insights.map(insight => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onStatusChange={handleUpdateInsightStatus}
                  />
                ))
              ) : (
                <div className="col-span-3">
                  <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Sparkles className="h-12 w-12 text-gray-300 mb-4" />
                      <CardTitle className="text-xl mb-2">No Financial Insights Yet</CardTitle>
                      <p className="text-gray-500 mb-6 max-w-md">
                        As you add more transactions and set goals, we'll generate personalized insights to help you improve your finances.
                      </p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowTransactionForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction Data
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assistant" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AssistantChat
                  userFinancialData={{
                    monthlyIncome: getMonthlyIncome(),
                    financialLiteracyLevel: userData?.financial_literacy_level || "beginner",
                    riskTolerance: userData?.risk_tolerance || "moderate"
                  }}
                />
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-blue-500" />
                      Financial Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
                      <p className="text-xl font-bold">{formatCurrency(getMonthlyIncome(), userData?.currency)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
                      <p className="text-xl font-bold">{formatCurrency(getMonthlyExpenses(), userData?.currency)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
                      <p className="text-xl font-bold">{getSavingsRate()}%</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Active Goals</h3>
                      <p className="text-xl font-bold">{goals.filter(g => g.status !== 'completed').length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSave={handleSaveTransaction}
      />
    </div>
  );
}
