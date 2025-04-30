import React from "react";
import "./Banner.css";

export const BannerSection = () => {
  return (
    <section className="banner-container">
      {/* <iframe
        src="https://player.vimeo.com/video/1053366353?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="video-background"
      ></iframe> */}
      <img className="video-background" src="https://static.wixstatic.com/media/1b1ecf_41c945a16e36485d9f1cf206caae0043~mv2.jpg/v1/fill/w_640,h_270,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/1b1ecf_41c945a16e36485d9f1cf206caae0043~mv2.jpg"></img>
    </section>
  );
};
