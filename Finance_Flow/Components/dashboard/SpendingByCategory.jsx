import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_COLORS = {
  housing: "#38bdf8", // sky-400
  transportation: "#a3e635", // lime-400
  food: "#fb7185", // rose-400
  utilities: "#60a5fa", // blue-400
  insurance: "#c084fc", // purple-400
  healthcare: "#34d399", // emerald-400
  debt: "#f87171", // red-400
  entertainment: "#fbbf24", // amber-400
  personal: "#a78bfa", // violet-400
  education: "#4ade80", // green-400
  shopping: "#f472b6", // pink-400
  other: "#94a3b8" // slate-400
};

const CATEGORY_ICONS = {
  housing: "🏠",
  transportation: "🚗",
  food: "🍔",
  utilities: "💡",
  insurance: "🛡️",
  healthcare: "🏥",
  debt: "💳",
  entertainment: "🎬",
  personal: "👤",
  education: "🎓",
  shopping: "🛍️",
  other: "📦"
};

const SpendingByCategory = ({ transactions }) => {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filterTransactions = () => {
    const now = new Date();
    let cutoffDate;

    if (timeRange === "month") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeRange === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      cutoffDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else if (timeRange === "year") {
      cutoffDate = new Date(now.getFullYear(), 0, 1);
    }

    return transactions.filter(t =>
      new Date(t.date) >= cutoffDate &&
      t.amount < 0 &&
      t.category !== "income"
    );
  };

  const getCategoryData = () => {
    const filteredTransactions = filterTransactions();
    const categoryTotals = {};

    filteredTransactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += Math.abs(transaction.amount);
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: Math.round(amount * 100) / 100,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
      icon: CATEGORY_ICONS[category] || CATEGORY_ICONS.other
    }));
  };

  const categoryData = getCategoryData();
  const totalSpending = categoryData.reduce((total, item) => total + item.value, 0);

  const handleCategoryClick = (data) => {
    setSelectedCategory(selectedCategory === data.name ? null : data.name);
  };

  const getCategoryTransactions = () => {
    if (!selectedCategory) return [];

    return filterTransactions()
      .filter(t => t.category === selectedCategory)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const categoryTransactions = getCategoryTransactions();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTimeRangeLabel = () => {
    const now = new Date();
    if (timeRange === "month") {
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (timeRange === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `Q${quarter} ${now.getFullYear()}`;
    } else {
      return now.getFullYear().toString();
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="text-sm font-medium flex items-center">
            <span className="mr-1">{data.icon}</span>
            {data.name.replace(/_/g, ' ')}
          </p>
          <p className="text-sm font-bold">${data.value.toLocaleString()}</p>
          <p className="text-xs text-gray-500">
            {((data.value / totalSpending) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Spending by Category</CardTitle>
            <CardDescription>{getTimeRangeLabel()}</CardDescription>
          </div>
          <Tabs defaultValue="month" value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
              <TabsTrigger value="quarter" className="text-xs">Quarter</TabsTrigger>
              <TabsTrigger value="year" className="text-xs">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 h-[280px] flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={handleCategoryClick}
                    cursor="pointer"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={selectedCategory === entry.name ? "#000" : "none"}
                        strokeWidth={selectedCategory === entry.name ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">
                <p>No spending data for this period</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
            <div className="space-y-2">
              {categoryData.length > 0 ? (
                categoryData
                  .sort((a, b) => b.value - a.value)
                  .map((category) => (
                    <Button
                      key={category.name}
                      variant="ghost"
                      className={`w-full justify-between hover:bg-slate-50 ${
                        selectedCategory === category.name ? "bg-slate-100" : ""
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span className="capitalize">
                          {category.name.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">${category.value.toLocaleString()}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {((category.value / totalSpending) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </Button>
                  ))
              ) : (
                <p className="text-center text-gray-500 p-4">No categories to display</p>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedCategory && categoryTransactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  {CATEGORY_ICONS[selectedCategory] || CATEGORY_ICONS.other}
                  <span className="ml-2 capitalize">
                    {selectedCategory.replace(/_/g, ' ')} Transactions
                  </span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categoryTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-2 text-sm border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                      </div>
                      <div className="font-medium text-rose-600">
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SpendingByCategory;