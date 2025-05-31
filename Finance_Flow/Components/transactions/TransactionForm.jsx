import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BrainCircuit, Send, ArrowDown, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InvokeLLM } from "@/integrations/Core";

const AssistantChat = ({ userFinancialData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your Finance Flow Assistant. I can help analyze your finances, suggest improvements, or answer any financial questions you might have. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "How can I improve my savings?",
    "What's a good budget for someone with my income?",
    "Explain emergency funds",
    "How should I prioritize debt repayment?"
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Prepare context for the AI about the user's financial situation
      const financialContext = userFinancialData
        ? `User financial data: Monthly income: $${userFinancialData.monthlyIncome}, Financial literacy level: ${userFinancialData.financialLiteracyLevel}, Risk tolerance: ${userFinancialData.riskTolerance}`
        : "No financial data available for this user yet.";

      const response = await InvokeLLM({
        prompt: `You are a helpful, friendly financial assistant for the Finance Flow app. 
                Your goal is to provide personalized financial advice, education, and guidance.
                
                ${financialContext}
                
                User question: ${input}
                
                Provide a helpful, clear, and concise response. Include specific actionable advice when possible.
                If recommending financial strategies, make sure they align with the user's risk tolerance.
                Keep your response focused and avoid overly technical jargon.`,
        add_context_from_internet: true
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      // Generate new suggestions based on the conversation
      generateNewSuggestions();
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNewSuggestions = async () => {
    try {
      // This could also use InvokeLLM, but we'll keep it simple with predefined suggestions
      const newSuggestions = [
        "How much should I save each month?",
        "What are some ways to reduce my spending?",
        "How do I start investing?",
        "What's the difference between good and bad debt?"
      ];
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <div className="mr-2 bg-blue-100 p-2 rounded-full">
            <BrainCircuit className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle className="text-lg font-semibold">Finance Assistant</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="mt-0.5 mr-2 h-8 w-8 border border-blue-100">
                      <AvatarImage src="/assistant-avatar.png" />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <BrainCircuit className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-xl px-3 py-2 text-sm ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white ml-2' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        message.role === 'user' ? 'text-right mr-2' : 'ml-2'
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start max-w-[80%]">
                  <Avatar className="mt-0.5 mr-2 h-8 w-8 border border-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-800">
                    <div className="flex items-center gap-2">
                      <span>Thinking</span>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <div className="px-4 py-2">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      <CardFooter className="pt-2">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask me about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AssistantChat;