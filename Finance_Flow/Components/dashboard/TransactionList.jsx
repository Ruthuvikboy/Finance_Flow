
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  ShoppingCart,
  Coffee,
  Utensils,
  Fuel,
  CreditCard,
  Heart,
  Briefcase,
  Plane,
  Smartphone,
  PenSquare
} from "lucide-react";

const CATEGORY_ICONS = {
  housing: <Home className="h-4 w-4" />,
  transportation: <Fuel className="h-4 w-4" />,
  food: <Utensils className="h-4 w-4" />,
  utilities: <Smartphone className="h-4 w-4" />,
  insurance: <Shield className="h-4 w-4" />,
  healthcare: <Heart className="h-4 w-4" />,
  debt: <CreditCard className="h-4 w-4" />,
  entertainment: <Play className="h-4 w-4" />,
  personal: <User className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  shopping: <ShoppingCart className="h-4 w-4" />,
  income: <Briefcase className="h-4 w-4" />,
  other: <CreditCard className="h-4 w-4" />
};

import {
  Play,
  User,
  Shield,
  GraduationCap
} from "lucide-react";

const PAYMENT_METHOD_ICONS = {
  credit_card: <CreditCard className="h-4 w-4" />,
  debit_card: <CreditCard className="h-4 w-4" />,
  cash: <Wallet className="h-4 w-4" />,
  bank_transfer: <ArrowUpRight className="h-4 w-4" />,
  mobile_payment: <Smartphone className="h-4 w-4" />,
  other: <PenSquare className="h-4 w-4" />
};

import { Wallet } from "lucide-react";
import { formatCurrency } from "@/components/ui/currency-formatter";

const TransactionList = ({ transactions, onViewAllClick, onAddClick, currency = "USD" }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={onAddClick}
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={onViewAllClick}
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length > 0 ? (
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="px-4 py-3 flex items-center hover:bg-slate-50 transition-colors">
                <div className="mr-3 p-2 rounded-full bg-slate-100">
                  {CATEGORY_ICONS[transaction.category] || CATEGORY_ICONS.other}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{transaction.description}</p>
                    <p className={`font-semibold ${transaction.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), currency)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="capitalize text-xs font-normal text-gray-500 bg-transparent border-gray-200"
                      >
                        {transaction.category.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                    </div>

                    {transaction.payment_method && (
                      <div className="flex items-center text-xs text-gray-500">
                        {PAYMENT_METHOD_ICONS[transaction.payment_method] || PAYMENT_METHOD_ICONS.other}
                        <span className="ml-1 capitalize">{transaction.payment_method.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <CreditCard className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-500 mb-4">No transactions yet</p>
            <Button
              onClick={onAddClick}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Transaction
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
