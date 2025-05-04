import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { InstagramAccount } from "@/lib/types";

export default function Home() {
  const [_, navigate] = useLocation();
  
  const { data: accounts, isLoading } = useQuery<InstagramAccount[]>({ 
    queryKey: ['/api/accounts']
  });
  
  useEffect(() => {
    // If there are accounts, redirect to the calendar page
    if (accounts && accounts.length > 0) {
      navigate("/calendar");
    }
  }, [accounts, navigate]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="gradient-logo p-2 rounded-lg">
              <svg 
                className="h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="ml-3 text-xl font-semibold">InstaTelegram</h1>
          </div>
          <div>
            <Button variant="outline" className="mr-2">Login</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Schedule and Manage Your Instagram Content Effortlessly
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Connect your Instagram accounts, schedule posts and stories, and manage your content calendar all in one place.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Key Features
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg 
                    className="h-6 w-6 text-primary" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Content Calendar</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Plan and visualize your content schedule with an intuitive calendar interface.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                <div className="bg-pink-100 dark:bg-pink-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg 
                    className="h-6 w-6 text-secondary" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Post & Story Scheduling</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Schedule both posts and stories in advance with precise timing.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <svg 
                    className="h-6 w-6 text-accent" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Account Support</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect and manage multiple Instagram accounts from one dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} InstaTelegram. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
