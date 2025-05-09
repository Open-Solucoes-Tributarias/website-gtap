import "./Banner.css";

export const BannerSection = ({ data }) => {
  const videoBackground = data.filter((video) => video.type === 6);
  const url = videoBackground[0]?.mediaUrl;

  // const videoBackground =
  //   "https://download-video-ak.vimeocdn.com/v3-1/playback/3b147fab-f996-4502-85ad-d7a2b84ff40a/aaafb346-8261fadb?__token__=st=1746820043~exp=1746834443~acl=%2Fv3-1%2Fplayback%2F3b147fab-f996-4502-85ad-d7a2b84ff40a%2Faaafb346-8261fadb%2A~hmac=55aaaed071a94dabe2d51fb33582c9856861ed70272479a8d503e222c2d0ec64&r=dXMtY2VudHJhbDE%3D";

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
