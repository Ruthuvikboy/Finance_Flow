
import React, { useState, useEffect } from "react";
import { Transaction } from "@/entities/Transaction";
import { User } from "@/entities/User";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  ArrowRight,
  Save,
  Percent,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Wallet,
  Home,
  ShoppingCart,
  Utensils,
  Fuel,
  CreditCard,
  Smartphone,
  Shield,
  Heart,
  PlayCircle,
  User as UserIcon,
  GraduationCap,
  AlertCircle
} from "lucide-react";

const EXPENSE_CATEGORIES = [
  { id: "housing", label: "Housing", icon: <Home className="h-4 w-4" />, color: "#38bdf8" }, // sky-400
  { id: "transportation", label: "Transportation", icon: <Fuel className="h-4 w-4" />, color: "#a3e635" }, // lime-400
  { id: "food", label: "Food", icon: <Utensils className="h-4 w-4" />, color: "#fb7185" }, // rose-400
  { id: "utilities", label: "Utilities", icon: <Smartphone className="h-4 w-4" />, color: "#60a5fa" }, // blue-400
  { id: "insurance", label: "Insurance", icon: <Shield className="h-4 w-4" />, color: "#c084fc" }, // purple-400
  { id: "healthcare", label: "Healthcare", icon: <Heart className="h-4 w-4" />, color: "#34d399" }, // emerald-400
  { id: "debt", label: "Debt Payments", icon: <CreditCard className="h-4 w-4" />, color: "#f87171" }, // red-400
  { id: "entertainment", label: "Entertainment", icon: <PlayCircle className="h-4 w-4" />, color: "#fbbf24" }, // amber-400
  { id: "personal", label: "Personal", icon: <UserIcon className="h-4 w-4" />, color: "#a78bfa" }, // violet-400
  { id: "education", label: "Education", icon: <GraduationCap className="h-4 w-4" />, color: "#4ade80" }, // green-400
  { id: "shopping", label: "Shopping", icon: <ShoppingCart className="h-4 w-4" />, color: "#f472b6" }, // pink-400
  { id: "other", label: "Other", icon: <AlertCircle className="h-4 w-4" />, color: "#94a3b8" } // slate-400
];

export default function BudgetingPage() {
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [savingTarget, setSavingTarget] = useState("");
  const [budgetType, setBudgetType] = useState("percentage");
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        setUserData(currentUser);

        let transactionsResult = [];
        if (currentUser && currentUser.email) {
          transactionsResult = await Transaction.filter({ created_by: currentUser.email }, "-date", 100);
        }
        setTransactions(transactionsResult);

        // Initialize form with user data
        setMonthlyIncome(currentUser.monthly_income?.toString() || "");
        setSavingTarget(currentUser.savings_rate?.toString() || "15");

        // Initialize category budgets from user data or defaults
        const initialBudgets = {};
        EXPENSE_CATEGORIES.forEach(category => {
          const savedBudget = currentUser[`budget_${category.id}`];
          if (savedBudget !== undefined) {
            initialBudgets[category.id] = savedBudget;
          } else {
            // Default values
            if (category.id === "housing") initialBudgets[category.id] = 30;
            else if (category.id === "food") initialBudgets[category.id] = 15;
            else if (category.id === "transportation") initialBudgets[category.id] = 10;
            else if (category.id === "utilities") initialBudgets[category.id] = 10;
            else initialBudgets[category.id] = 5;
          }
        });

        setCategoryBudgets(initialBudgets);

        // Set budget type based on user preference
        setBudgetType(currentUser.budget_type || "percentage");
      } catch (error) {
        console.error("Error loading data:", error);
        setTransactions([]); // Clear transactions on error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveChanges = async () => {
    setSavingChanges(true);
    try {
      const updateData = {
        monthly_income: parseFloat(monthlyIncome),
        savings_rate: parseFloat(savingTarget),
        budget_type: budgetType
      };

      // Add category budgets to update data
      Object.keys(categoryBudgets).forEach(category => {
        updateData[`budget_${category}`] = categoryBudgets[category];
      });

      await User.updateMyUserData(updateData);
      setUserData(prev => ({ ...prev, ...updateData }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving budget changes:", error);
    } finally {
      setSavingChanges(false);
    }
  };

  const calculateMonthlyExpenses = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyExpenses = {};
    let totalExpenses = 0;

    // Initialize with zeros
    EXPENSE_CATEGORIES.forEach(category => {
      monthlyExpenses[category.id] = 0;
    });

    // Sum up expenses by category
    transactions
      .filter(t =>
        new Date(t.date) >= firstDayOfMonth &&
        t.amount < 0 &&
        t.category !== "income"
      )
      .forEach(transaction => {
        const category = transaction.category || "other";
        const amount = Math.abs(transaction.amount);

        monthlyExpenses[category] = (monthlyExpenses[category] || 0) + amount;
        totalExpenses += amount;
      });

    return { monthlyExpenses, totalExpenses };
  };

  const getBudgetAmount = (category) => {
    if (budgetType === "percentage") {
      // If percentage, calculate dollar amount
      return (parseFloat(monthlyIncome) * categoryBudgets[category]) / 100;
    } else {
      // If absolute, return the dollar amount
      return categoryBudgets[category];
    }
  };

  const getBudgetPercentage = (category) => {
    if (budgetType === "percentage") {
      // If percentage, return the percentage
      return categoryBudgets[category];
    } else {
      // If absolute, calculate percentage
      return (categoryBudgets[category] / parseFloat(monthlyIncome)) * 100;
    }
  };

  const handleUpdateCategoryBudget = (category, value) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const { monthlyExpenses, totalExpenses } = calculateMonthlyExpenses(); // This uses the user-filtered transactions

  // Calculate remaining amounts for each category
  const getCategoryRemaining = (category) => {
    const budgetAmount = getBudgetAmount(category);
    const spent = monthlyExpenses[category] || 0;
    return budgetAmount - spent;
  };

  // Prepare data for charts
  const prepareBudgetVsActualData = () => {
    return EXPENSE_CATEGORIES.map(category => ({
      name: category.label,
      budget: Math.round(getBudgetAmount(category) * 100) / 100,
      actual: Math.round((monthlyExpenses[category.id] || 0) * 100) / 100,
      color: category.color
    }));
  };

  const preparePieChartData = () => {
    return EXPENSE_CATEGORIES.map(category => ({
      name: category.label,
      value: Math.round((monthlyExpenses[category.id] || 0) * 100) / 100,
      color: category.color
    })).filter(item => item.value > 0);
  };

  const budgetVsActualData = prepareBudgetVsActualData();
  const spendingByCategoryData = preparePieChartData();

  // Calculate total budget (excluding savings)
  const totalBudget = Object.keys(categoryBudgets).reduce((sum, category) => {
    return sum + getBudgetAmount(category);
  }, 0);

  // Check if budget exceeds income after savings
  const availableForBudget = parseFloat(monthlyIncome) * (1 - parseFloat(savingTarget) / 100);
  const isBudgetExceeded = totalBudget > availableForBudget;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">
            <span className="text-blue-600">Budget: ${payload[0].value.toFixed(2)}</span>
          </p>
          <p className="text-sm">
            <span className="text-orange-600">Actual: ${payload[1].value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex justify-center gap-8 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>

        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Budget Planner</h1>
          <p className="text-gray-500">Plan and track your monthly spending</p>
        </div>

        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Wallet className="h-4 w-4" />
            Edit Budget
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={savingChanges}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {savingChanges ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Budget Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Settings</CardTitle>
                  <CardDescription>Configure your monthly budget</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Budget Type */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="budget-type">Budget Type</Label>
                        <div className="flex mt-2">
                          <Tabs
                            value={budgetType}
                            onValueChange={setBudgetType}
                            className="w-full"
                            disabled={!isEditing}
                          >
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="percentage" className="gap-2">
                                <Percent className="h-4 w-4" />
                                Percentage
                              </TabsTrigger>
                              <TabsTrigger value="absolute" className="gap-2">
                                <DollarSign className="h-4 w-4" />
                                Dollar Amount
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="monthly-income">Monthly Income</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                          <Input
                            id="monthly-income"
                            type="number"
                            min="0"
                            placeholder="Enter your monthly income"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            className="pl-8"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="saving-target">Saving Target (%)</Label>
                        <div className="relative mt-2">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                          <Input
                            id="saving-target"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Enter saving percentage"
                            value={savingTarget}
                            onChange={(e) => setSavingTarget(e.target.value)}
                            className="pl-8"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Budget Summary */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Budget Summary</h3>

                      <div className="bg-gray-50 p-4 rounded-md space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Income:</span>
                          <span className="font-medium">${parseFloat(monthlyIncome || 0).toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Savings ({parseFloat(savingTarget || 0)}%):</span>
                          <span className="font-medium text-green-600">
                            ${((parseFloat(monthlyIncome || 0) * parseFloat(savingTarget || 0)) / 100).toFixed(2)}
                          </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between">
                          <span className="text-gray-600">Available for Expenses:</span>
                          <span className="font-medium">
                            ${availableForBudget.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Budgeted:</span>
                          <span className={`font-medium ${isBudgetExceeded ? 'text-red-600' : ''}`}>
                            ${totalBudget.toFixed(2)}
                          </span>
                        </div>

                        {isBudgetExceeded && (
                          <div className="text-red-600 text-sm flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Your budget exceeds your available income
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full gap-2"
                        onClick={() => setActiveTab("categories")}
                        variant="outline"
                      >
                        View Category Breakdown <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget vs. Actual */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Budget vs. Actual Spending</CardTitle>
                  <CardDescription>See how your actual spending compares to your budget</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={budgetVsActualData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="budget" name="Budget" fill="#3b82f6" />
                        <Bar dataKey="actual" name="Actual" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Budgets</CardTitle>
                  <CardDescription>
                    {budgetType === "percentage"
                      ? "Allocate your budget as percentages of your income"
                      : "Allocate specific dollar amounts for each category"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {EXPENSE_CATEGORIES.map((category) => {
                      const spent = monthlyExpenses[category.id] || 0;
                      const budgetAmount = getBudgetAmount(category.id);
                      const percentage = Math.min(100, (spent / budgetAmount) * 100 || 0);
                      const isOverBudget = spent > budgetAmount;

                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-1.5 rounded-full mr-2" style={{ backgroundColor: category.color + "30" }}>
                                {React.cloneElement(category.icon, {
                                  style: { color: category.color }
                                })}
                              </div>
                              <Label>{category.label}</Label>
                            </div>

                            <div className="flex items-center gap-3">
                              {isEditing ? (
                                <div className="flex items-center">
                                  {budgetType === "percentage" ? (
                                    <>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={categoryBudgets[category.id] || 0}
                                        onChange={(e) => handleUpdateCategoryBudget(category.id, e.target.value)}
                                        className="w-20 text-right"
                                      />
                                      <span className="ml-2">%</span>
                                    </>
                                  ) : (
                                    <>
                                      <DollarSign className="h-4 w-4 text-gray-500" />
                                      <Input
                                        type="number"
                                        min="0"
                                        value={categoryBudgets[category.id] || 0}
                                        onChange={(e) => handleUpdateCategoryBudget(category.id, e.target.value)}
                                        className="w-24 text-right"
                                      />
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-gray-500">
                                    {getBudgetPercentage(category.id).toFixed(1)}%
                                  </span>
                                  <span className="font-medium">
                                    ${budgetAmount.toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Progress
                              value={percentage}
                              className={isOverBudget ? "bg-red-100" : ""}
                            />
                            <div className="flex justify-between text-sm">
                              <span>
                                Spent: <span className="font-medium">${spent.toFixed(2)}</span>
                              </span>
                              <span className={isOverBudget ? "text-red-600" : "text-green-600"}>
                                {isOverBudget ? "Over by" : "Remaining"}: <span className="font-medium">
                                  ${Math.abs(getCategoryRemaining(category.id)).toFixed(2)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ANALYSIS TAB */}
          {activeTab === "analysis" && (
            <div className="space-y-6">
              {/* Spending by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>This month's actual spending breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={spendingByCategoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {spendingByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend layout="vertical" verticalAlign="middle" align="right" />
                          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Spending Summary</h3>

                      <div className="space-y-3">
                        {spendingByCategoryData.length > 0 ? (
                          spendingByCategoryData
                            .sort((a, b) => b.value - a.value)
                            .map((category, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: category.color }}
                                  ></div>
                                  <span>{category.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-gray-500">
                                    {((category.value / totalExpenses) * 100).toFixed(1)}%
                                  </span>
                                  <span className="font-medium">${category.value.toFixed(2)}</span>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            No spending data for this month yet
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total Spending:</span>
                          <span>${totalExpenses.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Insights */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-blue-600" />
                    <CardTitle>Budget Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-amber-50 border-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Top Spending Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {spendingByCategoryData
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 3)
                            .map((category, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: category.color }}
                                  ></div>
                                  <span className="text-sm">{category.name}</span>
                                </div>
                                <span className="font-medium">${category.value.toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Categories Over Budget</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {EXPENSE_CATEGORIES
                            .filter(cat => {
                              const spent = monthlyExpenses[cat.id] || 0;
                              const budget = getBudgetAmount(cat.id);
                              return spent > budget;
                            })
                            .slice(0, 3)
                            .map((category, index) => {
                              const spent = monthlyExpenses[category.id] || 0;
                              const budget = getBudgetAmount(category.id);
                              const overBy = spent - budget;

                              return (
                                <div key={index} className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div
                                      className="w-2 h-2 rounded-full mr-2"
                                      style={{ backgroundColor: category.color }}
                                    ></div>
                                    <span className="text-sm">{category.label}</span>
                                  </div>
                                  <span className="font-medium text-red-600">+${overBy.toFixed(2)}</span>
                                </div>
                              );
                            })}

                            {EXPENSE_CATEGORIES.filter(cat => {
                              const spent = monthlyExpenses[cat.id] || 0;
                              const budget = getBudgetAmount(cat.id);
                              return spent > budget;
                            }).length === 0 && (
                              <div className="text-center py-2 text-gray-500 text-sm">
                                No categories over budget - great job!
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-blue-50 border-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Budget Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                          <p className="text-sm">
                            {EXPENSE_CATEGORIES
                              .filter(cat => {
                                const spent = monthlyExpenses[cat.id] || 0;
                                const budget = getBudgetAmount(cat.id);
                                return spent > budget;
                              }).length > 0
                              ? "Consider adjusting your budget categories to better match your actual spending patterns."
                              : "Your budget is well-aligned with your spending patterns. Continue monitoring to maintain financial health."
                            }
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Wallet className="h-5 w-5 text-green-600 mt-0.5" />
                          <p className="text-sm">
                            {totalExpenses > availableForBudget
                              ? "Your spending exceeds your income after savings. Review your expenses or adjust your savings goal."
                              : `You're currently ${((availableForBudget - totalExpenses) / availableForBudget * 100).toFixed(1)}% under budget for the month. Consider putting extra funds toward savings or debt reduction.`
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
