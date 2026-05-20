import Navbar from "@/components/Navbar";
import VideoBackground from "@/components/VideoBackground";
import { Heart, Users, Video, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryParams } from "@/hooks/use-query-params";

export default function About() {
  const queryParams = useQueryParams();
  return (
    <div className="relative min-h-screen bg-yoga-cream">
      <VideoBackground />

      <div className="relative z-20">
        <Navbar />

        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-slide-up">
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                About <span className="text-red-500">Us</span>
              </h1>
              <p className="text-2xl text-white/90 font-semibold">
                Welcome to EYoga – Your Digital Gateway to Holistic Wellness
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 sm:p-12 space-y-6 animate-fade-in">
              <p className="text-lg text-white/90 leading-relaxed">
                At EYoga, we believe that wellness should be accessible, flexible, and empowering. That's why we created a modern Video-on-Demand (VOD) yoga platform designed to bring the benefits of yoga directly to your screen — anytime, anywhere.
              </p>

              <p className="text-lg text-white/90 leading-relaxed">
                Our platform offers a curated collection of high-quality yoga videos led by experienced instructors, focused on improving your physical health, mental clarity, and inner peace. Whether you're a beginner or an advanced practitioner, our diverse video library helps you stay consistent with your practice, at your own pace.
              </p>

              <p className="text-lg text-white/90 leading-relaxed">
                As a VOD (Video-on-Demand) yoga subscription service, EYoga bridges the gap between traditional yoga practice and the demands of today's digital lifestyle. No more fixed schedules or crowded studios — just pure, uninterrupted yoga whenever you need it.
              </p>

              <div className="bg-red-500/20 rounded-xl p-6 my-8 border border-red-400/30">
                <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-lg text-white/90 leading-relaxed">
                  To make yoga an everyday habit for everyone by delivering affordable, expert-guided, and health-focused content that nurtures your body, mind, and soul.
                </p>
              </div>

              <p className="text-xl text-white font-semibold text-center pt-4">
                Join the EYoga movement today — and let's breathe, move, and grow together.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mt-12">
              {[
                { icon: <Video className="w-8 h-8" />, title: "VOD Platform", desc: "Watch anytime" },
                { icon: <Users className="w-8 h-8" />, title: "Expert Instructors", desc: "Certified teachers" },
                { icon: <Clock className="w-8 h-8" />, title: "Flexible Schedule", desc: "Your own pace" },
                { icon: <Heart className="w-8 h-8" />, title: "Holistic Wellness", desc: "Body & mind" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 text-center animate-bounce-in hover:bg-white/15 transition-all duration-300"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <div className="text-red-400 flex justify-center mb-3">{feature.icon}</div>
                  <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.desc}</p>
                </div>
              ))}
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
