'use client';

import { Facebook, Twitter, Linkedin, Link2, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface SocialShareButtonsProps {
  bookTitle: string;
  bookAuthor: string;
  bookUrl?: string;
}

export default function SocialShareButtons({ 
  bookTitle, 
  bookAuthor,
  bookUrl 
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Generate share URL (use current page URL if not provided)
  const shareUrl = bookUrl || (typeof window !== 'undefined' ? window.location.href : '');
  
  // Share text
  const shareText = `Just read an amazing summary of "${bookTitle}" by ${bookAuthor} on BookDigest! 📚`;
  const hashTags = 'BookSummary,Reading,Books,PersonalDevelopment';

  // Social share URLs
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashTags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out: ${bookTitle}`)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    // Track share event with Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'book',
        item_id: bookTitle,
      });
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📢 Share this summary
      </h3>
      <div className="flex flex-wrap gap-3">
        {/* Twitter */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('Twitter')}
          className="flex items-center space-x-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
          <span className="text-sm font-medium">Twitter</span>
        </a>

        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('Facebook')}
          className="flex items-center space-x-2 px-4 py-2 bg-[#4267B2] hover:bg-[#365899] text-white rounded-lg transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
          <span className="text-sm font-medium">Facebook</span>
        </a>

        {/* LinkedIn */}
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('LinkedIn')}
          className="flex items-center space-x-2 px-4 py-2 bg-[#0077B5] hover:bg-[#006399] text-white rounded-lg transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
          <span className="text-sm font-medium">LinkedIn</span>
        </a>

        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('WhatsApp')}
          className="flex items-center space-x-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-colors"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">WhatsApp</span>
        </a>

        {/* Email */}
        <a
          href={shareLinks.email}
          onClick={() => handleShare('Email')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          aria-label="Share via Email"
        >
          <Mail className="w-4 h-4" />
          <span className="text-sm font-medium">Email</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          aria-label="Copy link"
        >
          <Link2 className="w-4 h-4" />
          <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Social proof text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        💡 Share this summary with friends who love reading!
      </p>
    </div>
  );
}
