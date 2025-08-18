'use client';
import React, { useState } from 'react';

interface AccordionItemProps {
  question: string;
  answer: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='border-b'>
      <button
        className='w-full text-left p-4 flex justify-between items-center'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className='font-semibold'>{question}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <p className='p-4 text-gray-600'>{answer}</p>}
    </div>
  );
};

export default AccordionItem;
