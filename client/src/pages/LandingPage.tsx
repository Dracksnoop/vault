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
  Mail
} from "lucide-react";

interface LandingPageProps {
  onAccessDashboard: () => void;
}

export default function LandingPage({ onAccessDashboard }: LandingPageProps) {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-black" />
              <h1 className="text-2xl font-bold text-black">Raydify Vault</h1>
            </div>
            <Button 
              onClick={onAccessDashboard}
              className="bg-black text-white hover:bg-gray-800 border border-black"
            >
              Access Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-black mb-6">
            Smart Inventory & Rental Management Software
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Welcome to Raydify Vault, your all-in-one solution to simplify inventory, rental, and customer management.
            Designed for businesses of all sizes, Raydify Vault empowers you to efficiently track assets, manage customer rentals, 
            generate invoices, and streamline your operations — all from a sleek, easy-to-use dashboard.
          </p>
          <Button 
            onClick={onAccessDashboard}
            size="lg"
            className="bg-black text-white hover:bg-gray-800 border border-black text-lg px-8 py-3"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-gray-50 border-t border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center text-black mb-16">
            Why Choose Raydify Vault?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-black bg-white">
                <CardHeader className="text-center">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-black" />
                  <CardTitle className="text-xl text-black">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white border-t border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center text-black mb-16">
            Key Features
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                {keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border border-black bg-white">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h4 className="font-semibold text-black">Analytics</h4>
                  <p className="text-sm text-gray-600">Real-time insights</p>
                </CardContent>
              </Card>
              <Card className="border border-black bg-white">
                <CardContent className="p-6 text-center">
                  <QrCode className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h4 className="font-semibold text-black">QR Codes</h4>
                  <p className="text-sm text-gray-600">Fast tracking</p>
                </CardContent>
              </Card>
              <Card className="border border-black bg-white">
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h4 className="font-semibold text-black">Automation</h4>
                  <p className="text-sm text-gray-600">Recurring billing</p>
                </CardContent>
              </Card>
              <Card className="border border-black bg-white">
                <CardContent className="p-6 text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h4 className="font-semibold text-black">Multi-user</h4>
                  <p className="text-sm text-gray-600">Secure access</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white border-t border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold mb-6">
            Get Started with Raydify Vault Today!
          </h3>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-300">
            Experience the difference with a powerful inventory and rental management system designed to scale with your business.
            Contact us now to schedule a demo or start your free trial!
          </p>
          <Button 
            onClick={onAccessDashboard}
            size="lg"
            className="bg-white text-black hover:bg-gray-100 border border-white text-lg px-8 py-3"
          >
            Access Dashboard
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white border-t border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-black mb-12">
            Contact
          </h3>
          <div className="flex justify-center space-x-12">
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-black" />
              <div>
                <p className="font-medium text-black">Email</p>
                <p className="text-gray-600">support@raydify.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-6 h-6 text-black" />
              <div>
                <p className="font-medium text-black">Phone</p>
                <p className="text-gray-600">+91 77778 88220</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Package className="w-6 h-6 text-black" />
            <span className="text-lg font-semibold text-black">Raydify Vault</span>
          </div>
          <p className="text-gray-600">
            © 2025 Raydify Vault. All rights reserved. Smart Inventory & Rental Management Software.
          </p>
        </div>
      </footer>
    </div>
  );
}