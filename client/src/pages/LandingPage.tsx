import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  CalendarDays, 
  Users, 
  CreditCard, 
  Shield, 
  HeadphonesIcon,
  CheckCircle,
  BarChart3,
  QrCode,
  Clock,
  Globe,
  Phone,
  Mail,
  ArrowRight,
  Star,
  TrendingUp,
  Database,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import logoPath from "@assets/Embroidered_Shield_with_Clock_Emblem-removebg-preview_1753020884635.png";

interface LandingPageProps {
  onAccessDashboard: () => void;
}

export default function LandingPage({ onAccessDashboard }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate stats counter
    const statsInterval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(statsInterval);
  }, []);

  const stats = [
    { number: "500+", label: "Businesses Trust Us", icon: TrendingUp },
    { number: "10K+", label: "Items Managed Daily", icon: Package },
    { number: "99.9%", label: "Uptime Guarantee", icon: Shield },
    { number: "24/7", label: "Customer Support", icon: HeadphonesIcon }
  ];

  const features = [
    {
      icon: Package,
      title: "Complete Inventory Control",
      description: "Manage CPUs, monitors, peripherals, and more with detailed product specifications and real-time stock tracking."
    },
    {
      icon: CalendarDays,
      title: "Powerful Rental Management",
      description: "Seamlessly handle rental agreements, track active rentals, and automate monthly recurring billing with ease."
    },
    {
      icon: Users,
      title: "Customer Management Made Easy",
      description: "Create and manage customers using a multi-step form integrated directly with your inventory for precise rental assignment."
    },
    {
      icon: CreditCard,
      title: "Automated Billing & Invoices",
      description: "Generate recurring invoices automatically and monitor payment status to keep your cash flow steady."
    },
    {
      icon: Shield,
      title: "User-Specific Dashboards",
      description: "Ensure data privacy and segregation — each user has a personalized dashboard reflecting only their data."
    },
    {
      icon: HeadphonesIcon,
      title: "Support & Call Service Module",
      description: "Track customer support requests and assign employees to resolve rental issues efficiently."
    }
  ];

  const keyFeatures = [
    "Multi-category inventory management with unit-level tracking",
    "Detailed product specifications and QR code integration for fast scanning",
    "Rental timelines and history for comprehensive audit trails",
    "Purchase and sales modules synchronized with inventory",
    "Role-based access control and user management",
    "Responsive and intuitive user interface with black slim borders and clean white backgrounds"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-black bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className={`flex items-center space-x-3 transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <img 
                src={logoPath} 
                alt="Vault Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-black bg-gradient-to-r from-black to-gray-600 bg-clip-text">
                VAULT
              </h1>
            </div>
            <Button 
              onClick={onAccessDashboard}
              className={`bg-black text-white hover:bg-gray-800 border border-black transition-all duration-500 hover:scale-105 hover:shadow-lg ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
            >
              Access Dashboard
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gray-100 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-black/5 border border-black/20 rounded-full px-4 py-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-700 font-medium">Trusted by 500+ Businesses</span>
              </div>
            </div>
            
            <h2 className="text-6xl font-bold text-black mb-6 leading-tight">
              Smart Inventory &<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rental Management
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Welcome to VAULT, your all-in-one solution to simplify inventory, rental, and customer management.
              Designed for businesses of all sizes, VAULT empowers you to efficiently track assets, manage customer rentals, 
              generate invoices, and streamline your operations — all from a sleek, easy-to-use dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={onAccessDashboard}
                size="lg"
                className="bg-black text-white hover:bg-gray-800 border border-black text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-black text-black hover:bg-black hover:text-white text-lg px-8 py-4 transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div>
            
            {/* Animated Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={index}
                    className={`text-center transition-all duration-700 ${
                      currentStat === index ? 'scale-110 bg-white/50 rounded-lg p-4 shadow-lg' : 'p-4'
                    }`}
                    style={{animationDelay: `${index * 200}ms`}}
                  >
                    <IconComponent className={`w-8 h-8 mx-auto mb-2 transition-colors duration-300 ${
                      currentStat === index ? 'text-blue-600' : 'text-black'
                    }`} />
                    <div className="text-2xl font-bold text-black">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 bg-white border-t border-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-5xl font-bold text-black mb-4">
              Why Choose VAULT?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to transform your business operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`border border-gray-200 bg-white hover:border-black transition-all duration-500 hover:scale-105 hover:shadow-xl group cursor-pointer ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{animationDelay: `${index * 150}ms`}}
              >
                <CardHeader className="text-center pb-4">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                      <feature.icon className="w-8 h-8 text-black group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-black group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-5xl font-bold text-black mb-4">
              Key Features
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your business efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <ul className="space-y-6">
                {keyFeatures.map((feature, index) => (
                  <li 
                    key={index} 
                    className="flex items-start space-x-4 group"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 text-lg leading-relaxed group-hover:text-black transition-colors duration-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={`grid grid-cols-2 gap-6 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <Card className="border border-gray-200 bg-white hover:border-blue-400 transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-black text-lg mb-2">Analytics</h4>
                  <p className="text-sm text-gray-600">Real-time insights</p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 bg-white hover:border-purple-400 transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full flex items-center justify-center group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-300">
                    <QrCode className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-black text-lg mb-2">QR Codes</h4>
                  <p className="text-sm text-gray-600">Fast tracking</p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 bg-white hover:border-green-400 transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-full flex items-center justify-center group-hover:from-green-100 group-hover:to-blue-100 transition-all duration-300">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-black text-lg mb-2">Automation</h4>
                  <p className="text-sm text-gray-600">Recurring billing</p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 bg-white hover:border-indigo-400 transition-all duration-500 hover:scale-105 hover:shadow-xl group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full flex items-center justify-center group-hover:from-indigo-100 group-hover:to-blue-100 transition-all duration-300">
                    <Database className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-black text-lg mb-2">Multi-user</h4>
                  <p className="text-sm text-gray-600">Secure access</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-black via-gray-900 to-black text-white border-t border-gray-800 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Get Started with VAULT Today!
            </h3>
            <p className="text-xl mb-10 max-w-4xl mx-auto text-gray-300 leading-relaxed">
              Experience the difference with a powerful inventory and rental management system designed to scale with your business.
              Contact us now to schedule a demo or start your free trial!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onAccessDashboard}
                size="lg"
                className="bg-white text-black hover:bg-gray-100 border border-white text-lg px-10 py-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black text-lg px-10 py-4 transition-all duration-300"
              >
                Schedule Demo
              </Button>
            </div>
            
            <div className="mt-12 text-sm text-gray-400">
              <p>🔒 Enterprise-grade security • 99.9% uptime • 24/7 support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-4xl font-bold text-black mb-4">
              Contact Us
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to transform your business? Get in touch with our team
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-12">
            <Card className="border border-gray-200 bg-white hover:border-blue-400 transition-all duration-500 hover:scale-105 hover:shadow-xl group p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-black text-lg mb-2">Email</h4>
              <p className="text-gray-600 mb-4">Get support or ask questions</p>
              <a href="mailto:support@raydify.com" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                support@raydify.com
              </a>
            </Card>
            
            <Card className="border border-gray-200 bg-white hover:border-green-400 transition-all duration-500 hover:scale-105 hover:shadow-xl group p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-full flex items-center justify-center group-hover:from-green-100 group-hover:to-blue-100 transition-all duration-300">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-black text-lg mb-2">Phone</h4>
              <p className="text-gray-600 mb-4">Speak with our experts</p>
              <a href="tel:+917777888220" className="text-green-600 hover:text-green-800 font-medium transition-colors">
                +91 77778 88220
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <img 
                  src={logoPath} 
                  alt="Vault Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  VAULT
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Smart Inventory & Rental Management Software designed to transform your business operations.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={onAccessDashboard} className="hover:text-white transition-colors">Access Dashboard</button></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#support" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div className="text-center md:text-right">
              <h4 className="text-lg font-semibold text-white mb-4">Get in Touch</h4>
              <div className="space-y-2 text-gray-400">
                <p>support@raydify.com</p>
                <p>+91 77778 88220</p>
                <div className="flex justify-center md:justify-end space-x-2 mt-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">24/7 Support Available</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 VAULT. All rights reserved. Built with ❤️ for modern businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}