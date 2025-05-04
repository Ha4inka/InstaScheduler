import { useState } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  ListOrdered,
  Image,
  BarChart3,
  Plus,
  Settings,
  User,
  LogOut
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { InstagramAccount } from "@/lib/types";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center p-2 rounded-lg font-medium",
        active 
          ? "text-primary bg-blue-50 dark:bg-blue-950" 
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      )}>
        <div className="w-6 mr-2">
          {icon}
        </div>
        <span>{label}</span>
      </a>
    </Link>
  );
};

const ConnectedAccount = ({ account }: { account: InstagramAccount }) => {
  return (
    <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        {account.profilePic ? (
          <img 
            src={account.profilePic} 
            alt={account.username} 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-white" />
        )}
      </div>
      <div className="ml-3 truncate">
        <p className="text-sm font-medium">{account.username}</p>
        <span className="text-xs text-gray-500 dark:text-gray-400">Instagram</span>
      </div>
      <div className="ml-auto">
        <span className={cn(
          "w-2 h-2 rounded-full",
          account.isActive ? "bg-green-500" : "bg-gray-400"
        )}></span>
      </div>
    </div>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: accounts, isLoading } = useQuery<InstagramAccount[]>({ 
    queryKey: ['/api/accounts']
  });

  return (
    <div className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="gradient-logo p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-semibold">InstaTelegram</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <NavItem 
              icon={<Calendar className="h-5 w-5" />} 
              label="Calendar" 
              href="/calendar" 
              active={location === "/calendar"}
            />
          </li>
          <li>
            <NavItem 
              icon={<ListOrdered className="h-5 w-5" />} 
              label="Queue" 
              href="/queue" 
              active={location === "/queue"}
            />
          </li>
          <li>
            <NavItem 
              icon={<Image className="h-5 w-5" />} 
              label="Media Library" 
              href="/media" 
              active={location === "/media"}
            />
          </li>
          <li>
            <NavItem 
              icon={<BarChart3 className="h-5 w-5" />} 
              label="Analytics" 
              href="/analytics" 
              active={location === "/analytics"}
            />
          </li>
        </ul>

        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Connected Accounts
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          ) : (
            <>
              {accounts?.map(account => (
                <ConnectedAccount key={account.id} account={account} />
              ))}
              
              <Link href="/auth">
                <a className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Add account</p>
                  </div>
                </a>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
          </div>
          <div className="ml-auto flex">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
