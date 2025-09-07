"use client";

import { useEffect, useRef, useMemo } from "react";

// Declaração global do Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

// Estender a interface OverlayView para incluir a propriedade div
interface CustomOverlayView extends google.maps.OverlayView {
  div?: HTMLDivElement;
}

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

interface MapProps {
  pontos: Ponto[];
}

// Função utilitária para obter a cor da borda de acordo com o público alvo
function getCorBorda(publicoAlvo?: string): string {
  switch ((publicoAlvo || "").toLowerCase()) {
    case "kids":
      return "#B026FF"; // Roxo neon
    case "adultos":
      return "#0A2342"; // Azul escuro
    case "jovens":
      return "#000000"; // Preto
    case "juvenis":
      return "#39FF14"; // Verde neon
    case "adolescentes":
      return "#1BC700"; // Verde
    default:
      return "#ffffff"; // Branco padrão
  }
}

// Função utilitária para obter a cor da borda do InfoWindow de acordo com o público alvo
function getCorBordaInfoWindow(publicoAlvo?: string): string {
  switch ((publicoAlvo || "").toLowerCase()) {
    case "kids":
      return "#B026FF"; // Laranja
    case "adultos":
      return "#0A2342"; // Azul
    case "jovens":
      return "#000000"; // Rosa
    case "juvenis":
      return "#39FF14"; // Verde água
    case "adolescentes":
      return "#1BC700"; // Laranja escuro
    default:
      return "#ffffff"; // Cinza padrão
  }
}

export default function Map({ pontos }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<CustomOverlayView[]>([]);

  // Memoiza os pontos para evitar re-renderizações desnecessárias
  const pontosMemo = useMemo(() => pontos, [pontos]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Cria o mapa apenas uma vez
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: -15.646670, lng: -56.132500 },
        styles: [
          {
            featureType: "poi", // todos os pontos de interesse
            elementType: "labels", // esconde os labels
            stylers: [{ visibility: "off" }],
          },
        ],
      });
    }

    const map = mapInstanceRef.current;

    // Remove overlays existentes
    overlaysRef.current.forEach(overlay => {
      overlay.setMap(null);
    });
    overlaysRef.current = [];

    pontosMemo.forEach((ponto) => {
      if (!ponto.lat || !ponto.lng) return;

      const overlay = new window.google.maps.OverlayView() as CustomOverlayView;

      overlay.onAdd = function () {
        // Cor da borda do marcador (círculo)
        const corBorda = getCorBorda(ponto.publico_alvo);
        // Cor da borda do InfoWindow (diferente)
        const corBordaInfo = getCorBordaInfoWindow(ponto.publico_alvo);

        // Cria o container principal
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.transform = "translate(-50%, -50%)";
        div.style.textAlign = "center";
        div.style.cursor = "pointer";

        // Container para posicionar a bolinha sobre a imagem
        const imgContainer = document.createElement("div");
        imgContainer.style.position = "relative";
        imgContainer.style.display = "inline-block";
        imgContainer.style.width = "50px";
        imgContainer.style.height = "50px";

        // Círculo com foto dentro e borda colorida
        const img = document.createElement("div");
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.border = `3px solid`;
        img.style.borderRadius = "50%";
        img.style.backgroundSize = "cover";
        img.style.backgroundPosition = "center";
        img.style.backgroundColor = "#fff";
        img.style.position = "relative";
        img.style.zIndex = "1";

        // Só define a imagem se fotoUrl existir e não for null/undefined
        if (ponto.fotoUrl && ponto.fotoUrl !== 'null' && ponto.fotoUrl !== 'undefined') {
          img.style.backgroundImage = `url(${ponto.fotoUrl})`;
        } else {
          // Imagem padrão quando não há foto
          img.style.backgroundImage = `url('/images/homem.png')`;
        }

        // Bolinha colorida no canto superior direito, por cima da imagem
        const bolinha = document.createElement("div");
        bolinha.style.position = "absolute";
        bolinha.style.top = "2px";
        bolinha.style.right = "2px";
        bolinha.style.width = "16px";
        bolinha.style.height = "16px";
        bolinha.style.borderRadius = "50%";
        bolinha.style.background = corBorda;
        bolinha.style.border = "2px solid #fff";
        bolinha.style.zIndex = "2";
        bolinha.style.boxShadow = "0 0 0 0 rgba(0,0,0,0.2)";

        // Animação de pulsar
        bolinha.style.animation = "pulsar-bolinha 1.2s infinite cubic-bezier(0.66, 0, 0, 1)";

        // Adiciona o keyframes da animação no head só uma vez
        if (!document.getElementById("pulsar-bolinha-keyframes")) {
          const style = document.createElement("style");
          style.id = "pulsar-bolinha-keyframes";
          style.innerHTML = `
            @keyframes pulsar-bolinha {
              0% {
                box-shadow: 0 0 0 0 rgba(0,0,0,0.2);
                transform: scale(1);
              }
              70% {
                box-shadow: 0 0 0 10px rgba(0,0,0,0);
                transform: scale(1.2);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(0,0,0,0);
                transform: scale(1);
              }
            }
          `;
          document.head.appendChild(style);
        }

        imgContainer.appendChild(img);
        imgContainer.appendChild(bolinha);
        div.appendChild(imgContainer);

        // Label com o nome da célula
        if (ponto.nome_lider) {
          const label = document.createElement("div");
          label.innerText = ponto.nome_lider;
          label.style.fontSize = "12px";
          label.style.fontWeight = "bold";
          label.style.color = "black";
          label.style.marginTop = "4px";
          div.appendChild(label);
        }

        // 🔥 InfoWindow com mais informações
        const fotoUrl = (ponto.fotoUrl && ponto.fotoUrl !== 'null' && ponto.fotoUrl !== 'undefined')
          ? ponto.fotoUrl
          : '/images/homem.png';

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width:340px;">
              <div style="display: flex; justify-content: center; align-items: center; box-shadow: inset 0 2px 16px rgba(0,0,0,0.53); border-radius: 24px; padding: 24px; background: #fff; margin-bottom: 16px; border: 5px solid ${corBordaInfo};">
                <img src="${fotoUrl}" alt="foto" style="width:140px; height:140px; object-fit:contain;" />
              </div>
              <h3 style="margin:0; font-size:28px; font-weight: bold; color: #000;">${ponto.nome_lider || ""}</h3>
              <span style="margin:8px 0; font-size:22px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Célula:</span> ${ponto.nome_celula || "Não informado"}
              </span>
              <span style="margin:8px 0; font-size:22px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Rede:</span> ${ponto.rede || "Não informado"}
              </span>
              <span style="margin:8px 0; font-size:22px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Discipulado:</span> ${ponto.discipulado || "Não informado"}
              </span>
              <span style="margin:8px 0; font-size:22px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Público Alvo:</span> ${ponto.publico_alvo || "Não informado"}
              </span>
              <span style="margin:8px 0; font-size:22px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Dia da Semana:</span> ${ponto.dia_da_semana || "Não informado"}
              </span>
              <span style="margin:8px 0; font-size:22px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Celular do Líder:</span> ${ponto.celular_lider || "Não informado"}
              </span>
              <span style="margin:8px 0; font-size:22px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Horário:</span> ${ponto.horario || "Não informado"}
              </span>
              <span style="margin:8px 0; font-size:22px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Bairro:</span> ${ponto.bairro || "Não informado"}
              </span>
              <div style="margin-top:24px; display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between;">
                <div style="display: flex; flex-direction: row; gap: 16px; width: 100%;">
                  <button id="btnCopiarInfo" title="Copiar informações"
                          style="padding:20px 0; border:none; border-radius:14px;
                                background:#6c757d; color:#fff; cursor:pointer; display: flex; align-items: center; gap: 12px; width: 100%; justify-content: center; font-size: 22px;">
                    <i class="fa fa-copy" aria-hidden="true"></i>
                  </button>
                  <button id="btnWhatsapp" title="WhatsApp do Líder"
                          style="padding:20px 0; border:none; border-radius:14px;
                                background:#25d366; color:#fff; cursor:pointer; display: flex; align-items: center; gap: 12px; width: 100%; justify-content: center; font-size: 22px;">
                    <i class="fab fa-whatsapp" aria-hidden="true"></i>
                  </button>
                  <button id="btnCompartilhar" title="Compartilhar Localização"
                          style="padding:20px 0; border:none; border-radius:14px;
                                background:#ff9800; color:#fff; cursor:pointer; display: flex; align-items: center; gap: 12px; width: 100%; justify-content: center; font-size: 22px;">
                    <i class="fa fa-share-alt" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
          `,
        });

        // Evento de clique no ícone
        div.addEventListener("click", () => {
          infoWindow.setPosition(new window.google.maps.LatLng(ponto.lat, ponto.lng));
          infoWindow.open(map);

          // Timeout para garantir que o DOM do InfoWindow foi renderizado
          setTimeout(() => {
            // Copiar informações
            const btnCopiar = document.getElementById("btnCopiarInfo");
            if (btnCopiar) {
              btnCopiar.onclick = () => {
                const info = `
                Líder: ${ponto.nome_lider || "Não informado"}
                Célula: ${ponto.nome_celula || "Não informado"}
                Rede: ${ponto.rede || "Não informado"}
                Discipulado: ${ponto.discipulado || "Não informado"}
                Público Alvo: ${ponto.publico_alvo || "Não informado"}
                Dia da Semana: ${ponto.dia_da_semana || "Não informado"}
                Celular do Líder: ${ponto.celular_lider || "Não informado"}
                Horário: ${ponto.horario || "Não informado"}
                Bairro: ${ponto.bairro || "Não informado"}
                Localização: https://www.google.com/maps/dir/?api=1&destination=${ponto.lat},${ponto.lng}
                `;
                navigator.clipboard.writeText(info.trim());
                btnCopiar.textContent = "Copiado!";
                setTimeout(() => {
                  btnCopiar.textContent = "Copiar informações";
                }, 1500);
              };
            }

            // WhatsApp do líder
            const btnWhatsapp = document.getElementById("btnWhatsapp");
            if (btnWhatsapp && ponto.celular_lider) {
              btnWhatsapp.onclick = () => {
                // Remove caracteres não numéricos do telefone
                const numero = ponto.celular_lider!.replace(/\D/g, "");
                const texto = encodeURIComponent(
                  `Olá ${ponto.nome_lider || ""}, gostaria de saber mais sobre a célula "${ponto.nome_celula || ""}".`
                );
                window.open(`https://wa.me/55${numero}?text=${texto}`, "_blank");
              };
            } else if (btnWhatsapp) {
              btnWhatsapp.onclick = () => {
                btnWhatsapp.textContent = "Sem WhatsApp";
                setTimeout(() => {
                  btnWhatsapp.textContent = "WhatsApp do Líder";
                }, 1500);
              };
            }

            // Compartilhar localização
            const btnCompartilhar = document.getElementById("btnCompartilhar");
            if (btnCompartilhar) {
              btnCompartilhar.onclick = async () => {
                // Link para abrir já na rota do Google Maps
                const url = `https://www.google.com/maps/dir/?api=1&destination=${ponto.lat},${ponto.lng}`;
                const shareData = {
                  title: `Rota para célula de ${ponto.nome_lider || ""}`,
                  text: `Veja a rota para a célula de ${ponto.nome_lider || ""}:\n${url}`,
                  url,
                };
                // Tenta usar a API nativa de compartilhamento se disponível
                if (window.parent !== window && window.parent !== window) {
                  // Estamos em um iframe (embed)
                  // Tenta pedir para o parent abrir a bandeja de compartilhamento via postMessage
                  window.parent.postMessage(
                    {
                      type: "abrir-compartilhamento",
                      data: shareData,
                    },
                    "*"
                  );
                  btnCompartilhar.textContent = "Solicitado ao app!";
                  setTimeout(() => {
                    btnCompartilhar.textContent = "Compartilhar Rota";
                  }, 1500);
                } else {
                  // Fallback: copia o link da rota
                  navigator.clipboard.writeText(url);
                  btnCompartilhar.textContent = "Link da rota copiado!";
                  setTimeout(() => {
                    btnCompartilhar.textContent = "Compartilhar Rota";
                  }, 1500);
                }
              };
            }
          }, 100);
        });

        const panes = this.getPanes();
        panes?.overlayMouseTarget.appendChild(div);

        this.div = div;
      };

      overlay.draw = function () {
        if (!this.div) return;
        const projection = this.getProjection();
        const position = new window.google.maps.LatLng(ponto.lat, ponto.lng);
        const point = projection.fromLatLngToDivPixel(position);
        if (point) {
          this.div.style.left = point.x + "px";
          this.div.style.top = point.y + "px";
        }
      };

      overlay.onRemove = function () {
        this.div?.parentNode?.removeChild(this.div);
      };

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });
  }, [pontosMemo]);

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
}
