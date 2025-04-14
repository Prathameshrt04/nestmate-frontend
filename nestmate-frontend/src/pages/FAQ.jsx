import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I list a flat on NestMate?',
      answer: 'Sign up or log in, go to your dashboard, and click "Add Listing." Select "Flat" as the type, fill in the details (e.g., location, BHK type, price), and submit. Your listing will be reviewed and published soon!',
    },
    {
      question: 'Can I offer services like cleaning or messes?',
      answer: 'Yes! Use the "Add Listing" option in your dashboard, select "Service" or "Mess," and provide details such as service type, pricing, and availability. It’s a great way to reach users in your area.',
    },
    {
      question: 'How do I search for a flat or room?',
      answer: 'Use the search bar on the homepage by entering your desired city or location (e.g., "Pune"). Filter results by flat type, price, or amenities to find the perfect match.',
    },
    {
      question: 'Is there a fee to use NestMate?',
      answer: 'NestMate is free for users to browse and connect. Listing a flat or service is also free, though premium features (e.g., promoted listings) may be available for a small fee in the future.',
    },
    {
      question: 'How do I contact a flat owner or service provider?',
      answer: 'Once you find a listing, click "View" to see details and use the "Contact" option to message the owner or provider directly through our secure platform.',
    },
    {
      question: 'What if I encounter an issue with a listing?',
      answer: 'Report it via the "Report" button on the listing page. Our admin team reviews reports promptly to ensure quality and safety on the platform.',
    },
    {
      question: 'Can I rate services or flats?',
      answer: 'Yes, after interacting with a flat owner or service provider, you can leave a rating and review on their listing to help other users make informed decisions.',
    },
    {
      question: 'How does NestMate ensure the quality of listings?',
      answer: 'All listings are moderated by our admin team. We verify key details and remove spam or inappropriate content to maintain a trusted community.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center animate-fade-in">
          <HelpCircle size={32} className="mr-2" />
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto animate-on-scroll opacity-0">
          Got questions? We’ve got answers. Explore common queries about using NestMate below.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden animate-on-scroll opacity-0"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left p-6 flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors duration-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 flex-1 pr-4">
                {faq.question}
              </h2>
              <ChevronDown
                size={24}
                className={`text-gray-600 transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : ''}`}
              />
            </button>
            {openFAQ === index && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 animate-slide-down">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Animation Styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            height: 0;
          }
          to {
            opacity: 1;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQ;