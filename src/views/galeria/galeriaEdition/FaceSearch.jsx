"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../../../components/Icon/Icon";
import { lockScroll, unlockScroll } from "../../../motion/scrollLock";
import { describeFace, describeVideo, findPhotos, loadEngine, loadIndex, loadManifest, toCanvas } from "../../../faceSearch/engine";
import "./FaceSearch.css";

// Âncora da seção: /galeria/#encontre-suas-fotos leva direto ao botão (e é o endereço que fica na barra ao abrir a busca).
export const FACE_ANCHOR = "encontre-suas-fotos";

const NOTICES = {
  none: "Não encontramos um rosto na imagem. Tente de novo com boa luz, de frente e sem boné ou óculos escuros.",
  multiple: "Há mais de um rosto na imagem. Use uma foto só sua.",
  small: "O rosto ficou pequeno na imagem. Aproxime-se da câmera ou use uma foto mais fechada.",
  empty: "Não encontramos fotos suas neste álbum. Tente com outra foto, de frente e bem iluminada.",
  emptyAll: "Não encontramos fotos suas na galeria. Tente com outra foto, de frente e bem iluminada.",
  camera: "Não foi possível acessar a câmera. Envie uma foto sua.",
};

// "Encontre suas fotos": a selfie é processada no próprio aparelho (nada é enviado).
// Biblioteca, modelos e índice só são baixados quando a pessoa abre o diálogo.
// albums: pastas dos álbuns pesquisados (um, na página do álbum; todos, na galeria).
export const FaceSearch = ({ albums, scope = "album", matchCount, onResults, onClear }) => {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const triggerRef = useRef(null);
  const [phase, setPhase] = useState("preparing"); // preparing | ready | camera | error
  const [busy, setBusy] = useState(false);
  // Aceite da política (pedido a cada visita; nada é gravado no aparelho).
  const [accepted, setAccepted] = useState(false);
  const [notice, setNotice] = useState("");
  const hasCamera = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

  // Ao passar o mouse/foco no botão, só o manifest e o índice (poucos KB) são antecipados.
  const warm = useCallback(() => {
    loadManifest().then(() => Promise.all(albums.map(loadIndex))).catch(() => {});
  }, [albums]);

  const prepare = useCallback(async () => {
    setPhase("preparing");
    setNotice("");
    try {
      await Promise.all([...albums.map(loadIndex), loadEngine()]);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }, [albums]);

  const open = (event) => {
    triggerRef.current = event.currentTarget;
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    lockScroll();
    history.replaceState(null, "", `#${FACE_ANCHOR}`);
    prepare();
  };

  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const onClose = () => {
      unlockScroll();
      setPhase("preparing");
      setBusy(false);
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
    try {
      const faceapi = await loadEngine();
      const result = await describe(faceapi);
      if (result.status !== "ok") {
        setNotice(NOTICES[result.status]);
        setPhase("ready");
        return;
      }
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
    }
  };

  const capture = () => run((faceapi) => describeVideo(faceapi, videoRef.current));

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

  return (
    <>
      <div className="face-bar" id={FACE_ANCHOR} data-active={matchCount != null || undefined}>
        {matchCount == null ? (
          <>
            <p className="face-bar-text"><b>Participou do evento?</b> Encontre as fotos em que você aparece{scope === "all" ? " em todas as edições" : ""}.</p>
            <button type="button" className="face-trigger" onClick={open} onPointerEnter={warm} onFocus={warm}>
              <Icon name="user" /> Encontre suas fotos
            </button>
          </>
        ) : (
          <>
            <p className="face-bar-text" aria-live="polite">
              <b>{matchCount === 1 ? "1 foto" : `${matchCount} fotos`}</b> com você {scope === "all" ? "na galeria" : "neste álbum"}.
            </p>
            <div className="face-bar-actions">
              <button type="button" className="face-trigger" onClick={open}>Buscar de novo</button>
              <button type="button" className="face-link" onClick={onClear}>Ver todas as fotos</button>
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

          {notice && <p className="face-notice" role="alert">{notice}</p>}

          {phase === "preparing" && <p className="face-status" role="status">Preparando a busca… na primeira vez, baixamos cerca de 12 MB.</p>}

          {phase === "error" && (
            <div className="face-status" role="alert">
              <p>Não foi possível concluir a busca. Verifique a conexão e tente de novo.</p>
              <button type="button" className="face-trigger" onClick={prepare}>Tentar de novo</button>
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
              <button type="button" className="face-trigger face-trigger--light" onClick={() => fileRef.current?.click()} disabled={busy || !accepted}>
                Enviar uma foto minha
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
              {busy && <p className="face-status" role="status">Procurando você nas fotos…</p>}
            </div>
          )}

          {phase === "camera" && (
            <div className="face-camera">
              <video ref={videoRef} className="face-video" playsInline muted aria-label="Prévia da câmera" />
              <p className="face-hint">Fique de frente, com boa luz, e olhe para a câmera.</p>
              <div className="face-actions">
                <button type="button" className="face-trigger" onClick={capture} disabled={busy || !accepted}>
                  {busy ? "Procurando…" : "Tirar foto e buscar"}
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
