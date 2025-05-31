
import React, { useState, useEffect } from "react";
import { Transaction } from "@/entities/Transaction";
import { User } from "@/entities/User";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  ArrowDownUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  CreditCard,
  Download,
  Plus,
  Search,
  Trash2,
  Edit,
  Filter,
} from "lucide-react";
import TransactionForm from "../components/transactions/TransactionForm";

const getTransactionIcon = (transaction) => {
  return transaction.amount > 0 ? (
    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
  ) : (
    <ArrowDownRight className="h-4 w-4 text-rose-500" />
  );
};

export default function TransactionsPage() {
  const [currentUser, setCurrentUser] = useState(null); // Store current user
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user && user.email) {
          const data = await Transaction.filter({ created_by: user.email });
          setTransactions(data);
        } else {
          setTransactions([]);
        }
      } catch (error)
      {
        console.error("Error initializing transactions page:", error);
        setTransactions([]);
      } finally
      {
        setLoading(false);
      }
    };
    initializePage();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, transactionType, categoryFilter, sortOrder, dateRange]);

  const loadUserTransactions = async () => {
    // This function is used to reload transactions after an operation
    setLoading(true);
    try {
      if (currentUser && currentUser.email) {
        const data = await Transaction.filter({ created_by: currentUser.email });
        setTransactions(data);
      } else {
        // Attempt to fetch user again if not available, e.g. after a refresh
        const user = await User.me();
        setCurrentUser(user);
        if (user && user.email) {
          const data = await Transaction.filter({ created_by: user.email });
          setTransactions(data);
        } else {
          setTransactions([]);
        }
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by transaction type
    if (transactionType === "income") {
      filtered = filtered.filter((t) => t.amount > 0);
    } else if (transactionType === "expense") {
      filtered = filtered.filter((t) => t.amount < 0);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Filter by date range
    if (dateRange) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
      });
    }

    // Sort transactions
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOrder === "highest") {
      filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    } else if (sortOrder === "lowest") {
      filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
    }

    setFilteredTransactions(filtered);
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        await Transaction.update(editingTransaction.id, transactionData);
      } else {
        await Transaction.create(transactionData);
      }
      setShowForm(false);
      setEditingTransaction(null);
      await loadUserTransactions(); // Use the new function
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await Transaction.delete(id);
        await loadUserTransactions(); // Use the new function
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ["Date", "Description", "Category", "Amount", "Payment Method", "Notes"];
    const csvRows = [headers];

    filteredTransactions.forEach((t) => {
      csvRows.push([
        format(new Date(t.date), "yyyy-MM-dd"),
        t.description || "",
        t.category || "",
        t.amount || 0,
        t.payment_method || "",
        t.notes || "",
      ]);
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals for the filtered transactions
  const totalIncome = filteredTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Transactions</h1>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={exportTransactions}
            className="gap-2"
            disabled={filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Income</p>
                <p className="text-xl font-bold text-emerald-600">
                  +${totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Expenses</p>
                <p className="text-xl font-bold text-rose-600">
                  -${totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-rose-100 rounded-full">
                <ArrowDownRight className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Net</p>
                <p
                  className={`text-xl font-bold ${
                    netAmount >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {netAmount >= 0 ? "+" : "-"}${Math.abs(netAmount).toFixed(2)}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  netAmount >= 0 ? "bg-emerald-100" : "bg-rose-100"
                }`}
              >
                {netAmount >= 0 ? (
                  <ArrowUpRight
                    className={`h-5 w-5 ${
                      netAmount >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  />
                ) : (
                  <ArrowDownRight
                    className={`h-5 w-5 ${
                      netAmount >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Tabs
            defaultValue="all"
            value={transactionType}
            onValueChange={setTransactionType}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="debt">Debt</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center">
                <ArrowDownUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Amount</SelectItem>
              <SelectItem value="lowest">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
              <div className="p-3 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(null)}
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium">No transactions found</h3>
              <p className="mt-2 text-gray-500">
                {transactions.length === 0
                  ? "Add your first transaction to get started"
                  : "Try adjusting your filters"}
              </p>
              {transactions.length === 0 && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.description}</div>
                        {transaction.notes && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {transaction.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize"
                        >
                          {transaction.category?.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          {getTransactionIcon(transaction)}
                          <span
                            className={`ml-1 font-medium ${
                              transaction.amount > 0
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm capitalize">
                            {transaction.payment_method?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
}
