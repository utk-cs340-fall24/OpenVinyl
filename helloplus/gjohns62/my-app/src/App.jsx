import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://xgukuojofpwrfnvsxecm.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhndWt1b2pvZnB3cmZudnN4ZWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwNzc2ODQsImV4cCI6MjA0MTY1MzY4NH0.Ma0kOaNwG5jnyUQ6FRlTZc7DAhBl4gNbBE5eNzmovxM");

function App() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    getCountries();
  }, []);

  async function getCountries() {
    const { data } = await supabase.from("countries").select();
    setCountries(data);
  }

  return (
    <ul>
      {countries.map((country) => (
        <li key={country.name}>{country.name}</li>
      ))}
    </ul>
  );
}

export default App;
