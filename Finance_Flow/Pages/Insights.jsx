
import React, { useState, useEffect } from "react";
import { FinancialInsight } from "@/entities/FinancialInsight";
import { InvokeLLM } from "@/integrations/Core";
import { Transaction } from "@/entities/Transaction";
import { FinancialGoal } from "@/entities/FinancialGoal";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BrainCircuit, ArrowRight, Sparkles, RefreshCcw, Filter } from "lucide-react";
import InsightCard from "../components/insights/InsightCard";

export default function InsightsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user && user.email) {
          const data = await FinancialInsight.filter({ created_by: user.email }, "-date_generated");
          setInsights(data);
        } else {
          setInsights([]);
        }
      } catch (error) {
        console.error("Error loading insights:", error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };
    initializePage();
  }, []);

  const loadUserInsights = async () => {
    setLoading(true);
    try {
      if (currentUser && currentUser.email) {
        const data = await FinancialInsight.filter({ created_by: currentUser.email }, "-date_generated");
        setInsights(data);
      } else {
        const user = await User.me();
        setCurrentUser(user);
        if (user && user.email) {
           const data = await FinancialInsight.filter({ created_by: user.email }, "-date_generated");
           setInsights(data);
        } else {
          setInsights([]);
        }
      }
    } catch (error) {
      console.error("Error reloading insights:", error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInsightStatus = async (id, status) => {
    try {
      await FinancialInsight.update(id, { status });
      setInsights(prevInsights =>
        prevInsights.map(insight =>
          insight.id === id ? { ...insight, status } : insight
        )
      );
    } catch (error) {
      console.error("Error updating insight status:", error);
    }
  };

  const generateNewInsight = async () => {
    setGeneratingInsight(true);
    try {
      if (!currentUser || !currentUser.email) {
        console.error("Cannot generate insight: user not loaded.");
        // Optionally, try to load user again if not available
        const user = await User.me();
        setCurrentUser(user);
        if(!user || !user.email) {
            setGeneratingInsight(false);
            return;
        }
      }

      const [transactionsResult, goalsResult] = await Promise.all([
        Transaction.filter({ created_by: currentUser.email }, "-date", 100),
        FinancialGoal.filter({ created_by: currentUser.email }),
      ]);

      const financialData = {
        transactions: transactionsResult,
        goals: goalsResult,
        userData: { // User data for context, not for filtering as created_by will be set automatically
          monthlyIncome: currentUser.monthly_income || 0,
          financialLiteracyLevel: currentUser.financial_literacy_level || "beginner",
          riskTolerance: currentUser.risk_tolerance || "moderate"
        }
      };

      // Generate insight using AI
      const result = await InvokeLLM({
        prompt: `You are a financial advisor assistant for the Finance Flow app. Based on the user's financial data, generate ONE meaningful and actionable financial insight.
                
                Here's the user's financial data:
                ${JSON.stringify(financialData)}
                
                Create a financial insight with the following attributes:
                - title: A short, attention-grabbing title
                - content: A detailed explanation that is helpful and actionable (2-3 sentences)
                - category: Choose one from ["spending", "saving", "investing", "debt", "income", "general"]
                - priority_level: Choose one from ["low", "medium", "high"] based on importance
                
                Return ONLY a JSON object with these fields, with no additional explanation.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            category: { type: "string", enum: ["spending", "saving", "investing", "debt", "income", "general"] },
            priority_level: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: ["title", "content", "category", "priority_level"]
        }
      });

      // Create the insight
      const insightData = {
        ...result,
        date_generated: new Date().toISOString().split('T')[0],
        status: "new"
      };

      await FinancialInsight.create(insightData); // created_by will be auto-added
      await loadUserInsights();
    } catch (error) {
      console.error("Error generating insight:", error);
    } finally {
      setGeneratingInsight(false);
    }
  };

  const filterInsights = () => {
    let filtered = [...insights];

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(insight => insight.status === activeTab);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(insight => insight.category === categoryFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(insight => insight.priority_level === priorityFilter);
    }

    return filtered;
  };

  const filteredInsights = filterInsights();

  const getNewInsightsCount = () => {
    return insights.filter(insight => insight.status === "new").length;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Insights</h1>
          <p className="text-gray-500">AI-powered suggestions to improve your finances</p>
        </div>
        <Button
          onClick={generateNewInsight}
          disabled={generatingInsight}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {generatingInsight ? (
            <>
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Insight
            </>
          )}
        </Button>
      </div>

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-blue-800">New Insights</p>
              <p className="text-2xl font-bold mt-1">{getNewInsightsCount()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-none">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-purple-800">Implemented</p>
              <p className="text-2xl font-bold mt-1">
                {insights.filter(i => i.status === "implemented").length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-none">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-amber-800">High Priority</p>
              <p className="text-2xl font-bold mt-1">
                {insights.filter(i => i.priority_level === "high").length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <BrainCircuit className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">
              New
              {getNewInsightsCount() > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {getNewInsightsCount()}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="implemented">Implemented</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="spending">Spending</SelectItem>
              <SelectItem value="saving">Saving</SelectItem>
              <SelectItem value="investing">Investing</SelectItem>
              <SelectItem value="debt">Debt</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Insights Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInsights.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BrainCircuit className="h-12 w-12 text-gray-300 mb-4" />
            <CardTitle className="text-xl mb-2">No insights found</CardTitle>
            <p className="text-gray-500 mb-6 max-w-md">
              {insights.length === 0
                ? "Generate your first financial insight to get personalized recommendations"
                : "There are no insights matching the selected filters"}
            </p>
            {insights.length === 0 && (
              <Button
                onClick={generateNewInsight}
                disabled={generatingInsight}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Insight
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredInsights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <InsightCard
                  insight={insight}
                  onStatusChange={handleUpdateInsightStatus}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Featured Insight */}
      {!loading && insights.length > 0 && filteredInsights.length > 0 && (
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Pro Tip: Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="text-gray-800">
              A good financial health strategy combines emergency savings, strategic debt reduction, and consistent investment. Aim to build an emergency fund covering 3-6 months of expenses while paying down high-interest debt, then focus on long-term investments in diverse assets aligned with your risk tolerance.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setActiveTab("high")}
              >
                View High Priority Insights <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
