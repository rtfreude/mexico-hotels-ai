import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import ResortLocationSelector from '../components/ResortLocationSelector';
import { fetchCopyBlock } from '../lib/useSanityCopy';
import { fetchSiteSettings } from '../lib/useSanitySiteSettings';
import PortableTextRenderer from '../components/PortableTextRenderer';
import { 
  MapPin, 
  Search, 
  Star, 
  Users, 
  Sparkles,
  ChevronRight,
  Shield,
  Sun,
  Waves,
  Zap,
  Award,
  DollarSign,
  Target,
  Phone,
  Mail,
  Palmtree
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
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
      className={className}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [selectedResortCategory, setSelectedResortCategory] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isDestinationMapOpen, setIsDestinationMapOpen] = useState(false);
  const [destinationModalStep, setDestinationModalStep] = useState(1); // 1 = locations, 2 = resort type
  const [isNavigating, setIsNavigating] = useState(false); // Add navigation loading state
  const [sanityHero, setSanityHero] = useState(null);
  const [sanityDestinations, setSanityDestinations] = useState(null);
  const [sanityNav, setSanityNav] = useState(null);
  const [sanityFooter, setSanityFooter] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCloseLocationSelector = () => {
    setIsLocationSelectorOpen(false);
    setSelectedResortCategory(null);
  };

  // Fetch editable hero copy from Sanity (document type `copyBlock` with key 'landing:hero')
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [heroDoc, destDoc, navDoc, footerDoc] = await Promise.all([
          fetchCopyBlock('landing:hero'),
          fetchCopyBlock('landing:destinations'),
          fetchCopyBlock('landing:nav'),
            fetchCopyBlock('landing:footer')
        ]);
          // also fetch site settings singleton
          const settings = await fetchSiteSettings().catch(() => null);
        if (mounted) {
          if (heroDoc) setSanityHero(heroDoc);
          if (destDoc) setSanityDestinations(destDoc);
          if (navDoc) setSanityNav(navDoc);
          if (footerDoc) setSanityFooter(footerDoc);
            if (settings) setSiteSettings(settings);
        }
      } catch (e) {
        // ignore — keep the default copy
        console.warn('Failed to load sanity landing copy', e && e.message ? e.message : e);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setIsNavigating(true); // Show loading immediately
    
    // Navigate to search page with both region and resort type using React Router
    const searchParams = new URLSearchParams({
      destination: region.id,
    });
    
    if (region.type) {
      searchParams.append('type', region.type);
    }
    
    navigate(`/resorts/search?${searchParams.toString()}`);
  };

  const destinations = [
    {
      name: "Riviera Maya",
      image: "https://images.unsplash.com/photo-1570792328831-0c9ce06bf824?w=800&q=80",
      description: "Exclusive beachfront luxury with ancient Mayan heritage",
      type: "Ultra-Luxury All-Inclusive"
    },
    {
      name: "Los Cabos",
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=800&q=80",
      description: "Desert meets ocean in sophisticated elegance",
      type: "Premium Adults-Only"
    },
    {
      name: "Puerto Vallarta",
      image: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&q=80",
      description: "Refined coastal charm with authentic Mexican culture",
      type: "Boutique Luxury"
    },
    {
      name: "Tulum",
      image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80",
      description: "Bohemian luxury meets archaeological wonder",
      type: "Eco-Luxury Resort"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Elegant Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/95 backdrop-blur-sm border-b border-gold-500/20' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Sun className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-light tracking-wide text-white" data-sanity-source={siteSettings && siteSettings.siteTitle ? 'siteSettings:siteTitle' : undefined}>
                {siteSettings && siteSettings.siteTitle ? siteSettings.siteTitle : null}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {sanityNav && sanityNav.bodyPlain ? (
                sanityNav.bodyPlain.split('|').map((item, i) => (
                  item.trim().toLowerCase().includes('find') ? (
                    <Link
                      key={i}
                      to="/resorts/ai-assistant"
                      data-sanity-source={sanityNav && sanityNav.key ? `copyBlock:${sanityNav.key}` : undefined}
                      className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-6 py-3 rounded-sm hover:shadow-lg transition-all duration-300 font-medium tracking-wide"
                    >
                      {item.trim()}
                    </Link>
                  ) : (
                    <a
                      key={i}
                      href={`#${item.trim().toLowerCase().replace(/\s+/g, '-')}`}
                      data-sanity-source={sanityNav && sanityNav.key ? `copyBlock:${sanityNav.key}` : undefined}
                      className="text-gray-300 hover:text-white transition-colors duration-300 font-light"
                    >
                      {item.trim()}
                    </a>
                  )
                ))
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80" 
            alt="Mexico Resort"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-4xl md:text-7xl font-thin mb-8 leading-tight tracking-wide"
            data-sanity-source={siteSettings && siteSettings.siteTitle ? 'siteSettings:siteTitle' : (sanityHero && sanityHero.key ? `copyBlock:${sanityHero.key}` : undefined)}
          >
            {siteSettings && siteSettings.siteTitle ? (
              <span className="block">{siteSettings.siteTitle}</span>
            ) : (sanityHero && sanityHero.title ? (
              // Only render the hero title when Sanity provides one and no siteSettings title exists.
              <span className="block">{sanityHero.title}</span>
            ) : null)}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl md:text-2xl mb-12 text-gray-300 font-light max-w-3xl mx-auto leading-relaxed"
            data-sanity-source={sanityHero && sanityHero.key ? `copyBlock:${sanityHero.key}` : undefined}
          >
            {sanityHero && ( (sanityHero.body && sanityHero.body.length) || sanityHero.bodyPlain) ? (
              sanityHero.body && sanityHero.body.length ? <PortableTextRenderer value={sanityHero.body} /> : <div>{sanityHero.bodyPlain}</div>
            ) : null}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link 
              to="/resorts/ai-assistant"
              className="group bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-8 py-4 rounded-sm text-lg font-medium hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
              Get AI Travel Recommendations
            </Link>
            <button 
              onClick={() => setIsDestinationMapOpen(true)}
              className="border border-white/30 text-white px-8 py-4 rounded-sm text-lg font-light hover:bg-white/10 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
            >
              <MapPin className="w-5 h-5 mr-3" />
              Browse Resorts Yourself
            </button>
          </motion.div>

          {/* Elegant Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-12 mt-16 text-sm font-light tracking-wide"
          >
            <div className="text-center">
              <div className="text-2xl font-thin text-amber-400 mb-1">200+</div>
              <div className="text-gray-400">Premier Resorts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-thin text-amber-400 mb-1">98%</div>
              <div className="text-gray-400">Guest Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-thin text-amber-400 mb-1">24/7</div>
              <div className="text-gray-400">Support Service</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Premium Destinations */}
      <AnimatedSection id="destinations" className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-block border border-amber-400/30 px-6 py-2 rounded-sm bg-gray-900/50 backdrop-blur-sm mb-8"
            >
              <span className="text-amber-400 text-sm font-light tracking-widest">PREMIER DESTINATIONS</span>
            </motion.div>
            {sanityDestinations && sanityDestinations.title ? (
              <h2 data-sanity-source={sanityDestinations && sanityDestinations.key ? `copyBlock:${sanityDestinations.key}` : undefined} className="text-4xl md:text-6xl font-thin mb-8 text-white">{sanityDestinations.title}</h2>
            ) : null}
            {sanityDestinations && ((sanityDestinations.body && sanityDestinations.body.length) || sanityDestinations.bodyPlain) ? (
              <div data-sanity-source={sanityDestinations && sanityDestinations.key ? `copyBlock:${sanityDestinations.key}` : undefined} className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                {sanityDestinations.body && sanityDestinations.body.length ? <PortableTextRenderer value={sanityDestinations.body} /> : <div>{sanityDestinations.bodyPlain}</div>}
              </div>
            ) : null}
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {destinations.map((dest, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-900">
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="w-full h-96 object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-amber-400 text-black px-4 py-1 rounded-sm text-sm font-medium">
                      {dest.type}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-2xl font-light mb-3 text-white">{dest.name}</h3>
                    <p className="text-gray-300 mb-4 font-light">{dest.description}</p>
                    <Link 
                      to={`/resorts/search?destination=${dest.name.toLowerCase().replace(' ', '-')}`} 
                      className="inline-flex items-center text-amber-400 hover:text-white transition-colors duration-300 font-light"
                    >
                      Explore Resorts <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      <footer className="bg-black border-t border-gray-800 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {siteSettings && Array.isArray(siteSettings.footerColumns) && siteSettings.footerColumns.length ? (
              // Render a brand/description column first, then the configured footer columns from siteSettings
              <>
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Sun className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-light text-white">{siteSettings && siteSettings.siteTitle ? siteSettings.siteTitle : null}</span>
                  </div>
                  {siteSettings && siteSettings.siteDescription && siteSettings.siteDescription.length ? (
                    <PortableTextRenderer value={siteSettings.siteDescription} />
                  ) : (sanityFooter && sanityFooter.bodyPlain ? (
                    <p data-sanity-source={sanityFooter && sanityFooter.key ? `copyBlock:${sanityFooter.key}` : undefined} className="text-gray-400 font-light">{sanityFooter.bodyPlain}</p>
                  ) : null)}
                </div>

                {siteSettings.footerColumns.map((col, idx) => (
                  <div key={idx}>
                    <h4 className="font-light mb-6 text-white">{col.title}</h4>
                    <ul className="space-y-3 text-gray-400 font-light">
                      {Array.isArray(col.links) && col.links.length ? col.links.map((lnk, i) => (
                        <li key={i}>
                          {lnk.url ? (
                            <a href={lnk.url} target={lnk.external ? '_blank' : '_self'} rel={lnk.external ? 'noreferrer noopener' : undefined} className="hover:text-white transition-colors">{lnk.title}</a>
                          ) : (
                            <span>{lnk.title}</span>
                          )}
                        </li>
                      )) : null}
                    </ul>
                  </div>
                ))}
              </>
            ) : (
              // Fallback to previous hardcoded layout
              <>
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Sun className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-light text-white" data-sanity-source={siteSettings && siteSettings.siteTitle ? 'siteSettings:siteTitle' : undefined}>{siteSettings && siteSettings.siteTitle ? siteSettings.siteTitle : null}</span>
                  </div>
                  {siteSettings && siteSettings.siteDescription && siteSettings.siteDescription.length ? (
                    <PortableTextRenderer value={siteSettings.siteDescription} />
                  ) : (
                    <p className="text-gray-400 font-light">{sanityFooter && sanityFooter.bodyPlain ? sanityFooter.bodyPlain : "Discovering extraordinary resort experiences across Mexico's most beautiful destinations."}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-light mb-6 text-white">Destinations</h4>
                  <ul className="space-y-3 text-gray-400 font-light">
                    <li><a href="#" className="hover:text-white transition-colors">Riviera Maya</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Los Cabos</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Puerto Vallarta</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Tulum</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-light mb-6 text-white">Resort Types</h4>
                  <ul className="space-y-3 text-gray-400 font-light">
                    <li><a href="#" className="hover:text-white transition-colors">Ultra-Luxury</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Family Paradise</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Adults-Only</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Eco-Luxury</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-light mb-6 text-white">Support</h4>
                  <ul className="space-y-3 text-gray-400 font-light">
                    <li className="flex items-center">
                      <Phone className="w-4 h-4 mr-3" />
                      <span>{(siteSettings && siteSettings.contact && siteSettings.contact.phone) || '1-800-RESORTS'}</span>
                    </li>
                    <li className="flex items-center">
                      <Mail className="w-4 h-4 mr-3" />
                      <span>{(siteSettings && siteSettings.contact && siteSettings.contact.email) || 'help@resortsofmexico.com'}</span>
                    </li>
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 mr-3" />
                      <span>{(siteSettings && siteSettings.contact && siteSettings.contact.supportText) || '24/7 Travel Support'}</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 font-light">
            {siteSettings ? (
              siteSettings.bottomBody && siteSettings.bottomBody.length ? (
                <PortableTextRenderer value={siteSettings.bottomBody} />
              ) : (
                <p>{siteSettings.copyrightText || siteSettings.bottomBodyPlain || null}</p>
              )
            ) : (
              (sanityFooter && sanityFooter.body && sanityFooter.body.length) ? (
                <PortableTextRenderer value={sanityFooter.body} />
              ) : (sanityFooter && sanityFooter.bodyPlain ? (
                <p>{sanityFooter.bodyPlain}</p>
              ) : (
                <p>{null}</p>
              ))
            )}
          </div>
        </div>
      </footer>

      {/* Two-Step Destination Modal */}
      {isDestinationMapOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {destinationModalStep === 1 ? 'Choose Your Destination' : 'Choose Resort Type'}
                  </h2>
                  <p className="text-black/80">
                    {destinationModalStep === 1 
                      ? 'Where would you like to stay in Mexico?' 
                      : `What type of ${selectedRegion} resort experience are you looking for?`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {destinationModalStep === 2 && (
                    <button
                      onClick={() => {
                        setDestinationModalStep(1);
                      }}
                      className="p-2 hover:bg-black/10 rounded-full transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsDestinationMapOpen(false);
                      setDestinationModalStep(1);
                    }}
                    className="p-2 hover:bg-black/10 rounded-full transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 1: Location Selection */}
            {destinationModalStep === 1 && (
              <div className="p-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Riviera Maya */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedRegion('Riviera Maya');
                      setDestinationModalStep(2);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-400/50 transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1570792328831-0c9ce06bf824?w=600&q=80" 
                        alt="Riviera Maya"
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Riviera Maya</h3>
                        <p className="text-gray-300 text-sm mb-3">Ancient Mayan heritage meets luxury beachfront</p>
                        <div className="flex items-center text-amber-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">Caribbean Coast</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Los Cabos */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedRegion('Los Cabos');
                      setDestinationModalStep(2);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-400/50 transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=600&q=80" 
                        alt="Los Cabos"
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Los Cabos</h3>
                        <p className="text-gray-300 text-sm mb-3">Desert landscapes meet Pacific Ocean luxury</p>
                        <div className="flex items-center text-amber-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">Baja California Sur</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Puerto Vallarta */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedRegion('Puerto Vallarta');
                      setDestinationModalStep(2);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-400/50 transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&q=80" 
                        alt="Puerto Vallarta"
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Puerto Vallarta</h3>
                        <p className="text-gray-300 text-sm mb-3">Authentic Mexican culture with Pacific charm</p>
                        <div className="flex items-center text-amber-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">Jalisco Coast</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tulum */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedRegion('Tulum');
                      setDestinationModalStep(2);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-400/50 transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=80" 
                        alt="Tulum"
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Tulum</h3>
                        <p className="text-gray-300 text-sm mb-3">Bohemian luxury meets ancient ruins</p>
                        <div className="flex items-center text-amber-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">Quintana Roo</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Cancun */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedRegion('Cancun');
                      setDestinationModalStep(2);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-400/50 transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80" 
                        alt="Cancun"
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Cancun</h3>
                        <p className="text-gray-300 text-sm mb-3">Vibrant nightlife meets pristine beaches</p>
                        <div className="flex items-center text-amber-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">Hotel Zone</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Playa del Carmen */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedRegion('Playa del Carmen');
                      setDestinationModalStep(2);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-400/50 transition-all duration-300">
                      <img 
                        src="https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=600&q=80" 
                        alt="Playa del Carmen"
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Playa del Carmen</h3>
                        <p className="text-gray-300 text-sm mb-3">Cosmopolitan beach town with local flavor</p>
                        <div className="flex items-center text-amber-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">Quinta Avenida</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Step 2: Resort Type Selection */}
            {destinationModalStep === 2 && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Family Friendly Resort */}
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      handleRegionSelect({ 
                        id: selectedRegion.toLowerCase().replace(' ', '-'), 
                        name: selectedRegion, 
                        type: 'family-friendly' 
                      });
                      setIsDestinationMapOpen(false);
                      setDestinationModalStep(1);
                      setSelectedRegion(null);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-400/50 transition-all duration-300 h-96">
                      <img 
                        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80" 
                        alt="Family Resort"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mb-6">
                          <Users className="w-10 h-10 text-black" />
                        </div>
                        <h3 className="text-3xl font-semibold text-white mb-4">Family-Friendly Resorts</h3>
                        <p className="text-gray-300 text-lg mb-6 max-w-sm">
                          Perfect for families with kids' clubs, water parks, and activities for all ages
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">Kids Clubs</span>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">Water Parks</span>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">Family Suites</span>
                        </div>
                        <div className="inline-flex items-center text-amber-400 font-medium">
                          Choose Family Resort <ChevronRight className="w-5 h-5 ml-2" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Adults Only Resort */}
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      handleRegionSelect({ 
                        id: selectedRegion.toLowerCase().replace(' ', '-'), 
                        name: selectedRegion, 
                        type: 'adults-only' 
                      });
                      setIsDestinationMapOpen(false);
                      setDestinationModalStep(1);
                      setSelectedRegion(null);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-400/50 transition-all duration-300 h-96">
                      <img 
                        src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" 
                        alt="Adults Only Resort"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mb-6">
                          <Waves className="w-10 h-10 text-black" />
                        </div>
                        <h3 className="text-3xl font-semibold text-white mb-4">Adults-Only Resorts</h3>
                        <p className="text-gray-300 text-lg mb-6 max-w-sm">
                          Sophisticated escapes designed for couples seeking tranquility and romance
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">Spa & Wellness</span>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">Fine Dining</span>
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">Peaceful Atmosphere</span>
                        </div>
                        <div className="inline-flex items-center text-amber-400 font-medium">
                          Choose Adults-Only <ChevronRight className="w-5 h-5 ml-2" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Resort Location Selector */}
      {isLocationSelectorOpen && (
        <ResortLocationSelector
          selectedCategory={selectedResortCategory}
          onClose={handleCloseLocationSelector}
        />
      )}

      {/* Navigation Loading Screen - Shows immediately when location is clicked */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-blue-900 via-teal-800 to-green-900 z-50 flex items-center justify-center"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Floating Palm Trees */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-20 left-20"
              >
                <Palmtree className="w-16 h-16 text-green-400 opacity-20" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -3, 3, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute top-40 right-32"
              >
                <Palmtree className="w-12 h-12 text-green-300 opacity-15" />
              </motion.div>

              {/* Floating Waves */}
              <motion.div
                animate={{ 
                  x: [0, 30, 0],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute bottom-20 left-40"
              >
                <Waves className="w-20 h-20 text-blue-400 opacity-20" />
              </motion.div>

              <motion.div
                animate={{ 
                  x: [0, -25, 0],
                  opacity: [0.15, 0.35, 0.15]
                }}
                transition={{ 
                  duration: 7, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute bottom-32 right-20"
              >
                <Waves className="w-16 h-16 text-cyan-400 opacity-25" />
              </motion.div>

              {/* Sun */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute top-16 right-16"
              >
                <Sun className="w-24 h-24 text-yellow-400 opacity-30" />
              </motion.div>
            </div>

            {/* Main Loading Content */}
            <div className="text-center z-10 px-6">
              {/* Animated Resort Icon */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Palmtree className="w-16 h-16 text-black" />
                </div>
              </motion.div>

              {/* Loading Text */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-thin mb-6 text-white"
              >
                Finding Your Perfect Resort
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-cyan-200 font-light mb-8"
              >
                We're on island time... ⏰ 🏝️
              </motion.p>

              {/* Loading Messages */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-3 mb-8"
              >
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-gray-300 text-lg"
                >
                  Taking you to paradise...
                </motion.p>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                  className="text-gray-400"
                >
                  Preparing your luxury escape
                </motion.p>
              </motion.div>

              {/* Animated Loading Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    animate={{ 
                      x: ['-100%', '100%'],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full"
                    style={{ width: '50%' }}
                  />
                </div>
                <p className="text-center text-gray-400 text-sm mt-3">
                  Your perfect resort awaits... 🌺
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
