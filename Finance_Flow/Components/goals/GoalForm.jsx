import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Target, Shield, Wallet, PiggyBank, GraduationCap, Plane, Home } from "lucide-react";

const GoalForm = ({ isOpen, onClose, onSave, goal }) => {
  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    current_amount: "0",
    category: "emergency_fund",
    deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    notes: "",
    status: "not_started"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || "",
        target_amount: goal.target_amount ? goal.target_amount.toString() : "",
        current_amount: goal.current_amount ? goal.current_amount.toString() : "0",
        category: goal.category || "emergency_fund",
        deadline: goal.deadline ? new Date(goal.deadline) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        notes: goal.notes || "",
        status: goal.status || "not_started"
      });
    } else {
      resetForm();
    }
  }, [goal, isOpen]);

  const resetForm = () => {
    setFormData({
      title: "",
      target_amount: "",
      current_amount: "0",
      category: "emergency_fund",
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      notes: "",
      status: "not_started"
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Please enter a title";
    }

    if (!formData.target_amount || isNaN(formData.target_amount) || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = "Please enter a valid target amount";
    }

    if (isNaN(formData.current_amount)) {
      newErrors.current_amount = "Please enter a valid current amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSave({
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount || 0),
      deadline: format(formData.deadline, "yyyy-MM-dd")
    });

    onClose();
  };

  const categoryIcons = {
    emergency_fund: <Shield className="h-4 w-4" />,
    debt_repayment: <Wallet className="h-4 w-4" />,
    retirement: <PiggyBank className="h-4 w-4" />,
    major_purchase: <Target className="h-4 w-4" />,
    education: <GraduationCap className="h-4 w-4" />,
    travel: <Plane className="h-4 w-4" />,
    home: <Home className="h-4 w-4" />,
    other: <Target className="h-4 w-4" />
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {goal ? "Edit Financial Goal" : "Add Financial Goal"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="What are you saving for?"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="target_amount">Target Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="target_amount"
                value={formData.target_amount}
                onChange={(e) => handleChange("target_amount", e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            {errors.target_amount && <p className="text-sm text-red-500">{errors.target_amount}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="current_amount">Current Amount (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="current_amount"
                value={formData.current_amount}
                onChange={(e) => handleChange("current_amount", e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            {errors.current_amount && <p className="text-sm text-red-500">{errors.current_amount}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Goal Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency_fund">
                  <div className="flex items-center">
                    {categoryIcons.emergency_fund}
                    <span className="ml-2">Emergency Fund</span>
                  </div>
                </SelectItem>
                <SelectItem value="debt_repayment">
                  <div className="flex items-center">
                    {categoryIcons.debt_repayment}
                    <span className="ml-2">Debt Repayment</span>
                  </div>
                </SelectItem>
                <SelectItem value="retirement">
                  <div className="flex items-center">
                    {categoryIcons.retirement}
                    <span className="ml-2">Retirement</span>
                  </div>
                </SelectItem>
                <SelectItem value="major_purchase">
                  <div className="flex items-center">
                    {categoryIcons.major_purchase}
                    <span className="ml-2">Major Purchase</span>
                  </div>
                </SelectItem>
                <SelectItem value="education">
                  <div className="flex items-center">
                    {categoryIcons.education}
                    <span className="ml-2">Education</span>
                  </div>
                </SelectItem>
                <SelectItem value="travel">
                  <div className="flex items-center">
                    {categoryIcons.travel}
                    <span className="ml-2">Travel</span>
                  </div>
                </SelectItem>
                <SelectItem value="home">
                  <div className="flex items-center">
                    {categoryIcons.home}
                    <span className="ml-2">Home</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center">
                    {categoryIcons.other}
                    <span className="ml-2">Other</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline">Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => handleChange("deadline", date || new Date())}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {goal && (
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add any additional notes about your goal..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2 bg-blue-600 hover:bg-blue-700">
            {goal ? "Update" : "Create"} Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoalForm;