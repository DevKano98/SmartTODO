import { useState, useEffect } from 'react';

const quotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  }
];

const DailyQuote = () => {
  const [quote, setQuote] = useState(null);
  
  useEffect(() => {
    // Get a random quote or use a quote API
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
    
    // Alternative: Fetch from a quote API
     const fetchQuote = async () => {
       try {
         const response = await fetch('https://api.quotable.io/random');
         const data = await response.json();
         setQuote({ text: data.content, author: data.author });
       } catch (error) {
         console.error('Error fetching quote:', error);
         const randomIndex = Math.floor(Math.random() * quotes.length);
         setQuote(quotes[randomIndex]);
       }
     };
     fetchQuote();
  }, []);
  
  if (!quote) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {quote.text}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            — {quote.author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyQuote;
