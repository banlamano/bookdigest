export default function FAQSchema() {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is BookDigest?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BookDigest is a free AI-powered platform that provides concise summaries of over 900 bestselling business, self-help, and personal development books. You can read key insights from bestselling books in just 15 minutes. It\'s the perfect alternative to Blinkist with 100% free access to quality book summaries.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is BookDigest free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! BookDigest offers free access to book summaries. We use a freemium model where you can read 3 free book summaries per month. For unlimited access to all 900+ summaries, audio narrations, and premium features, you can upgrade to our premium plan.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is BookDigest different from Blinkist?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BookDigest is completely free for basic access (3 summaries/month), while Blinkist requires a paid subscription from the start. We offer 900+ AI-powered book summaries with key insights, quotes, and action items. Our summaries are comprehensive, well-structured, and include features like bookmarking and progress tracking.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many book summaries are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We currently have 900+ AI-generated book summaries covering business, self-help, personal development, psychology, productivity, leadership, entrepreneurship, finance, marketing, and more categories. We regularly add new summaries of bestselling and popular books.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to read a book summary?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each book summary is designed to be read in approximately 15 minutes. This saves you 10+ hours compared to reading the full book, while still providing you with the key insights, main ideas, quotes, and actionable takeaways.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of books do you summarize?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We summarize bestselling books in multiple categories: Business books (leadership, management, strategy), Self-help books (productivity, habits, mindset), Personal development (success, motivation), Psychology (behavioral science, decision making), Finance (investing, money management), Marketing, Health & Wellness, and Entrepreneurship. All summaries include key insights and actionable advice.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I listen to audio summaries?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Premium subscribers have access to audio narrations of book summaries, allowing you to learn on the go while commuting, exercising, cooking, or doing other activities. Each audio summary is professionally narrated and syncs with the text version.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the book summaries accurate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Our AI-powered summaries are carefully generated from the original books and include the most important concepts, key insights, memorable quotes, and actionable takeaways. Each summary captures the essence of the book while maintaining accuracy and clarity.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get started with BookDigest?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply create a free account on BookDigest, browse our library of 900+ book summaries, and start reading! You get 3 free summaries per month. No credit card required to start. You can upgrade to premium anytime for unlimited access to all summaries and audio features.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the best business book summaries on BookDigest?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Popular business book summaries include "Atomic Habits" by James Clear, "The 7 Habits of Highly Effective People" by Stephen Covey, "Think and Grow Rich" by Napoleon Hill, "Good to Great" by Jim Collins, and many more bestselling business and leadership books. All summaries include key insights and actionable strategies.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
