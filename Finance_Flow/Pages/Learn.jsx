
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InvokeLLM } from "@/integrations/Core";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown"; // Import ReactMarkdown
import {
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  PlayCircle,
  ArrowRight,
  Clock,
  Star,
  FileText,
  Lightbulb,
  Sparkles,
  Flame,
  Trophy,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  LineChart,
  BarChart3,
  PieChart,
  Umbrella,
  CalendarClock,
  DollarSign,
  HomeIcon,
  ShieldCheck
} from "lucide-react";

// Sample financial topics data
const FINANCIAL_TOPICS = [
  {
    id: "basics",
    title: "Financial Basics",
    description: "Introduction to personal finance fundamentals",
    icon: <BookOpen className="h-6 w-6" />,
    color: "bg-blue-100 text-blue-600",
    levels: [
      {
        id: "budgeting",
        title: "Budgeting",
        description: "Learn how to create and maintain a budget",
        icon: <Wallet className="h-5 w-5" />
      },
      {
        id: "saving",
        title: "Saving Strategies",
        description: "Building emergency funds and savings habits",
        icon: <PiggyBank className="h-5 w-5" />
      },
      {
        id: "credit",
        title: "Understanding Credit",
        description: "How credit works and managing your score",
        icon: <CreditCard className="h-5 w-5" />
      }
    ]
  },
  {
    id: "investing",
    title: "Investing",
    description: "Grow your wealth through investing",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "bg-green-100 text-green-600",
    levels: [
      {
        id: "investment_basics",
        title: "Investment Basics",
        description: "Introduction to investment concepts",
        icon: <LineChart className="h-5 w-5" />
      },
      {
        id: "stocks_bonds",
        title: "Stocks & Bonds",
        description: "Understanding equity and debt markets",
        icon: <BarChart3 className="h-5 w-5" />
      },
      {
        id: "portfolio",
        title: "Portfolio Management",
        description: "Building and managing your investment portfolio",
        icon: <PieChart className="h-5 w-5" />
      }
    ]
  },
  {
    id: "retirement",
    title: "Retirement Planning",
    description: "Prepare for a secure financial future",
    icon: <Umbrella className="h-6 w-6" />,
    color: "bg-purple-100 text-purple-600",
    levels: [
      {
        id: "retirement_basics",
        title: "Retirement Basics",
        description: "Introduction to retirement planning",
        icon: <CalendarClock className="h-5 w-5" />
      },
      {
        id: "retirement_accounts",
        title: "Retirement Accounts",
        description: "Understanding 401(k)s, IRAs, and more",
        icon: <DollarSign className="h-5 w-5" />
      },
      {
        id: "retirement_strategies",
        title: "Retirement Strategies",
        description: "Advanced planning for retirement",
        icon: <ShieldCheck className="h-5 w-5" />
      }
    ]
  },
  {
    id: "homeownership",
    title: "Homeownership",
    description: "Navigate the process of buying and owning a home",
    icon: <HomeIcon className="h-6 w-6" />,
    color: "bg-amber-100 text-amber-600",
    levels: [
      {
        id: "home_buying",
        title: "Home Buying Process",
        description: "Steps to purchase your first home",
        icon: <HomeIcon className="h-5 w-5" />
      },
      {
        id: "mortgages",
        title: "Understanding Mortgages",
        description: "Types of home loans and how they work",
        icon: <FileText className="h-5 w-5" />
      },
      {
        id: "home_equity",
        title: "Home Equity",
        description: "Using your home's value as a financial tool",
        icon: <DollarSign className="h-5 w-5" />
      }
    ]
  }
];

export default function LearnPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState("basics");
  const [activeTab, setActiveTab] = useState("explore");
  const [progress, setProgress] = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState("");
  const [loadingLesson, setLoadingLesson] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await User.me();
        setUserData(user);

        // Initialize progress from user data or set defaults
        const savedProgress = user.learning_progress || {};
        setProgress(savedProgress);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLessonSelect = async (topicId, lessonId) => {
    setLoadingLesson(true);
    setCurrentLesson({ topicId, lessonId });

    try {
      // Find the topic and lesson
      const topic = FINANCIAL_TOPICS.find(t => t.id === topicId);
      const lesson = topic.levels.find(l => l.id === lessonId);

      // Generate lesson content using AI
      const result = await InvokeLLM({
        prompt: `Create an educational lesson about "${lesson.title}" for a personal finance learning platform.
                
                Target audience: Someone interested in improving their financial literacy.
                Topic description: ${lesson.description}
                
                Structure the lesson with:
                1. Introduction to the concept
                2. Key principles or ideas (3-5 points)
                3. Practical tips or applications
                4. Summary
                
                Make it conversational, clear, and actionable. Length should be around 500 words.
                Use markdown formatting for headings, bullet points, etc. This content will be rendered as Markdown.`,
        add_context_from_internet: true
      });

      // Update lesson content
      setLessonContent(result);

      // Update progress
      const newProgress = { ...progress };
      if (!newProgress[topicId]) {
        newProgress[topicId] = { completed: [], inProgress: lessonId };
      } else {
        if (!newProgress[topicId].completed?.includes(lessonId)) { // Ensure 'completed' is an array
          newProgress[topicId].inProgress = lessonId;
        }
      }

      setProgress(newProgress);

      // Save progress to user data
      await User.updateMyUserData({ learning_progress: newProgress });

    } catch (error) {
      console.error("Error loading lesson:", error);
      setLessonContent("Sorry, there was an error loading the lesson content. Please try again.");
    } finally {
      setLoadingLesson(false);
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      const { topicId, lessonId } = currentLesson;

      // Update progress
      const newProgress = { ...progress };
      if (!newProgress[topicId]) {
        newProgress[topicId] = { completed: [lessonId], inProgress: null };
      } else {
        if (!newProgress[topicId].completed) { // Initialize completed array if it doesn't exist
            newProgress[topicId].completed = [];
        }
        if (!newProgress[topicId].completed.includes(lessonId)) {
          newProgress[topicId].completed.push(lessonId);
        }
        if (newProgress[topicId].inProgress === lessonId) {
          newProgress[topicId].inProgress = null;
        }
      }

      setProgress(newProgress);

      // Save progress to user data
      await User.updateMyUserData({ learning_progress: newProgress });

    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    }
  };

  const getTopicProgress = (topicId) => {
    if (!progress[topicId] || !progress[topicId].completed) return 0; // Check for completed array

    const topic = FINANCIAL_TOPICS.find(t => t.id === topicId);
    const totalLessons = topic.levels.length;
    const completedLessons = progress[topicId].completed?.length || 0;

    return Math.round((completedLessons / totalLessons) * 100);
  };

  const isLessonCompleted = (topicId, lessonId) => {
    return progress[topicId]?.completed?.includes(lessonId) || false;
  };

  const isLessonInProgress = (topicId, lessonId) => {
    return progress[topicId]?.inProgress === lessonId;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Education</h1>
          <p className="text-gray-500">Learn key concepts to improve your financial literacy</p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="explore">Explore Topics</TabsTrigger>
          <TabsTrigger value="my-learning">My Learning</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* EXPLORE TOPICS TAB */}
          <TabsContent value="explore">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FINANCIAL_TOPICS.map((topic) => (
                <Card key={topic.id} className="border overflow-hidden">
                  <CardHeader className={`pb-2 ${topic.color.split(' ')[0]}`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${topic.color}`}>
                        {topic.icon}
                      </div>
                      <CardTitle>{topic.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500 mb-4">{topic.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{getTopicProgress(topic.id)}% Complete</span>
                        <span className="text-gray-500">{topic.levels.length} Lessons</span>
                      </div>
                      <Progress value={getTopicProgress(topic.id)} className="h-1.5" />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setActiveTopic(topic.id);
                        setActiveTab("my-learning");
                      }}
                    >
                      View Lessons <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Featured Learning */}
            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Featured Learning
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    <Flame className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold">The Psychology of Money</h3>
                    <p className="mt-2 text-gray-600">
                      Understand how your beliefs about money impact your financial decisions.
                      Learn to recognize cognitive biases that affect spending, saving, and investing.
                    </p>
                    <div className="mt-4">
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setActiveTopic("basics");
                          setActiveTab("my-learning");
                        }}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Start Learning
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                      <Lightbulb className="h-16 w-16 text-blue-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MY LEARNING TAB */}
          <TabsContent value="my-learning">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Topic Sidebar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Learning Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {FINANCIAL_TOPICS.map((topic) => (
                      <div
                        key={topic.id}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          activeTopic === topic.id ? "bg-gray-50" : ""
                        }`}
                        onClick={() => setActiveTopic(topic.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full ${topic.color}`}>
                              {topic.icon}
                            </div>
                            <span className="font-medium">{topic.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {getTopicProgress(topic.id)}%
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lesson Content */}
              <div className="lg:col-span-2">
                {currentLesson ? (
                  <Card>
                    <CardHeader className="border-b">
                      {loadingLesson ? (
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>
                                {FINANCIAL_TOPICS.find(t => t.id === currentLesson.topicId)?.levels.find(l => l.id === currentLesson.lessonId)?.title}
                              </CardTitle>
                              <CardDescription>
                                {FINANCIAL_TOPICS.find(t => t.id === currentLesson.topicId)?.title}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={isLessonCompleted(currentLesson.topicId, currentLesson.lessonId) ? "default" : "outline"}
                              className={isLessonCompleted(currentLesson.topicId, currentLesson.lessonId) ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                            >
                              {isLessonCompleted(currentLesson.topicId, currentLesson.lessonId) ? (
                                <><Check className="h-3 w-3 mr-1" /> Completed</>
                              ) : (
                                <><Clock className="h-3 w-3 mr-1" /> In Progress</>
                              )}
                            </Badge>
                          </div>
                        </>
                      )}
                    </CardHeader>
                    <CardContent className="py-6">
                      {loadingLesson ? (
                        <div className="space-y-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      ) : (
                        <div className="prose max-w-none">
                          <ReactMarkdown>{lessonContent}</ReactMarkdown>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentLesson(null)}>
                        Back to Lessons
                      </Button>
                      {!isLessonCompleted(currentLesson.topicId, currentLesson.lessonId) && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 gap-2"
                          onClick={markLessonComplete}
                          disabled={loadingLesson}
                        >
                          <Check className="h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {FINANCIAL_TOPICS.find(t => t.id === activeTopic)?.title} Lessons
                      </CardTitle>
                      <CardDescription>
                        Select a lesson to start learning
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {FINANCIAL_TOPICS.find(t => t.id === activeTopic)?.levels.map((lesson, index) => {
                          const isCompleted = isLessonCompleted(activeTopic, lesson.id);
                          const isInProgress = isLessonInProgress(activeTopic, lesson.id);

                          return (
                            <Card
                              key={lesson.id}
                              className="border hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleLessonSelect(activeTopic, lesson.id)}
                            >
                              <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700">
                                    {isCompleted ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <span>{index + 1}</span>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium flex items-center gap-2">
                                      {lesson.title}
                                      {isCompleted && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                          Completed
                                        </Badge>
                                      )}
                                      {isInProgress && !isCompleted && (
                                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                                          In Progress
                                        </Badge>
                                      )}
                                    </h4>
                                    <p className="text-sm text-gray-500">{lesson.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center text-blue-600">
                                  {lesson.icon}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Learning Progress Overview */}
      {activeTab === "my-learning" && !currentLesson && (
        <Card className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                Your Learning Progress
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {FINANCIAL_TOPICS.map((topic) => {
                const topicProgress = getTopicProgress(topic.id);
                const completedLessons = progress[topic.id]?.completed?.length || 0;
                const totalLessons = topic.levels.length;

                return (
                  <div key={topic.id} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-full ${topic.color}`}>
                        {topic.icon}
                      </div>
                      <h3 className="font-medium">{topic.title}</h3>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{completedLessons}/{totalLessons} lessons</span>
                      <span>{topicProgress}%</span>
                    </div>
                    <Progress value={topicProgress} className="h-2 mb-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-auto self-start text-blue-600"
                      onClick={() => setActiveTopic(topic.id)}
                    >
                      Continue <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
