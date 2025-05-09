import "./Banner.css";

export const BannerSection = () => {
  const videoBackground =
    "https://player.vimeo.com/video/1082559677?autoplay=1&muted=1&background=1&loop=1";

  return (
    <section
      className="banner-container"
      style={{ background: `url(${videoBackground})` }}
    >
      <iframe
        src="https://player.vimeo.com/video/1082559677?autoplay=1&muted=1&background=1&loop=1"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="video-background"
      ></iframe>
    </section>
  );
};
