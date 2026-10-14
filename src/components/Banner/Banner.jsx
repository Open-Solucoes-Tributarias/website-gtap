"use client";

import { useEffect, useRef, useState } from "react";
import "./Banner.css";
import ResponsiveImage from '../ResponsiveImage/ResponsiveImage';
import generatedVideo from "../../data/generated-video.json";

const POSTER_URL = "/preloadBanner.webp";

export const BannerSection = ({ data, poster }) => {
  const videoBackground = data.find((video) => video.type === 6);
  // O original em midias/ tem 122 MB; usa a versão otimizada versionada (public/optimized-video/).
  const videoUrl = videoBackground?.mediaUrl === generatedVideo.source ? generatedVideo.src : videoBackground?.mediaUrl;
  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // O vídeo está no HTML desde o início (autoPlay, como na versão anterior) e pode
  // começar antes da hidratação: o React não grava o atributo muted no HTML do
  // servidor, então garante o mudo, tenta tocar e sincroniza o pôster com o estado real.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (!video.paused && video.currentTime > 0) setVideoPlaying(true);
    else video.play().catch(() => { /* Autoplay bloqueado: mantém o pôster. */ });
  }, []);

  return (
    <section className="banner-container" id="inicio">
      <ResponsiveImage
        image={poster}
        className={`banner-poster${videoPlaying ? " is-hidden" : ""}`}
        src={POSTER_URL}
        sizes="100vw"
        width="1920"
        height="1170"
        alt=""
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
      {videoUrl && (
        <video
          ref={videoRef}
          className="video-background"
          src={videoUrl}
          preload="none"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          onPlaying={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
        />
      )}
    </section>
  );
};
