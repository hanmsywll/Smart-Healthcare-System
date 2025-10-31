import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Users, BarChart3, Clock, CheckCircle,  ArrowRight, Menu, X, Phone, Mail, MapPin, Building2, Activity } from 'lucide-react';
import LogoWhite from '/logo-white.png';
import Background from '/background.jpg'


const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col bg-white"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 z-0"></div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col justify-center items-center px-6 text-center max-w-5xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h1 className="font-bold text-5xl md:text-7xl leading-tight text-white mb-6 drop-shadow-lg">
            The Future of Secure
            <span className="block bg-gradient-to-br from-[#c0e5ff] to-[#b7e7ff] bg-clip-text text-transparent drop-shadow-lg">
              Healthcare Records
            </span>
          </h1>

          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-sm font-medium">
            Securely manage hospital records with decentralized EMR. Ensure transparency, interoperability, and patient-owned healthcare data.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href="/buy#trial"
            className="px-10 py-4 bg-white text-slate-800 rounded-xl font-semibold hover:bg-white/95 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl inline-block text-center"
          >
            Start Free Trial
          </a>

            <button className="px-10 py-4 border-2 border-white/80 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white transition-all duration-200 backdrop-blur-sm">
              Schedule Demo
            </button>
          </div>
        </div>

        {/* Trust Section */}
        <div
          className={`mt-24 transform transition-all duration-1000 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="text-sm font-semibold text-white/80 mb-8 tracking-wider">
            TRUSTED BY 50+ HOSPITALS
          </p>
          <div className="flex flex-wrap justify-center gap-12 text-white/70">
            <div className="flex items-center space-x-3 hover:text-white/90 transition-colors duration-200">
              <Building2 className="w-5 h-5" />
              <span className="text-base font-medium">Metro General</span>
            </div>
            <div className="flex items-center space-x-3 hover:text-white/90 transition-colors duration-200">
              <Activity className="w-5 h-5" />
              <span className="text-base font-medium">Care Central</span>
            </div>
            <div className="flex items-center space-x-3 hover:text-white/90 transition-colors duration-200">
              <Users className="w-5 h-5" />
              <span className="text-base font-medium">Unity Health</span>
            </div>
            <div className="flex items-center space-x-3 hover:text-white/90 transition-colors duration-200">
              <Shield className="w-5 h-5" />
              <span className="text-base font-medium">SafeMed Corp</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Stats Section Component
const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    { number: "500+", label: "Hospitals Served" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "40%", label: "Cost Reduction" },
    { number: "24/7", label: "Support Available" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="stats" className="py-20 bg-white/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`text-center transform transition-all duration-700 ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Feature Card Component
const FeatureCard = ({ feature, index, isVisible }) => {
  return (
    <div 
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 transform transition-all duration-700 hover:scale-105 hover:shadow-lg ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <div className="w-12 h-12 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] rounded-xl flex items-center justify-center text-white mb-6">
        {feature.icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-4">
        {feature.title}
      </h3>
      <p className="text-slate-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "HIPAA Compliant Security",
      description: "Bank-level encryption and ICP-backed protocols to safeguard sensitive medical and administrative data."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Patient-Centered Data Ownership",
      description: "SEmpower patients with full transparency and control over their medical history."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics & Reporting",
      description: "Comprehensive dashboards and custom reports to optimize operations and improve decision-making."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Round-the-clock technical support and maintenance to ensure systems run smoothly."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('features');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Powerful Features for Modern Healthcare
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
           Our comprehensive platform provides secure, decentralized tools to manage hospital operations and medical records—improving care while protecting patient data.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Benefits Section Component
const BenefitsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const benefits = [
    "Secure & tamper-proof medical records powered by blockchain",
    "Patients retain full ownership and control of their data",
    "Seamless interoperability across hospitals and healthcare providers",
    "HIPAA-compliant security with bank-level encryption",
    "Real-time access to accurate and up-to-date patient information",
    "Scalable, future-ready solutions built on the ICP blockchain"
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('benefits');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-[#4f46e5] to-[#a3c6fc]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={`transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Why Choose Medly?
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Join hospitals across Indonesia that are redefining patient care with secure, decentralized medical records powered by blockchain.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 transform transition-all duration-500 ${
                    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-white">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`transform transition-all duration-700 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Get Started?</h3>
                <p className="text-white/80">Experience the difference today</p>
              </div>
              <div className="space-y-3 flex flex-col text-center">
                <a href="/buy#trial" className="w-full bg-white text-[#4f46e5] py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
                  Start Your Free Trial
                </a>
                <a className="w-full border border-white/30 text-white py-3 rounded-lg font-medium hover:bg-white/10 transition-all duration-200">
                  Request a Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Contact Card Component
const ContactCard = ({ icon, title, info, index, isVisible }) => {
  return (
    <div 
      className={`text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-lg ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="w-12 h-12 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] rounded-xl flex items-center justify-center text-white mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <div className="text-slate-600">{info}</div>
    </div>
  );
};

// Contact Section Component
const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('contact');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-12 transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
           Ready to bring the future of healthcare to your hospital? Let’s build secure and interoperable medical records together.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <ContactCard 
            icon={<Phone className="w-6 h-6" />}
            title="Call Us"
            info="+1 (555) 123-4567"
            index={0}
            isVisible={isVisible}
          />
          <ContactCard 
            icon={<Mail className="w-6 h-6" />}
            title="Email Us"
            info="support@medly.id"
            index={1}
            isVisible={isVisible}
          />
          <ContactCard 
            icon={<MapPin className="w-6 h-6" />}
            title="Visit Us"
            info={<>123 Kesehatan<br />Medical District, NY 10001</>}
            index={2}
            isVisible={isVisible}
          />
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-6">
   <div className="flex items-center space-x-2 mb-4 w-20">
              <img src={LogoWhite} alt="Logo" className="w-full h-full object-contain" />
            </div>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
             Empowering hospitals with blockchain technology, ensuring data security, compliance, and better patient care.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Services</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">Secure EMR Management</li>
              <li className="hover:text-white transition-colors cursor-pointer">Staff & Access Control</li>
              <li className="hover:text-white transition-colors cursor-pointer">Compliance Monitoring</li>
              <li className="hover:text-white transition-colors cursor-pointer">Data Analytics & Reporting</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
              <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
              <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
          <p>&copy; 2025 Medly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <BenefitsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;