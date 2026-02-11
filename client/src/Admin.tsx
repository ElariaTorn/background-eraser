import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    supabase.from("items").select("*")
      .then(res => setItems(res.data || []));
  }, []);

  return (
    <div>
      <h1>Все вещи</h1>
      {items.map((item: any) => (
        <div key={item.id}>
          <img src={item.image_url} width={200} />
          <a href={item.image_url} download>Скачать</a>
        </div>
      ))}
    </div>
  );
}
