"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "../../../components/Icon/Icon";
import { lockScroll, unlockScroll } from "../../../motion/scrollLock";
import {
  describeFace, describeVideo, findPhotos, getEngineStatus, getServerStatus,
  preloadEngine, retryEngine, subscribeEngine, toCanvas,
} from "../../../faceSearch/engine";
import "./FaceSearch.css";

// Âncora da seção: /galeria/#encontre-suas-fotos leva direto ao botão (e é o endereço que fica na barra ao abrir a busca).
export const FACE_ANCHOR = "encontre-suas-fotos";

// Deixa o navegador pintar o estado "ocupado" antes de começar a conta pesada (a primeira inferência
// trava a thread principal por segundos no celular; sem isso o clique parece não ter feito nada).
const nextPaint = () => new Promise((resolve) => {
  const timer = setTimeout(resolve, 120);
  requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(timer); resolve(); }));
});

// Conexão que não deve baixar ~13 MB sozinha: nesses casos a pré-carga só começa por intenção (hover, foco, clique).
const canPreloadAlone = () => {
  const connection = navigator.connection;
  if (!connection) return true;
  return !connection.saveData && !["slow-2g", "2g"].includes(connection.effectiveType);
};

const NOTICES = {
  none: "Não encontramos um rosto na imagem. Tente de novo com boa luz, de frente e sem boné ou óculos escuros.",
  multiple: "Há mais de um rosto na imagem. Use uma foto só sua.",
  small: "O rosto ficou pequeno na imagem. Aproxime-se da câmera ou use uma foto mais fechada.",
  empty: "Não encontramos fotos suas neste álbum. Tente com outra foto, de frente e bem iluminada.",
  emptyAll: "Não encontramos fotos suas na galeria. Tente com outra foto, de frente e bem iluminada.",
  camera: "Não foi possível acessar a câmera. Envie uma foto sua.",
};

// Faixa de preparo do motor. Só aparece enquanto carrega (ou falha): com tudo pronto, some e deixa as ações.
// A barra anima só com transform, então segue se mexendo mesmo quando a thread principal está ocupada.
const EngineStatus = ({ engine, onRetry }) => {
  if (engine.state === "ready" || engine.state === "idle") return null;
  if (engine.state === "error" || engine.stalled) {
    return (
      <div className="face-prepare" data-tone="warn" role="alert">
        <p className="face-prepare-text">
          {engine.state === "error"
            ? "Não foi possível preparar a busca. Verifique a conexão e tente de novo."
            : "Está demorando mais que o normal. Verifique a conexão."}
        </p>
        <button type="button" className="face-trigger face-trigger--light" onClick={onRetry}>Tentar de novo</button>
      </div>
    );
  }
  const warming = engine.progress >= 0.9; // o que falta (aquecer a IA) não é mensurável: varredura contínua
  return (
    <div className="face-prepare" role="status">
      <p className="face-prepare-text">
        <span className="face-spinner" aria-hidden="true" />
        Preparando a busca…
        {!warming && <span className="face-prepare-pct">{Math.round(engine.progress * 100)}%</span>}
      </p>
      <div className="face-meter" data-warming={warming || undefined} aria-hidden="true">
        <i style={warming ? undefined : { transform: `scaleX(${engine.progress})` }} />
      </div>
    </div>
  );
};

// "Encontre suas fotos": a selfie é processada no próprio aparelho (nada é enviado).
// O motor (biblioteca, modelos e índices) é pré-carregado quando a barra aparece na tela, para o diálogo
// abrir pronto; se a conexão for lenta/econômica, só carrega ao interagir.
// albums: pastas dos álbuns pesquisados (um, na página do álbum; todos, na galeria).
export const FaceSearch = ({ albums, scope = "album", matchCount, onResults, onClear }) => {
  const dialogRef = useRef(null);
  const barRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const triggerRef = useRef(null);
  const [phase, setPhase] = useState("ready"); // ready | camera | error (falha da análise)
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(""); // o que está acontecendo durante a busca
  // Aceite da política (pedido a cada visita; nada é gravado no aparelho).
  const [accepted, setAccepted] = useState(false);
  const [notice, setNotice] = useState("");
  const engine = useSyncExternalStore(subscribeEngine, getEngineStatus, getServerStatus);
  // Decidido depois da hidratação: o servidor não sabe se há câmera, e o diálogo já vem desenhado no HTML.
  const [hasCamera, setHasCamera] = useState(false);
  useEffect(() => { setHasCamera(Boolean(navigator.mediaDevices?.getUserMedia)); }, []);

  // Idempotente: hover, foco, clique e a barra visível chamam a mesma pré-carga.
  const preload = () => { preloadEngine(albums).catch(() => {}); };
  const retry = () => { retryEngine(albums).catch(() => {}); };

  // Barra perto da tela (e conexão boa): começa a preparar no tempo ocioso, antes de qualquer clique.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof IntersectionObserver === "undefined") return undefined;
    let idle = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      if (!canPreloadAlone()) return;
      const start = () => { preloadEngine(albums).catch(() => {}); };
      idle = "requestIdleCallback" in window ? window.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 600);
    }, { rootMargin: "300px" });
    observer.observe(bar);
    return () => {
      observer.disconnect();
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, [albums]);

  const open = (event) => {
    triggerRef.current = event.currentTarget;
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    lockScroll();
    history.replaceState(null, "", `#${FACE_ANCHOR}`);
    preload();
  };

  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const onClose = () => {
      unlockScroll();
      setPhase("ready");
      setBusy(false);
      setStage("");
      triggerRef.current?.focus({ preventScroll: true });
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  // Câmera frontal enquanto o passo "camera" estiver ativo; desliga ao sair.
  useEffect(() => {
    if (phase !== "camera") return undefined;
    let cancelled = false;
    let stream;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      .then((media) => {
        if (cancelled) return media.getTracks().forEach((track) => track.stop());
        stream = media;
        videoRef.current.srcObject = media;
        return videoRef.current.play();
      })
      .catch(() => {
        if (cancelled) return;
        setNotice(NOTICES.camera);
        setPhase("ready");
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [phase]);

  const run = async (describe) => {
    setBusy(true);
    setNotice("");
    // Se o motor ainda estiver carregando, a pessoa já pode ter aberto a câmera ou escolhido a foto:
    // esperamos aqui (com a faixa de progresso visível) e seguimos sozinhos.
    setStage(getEngineStatus().state === "ready" ? "Analisando seu rosto…" : "Preparando a busca…");
    await nextPaint();
    try {
      const faceapi = await preloadEngine(albums);
      setStage("Analisando seu rosto…");
      await nextPaint();
      const result = await describe(faceapi);
      if (result.status !== "ok") {
        setNotice(NOTICES[result.status]);
        setPhase("ready");
        return;
      }
      setStage("Procurando nas fotos…");
      await nextPaint();
      const hits = await findPhotos(albums, result.descriptor);
      if (!hits.length) {
        setNotice(NOTICES[scope === "all" ? "emptyAll" : "empty"]);
        setPhase("ready");
        return;
      }
      onResults(hits);
      close();
    } catch {
      setPhase("error");
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const capture = () => run((faceapi) => describeVideo(
    faceapi,
    videoRef.current,
    (step, total) => setStage(`Analisando seu rosto (${step} de ${total})…`),
  ));

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await run(async (faceapi) => {
      const bitmap = await createImageBitmap(file);
      try {
        return await describeFace(faceapi, toCanvas(bitmap));
      } finally {
        bitmap.close?.();
      }
    });
  };

  const loading = engine.state === "loading";

  return (
    <>
      <div className="face-bar" id={FACE_ANCHOR} ref={barRef} data-active={matchCount != null || undefined}>
        {matchCount == null ? (
          <>
            {/* Moldura de câmera com linha de varredura: sinaliza "reconhecimento de rosto" sem expor ninguém. */}
            <div className="face-viewfinder" aria-hidden="true"><Icon name="user" /></div>
            <div className="face-bar-copy">
              <h2 className="face-bar-title">
                Encontre suas fotos <b>{scope === "all" ? "em todas as edições" : "neste álbum"}</b>
              </h2>
              <p className="face-bar-sub">Tire uma selfie ou envie uma foto. Mostramos só as fotos em que você aparece.</p>
              <p className="face-bar-trust"><Icon name="lock" /> Seus dados estão seguros</p>
            </div>
            <button
              type="button"
              className="btn btn--gold face-bar-cta"
              onClick={open}
              onPointerEnter={preload}
              onFocus={preload}
              data-loading={loading || undefined}
              style={loading ? { "--p": engine.progress } : undefined}
            >
              <Icon name="search" /> Buscar minhas fotos
            </button>
          </>
        ) : (
          <>
            <p className="face-bar-count" aria-live="polite">
              <b>{matchCount}</b>
              <span>{matchCount === 1 ? "foto" : "fotos"} com você {scope === "all" ? "na galeria" : "neste álbum"}</span>
            </p>
            <div className="face-bar-actions">
              <button type="button" className="btn btn--outline" onClick={open}>Buscar de novo</button>
              <button type="button" className="face-bar-clear" onClick={onClear}>Ver todas as fotos</button>
            </div>
          </>
        )}
      </div>

      <dialog ref={dialogRef} className="face-dialog" aria-labelledby="face-title">
        <div className="face-panel">
          <button type="button" className="face-close" onClick={close} aria-label="Fechar">
            <Icon name="close" />
          </button>
          <h2 id="face-title" className="face-title">Encontre suas fotos</h2>
          <p className="face-privacy">
            Sua foto é analisada <b>no seu aparelho</b>: ela não é enviada nem guardada em nenhum servidor.
          </p>

          <EngineStatus engine={engine} onRetry={retry} />

          {notice && <p className="face-notice" role="alert">{notice}</p>}

          {phase === "error" && (
            <div className="face-status" role="alert">
              <p>Não foi possível concluir a busca. Verifique a conexão e tente de novo.</p>
              <button type="button" className="face-trigger" onClick={() => { setPhase("ready"); if (engine.state === "error") retry(); }}>Tentar de novo</button>
            </div>
          )}

          {(phase === "ready" || phase === "camera") && (
            <label className="face-consent">
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} disabled={busy} />
              <span>
                Li e aceito a <a href="/privacidade/#busca-facial" target="_blank" rel="noopener noreferrer">Política de Privacidade<span className="sr-only"> (abre em nova aba)</span></a>.
                Autorizo o uso da minha imagem, neste aparelho, apenas para procurar as minhas fotos.
              </span>
            </label>
          )}

          {phase === "ready" && (
            <div className="face-actions">
              {hasCamera && (
                <button type="button" className="face-trigger" onClick={() => { setNotice(""); setPhase("camera"); }} disabled={busy || !accepted}>
                  <Icon name="camera" /> Tirar uma selfie
                </button>
              )}
              <button type="button" className="face-trigger face-trigger--light" onClick={() => fileRef.current?.click()} disabled={busy || !accepted} data-busy={busy || undefined}>
                {busy ? <><span className="face-spinner" aria-hidden="true" /> Analisando…</> : "Enviar uma foto minha"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
              {busy && <p className="face-progress" role="status"><span className="face-spinner" aria-hidden="true" />{stage}</p>}
            </div>
          )}

          {phase === "camera" && (
            <div className="face-camera">
              <div className="face-stage" data-busy={busy || undefined}>
                <video ref={videoRef} className="face-video" playsInline muted aria-label="Prévia da câmera" />
                {/* Moldura e varredura (só transform: seguem animando mesmo com a thread ocupada). */}
                {busy && <span className="face-scan" aria-hidden="true"><span className="face-scan-sweep" /></span>}
              </div>
              {busy
                ? <p className="face-progress" role="status"><span className="face-spinner" aria-hidden="true" />{stage}</p>
                : <p className="face-hint">Fique de frente, com boa luz, e olhe para a câmera.</p>}
              <div className="face-actions">
                <button type="button" className="face-trigger" onClick={capture} disabled={busy || !accepted} data-busy={busy || undefined}>
                  {busy ? <><span className="face-spinner" aria-hidden="true" /> {stage.startsWith("Preparando") ? "Preparando…" : "Analisando…"}</> : "Tirar foto e buscar"}
                </button>
                <button type="button" className="face-link" onClick={() => setPhase("ready")} disabled={busy}>Voltar</button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
};
