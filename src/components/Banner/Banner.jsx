import React from "react";
import "./Banner.css";

export const BannerSection = () => {
  return (
    <section className="banner-container">
      <iframe
        src="https://player.vimeo.com/video/1033581358?h=84fd63e06e&title=0&muted=1&autoplay=1&autopause=0&loop=1&app_id=122963"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="video-background"
      ></iframe>
    </section>
  );
};
