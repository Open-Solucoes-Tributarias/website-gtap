import "./PrivacidadePage.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";

// Estrutura e textos-base: política da Plataforma GT (gestaotributaria.com.br/politica-de-privacidade-e-cookies),
// adaptados ao que este site realmente faz. Mudou algo em dados, Pixel ou busca facial? Revise aqui.
export const PRIVACY_UPDATED = "16 de outubro de 2026";
const CONTACT_EMAIL = "contato@opensolucoestributarias.com.br";
const DPO_EMAIL = "dpo@opensolucoestributarias.com.br";
const Mail = ({ address }) => <a href={`mailto:${address}`}>{address}</a>;

const SUMMARY = [
  ["controlador", "Controlador"],
  ["dados", "Dados pessoais tratados"],
  ["finalidades", "Finalidades"],
  ["bases-legais", "Bases legais"],
  ["compartilhamento", "Compartilhamento de dados"],
  ["seguranca", "Armazenamento, retenção e segurança"],
  ["busca-facial", "Busca facial nos álbuns"],
  ["direitos", "Direitos do titular"],
  ["encarregado", "Encarregado (DPO)"],
  ["atualizacoes", "Atualizações da política"],
  ["cookies", "Política de cookies"],
];

export const PrivacidadePage = () => (
  <>
    <Navbar />
    <header className="privacy-hero">
      <h1 data-enter>Política de <b>Privacidade e Cookies</b></h1>
      <p data-enter>Como o GTAP trata dados pessoais neste site. Atualizada em {PRIVACY_UPDATED}.</p>
    </header>

    <main className="privacy-body">
      <nav className="privacy-summary" aria-label="Sumário">
        <p>Sumário</p>
        <ol>
          {SUMMARY.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}
        </ol>
      </nav>

      <section id="controlador">
        <h2>1. Controlador</h2>
        <p>
          Este site do GTAP, congresso brasileiro de gestão tributária na Administração Pública, é mantido pela
          <b> Open Soluções Tributárias LTDA</b>, CNPJ 09.094.300/0001-51, com sede na R. Frederico Simões, 125, sala 401,
          Edf. Liz Empresarial, Caminho das Árvores, Salvador/BA, CEP 41820-774. A Open atua como controladora dos dados
          pessoais tratados aqui, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018), e observa os
          princípios da finalidade, adequação, necessidade, transparência, segurança e responsabilização.
        </p>
      </section>

      <section id="dados">
        <h2>2. Dados pessoais tratados</h2>
        <ul>
          <li><b>Dados de contato:</b> nome, e-mail e telefone que você informa no formulário de contato, e os parâmetros de campanha da página (UTM).</li>
          <li><b>Dados técnicos de navegação:</b> endereço IP, data e hora do acesso, tipo de navegador, sistema operacional e dispositivo, registrados na hospedagem e na rede de entrega do site. O Meta Pixel também coleta identificadores e eventos de navegação (seção 11).</li>
          <li><b>Fotos dos eventos:</b> os álbuns reúnem fotos de participantes, palestrantes e do ambiente, feitas pela organização.</li>
          <li><b>Busca facial (opcional):</b> descrita na seção 7.</li>
        </ul>
        <p>
          O GTAP não trata outros dados pessoais sensíveis. A exceção é o índice facial dos álbuns (seção 7), que contém dados biométricos.
        </p>
      </section>

      <section id="finalidades">
        <h2>3. Finalidades</h2>
        <ul>
          <li>Responder ao seu contato e falar sobre o evento (inscrições, programação e lotes).</li>
          <li>Medir as visitas ao site e a eficiência dos anúncios do evento.</li>
          <li>Garantir a segurança do site e prevenir acessos indevidos e incidentes.</li>
          <li>Disponibilizar os álbuns de fotos e permitir que participantes encontrem as próprias fotos (busca facial).</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
        <p>Não vendemos dados pessoais.</p>
      </section>

      <section id="bases-legais">
        <h2>4. Bases legais</h2>
        <ul>
          <li><b>Formulário de contato:</b> consentimento, ao enviar o formulário, e legítimo interesse para responder ao seu contato, respeitados os seus direitos.</li>
          <li><b>Mensuração e anúncios (Meta Pixel):</b> consentimento, quando aplicável, e legítimo interesse.</li>
          <li><b>Fotos dos eventos:</b> legítimo interesse na divulgação e na memória do evento, respeitados os seus direitos. Você pode pedir a remoção de uma foto (seção 8).</li>
          <li><b>Busca facial:</b> consentimento (art. 11, I, da LGPD), dado por você a cada visita à função.</li>
          <li><b>Segurança e obrigações legais:</b> cumprimento de obrigação legal ou regulatória e legítimo interesse.</li>
        </ul>
      </section>

      <section id="compartilhamento">
        <h2>5. Compartilhamento de dados</h2>
        <p>
          A Open Soluções Tributárias não comercializa dados pessoais. Compartilhamos apenas o necessário, com:
        </p>
        <ul>
          <li><b>RD Station:</b> gestão dos contatos do formulário e relacionamento.</li>
          <li><b>Meta:</b> Pixel de mensuração e anúncios.</li>
          <li><b>Hospedagem e rede de entrega de conteúdo:</b> infraestrutura que mantém o site no ar.</li>
          <li><b>Autoridades:</b> quando exigido por lei ou por decisão judicial.</li>
        </ul>
        <p>
          O Meta pode tratar dados em servidores fora do Brasil, o que caracteriza transferência internacional de dados
          (art. 33 da LGPD).
        </p>
      </section>

      <section id="seguranca">
        <h2>6. Armazenamento, retenção e segurança</h2>
        <ul>
          <li><b>Segurança:</b> o site usa conexão criptografada (HTTPS) e o envio do formulário vai direto do seu navegador ao RD Station.</li>
          <li><b>Formulário:</b> os dados ficam pelo tempo necessário ao contato e ao relacionamento sobre o evento, ou até você pedir a exclusão.</li>
          <li><b>Fotos e índice facial:</b> ficam enquanto o álbum estiver publicado, ou até uma solicitação de remoção ser atendida.</li>
          <li><b>Sua selfie:</b> nunca é armazenada (seção 7).</li>
        </ul>
      </section>

      <section id="busca-facial">
        <h2>7. Busca facial nos álbuns</h2>
        <p>
          Na galeria e nos álbuns com a função “Encontre suas fotos”, você pode enviar uma foto sua ou tirar uma selfie
          para ver só as fotos em que aparece, em todas as edições ou só no álbum aberto. O uso é <b>opcional</b> e
          depende do seu aceite desta política, que pedimos a cada visita.
        </p>
        <ul>
          <li><b>A sua foto não sai do seu aparelho.</b> A análise acontece no seu navegador. Não enviamos, gravamos nem compartilhamos a selfie ou o resultado com nenhum servidor.</li>
          <li><b>Como funciona:</b> o navegador transforma o seu rosto em uma sequência de números (uma “impressão facial”) e a compara com sequências geradas previamente a partir das fotos dos álbuns. Depois da busca, essa sequência é descartada.</li>
          <li><b>Índice dos álbuns:</b> para a comparação funcionar, a organização gera e publica no site, para cada álbum, um arquivo com as sequências numéricas dos rostos detectados nas fotos. Ele não contém imagens, nomes ou outros dados pessoais, mas as sequências são <b>dados biométricos</b> (dado pessoal sensível). Por isso o uso é restrito à finalidade de permitir que participantes encontrem as próprias fotos.</li>
          <li><b>Base legal:</b> para a sua busca, o seu consentimento (art. 11, I, da LGPD), que você pode revogar a qualquer momento deixando de usar a função.</li>
        </ul>
        <p>
          Aparece em alguma foto e quer que seu rosto saia do índice, ou que a foto seja removida do álbum? Escreva para{" "}
          <Mail address={DPO_EMAIL} />. A foto é retirada do álbum e o índice é regerado.
        </p>
      </section>

      <section id="direitos">
        <h2>8. Direitos do titular</h2>
        <p>Nos termos da LGPD (art. 18), você pode solicitar:</p>
        <ul>
          <li>confirmação da existência de tratamento;</li>
          <li>acesso aos dados;</li>
          <li>correção de dados incompletos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação, quando aplicável;</li>
          <li>portabilidade dos dados;</li>
          <li>informações sobre o compartilhamento;</li>
          <li>revogação do consentimento, quando cabível.</li>
        </ul>
        <p>
          Envie o pedido para <Mail address={DPO_EMAIL} /> ou <Mail address={CONTACT_EMAIL} />. Se preferir, você também pode
          recorrer à Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </section>

      <section id="encarregado">
        <h2>9. Encarregado de Proteção de Dados (DPO)</h2>
        <p>
          A Open Soluções Tributárias mantém Encarregado de Proteção de Dados, responsável pela governança de privacidade
          e pelo atendimento às demandas relacionadas à LGPD. Contato: <Mail address={DPO_EMAIL} />.
        </p>
      </section>

      <section id="atualizacoes">
        <h2>10. Atualizações da política</h2>
        <p>
          Podemos atualizar esta política para refletir mudanças técnicas, regulatórias ou nos serviços. A versão vigente
          é sempre a desta página, e a data no topo mostra a última revisão. Se a mudança afetar a busca facial, pediremos
          um novo aceite.
        </p>
      </section>

      <section id="cookies">
        <h2>11. Política de cookies</h2>
        <h3>O que são cookies</h3>
        <p>
          Cookies são pequenos arquivos guardados no navegador para garantir o funcionamento do site e medir seu uso.
        </p>
        <h3>O que este site usa</h3>
        <ul>
          <li><b>Meta Pixel:</b> cookies e identificadores de terceiros, carregados depois que a página termina de abrir, para medir visitas e anúncios do evento.</li>
          <li><b>Armazenamento da sessão do navegador:</b> guarda os parâmetros de campanha (UTM) da sua visita para o formulário de contato. Ele é apagado quando você fecha a aba.</li>
        </ul>
        <p>O site não tem área restrita nem cookies de login.</p>
        <h3>Base legal</h3>
        <p>Cookies não essenciais, como os do Meta Pixel, dependem de consentimento, quando aplicável, e de legítimo interesse.</p>
        <h3>Como gerenciar</h3>
        <p>
          Você pode bloquear ou apagar cookies nas configurações do navegador e gerenciar suas preferências de anúncios
          na sua conta do Meta. Bloquear o Pixel não impede o uso do site, nem da busca facial.
        </p>
      </section>
    </main>
    <Footer />
  </>
);
