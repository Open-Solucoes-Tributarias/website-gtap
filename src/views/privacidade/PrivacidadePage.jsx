import "./PrivacidadePage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

// Versão do texto: ao mudar o conteúdo da busca facial, incremente (FaceSearch pede novo aceite).
export const PRIVACY_UPDATED = "16 de outubro de 2026";

export const PrivacidadePage = () => (
  <>
    <Navbar />
    <header className="privacy-hero">
      <h1 data-enter>Política de <b>Privacidade</b></h1>
      <p data-enter>Como o GTAP trata os seus dados neste site. Atualizada em {PRIVACY_UPDATED}.</p>
    </header>

    <main className="privacy-body">
      <section>
        <h2>Quem somos</h2>
        <p>
          Este site é do GTAP, congresso brasileiro de gestão tributária na Administração Pública, realizado pela
          Open Soluções Tributárias (Salvador/BA), que é a controladora dos dados tratados aqui, nos termos da Lei Geral de
          Proteção de Dados (LGPD, Lei 13.709/2018).
        </p>
      </section>

      <section>
        <h2>Quais dados tratamos</h2>
        <ul>
          <li><b>Formulário de contato:</b> nome, e-mail e telefone, enviados por você, e os parâmetros de campanha da página (UTM). Usamos para responder ao seu contato e falar sobre o evento. Os dados são enviados ao RD Station, nossa ferramenta de relacionamento.</li>
          <li><b>Navegação:</b> o site usa o Meta Pixel para medir visitas e a eficiência dos anúncios do evento. Ele pode gravar cookies e identificadores no seu navegador.</li>
          <li><b>Fotos dos eventos:</b> o álbum de cada edição reúne fotos de participantes, palestrantes e do ambiente, feitas pela organização.</li>
          <li><b>Busca facial (opcional):</b> descrita na seção seguinte.</li>
        </ul>
      </section>

      <section id="busca-facial">
        <h2>Busca facial nos álbuns</h2>
        <p>
          Nos álbuns com a função “Encontre suas fotos”, você pode enviar uma foto sua ou tirar uma selfie para ver só as
          fotos em que aparece. O uso é <b>opcional</b> e depende do seu aceite desta política, que pedimos a cada visita.
        </p>
        <ul>
          <li><b>A sua foto não sai do seu aparelho.</b> A análise acontece no seu navegador. Não enviamos, gravamos nem compartilhamos a selfie ou o resultado com nenhum servidor.</li>
          <li><b>Como funciona:</b> o navegador transforma o seu rosto em uma sequência de números (uma “impressão facial”) e a compara com sequências geradas previamente a partir das fotos do álbum. Depois da busca, essa sequência é descartada.</li>
          <li><b>Índice dos álbuns:</b> para a comparação funcionar, a organização gera e publica no site, para cada álbum, um arquivo com as sequências numéricas dos rostos detectados nas fotos. Ele não contém imagens, nomes ou outros dados pessoais, mas as sequências são <b>dados biométricos</b> (dado pessoal sensível). Por isso o uso é restrito à finalidade de permitir que participantes encontrem as próprias fotos.</li>
          <li><b>Base legal:</b> para a sua busca, o seu consentimento (art. 11, I, da LGPD), que você pode revogar a qualquer momento deixando de usar a função.</li>
        </ul>
        <p>
          Aparece em alguma foto e quer que seu rosto saia do índice, ou que a foto seja removida do álbum? Peça pelo
          formulário de contato e atendemos em até 15 dias. A foto é retirada do álbum e o índice é regerado.
        </p>
      </section>

      <section>
        <h2>Com quem compartilhamos</h2>
        <p>
          Apenas com fornecedores que viabilizam o site: RD Station (formulário e relacionamento), Meta (Pixel de
          mensuração), a hospedagem do site e a rede de entrega de conteúdo. Não vendemos dados pessoais.
        </p>
      </section>

      <section>
        <h2>Por quanto tempo guardamos</h2>
        <p>
          Dados do formulário ficam pelo tempo necessário para o contato e para o relacionamento sobre o evento, ou até
          você pedir a exclusão. Fotos e o índice facial ficam enquanto o álbum estiver publicado, ou até uma solicitação
          de remoção ser atendida.
        </p>
      </section>

      <section>
        <h2>Seus direitos</h2>
        <p>
          Você pode pedir confirmação do tratamento, acesso, correção, anonimização, portabilidade, informação sobre
          compartilhamento, eliminação dos dados e a revogação do consentimento (art. 18 da LGPD). Fale com a gente pelo{" "}
          <a href="/#contato">formulário de contato</a>. Se preferir, você também pode recorrer à Autoridade Nacional de
          Proteção de Dados (ANPD).
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Além do Meta Pixel, o site guarda no seu navegador, por conveniência, os parâmetros de campanha da visita.
          Você pode apagar esses dados nas configurações do navegador.
        </p>
      </section>

      <section>
        <h2>Alterações</h2>
        <p>
          Podemos atualizar esta política. A data no topo mostra a última revisão e, se a mudança afetar a busca facial,
          pediremos um novo aceite.
        </p>
      </section>
    </main>
    <Footer />
  </>
);
