import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import {
  LayoutDashboard,
  Receipt,
  Target,
  Wallet,
  Lightbulb,
  GraduationCap,
  PiggyBank,
  Settings,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  LogIn
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setUserData(user);
      } catch (error) {
        console.error("Not authenticated", error);
        // We don't redirect here since the platform will handle authentication
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await User.logout();
      setUserData(null);
      // The platform will handle redirection
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const handleLogin = async () => {
    try {
      await User.login();
      // The login method will redirect to Google
    } catch (error) {
      console.error("Error during login", error);
    }
  };

  const navigation = [
    { name: "Dashboard", href: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { name: "Transactions", href: createPageUrl("Transactions"), icon: Receipt },
    { name: "Goals", href: createPageUrl("Goals"), icon: Target },
    { name: "Budgeting", href: createPageUrl("Budgeting"), icon: Wallet },
    { name: "Insights", href: createPageUrl("Insights"), icon: Lightbulb },
    { name: "Learn", href: createPageUrl("Learn"), icon: GraduationCap }
  ];

  const initials = userData?.full_name
    ? userData.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
            <Link to={createPageUrl("Dashboard")} className="flex items-center space-x-2">
              <PiggyBank className="h-7 w-7 text-white" />
              <span className="text-white font-semibold text-lg">Finance Flow</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  currentPageName === item.name
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    currentPageName === item.name ? "text-blue-500" : "text-gray-400"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="border-t p-4">
            {!loading && userData ? (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{userData.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate(createPageUrl("Profile"));
                    }}
                  >
                    <UserIcon className="h-4 w-4 mr-1" />
                    Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Log out
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <div className="animate-pulse flex space-x-3">
                <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("min-h-screen", "lg:pl-64")}>
        {/* Mobile header */}
        <header className="sticky top-0 z-10 lg:hidden bg-white border-b px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-2">
            <PiggyBank className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-lg">Finance Flow</span>
          </div>
          <div className="w-6"></div> {/* Empty div for centering */}
        </header>

        {/* Main content area */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}