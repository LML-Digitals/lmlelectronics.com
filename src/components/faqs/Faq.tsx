'use client';

import { useState, useEffect } from 'react';
import { FAQ } from '@prisma/client';
import {
  getPublicFAQsByCategory,
  searchPublicFAQs,
  submitFAQQuestion,
} from './services/faqService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import FaqAccordion from './FaqAccordion';
import FaqQuestionForm from './FaqQuestionForm';

export default function Faq() {
  const [categorizedFaqs, setCategorizedFaqs] = useState<Record<string, FAQ[]>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    question: '',
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    setIsLoading(true);
    try {
      const faqs = await getPublicFAQsByCategory();
      setCategorizedFaqs(faqs);
      setActiveCategory(Object.keys(faqs)[0] || null);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchPublicFAQs(query);
      setCategorizedFaqs({ 'Search Results': results });
      setActiveCategory('Search Results');
    } else {
      loadFAQs();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitFAQQuestion(formData);
      setFormData({ customerName: '', customerEmail: '', question: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* FAQ Section */}
      <div id="faq-section" className="space-y-8 mb-16">
        {/* Search and Categories Section */}
        <div className="bg-white rounded-xl p-6">
          {/* Search Bar */}
          <div className="relative mb-12">
            <div className="relative max-w-xl mx-auto">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary/70 transition-colors group-hover:text-secondary"
                    size={24}
                  />
                  <Input
                    type="search"
                    placeholder="What can we help you find?"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-14 h-12 text-base w-full border-2 border-gray-100 bg-gray-50/50 shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-300 rounded-xl focus:border-secondary/20 focus:ring-2 focus:ring-secondary/10"
                  />
                </div>
                {/* {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )} */}
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Type your question or keyword to search through our FAQs
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-2 p-1 bg-[#F5F6F7] rounded-xl">
              {Object.keys(categorizedFaqs).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-1.5 rounded-full border transition-all duration-200 text-sm font-medium whitespace-nowrap
                    ${
                      activeCategory === category
                        ? 'border-yellow-400 bg-yellow-50 text-yellow-900 shadow-sm'
                        : 'border-transparent text-gray-700 hover:border-yellow-200 hover:bg-yellow-50/50'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        {activeCategory && categorizedFaqs[activeCategory] && (
          <div className="max-w-7xl mx-auto">
            <FaqAccordion faqs={categorizedFaqs[activeCategory]} />
          </div>
        )}
      </div>

      {/* Question Form Section */}
      <div id="question-form" className=" mt-32">
        <FaqQuestionForm />
      </div>
    </div>
  );
}
