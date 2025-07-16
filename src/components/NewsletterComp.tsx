"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";

type Inputs = {
  email: string;
};

function NewsletterComp() {
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    mode: "onChange",
  });

  const onSubmit = async (data: Inputs) => {
    setIsPending(true);
    try {
      // TODO: Implement newsletter signup logic
      console.log("Newsletter signup:", data.email);
      reset();
      // You can add a toast notification here
    } catch (error) {
      console.log(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-center lg:text-start">
          Get The Latest Deals!
        </h1>
        <p className="text-sm text-gray-300 text-center lg:text-start">
          Stay updated with exclusive offers and repair tips
        </p>
      </div>

      <form
        className="flex flex-col items-center md:items-start flex-wrap gap-4 text-black xl:w-4/5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col w-full">
          <Input
            type="email"
            placeholder="Enter your email*"
            className={`py-2 ${errors.email ? "border-red-500" : ""}`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          className="bg-secondary hover:bg-yellow-400 text-black transition-all font-bold w-full"
          disabled={isPending}
        >
          {isPending ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </div>
  );
}

export default NewsletterComp; 