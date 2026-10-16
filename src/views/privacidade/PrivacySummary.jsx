"use client";

import { useEffect, useState } from "react";

// Sumário lateral (fixo ao rolar no desktop) com destaque da seção que está sendo lida.
// groups: [{ title, items: [[id, rótulo]] }]; cada id é o id de uma <section> da página.
export const PrivacySummary = ({ groups }) => {
  const [active, setActive] = useState(groups[0].items[0][0]);

  useEffect(() => {
    const sections = groups.flatMap((group) => group.items).map(([id]) => document.getElementById(id)).filter(Boolean);
    let frame = 0;
    // Vale a última seção cujo topo já passou da linha de leitura (30% da altura da tela).
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      const reached = sections.filter((section) => section.getBoundingClientRect().top <= line);
      setActive((reached.at(-1) ?? sections[0]).id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [groups]);

  return (
    <nav className="privacy-summary" aria-label="Sumário">
      <p className="privacy-summary-title">Sumário</p>
      {groups.map((group) => (
        <div className="privacy-summary-group" key={group.title}>
          <p className="privacy-summary-heading">{group.title}</p>
          <ul>
            {group.items.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={active === id ? "location" : undefined}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};
