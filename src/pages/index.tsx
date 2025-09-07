import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Map from "@/components/Map";

type Ponto = {
  lat: number;
  lng: number;
  nome_lider?: string;
  nome_celula?: string;
  bairro?: string;
  rede?: string;
  discipulado?: string;
  publico_alvo?: string;
  dia_da_semana?: string;
  celular_lider?: string;
  horario?: string;
  fotoUrl?: string;
};

type CelulaData = {
  lat: string;
  lng: string;
  nome_lider?: string;
  nome_celula?: string;
  bairro?: string;
  rede?: string;
  discipulado?: string;
  publico_alvo?: string;
  dia_da_semana?: string;
  celular_lider?: string;
  horario?: string;
  photo?: string;
};

// Cor única para todos os inputs
const corInput = "#242424";
const corInputHover = "#161616";
const corBotao = "#602e7f";
const corBotaoHover = "#2b1838";

// Cores do gabarito
const gabaritoCores = [
  { cor: "#B026FF", nome: "Kids" }, // Roxo neon
  { cor: "#0A1A3C", nome: "Adultos" }, // Azul escuro
  { cor: "#000000", nome: "Jovens" }, // Preto
  { cor: "#39FF14", nome: "Juvenis" }, // Verde neon
  { cor: "#1DB954", nome: "Adolecentes" }, // Verde
];

export default function MapPage() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [bairroFiltro, setBairroFiltro] = useState<string | null>(null);
  const [discipuladoFiltro, setDiscipuladoFiltro] = useState<string | null>(null);
  const [publicoAlvoFiltro, setPublicoAlvoFiltro] = useState<string | null>(null);
  const [diaSemanaFiltro, setDiaSemanaFiltro] = useState<string | null>(null);
  const [redeFiltro, setRedeFiltro] = useState<string | null>(null);

  // Opções únicas para cada filtro
  const [bairros, setBairros] = useState<string[]>([]);
  const [discipulados, setDiscipulados] = useState<string[]>([]);
  const [publicosAlvo, setPublicosAlvo] = useState<string[]>([]);
  const [diasSemana, setDiasSemana] = useState<string[]>([]);
  const [redes, setRedes] = useState<string[]>([]);

  // Estados de hover para inputs e botão
  const [hoverInput, setHoverInput] = useState<string | null>(null);
  const [hoverBotao, setHoverBotao] = useState(false);

  // Ref para evitar piscar o mapa ao passar mouse nos selects
  const isFirstRender = useRef(true);

  useEffect(() => {
    const fetchCelulas = async () => {
      const { data, error } = await supabase
        .from("celulas")
        .select("*");

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const pontosFormatados: Ponto[] = (data || []).map((item: CelulaData) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lng),
        nome_lider: item.nome_lider,
        nome_celula: item.nome_celula,
        bairro: item.bairro,
        rede: item.rede,
        discipulado: item.discipulado,
        publico_alvo: item.publico_alvo,
        dia_da_semana: item.dia_da_semana,
        celular_lider: item.celular_lider,
        horario: item.horario,
        fotoUrl: item.photo,
      }));

      setPontos(pontosFormatados);

      // Extrai valores únicos para cada filtro
      setBairros(Array.from(new Set(pontosFormatados.map(p => p.bairro).filter(Boolean) as string[])));
      setDiscipulados(Array.from(new Set(pontosFormatados.map(p => p.discipulado).filter(Boolean) as string[])));
      setPublicosAlvo(Array.from(new Set(pontosFormatados.map(p => p.publico_alvo).filter(Boolean) as string[])));
      setDiasSemana(Array.from(new Set(pontosFormatados.map(p => p.dia_da_semana).filter(Boolean) as string[])));
      setRedes(Array.from(new Set(pontosFormatados.map(p => p.rede).filter(Boolean) as string[])));

      setLoading(false);
    };

    fetchCelulas();
  }, []);

  // Filtra os pontos conforme os filtros selecionados usando useMemo
  const pontosFiltrados = useMemo(() => {
    return pontos.filter(p => {
      return (
        (!bairroFiltro || p.bairro === bairroFiltro) &&
        (!discipuladoFiltro || p.discipulado === discipuladoFiltro) &&
        (!publicoAlvoFiltro || p.publico_alvo === publicoAlvoFiltro) &&
        (!diaSemanaFiltro || p.dia_da_semana === diaSemanaFiltro) &&
        (!redeFiltro || p.rede === redeFiltro)
      );
    });
  }, [pontos, bairroFiltro, discipuladoFiltro, publicoAlvoFiltro, diaSemanaFiltro, redeFiltro]);

  // Estilos para os selects e botão usando useMemo para evitar re-criação
  const selectBaseStyle = useMemo(() => (isHover: boolean) => ({
    background: isHover ? corInputHover : corInput,
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "1rem",
    fontWeight: 500,
    outline: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "background 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    marginRight: "8px",
    minWidth: 120
  }), []);

  const buttonStyle = useMemo(() => (isHover: boolean) => ({
    background: isHover ? corBotaoHover : corBotao,
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 20px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginLeft: "8px",
    transition: "background 0.2s"
  }), []);

  // Função para limpar filtros usando useCallback
  const limparFiltros = useCallback(() => {
    setBairroFiltro(null);
    setDiscipuladoFiltro(null);
    setPublicoAlvoFiltro(null);
    setDiaSemanaFiltro(null);
    setRedeFiltro(null);
  }, []);

  // Evita piscar branco ao passar mouse nos selects
  // O loading só é true no primeiro render, nunca ao passar mouse
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: "linear-gradient(135deg, #602e7f 0%, #5c79b9 50%, #5e9ecb 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Animação de pontos de localização */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 1
        }}>
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: 18 + Math.random() * 12,
                height: 18 + Math.random() * 12,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                animation: `float${i} 3s ease-in-out infinite alternate`,
                filter: "blur(1px)"
              }}
            />
          ))}
        </div>
        {/* Ícone de UVA animado */}
        <div style={{
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.13)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            boxShadow: "0 8px 32px 0 rgba(58,28,113,0.18)",
            animation: "pulseUva 1.8s infinite alternate"
          }}>
            {/* Ícone de mapa do FontAwesome Free */}
            <i
              className="fas fa-map-marked-alt"
              style={{
                fontSize: 70,
                color: "#7B2FF2",
                filter: "drop-shadow(0 2px 8px rgba(123,47,242,0.18))"
              }}
            />
          </div>
          <h1 style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "2.5rem",
            letterSpacing: "2px",
            textShadow: "0 2px 16px rgba(58,28,113,0.18)",
            margin: 0,
            marginBottom: 8,
            fontFamily: "Montserrat, Arial, sans-serif"
          }}>
            Maps Videira
          </h1>
          <div style={{
            color: "#fff",
            fontSize: "1.1rem",
            fontWeight: 400,
            opacity: 0.85,
            marginBottom: 12,
            letterSpacing: "1px"
          }}>
            Carregando células e localização...
          </div>
          {/* Loader animado */}
          <div style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "center"
          }}>
            <div style={{
              width: 48, height: 48, border: "5px solid #fff",
              borderTop: "5px solid #7B2FF2",
              borderRadius: "50%",
              animation: "spinLoader 1.1s linear infinite"
            }} />
            <style>
              {`
                @keyframes spinLoader {
                  0% { transform: rotate(0deg);}
                  100% { transform: rotate(360deg);}
                }
                @keyframes pulseUva {
                  0% { box-shadow: 0 8px 32px 0 rgba(58,28,113,0.18), 0 0 0 0 #7B2FF2; }
                  100% { box-shadow: 0 8px 32px 0 rgba(58,28,113,0.18), 0 0 0 18px rgba(123,47,242,0.13); }
                }
              `}
            </style>
          </div>
        </div>
        {/* Footer */}
        <footer style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "rgba(58,28,113,0.13)",
          color: "#fff",
          textAlign: "center",
          padding: "14px 0 10px 0",
          fontSize: "1rem",
          fontWeight: 400,
          letterSpacing: "1px",
          zIndex: 10,
          backdropFilter: "blur(2px)"
        }}>
          Desenvolvido por <b>Yan Amorim</b> - Tech | UI inspirada em mapas e localização | Videira 2024
        </footer>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Map pontos={pontosFiltrados} />
      {/* Filtros suspensos na parte de baixo */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "transparent",
          boxShadow: "none",
          zIndex: 9999, // z-index bem alto para garantir que fique sobre o mapa
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          padding: "18px 8px",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {/* Bairro */}
        <select
          value={bairroFiltro || ""}
          onChange={e => setBairroFiltro(e.target.value || null)}
          style={selectBaseStyle(hoverInput === "bairro")}
          onMouseEnter={() => setHoverInput("bairro")}
          onMouseLeave={() => setHoverInput(null)}
        >
          <option value="" style={{ color: "#222", background: "#fff" }}>Bairro</option>
          {bairros.map(bairro => (
            <option key={bairro} value={bairro} style={{ color: "#222", background: "#fff" }}>{bairro}</option>
          ))}
        </select>
        {/* Discipulado */}
        <select
          value={discipuladoFiltro || ""}
          onChange={e => setDiscipuladoFiltro(e.target.value || null)}
          style={selectBaseStyle(hoverInput === "discipulado")}
          onMouseEnter={() => setHoverInput("discipulado")}
          onMouseLeave={() => setHoverInput(null)}
        >
          <option value="" style={{ color: "#222", background: "#fff" }}>Discipulado</option>
          {discipulados.map(discipulado => (
            <option key={discipulado} value={discipulado} style={{ color: "#222", background: "#fff" }}>{discipulado}</option>
          ))}
        </select>
        {/* Público Alvo */}
        <select
          value={publicoAlvoFiltro || ""}
          onChange={e => setPublicoAlvoFiltro(e.target.value || null)}
          style={selectBaseStyle(hoverInput === "publicoAlvo")}
          onMouseEnter={() => setHoverInput("publicoAlvo")}
          onMouseLeave={() => setHoverInput(null)}
        >
          <option value="" style={{ color: "#222", background: "#fff" }}>Público Alvo</option>
          {publicosAlvo.map(publico => (
            <option key={publico} value={publico} style={{ color: "#222", background: "#fff" }}>{publico}</option>
          ))}
        </select>
        {/* Dia da Semana */}
        <select
          value={diaSemanaFiltro || ""}
          onChange={e => setDiaSemanaFiltro(e.target.value || null)}
          style={selectBaseStyle(hoverInput === "diaSemana")}
          onMouseEnter={() => setHoverInput("diaSemana")}
          onMouseLeave={() => setHoverInput(null)}
        >
          <option value="" style={{ color: "#222", background: "#fff" }}>Dia da Semana</option>
          {diasSemana.map(dia => (
            <option key={dia} value={dia} style={{ color: "#222", background: "#fff" }}>{dia}</option>
          ))}
        </select>
        {/* Rede */}
        <select
          value={redeFiltro || ""}
          onChange={e => setRedeFiltro(e.target.value || null)}
          style={selectBaseStyle(hoverInput === "rede")}
          onMouseEnter={() => setHoverInput("rede")}
          onMouseLeave={() => setHoverInput(null)}
        >
          <option value="" style={{ color: "#222", background: "#fff" }}>Rede</option>
          {redes.map(rede => (
            <option key={rede} value={rede} style={{ color: "#222", background: "#fff" }}>{rede}</option>
          ))}
        </select>
        {/* Botão para limpar filtros */}
        <button
          onClick={limparFiltros}
          style={buttonStyle(hoverBotao)}
          onMouseEnter={() => setHoverBotao(true)}
          onMouseLeave={() => setHoverBotao(false)}
        >
          Limpar filtros
        </button>
      </div>
      {/* Gabarito de cores no canto inferior esquerdo */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 10000,
          background: "rgba(30,30,30,0.95)",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          padding: "16px 20px",
          minWidth: 180,
          color: "#fff",
          fontSize: "1rem",
          fontWeight: 500,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "flex-start"
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "1.08rem", marginBottom: 4, letterSpacing: 0.5 }}>Gabarito de Cores</div>
        {gabaritoCores.map(({ cor, nome }) => (
          <div key={nome} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-block",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: cor,
                border: "2px solid #fff",
                marginRight: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.18)"
              }}
            />
            <span style={{ color: "#fff", fontWeight: 500 }}>{nome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

<style>
  {`
              ${[...Array(18)].map((_, i) => `
                @keyframes float${i} {
                  0% { transform: translateY(0px) scale(1); }
                  100% { transform: translateY(${Math.random() * 40 - 20}px) scale(${0.9 + Math.random() * 0.3}); }
                }
              `).join("\n")}
            `}
</style>
