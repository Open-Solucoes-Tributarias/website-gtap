import React from "react";
import "./Banner.css";

export const BannerSection = () => {
  return (
    <section className="banner-container">
      <iframe
        src="https://player.vimeo.com/video/1053366353?autoplay=1&muted=1&background=1&loop=1"
        frameBorder="0"
        allow="autoplay; fullscreen"
        width="100%"
        height="100%"
        allowFullScreen
        className="video-background"
      ></iframe>
    </section>
  );
};
