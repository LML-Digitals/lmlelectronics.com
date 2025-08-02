'use client';
import AccordionItem from './AccordionItem';
import { FAQ } from "@prisma/client";

interface FaqCategoryProps {
  category: string;
  questions: FAQ[];
}

const FaqCategory: React.FC<FaqCategoryProps> = ({ category, questions }) => {
  return (
    <div className="my-6">
      {/* <h2 className='text-2xl font-bold mb-4'>{category}</h2> */}
      <div className="border rounded-lg">
        {questions.map((item, index) => (
          <AccordionItem
            key={index}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </div>
  );
};

export default FaqCategory;
