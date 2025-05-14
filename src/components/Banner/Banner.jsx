import "./Banner.css";

export const BannerSection = ({ data }) => {
  const videoBackground = data.filter((video) => video.type === 6);
  const url = videoBackground[0]?.mediaUrl;

  return (
    <section className="banner-container">
      <video
        className="video-background"
        src={url}
        autoPlay
        muted
        loop
        playsInline
      />
    </section>
  );
};
