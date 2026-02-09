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
          text: 'BookDigest is an AI-powered platform that provides concise summaries of over 454 business, self-help, and personal development books. You can read or listen to key insights from bestselling books in just 15 minutes.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many book summaries are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We currently have 454+ AI-generated book summaries covering business, self-help, personal development, psychology, productivity, leadership, and more categories.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the summaries free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We offer a freemium model where you can access 3 free book summaries per month. For unlimited access to all summaries and premium features, you can subscribe to our premium plan.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to read a summary?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each book summary is designed to be read in approximately 15 minutes, providing you with the key insights, main ideas, and actionable takeaways from the book.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I listen to audio summaries?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Premium subscribers have access to audio narrations of book summaries, allowing you to learn on the go while commuting, exercising, or doing other activities.',
        },
      },
      {
        '@type': 'Question',
        name: 'What categories of books are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We cover multiple categories including Business, Self-Help, Personal Development, Psychology, Productivity, Leadership, Finance, Marketing, Health & Wellness, and more.',
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
