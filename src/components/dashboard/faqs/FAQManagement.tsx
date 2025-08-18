'use client';

import { useState, useEffect, useCallback } from 'react';
import { FAQ } from '@prisma/client';
import { getFAQs, searchFAQs, getFAQCategories } from './Services/faqCrud';
import FAQForm from './FAQForm';
import FAQList from './FAQList';
import FAQFilter from './FAQFilter';
import { Button } from '@/components/ui/button';

export default function FAQManagement () {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isPublished: undefined as boolean | undefined,
  });

  // Load categories only once when component mounts
  useEffect(() => {
    loadCategories();
    handleSearch(); // Initial load
  }, []);

  const loadCategories = async () => {
    try {
      const categories = await getFAQCategories();

      setCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      const results = await searchFAQs(
        filters.search,
        filters.category,
        filters.isPublished,
      );

      setFaqs(results);
    } catch (error) {
      console.error('Error searching FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleSearch]);

  const handleFormSuccess = () => {
    handleSearch();
    setShowForm(false);
    setEditingFaq(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl font-semibold">FAQ Entries</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="text-white px-4 py-2 rounded-md min-h-[44px] text-sm sm:text-base"
        >
          Add New FAQ
        </Button>
      </div>

      <FAQFilter
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <div className="text-center py-8 text-sm sm:text-base">Loading...</div>
      ) : (
        <FAQList faqs={faqs} onEdit={setEditingFaq} onUpdate={handleSearch} />
      )}

      {(showForm || editingFaq) && (
        <FAQForm
          faq={editingFaq}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingFaq(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
