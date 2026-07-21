import React, { useEffect, useState } from "react";
import Parse from "./main.jsx";
import ShelterCard from "./Components/ShelterCard";
import "./App.css";

export default function App() {
  const [zipcode, setZipcode] = useState("");
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShelters() {
      try {
        const Shelter = Parse.Object.extend("Shelter");
        const query = new Parse.Query(Shelter);
        const results = await query.find();

        const mapped = results.map((obj) => ({
          id: obj.id,
          name: obj.get("name"),
          status: obj.get("status"),
          distanceMiles: obj.get("distanceMiles"),
          petsAllowed: obj.get("petsAllowed"),
          accessible: obj.get("accessible"),
          medicalOnSite: obj.get("medicalOnSite"),
          updatedAt: obj.updatedAt
            ? new Date(obj.updatedAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : null,
        }));

        setShelters(mapped);
      } catch (err) {
        setError("Couldn't load shelter data. Check your Back4App keys and connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchShelters();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // Zipcode lookup isn't wired up yet - this is a placeholder for now.
  }

  return (
    <div className="page">
      <header className="banner">
        <h1>Shelter Finder</h1>
      </header>

      <form className="search-form" onSubmit={handleSubmit}>
        <label htmlFor="zipcode" className="sr-only">
          Enter zipcode
        </label>
        <input
          id="zipcode"
          type="text"
          inputMode="numeric"
          placeholder="Enter zipcode"
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <main className="content">
        <section className="shelter-list" aria-label="Nearby shelters">
          {loading && <p className="status-message">Loading shelters…</p>}
          {error && <p className="status-message status-message--error">{error}</p>}
          {!loading && !error && shelters.length === 0 && (
            <p className="status-message">No shelters found yet.</p>
          )}
          {shelters.map((shelter) => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))}
        </section>

        <section className="map-placeholder" aria-label="Map (coming soon)">
          <span>Map view coming soon</span>
        </section>
      </main>
    </div>
  );
}