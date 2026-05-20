import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import VideoBackground from "@/components/VideoBackground";
import SubscriptionModal from "@/components/SubscriptionModal";
import { User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryParams } from "@/hooks/use-query-params";

export default function Account() {
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const queryParams = useQueryParams();

  useEffect(() => {
    const mobile = localStorage.getItem('userMobile');
    const subscribed = localStorage.getItem('isSubscribed') === 'true';
    const subData = localStorage.getItem('subscriptionData');
    
    setUserMobile(mobile);
    setIsSubscribed(subscribed);
    
    if (subData) {
      try {
        setSubscriptionData(JSON.parse(subData));
      } catch (e) {
        console.error('Failed to parse subscription data');
      }
    }
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleSignIn = () => {
    setSubscriptionModal(true);
  };

  const handleSubscription = (mobile: string) => {
    localStorage.setItem('userMobile', mobile);
    setUserMobile(mobile);
    setSubscriptionModal(false);
    
    // Reload subscription data
    const subData = localStorage.getItem('subscriptionData');
    if (subData) {
      try {
        const parsed = JSON.parse(subData);
        setSubscriptionData(parsed);
        setIsSubscribed(parsed.active === true);
      } catch (e) {
        console.error('Failed to parse subscription data');
      }
    }
  };
  return (
    <div className="relative min-h-screen bg-yoga-cream">
      <VideoBackground />
      <SubscriptionModal 
        isOpen={subscriptionModal} 
        onClose={() => setSubscriptionModal(false)} 
        onSubmit={handleSubscription} 
      />

      <div className="relative z-20">
        <Navbar />

        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 animate-slide-up">
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                My <span className="text-red-500">Account</span>
              </h1>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 sm:p-12 space-y-6 animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <User className="w-12 h-12 text-red-400" />
                <h2 className="text-3xl font-bold text-white">Dashboard</h2>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                {isSubscribed && userMobile && subscriptionData ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
                      <p className="text-green-300 font-semibold text-center">Active Subscription</p>
                    </div>
                    <div className="space-y-3 text-white/90">
                      <p className="text-lg"><span className="font-semibold">Mobile:</span> {userMobile}</p>
                      <p className="text-lg"><span className="font-semibold">Plan:</span> {subscriptionData.packType || 'N/A'}</p>
                      <p className="text-lg"><span className="font-semibold">Start:</span> {formatDate(subscriptionData.startDate)}</p>
                      <p className="text-lg"><span className="font-semibold">End:</span> {formatDate(subscriptionData.endDate)}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xl text-white/90 mb-6">Mobile number not found.</p>
                    <button 
                      onClick={handleSignIn}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-white/70 text-center">
                  Don't have an account? Sign in to access your dashboard and manage your subscription.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/20 bg-white/10 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center text-white text-sm">
            <p className="mb-2">&copy; 2025, All Rights Reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
