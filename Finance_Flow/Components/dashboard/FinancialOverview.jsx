
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { DollarSign, PiggyBank, TrendingUp, CreditCard, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/components/ui/currency-formatter";

const FinancialOverview = ({ monthlyIncome, totalExpenses, savingsRate, currency = "USD" }) => {
  const savingsAmount = monthlyIncome * (savingsRate / 100);
  const remainingBudget = monthlyIncome - totalExpenses;
  const isNegativeBudget = remainingBudget < 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Monthly Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="rounded-full w-8 h-8 bg-blue-100 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(monthlyIncome, currency)}</div>
              <div className="text-xs text-gray-500">After taxes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-rose-700">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="rounded-full w-8 h-8 bg-rose-100 flex items-center justify-center mr-3">
              <CreditCard className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses, currency)}</div>
              <div className="text-xs text-gray-500">
                {Math.round((totalExpenses / monthlyIncome) * 100)}% of income
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700">Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="rounded-full w-8 h-8 bg-emerald-100 flex items-center justify-center mr-3">
              <PiggyBank className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(savingsAmount, currency)}</div>
              <div className="text-xs text-gray-500">{savingsRate}% of income</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isNegativeBudget ? 'bg-gradient-to-br from-red-50 to-orange-50' : 'bg-gradient-to-br from-violet-50 to-purple-50'} border-none shadow-sm`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-sm font-medium ${isNegativeBudget ? 'text-red-700' : 'text-violet-700'}`}>Remaining Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className={`rounded-full w-8 h-8 ${isNegativeBudget ? 'bg-red-100' : 'bg-violet-100'} flex items-center justify-center mr-3`}>
              {isNegativeBudget ? (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-violet-600" />
              )}
            </div>
            <div>
              <div className={`text-2xl font-bold ${isNegativeBudget ? 'text-red-600' : ''}`}>
                {formatCurrency(Math.abs(remainingBudget), currency)}
              </div>
              <div className="text-xs text-gray-500">
                {isNegativeBudget ? 'Over budget' : 'Available'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
