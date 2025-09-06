import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Map from "@/components/Map";

type Ponto = {
  lat: number;
  lng: number;
  title?: string;
  fotoUrl?: string;
};

export default function MapPage() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCelulas = async () => {
      const { data, error } = await supabase
        .from("celulas")
        .select("*");

      console.log(data);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Mapeia os dados da tabela 'celulas' para o formato do Map
      const pontosFormatados: Ponto[] = (data || []).map((item: any) => ({
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
      setLoading(false);
    };

    fetchCelulas();
  }, []);

  if (loading) return <p>Carregando células...</p>;

  return <Map pontos={pontos} />;
}
