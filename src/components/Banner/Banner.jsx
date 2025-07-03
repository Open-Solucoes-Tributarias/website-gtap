import "./Banner.css";

export const BannerSection = ({ data }) => {
  const videoBackground = data.find((video) => video.type === 6);
  const url = videoBackground?.mediaUrl;

  return (
    <section className="banner-container" id="inicio">
      <video
        className="video-background"
        src={url}
        preload="none"
        poster="./preloadBanner.webp"
        autoPlay
        muted
        loop
        playsInline
      />
    </section>
  );
};
