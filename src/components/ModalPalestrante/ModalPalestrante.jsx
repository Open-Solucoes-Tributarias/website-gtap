import { useEffect, useRef, useState } from "react";
import "./ModalPalestrante.css";

export const ModalPalestrantes = ({ palestrantes, selecionado, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const dialogRef = useRef(null);

    // Define o índice com base no palestrante clicado
    useEffect(() => {
        const index = palestrantes.findIndex(p => p.id === selecionado.id);
        if (index !== -1) setCurrentIndex(index);
    }, [selecionado, palestrantes]);

    // Abre o dialog após montar
    useEffect(() => {
        if (dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal();
        }
    }, []);

    const current = palestrantes[currentIndex];

    const next = () =>
        setCurrentIndex((prev) => (prev + 1) % palestrantes.length);
    const prev = () =>
        setCurrentIndex((prev) =>
            prev === 0 ? palestrantes.length - 1 : prev - 1
        );

    const fecharModal = () => {
        dialogRef.current?.close();
        onClose();
    };

    return (

        <dialog className="modal-dialog" ref={dialogRef} onClose={fecharModal}>
            <button className="nav-arrow nav-left" onClick={prev}><i class="fa-solid fa-chevron-left"></i></button>
            <div className="modal-structure">
                <div className="modal-photo"  style={{ backgroundImage: `url(${current?.mediaUrl})` }}>

                </div>
                <div className="modal-box">
                    <button className="close" onClick={fecharModal}>✕</button>
                    <div>
                        <h2>{current.title}</h2>
                        <h4>{current.description}</h4>
                    </div>
                    <div>
                        <p>{current.annotation}</p>
                    </div>
                    <div>
                        {current.linkedin && (
                            <a href={current.linkedin} target="_blank" rel="noopener noreferrer">
                                <img
                                    src="/linkedin-icon.png"
                                    alt="LinkedIn"
                                    className="linkedin-icon"
                                />
                            </a>
                        )}
                    </div>
                </div>
            </div>
            <button className="nav-arrow nav-right" onClick={next}><i class="fa-solid fa-chevron-right"></i></button>
        </dialog>

    );
};
