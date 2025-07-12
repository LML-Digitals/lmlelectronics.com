import React from "react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Contact Us</h1>
        <p className="text-gray-600 mb-8 text-center">
          Have a question or need help? Fill out the form below and our team will get back to you as soon as possible.
        </p>
        <form className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                placeholder="First Name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                placeholder="Last Name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
              placeholder="Subject"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-secondary outline-none resize-none"
              placeholder="How can we help you?"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Send Message
          </button>
        </form>
        <div className="mt-10 border-t pt-8 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-semibold mb-2">Business Contact</h2>
            <p className="text-gray-700">support@lmlelectronics.com</p>
            <p className="text-gray-700">1-800-LML-ELECTRONICS</p>
            <p className="text-gray-700">Mon-Fri: 9AM-6PM EST</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {/* Map Placeholder */}
            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              Map Placeholder
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 