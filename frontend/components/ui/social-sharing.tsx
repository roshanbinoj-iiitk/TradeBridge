"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Mail, 
  Link, 
  Copy,
  QrCode,
  Download,
  Check
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/shared/AuthContext';

interface SocialSharingProps {
  productId?: number;
  postId?: number;
  profileId?: string;
  shareType: 'product' | 'post' | 'profile';
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export default function SocialSharing({
  productId,
  postId,
  profileId,
  shareType,
  title,
  description,
  imageUrl,
  className,
  variant = 'button',
  size = 'md'
}: SocialSharingProps) {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');

  React.useEffect(() => {
    // Generate the share URL based on the type
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    let url = '';
    
    switch (shareType) {
      case 'product':
        url = `${baseUrl}/products/${productId}`;
        break;
      case 'post':
        url = `${baseUrl}/forum/post/${postId}`;
        break;
      case 'profile':
        url = `${baseUrl}/profile/${profileId}`;
        break;
    }
    
    setShareUrl(url);
    
    // Generate QR code data URL (you'd need a QR code library for actual implementation)
    setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`);
  }, [shareType, productId, postId, profileId]);

  const trackShare = async (platform: string) => {
    if (!user) return;

    try {
      const supabase = createClient();
      await supabase
        .from('social_shares')
        .insert({
          user_id: user.id,
          product_id: productId,
          forum_post_id: postId,
          platform,
          share_url: shareUrl,
          referrer_url: typeof window !== 'undefined' ? window.location.href : ''
        });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const handleShare = async (platform: string) => {
    await trackShare(platform);
    
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || '');
    const text = `${title} - Check this out on TradeBridge!`;
    const encodedText = encodeURIComponent(text);

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
          '_blank',
          'width=600,height=400'
        );
        break;
        
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
          '_blank',
          'width=600,height=400'
        );
        break;
        
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
          '_blank',
          'width=600,height=400'
        );
        break;
        
      case 'whatsapp':
        const whatsappText = `${text} ${shareUrl}`;
        if (/Android|iPhone/i.test(navigator.userAgent)) {
          window.open(`whatsapp://send?text=${encodeURIComponent(whatsappText)}`);
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
        }
        break;
        
      case 'email':
        const subject = encodeURIComponent(`Check out: ${title}`);
        const body = encodeURIComponent(`${description || ''}\n\n${shareUrl}\n\nShared via TradeBridge`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
        break;
        
      case 'copy_link':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
          console.error('Failed to copy link:', error);
        }
        break;
        
      default:
        break;
    }
    
    setShowDialog(false);
  };

  const handleNativeShare = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: title,
          text: description || '',
          url: shareUrl,
        });
        await trackShare('native_share');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const ShareButton = () => {
    const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
    
    if (variant === 'icon') {
      return (
        <Button variant="ghost" size="sm" className={className}>
          <Share2 className="h-4 w-4" />
        </Button>
      );
    }
    
    if (variant === 'text') {
      return (
        <button className={`text-gray-500 hover:text-blue-600 text-sm ${className}`}>
          Share
        </button>
      );
    }
    
    return (
      <Button variant="outline" size={buttonSize} className={className}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    );
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <div onClick={() => {
          // Check if native sharing is available and preferred
          if ('share' in navigator && /Android|iPhone/i.test(navigator.userAgent)) {
            handleNativeShare();
          } else {
            setShowDialog(true);
          }
        }}>
          <ShareButton />
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {shareType}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex gap-3">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{title}</h4>
                {description && (
                  <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
                )}
                <p className="text-xs text-blue-600 mt-1 truncate">{shareUrl}</p>
              </div>
            </div>
          </div>
          
          {/* Social Platforms */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share on social media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleShare('facebook')}
              >
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center mr-3">
                  <Facebook className="h-3 w-3 text-white" />
                </div>
                Facebook
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleShare('twitter')}
              >
                <div className="w-5 h-5 bg-black rounded flex items-center justify-center mr-3">
                  <Twitter className="h-3 w-3 text-white" />
                </div>
                Twitter
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleShare('linkedin')}
              >
                <div className="w-5 h-5 bg-blue-700 rounded flex items-center justify-center mr-3">
                  <Linkedin className="h-3 w-3 text-white" />
                </div>
                LinkedIn
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleShare('whatsapp')}
              >
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center mr-3">
                  <MessageCircle className="h-3 w-3 text-white" />
                </div>
                WhatsApp
              </Button>
            </div>
          </div>
          
          {/* Other Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Other options</Label>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShare('email')}
              >
                <Mail className="h-4 w-4 mr-3" />
                Send via email
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShare('copy_link')}
              >
                {copySuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-3" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">QR Code</Label>
            <div className="flex items-center justify-center p-4 bg-white border rounded-lg">
              <img 
                src={qrCodeData} 
                alt="QR Code"
                className="w-32 h-32"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrCodeData;
                link.download = `${shareType}-qr-code.png`;
                link.click();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
          
          {/* Direct Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Direct link</Label>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('copy_link')}
              >
                {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Share Statistics */}
          {user && (
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Share to earn engagement points</span>
                <Badge variant="secondary" className="text-xs">
                  +5 points
                </Badge>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
