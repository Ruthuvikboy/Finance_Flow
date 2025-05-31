import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, BrainCircuit, Calendar, AlertTriangle } from "lucide-react";

const priorityConfig = {
  low: {
    icon: <Lightbulb className="h-4 w-4" />,
    color: "bg-blue-50 text-blue-700 border-blue-100"
  },
  medium: {
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-amber-50 text-amber-700 border-amber-100"
  },
  high: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "bg-red-50 text-red-700 border-red-100"
  }
};

const categoryIcons = {
  spending: <TrendingUp className="h-5 w-5 text-blue-500" />,
  saving: <Lightbulb className="h-5 w-5 text-green-500" />,
  investing: <TrendingUp className="h-5 w-5 text-purple-500" />,
  debt: <AlertTriangle className="h-5 w-5 text-red-500" />,
  income: <TrendingUp className="h-5 w-5 text-emerald-500" />,
  general: <BrainCircuit className="h-5 w-5 text-gray-500" />
};

const InsightCard = ({ insight, onStatusChange }) => {
  const formattedDate = insight.date_generated
    ? new Date(insight.date_generated).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : '';

  const { icon, color } = priorityConfig[insight.priority_level] || priorityConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-l-4 hover:shadow-md transition-all duration-200"
            style={{ borderLeftColor: color.split(' ')[1].replace('text-', 'var(--') + ')' }}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {categoryIcons[insight.category]}
              <CardTitle className="text-lg font-semibold">{insight.title}</CardTitle>
            </div>
            <Badge className={`${color} border`}>
              {icon}
              <span className="ml-1">{insight.priority_level}</span>
            </Badge>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            {formattedDate}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-gray-700">{insight.content}</p>
        </CardContent>
        {insight.status !== 'implemented' && insight.status !== 'dismissed' && (
          <CardFooter className="pt-0 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(insight.id, 'dismissed')}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => onStatusChange(insight.id, 'implemented')}
            >
              Mark as Implemented
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default InsightCard;