import { useState, useEffect } from "react";
import "./AdminDash.css";
import { supabase } from "../../supabaseClient";
import { MidiaList } from "../../components/Midias/Midias";

export const AdminDash = () => {
  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    type: "0",
    title: "",
    description: "",
    mediaUrl: "",
  });

  const typeLabels = {
    0: "Palestrantes",
    1: "Temas",
    2: "Clientes",
    3: "Depoimentos",
    4: "Galeria",
    5: "Investimento",
    6: "banner",
  };

  const fetchDados = async () => {
    const { data, error } = await supabase.from("landing_page").select("*");
    if (error) {
      console.error("Erro ao buscar dados", error);
      return;
    }
    setData(data);
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setFormData({
      type: item.type?.toString() || "0",
      title: item.title ?? "",
      description: item.description ?? "",
      mediaUrl: item.mediaUrl ?? "",
    });
    setEditItem(item);
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let error;
    if (editItem) {
      // edição
      ({ error } = await supabase
        .from("landing_page")
        .update(formData)
        .eq("id", editItem.id));
    } else {
      // criação
      ({ error } = await supabase.from("landing_page").insert([formData]));
    }
    if (error) {
      alert("Não foi possível salvar as informações");
    } else {
      alert("Dados salvos com sucesso!");
      fetchDados();
      setFormData({ type: "0", title: "", description: "", mediaUrl: "" }); // Limpa o formulário
      setEditItem(null);
      setOpenModal(false);
    }
  };

  return (
    <>
      <section className="section-admin-dashboard">
        <img src="./icon-gtap.svg" alt="Ícone GTAP" />
        <h5>
          Editar conteúdos do Site
          <i
            className="fa-regular fa-plus"
            onClick={() => setOpenModal(true)}
          ></i>
        </h5>

        {openModal && (
          <dialog open className="dialog-container">
            <form className="form-create" onSubmit={handleSubmit}>
              <div className="form-input-create">
                <label htmlFor="type">Tipo de conteúdo</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-input-create">
                <label htmlFor="title">Título *</label>
                <input
                  name="title"
                  type="text"
                  placeholder="Título"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-input-create">
                <label htmlFor="description">Descrição *</label>
                <input
                  name="description"
                  type="text"
                  placeholder="Descrição"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-input-create">
                <label htmlFor="mediaUrl">URL da imagem ou vídeo *</label>
                <input
                  name="mediaUrl"
                  type="text"
                  placeholder="URL da imagem ou vídeo"
                  value={formData.mediaUrl}
                  onChange={handleChange}
                  // required
                />
              </div>
              <div className="form-content-buttons">
                <button type="button" onClick={() => setOpenModal(false)}>
                  Fechar
                </button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </dialog>
        )}

        <table className="table-admin">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Título</th>
              <th>Descrição</th>
              <th>Mídia</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{typeLabels[item.type]}</td>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>
                  {item.mediaUrl ? (
                    <a
                      href={item.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver mídia
                    </a>
                  ) : (
                    "Sem mídia"
                  )}
                </td>
                <td>
                  <i
                    className="fa-regular fa-pen-to-square"
                    onClick={() => handleEdit(item)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <MidiaList />
    </>
  );
};
