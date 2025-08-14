import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Search, 
  Star, 
  Users, 
  Calendar,
  Sparkles,
  ChevronRight,
  Globe,
  Shield,
  Heart,
  Sun,
  Waves,
  Palmtree,
  Camera,
  Plane
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Animated Section Component
const AnimatedSection = ({ children, className = "" }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const destinations = [
    {
      name: "Cancún",
      image: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80",
      description: "Crystal clear waters and white sand beaches"
    },
    {
      name: "Playa del Carmen",
      image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80",
      description: "Vibrant nightlife and stunning cenotes"
    },
    {
      name: "Tulum",
      image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80",
      description: "Ancient ruins meet bohemian beach vibes"
    },
    {
      name: "Cabo San Lucas",
      image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
      description: "Luxury resorts and dramatic landscapes"
    },
    {
      name: "Puerto Vallarta",
      image: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80",
      description: "Charming old town and golden beaches"
    },
    {
      name: "Cozumel",
      image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80",
      description: "World-class diving and snorkeling paradise"
    }
  ];

  const excursions = [
    {
      title: "Cenote Diving",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
      price: "From $89",
      duration: "4 hours"
    },
    {
      title: "Mayan Ruins Tour",
      image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
      price: "From $120",
      duration: "Full day"
    },
    {
      title: "Sunset Catamaran",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      price: "From $75",
      duration: "3 hours"
    },
    {
      title: "Zip-line Adventure",
      image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&q=80",
      price: "From $95",
      duration: "Half day"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Austin, TX",
      text: "The personal touch from the travel agent made all the difference! Our honeymoon in Riviera Maya was absolutely perfect.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      name: "Michael Chen",
      location: "San Francisco, CA",
      text: "The AI assistant helped me find hidden gems I never would have discovered. Best family vacation ever!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    {
      name: "Emily Rodriguez",
      location: "Miami, FL",
      text: "From booking to checkout, everything was seamless. The hotel recommendations were spot on!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=5"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sun className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Mexico Travel Pro
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#destinations" className="hover:text-blue-600 transition">Destinations</a>
              <a href="#excursions" className="hover:text-blue-600 transition">Excursions</a>
              <a href="#services" className="hover:text-blue-600 transition">Services</a>
              <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
              <Link to="/ai-assistant" className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition">
                Try AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background Effect */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=1920&q=80" 
            alt="Mexico Beach"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Your Dream Mexico Vacation
            <span className="block text-3xl md:text-5xl mt-4 text-yellow-300">
              Starts Here
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 text-gray-100"
          >
            Expert travel planning meets cutting-edge AI technology
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/search" className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Search Hotels
            </Link>
            <a href="#contact" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" />
              Talk to an Expert
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 flex justify-center space-x-8 text-sm"
          >
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span>100% Secure Booking</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              <span>Best Price Guarantee</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              <span>24/7 Support</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronRight className="w-8 h-8 text-white rotate-90" />
        </motion.div>
      </section>

      {/* Quick Search Bar */}
      <AnimatedSection className="py-12 bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-6">Quick Hotel Search</h2>
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <input 
                type="text" 
                placeholder="Where in Mexico?" 
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none"
              />
              <input 
                type="date" 
                className="px-6 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none"
              />
              <Link to="/search" className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-3 rounded-full hover:shadow-lg transition flex items-center justify-center">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Popular Destinations */}
      <AnimatedSection id="destinations" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Discover Mexico's most breathtaking locations</p>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {destinations.map((dest, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{dest.name}</h3>
                    <p className="text-sm opacity-90">{dest.description}</p>
                    <Link to="/search" className="inline-flex items-center mt-3 text-yellow-300 hover:text-yellow-400 transition">
                      Explore <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Excursions Section */}
      <AnimatedSection id="excursions" className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Unforgettable Excursions</h2>
            <p className="text-xl text-gray-600">Add adventure to your Mexico vacation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {excursions.map((excursion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <img 
                  src={excursion.image} 
                  alt={excursion.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{excursion.title}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">{excursion.price}</span>
                    <span className="text-sm text-gray-500">{excursion.duration}</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-2 rounded-lg hover:shadow-lg transition">
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Services Section */}
      <AnimatedSection id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Perfect Planning Experience</h2>
            <p className="text-xl text-gray-600">Personal touch or AI-powered convenience</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Personal Travel Agent Service */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center mb-6">
                <Heart className="w-12 h-12 text-purple-600 mr-4" />
                <h3 className="text-3xl font-bold">Personal Travel Agent</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Work directly with an experienced travel agent who knows Mexico inside and out. 
                Get personalized recommendations, insider tips, and dedicated support throughout your journey.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>One-on-one consultation</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>Custom itinerary planning</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>24/7 travel support</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>Exclusive deals & upgrades</span>
                </li>
              </ul>
              <a href="#contact" className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-4 rounded-xl font-semibold hover:shadow-lg transition">
                Contact Travel Agent
              </a>
            </motion.div>

            {/* AI Assistant Service */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center mb-6">
                <Sparkles className="w-12 h-12 text-blue-600 mr-4" />
                <h3 className="text-3xl font-bold">AI Travel Assistant</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Get instant recommendations powered by advanced AI. Ask questions, explore options, 
                and find your perfect Mexico vacation 24/7 with our intelligent assistant.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>Instant responses</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>Smart recommendations</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>Available 24/7</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>Real-time availability</span>
                </li>
              </ul>
              <Link to="/ai-assistant" className="block w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white text-center py-4 rounded-xl font-semibold hover:shadow-lg transition">
                Try AI Assistant
              </Link>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Features Grid */}
      <AnimatedSection className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600">Everything you need for the perfect Mexico vacation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-blue-500 to-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Local Expertise</h3>
              <p className="text-gray-600">Deep knowledge of Mexico's best destinations and hidden gems</p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Booking</h3>
              <p className="text-gray-600">Safe, encrypted transactions with trusted partners</p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Flexible Planning</h3>
              <p className="text-gray-600">Customize your trip exactly how you want it</p>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-green-500 to-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Always here when you need us, before and during your trip</p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Travelers Say</h2>
            <p className="text-xl text-gray-600">Real experiences from real people</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Instagram-style Gallery */}
      <AnimatedSection className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Mexico Moments</h2>
            <p className="text-xl text-gray-600">Follow our adventures @MexicoTravelPro</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              "https://images.unsplash.com/photo-1512813389649-acb9131ced20?w=400&q=80",
              "https://images.unsplash.com/photo-1503183711474-e867f59b0f91?w=400&q=80",
              "https://images.unsplash.com/photo-1536248467711-8d5cb3e75b31?w=400&q=80",
              "https://images.unsplash.com/photo-1565118531796-763e5082d113?w=400&q=80",
              "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400&q=80",
              "https://images.unsplash.com/photo-1501619593928-bef49688c888?w=400&q=80"
            ].map((img, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-lg aspect-square"
              >
                <img 
                  src={img} 
                  alt={`Mexico moment ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Section */}
      <AnimatedSection id="contact" className="py-20 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Mexico Adventure?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact our expert travel agent for personalized service
            </p>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6">Get in Touch with Our Travel Expert</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="tel:+1234567890" className="flex items-center justify-center space-x-3 bg-white/20 rounded-xl p-4 hover:bg-white/30 transition">
                  <Phone className="w-6 h-6" />
                  <span className="font-semibold">(123) 456-7890</span>
                </a>
                <a href="mailto:travel@mexicotravelpro.com" className="flex items-center justify-center space-x-3 bg-white/20 rounded-xl p-4 hover:bg-white/30 transition">
                  <Mail className="w-6 h-6" />
                  <span className="font-semibold">Email Us</span>
                </a>
                <a href="#" className="flex items-center justify-center space-x-3 bg-white/20 rounded-xl p-4 hover:bg-white/30 transition">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-semibold">WhatsApp</span>
                </a>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition">
                Schedule a Call
              </button>
              <Link to="/ai-assistant" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition">
                Try AI Assistant Now
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Newsletter Signup */}
      <AnimatedSection className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Stay Updated on Mexico Travel Deals</h3>
            <p className="text-gray-600 mb-6">Get exclusive offers and travel tips delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none"
              />
              <button className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-3 rounded-full hover:shadow-lg transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sun className="w-8 h-8 text-yellow-500" />
                <span className="text-xl font-bold">Mexico Travel Pro</span>
              </div>
              <p className="text-gray-400">Your trusted partner for unforgettable Mexico vacations</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#destinations" className="hover:text-white transition">Destinations</a></li>
                <li><a href="#excursions" className="hover:text-white transition">Excursions</a></li>
                <li><a href="#services" className="hover:text-white transition">Services</a></li>
                <li><Link to="/search" className="hover:text-white transition">Search Hotels</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Popular Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Cancún</a></li>
                <li><a href="#" className="hover:text-white transition">Playa del Carmen</a></li>
                <li><a href="#" className="hover:text-white transition">Tulum</a></li>
                <li><a href="#" className="hover:text-white transition">Cabo San Lucas</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>(123) 456-7890</span>
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>travel@mexicotravelpro.com</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Available Worldwide</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Mexico Travel Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
