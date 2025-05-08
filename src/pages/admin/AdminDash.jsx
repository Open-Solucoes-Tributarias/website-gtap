import { useEffect, useState } from "react";
import "./AdminDash.css";
import { supabase } from "../../supabaseClient";

export const AdminDash = () => {
  const [data, setData] = useState([]);

  const typeLabels = {
    0: "Palestrantes",
    1: "Temas",
    2: "clientes",
    3: "depoimentos",
    4: "galeria",
    5: "investimento",
  };

  const fecthDados = async () => {
    const { data, error } = await supabase.from("landing_page").select("*");
    if (error) {
      console.error("erro ao buscar dados", error);
      return;
    }

    setData(data);
  };

  useEffect(() => {
    fecthDados();
  }, []);

  return (
    <section className="section-admin-dashboard">
      <img src="./icon-gtap.svg" />
      <h5>Editar conteúdos do Site</h5>
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
                  <a href={item.mediaUrl}>Ver mídia</a>
                ) : (
                  "Sem mídia"
                )}
              </td>
              <td>
                <i className="fa-regular fa-pen-to-square"></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
