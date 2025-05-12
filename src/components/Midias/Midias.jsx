import { useState, useEffect } from "react";
import "./Midias.css";
import { supabase } from "../../supabaseClient";

const bucketName = "medias";

export const MidiaList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  // Carregar arquivos ao montar o componente
  const fetchFiles = async () => {
    setLoading(true);

    const { data, error } = await supabase.storage
      .from("medias")
      .list("midias");

    if (error) console.error("Erro ao listar arquivos:", error);
    else setFiles(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (fileName) => {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([`midias/${fileName}`]);
    if (error) {
      console.error("Erro ao deletar:", error);
    } else {
      setFiles(files.filter((file) => file.name !== fileName));
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(`midias/${file.name}`, file);
    if (error) {
      console.error("Erro ao enviar:", error);
    } else {
      fetchFiles(); // recarregar
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    alert("Link copiado!");
  };
  return (
    <section className="section-midias-list">
      <p>Biblioteca de Mídias</p>
      <input type="file" onChange={handleUpload} />
      {loading && <p>Carregando...</p>}
      <div className="container-midias">
        {files.map((file) => {
          const { publicUrl } = supabase.storage
            .from("medias")
            .getPublicUrl(`midias/${file.name}`).data;
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
          const isVideo = /\.(mp4|webm|ogg)$/i.test(file.name);
          return (
            <div key={file.id} className="content-midias">
              {isImage && <img src={publicUrl} alt={file.name} width="150" />}
              {isVideo && (
                <video width="250" controls>
                  <source
                    src={publicUrl}
                    type={`video/${file.name.split(".").pop()}`}
                  />
                </video>
              )}
              {!isImage && !isVideo && <p>Tipo de mídia não suportado</p>}
              <button onClick={() => handleCopyLink(publicUrl)}>
                Copiar link
              </button>
              <button onClick={() => handleDelete(file.name)}>Excluir</button>
              <p>{file.name}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
