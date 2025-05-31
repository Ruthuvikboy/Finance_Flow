
import React, { useState, useEffect } from "react";
import { FinancialGoal } from "@/entities/FinancialGoal";
import { User } from "@/entities/User";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { format, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Shield, Wallet, PiggyBank, Home, GraduationCap, Plane, Plus, Edit, Calendar, Trash2, CheckCircle2 } from "lucide-react";
import GoalForm from "../components/goals/GoalForm";

const categoryIcons = {
  emergency_fund: <Shield className="h-5 w-5 text-amber-500" />,
  debt_repayment: <Wallet className="h-5 w-5 text-red-500" />,
  retirement: <PiggyBank className="h-5 w-5 text-emerald-500" />,
  major_purchase: <Target className="h-5 w-5 text-blue-500" />,
  education: <GraduationCap className="h-5 w-5 text-purple-500" />,
  travel: <Plane className="h-5 w-5 text-sky-500" />,
  home: <Home className="h-5 w-5 text-indigo-500" />,
  other: <Target className="h-5 w-5 text-gray-500" />
};

export default function GoalsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState("in_progress");

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user && user.email) {
          const data = await FinancialGoal.filter({ created_by: user.email });
          setGoals(data);
        } else {
          setGoals([]);
        }
      } catch (error) {
        console.error("Error loading goals:", error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };
    initializePage();
  }, []);

  const loadUserGoals = async () => {
    setLoading(true);
    try {
      if (currentUser && currentUser.email) {
        const data = await FinancialGoal.filter({ created_by: currentUser.email });
        setGoals(data);
      } else {
         const user = await User.me();
        setCurrentUser(user);
        if (user && user.email) {
          const data = await FinancialGoal.filter({ created_by: user.email });
          setGoals(data);
        } else {
          setGoals([]);
        }
      }
    } catch (error) {
      console.error("Error reloading goals:", error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (goalData) => {
    try {
      if (editingGoal) {
        await FinancialGoal.update(editingGoal.id, goalData);
      } else {
        await FinancialGoal.create(goalData);
      }
      setShowForm(false);
      setEditingGoal(null);
      await loadUserGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await FinancialGoal.delete(id);
        await loadUserGoals();
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  const handleUpdateGoalStatus = async (id, status) => {
    try {
      await FinancialGoal.update(id, { status });
      await loadUserGoals();
    } catch (error) {
      console.error("Error updating goal status:", error);
    }
  };

  const filterGoalsByStatus = (status) => {
    if (status === "all") return goals;
    return goals.filter(goal => goal.status === status);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "success";
    if (percentage >= 40) return "primary";
    return "warning";
  };

  const formatTimeLeft = (deadline) => {
    if (!deadline) return "No deadline";

    const today = new Date();
    const deadlineDate = new Date(deadline);

    if (deadlineDate < today) return "Overdue";

    const days = differenceInDays(deadlineDate, today);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 30) return `${days} days left`;

    const months = differenceInMonths(deadlineDate, today);
    if (months < 12) return `${months} months left`;

    const years = differenceInYears(deadlineDate, today);
    return `${years} years left`;
  };

  const filteredGoals = filterGoalsByStatus(activeTab);

  // Calculate total progress for user-specific goals
  const totalTargetAmount = goals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const totalProgressPercentage = totalTargetAmount > 0
    ? Math.min(100, (totalCurrentAmount / totalTargetAmount) * 100)
    : 0;

  // In progress goals
  const inProgressGoals = goals.filter(goal => goal.status === "in_progress");
  const inProgressCount = inProgressGoals.length;
  const completedGoals = goals.filter(goal => goal.status === "completed");
  const completedCount = completedGoals.length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className="text-gray-500">Track and manage your saving goals</p>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null);
            setShowForm(true);
          }}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="mr-4">
                <ProgressCircle
                  value={totalProgressPercentage}
                  color="primary"
                  size="md"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Overall Progress</h3>
                <p className="text-2xl font-bold">${totalCurrentAmount.toLocaleString()} <span className="text-sm text-gray-500">/ ${totalTargetAmount.toLocaleString()}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-4 rounded-full bg-amber-100 mr-4">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Goals</h3>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-4 rounded-full bg-emerald-100 mr-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completed Goals</h3>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Goals</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="not_started">Not Started</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGoals.length === 0 ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-gray-300 mb-4" />
              <CardTitle className="text-xl mb-2">No goals found</CardTitle>
              <p className="text-gray-500 mb-6 max-w-md">
                {goals.length === 0
                  ? "Start by creating your first financial goal"
                  : "There are no goals matching the selected filter"}
              </p>
              {goals.length === 0 && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredGoals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const timeLeft = formatTimeLeft(goal.deadline);
                const progressColor = getProgressColor(progress);

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`
                      ${goal.status === "completed" ? "bg-green-50" : ""}
                      ${goal.status === "not_started" ? "bg-gray-50" : ""}
                      hover:shadow-md transition-shadow
                    `}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {categoryIcons[goal.category] || categoryIcons.other}
                            <CardTitle>{goal.title}</CardTitle>
                          </div>
                          <Badge variant={goal.status === "completed" ? "success" : "outline"}>
                            {goal.status === "in_progress" && "In Progress"}
                            {goal.status === "not_started" && "Not Started"}
                            {goal.status === "completed" && "Completed"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 pb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xl font-bold">${goal.current_amount.toLocaleString()}</span>
                          <span className="text-gray-500">of ${goal.target_amount.toLocaleString()}</span>
                        </div>

                        <Progress value={progress} className="h-2 mb-4" />

                        <div className="flex items-center text-sm text-gray-500 mt-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          {goal.deadline ? (
                            <span className={timeLeft === "Overdue" ? "text-red-500" : ""}>
                              {timeLeft} ({format(new Date(goal.deadline), "MMM d, yyyy")})
                            </span>
                          ) : (
                            <span>No deadline set</span>
                          )}
                        </div>

                        {goal.notes && (
                          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {goal.notes}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-end gap-2">
                        {goal.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateGoalStatus(goal.id, "completed")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Goal Form */}
      <GoalForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />
    </div>
  );
}
