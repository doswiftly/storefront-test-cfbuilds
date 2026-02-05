"use client";

import { useState } from "react";
import { Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * SocialShare - Share on social media buttons
 */
export function SocialShare({
  url,
  title,
  description = "",
  className = "",
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const width = 600;
    const height = 400;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      shareLinks[platform],
      "share",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Share:
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("facebook")}
        aria-label="Share on Facebook"
        className="h-9 w-9 p-0"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("twitter")}
        aria-label="Share on Twitter"
        className="h-9 w-9 p-0"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("linkedin")}
        aria-label="Share on LinkedIn"
        className="h-9 w-9 p-0"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        aria-label="Copy link"
        className="h-9 w-9 p-0"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export interface SocialShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * SocialShareButton - Single button that opens a share dialog
 */
export function SocialShareButton({
  url,
  title,
  description = "",
  className = "",
}: SocialShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button variant="outline" size="sm" onClick={handleNativeShare}>
        <Link2 className="mr-2 h-4 w-4" />
        Share
      </Button>

      {isOpen && !navigator.share && (
        <div className="absolute right-0 top-full mt-2 z-10">
          <SocialShare
            url={url}
            title={title}
            description={description}
            className="bg-background border border-border rounded-lg p-3 shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
