'use client';

import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
} from 'react-share';

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  url,
  title,
}) => {
  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Share this post:
      </h3>
      <div className="flex items-center space-x-3">
        <FacebookShareButton url={url}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>

        <TwitterShareButton url={url} title={title}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>

        <LinkedinShareButton
          url={url}
          title={title}
          summary="Check out this blog post!"
        >
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>

        <EmailShareButton
          url={url}
          subject={title}
          body="Check out this blog post:"
        >
          <EmailIcon size={32} round />
        </EmailShareButton>
      </div>
    </div>
  );
};

export default SocialShareButtons;
