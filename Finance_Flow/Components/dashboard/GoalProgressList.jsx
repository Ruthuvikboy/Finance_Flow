import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Target, ChevronRight, Calendar, PiggyBank, Home, GraduationCap, Plane, Wallet, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryIcons = {
  emergency_fund: <Shield className="h-4 w-4 text-amber-500" />,
  debt_repayment: <Wallet className="h-4 w-4 text-red-500" />,
  retirement: <PiggyBank className="h-4 w-4 text-emerald-500" />,
  major_purchase: <Target className="h-4 w-4 text-blue-500" />,
  education: <GraduationCap className="h-4 w-4 text-purple-500" />,
  travel: <Plane className="h-4 w-4 text-sky-500" />,
  home: <Home className="h-4 w-4 text-indigo-500" />,
  other: <Target className="h-4 w-4 text-gray-500" />
};

const GoalProgressList = ({ goals, onViewAllClick }) => {
  const sortedGoals = [...goals]
    .filter(goal => goal.status !== "completed")
    .sort((a, b) => {
      // Prioritize in-progress goals
      if (a.status === "in_progress" && b.status !== "in_progress") return -1;
      if (b.status === "in_progress" && a.status !== "in_progress") return 1;

      // Then sort by progress percentage
      const aProgress = (a.current_amount / a.target_amount) * 100;
      const bProgress = (b.current_amount / b.target_amount) * 100;
      return bProgress - aProgress;
    })
    .slice(0, 3); // Only show top 3

  const getTimeRemaining = (deadline) => {
    if (!deadline) return "No deadline";

    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getProgressColor = (goal) => {
    const progress = (goal.current_amount / goal.target_amount) * 100;
    if (progress > 75) return "success";
    if (progress > 35) return "primary";
    return "warning";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Financial Goals</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllClick} className="h-8 gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {sortedGoals.length > 0 ? (
            <div className="space-y-4">
              {sortedGoals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <ProgressCircle
                      value={progress}
                      color={getProgressColor(goal)}
                      size="sm"
                      thickness={4}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {categoryIcons[goal.category] || categoryIcons.other}
                        <h3 className="font-medium text-sm truncate">{goal.title}</h3>
                      </div>

                      <div className="flex justify-between mb-1.5 text-sm">
                        <span>${goal.current_amount.toLocaleString()}</span>
                        <span className="text-gray-500">of ${goal.target_amount.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {getTimeRemaining(goal.deadline)} remaining
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Target className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500 mb-4">No financial goals set yet</p>
              <Button
                onClick={onViewAllClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Goal
              </Button>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default GoalProgressList;