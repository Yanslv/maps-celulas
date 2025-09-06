"use client";

import { useEffect, useRef } from "react";

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

export default function Map({ pontos }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: -15.646670, lng: -56.132500 },
    });

    pontos.forEach((ponto) => {
      if (!ponto.lat || !ponto.lng) return;

      const overlay = new window.google.maps.OverlayView() as CustomOverlayView;

      overlay.onAdd = function () {
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.transform = "translate(-50%, -50%)";
        div.style.textAlign = "center";
        div.style.cursor = "pointer";

        // Círculo branco com foto dentro
        const img = document.createElement("div");
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.border = "3px solid white";
        img.style.borderRadius = "50%";
        img.style.backgroundImage = `url(${ponto.fotoUrl})`;
        img.style.backgroundSize = "cover";
        img.style.backgroundPosition = "center";
        img.style.backgroundColor = "#fff";
        div.appendChild(img);

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
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="max-width:200px;">
              <div style="display: flex; justify-content: center; align-items: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.53); border-radius: 16px; padding: 12px; background: #fff; margin-bottom: 8px;">
                <img src="${ponto.fotoUrl}" alt="foto" style="width:80px; height:80px; border-radius:50%; object-fit:cover;" />
              </div>
              <h3 style="margin:0; font-size:16px; font-weight: bold; color: #000;">${ponto.nome_lider || ""}</h3>
              <span style="margin:4px 0; font-size:14px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Célula:</span> ${ponto.nome_celula || "Não informado"}
              </span>
              <span style="margin:4px 0; font-size:14px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Rede:</span> ${ponto.rede || "Não informado"}
              </span>
              <span style="margin:4px 0; font-size:14px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Discipulado:</span> ${ponto.discipulado || "Não informado"}
              </span>
              <span style="margin:4px 0; font-size:14px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Público Alvo:</span> ${ponto.publico_alvo || "Não informado"}
              </span>
              <span style="margin:4px 0; font-size:14px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Dia da Semana:</span> ${ponto.dia_da_semana || "Não informado"}
              </span>
              <span style="margin:4px 0; font-size:14px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Celular do Líder:</span> ${ponto.celular_lider || "Não informado"}
              </span>
              <span style="margin:4px 0; font-size:14px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Horário:</span> ${ponto.horario || "Não informado"}
              </span>
              <span style="margin:4px 0; font-size:14px; font-weight: 400; color: #161616; display: block; text-align: left;">
                <span style="font-weight: bold;">Bairro:</span> ${ponto.bairro || "Não informado"}
              </span>
              <div style="margin-top:12px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between;">
                <div style="display: flex; flex-direction: row; gap: 8px; width: 100%;">
                  <button id="btnCopiarInfo" title="Copiar informações"
                          style="padding:12px 0; border:none; border-radius:8px;
                                background:#6c757d; color:#fff; cursor:pointer; display: flex; align-items: center; gap: 6px; width: 100%; justify-content: center;">
                    <i class="fa fa-copy" aria-hidden="true"></i>
                  </button>
                  <button id="btnWhatsapp" title="WhatsApp do Líder"
                          style="padding:12px 0; border:none; border-radius:8px;
                                background:#25d366; color:#fff; cursor:pointer; display: flex; align-items: center; gap: 6px; width: 100%; justify-content: center;">
                    <i class="fab fa-whatsapp" aria-hidden="true"></i>
                  </button>
                  <button id="btnCompartilhar" title="Compartilhar Localização"
                          style="padding:12px 0; border:none; border-radius:8px;
                                background:#ff9800; color:#fff; cursor:pointer; display: flex; align-items: center; gap: 6px; width: 100%; justify-content: center;">
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
Localização: https://www.google.com/maps?q=${ponto.lat},${ponto.lng}
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
                const url = `https://www.google.com/maps?q=${ponto.lat},${ponto.lng}`;
                const shareData = {
                  title: `Localização da célula de ${ponto.nome_lider || ""}`,
                  text: `Veja a localização da célula de ${ponto.nome_lider || ""}:\n${url}`,
                  url,
                };
                // Tenta usar a API nativa de compartilhamento se disponível
                if (navigator.share) {
                  try {
                    await navigator.share(shareData);
                  } catch (_) {
                    // Usuário cancelou ou erro
                  }
                } else {
                  // Fallback: copia o link
                  navigator.clipboard.writeText(url);
                  btnCompartilhar.textContent = "Link copiado!";
                  setTimeout(() => {
                    btnCompartilhar.textContent = "Compartilhar Localização";
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
    });
  }, [pontos]);

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
}
