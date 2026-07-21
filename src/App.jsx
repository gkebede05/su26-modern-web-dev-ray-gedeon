import React, { useEffect, useState } from "react";
import Parse from "./Service/ParseClient.js";
import ShelterCard from "./Components/ShelterCard";
import OfflineBanner from "./Components/OfflineBanner.jsx";
import {
  getShelterCache,
  saveShelterCache,
} from "./Service/OfflineStorage.js";
import "./App.css";

export default function App() {
  const [zipcode, setZipcode] = useState("");
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cachedAt, setCachedAt] = useState(null);
  const [usingCachedData, setUsingCachedData] = useState(false);

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

        const savedCache = saveShelterCache(mapped);
        setCachedAt(savedCache.cachedAt);
        setUsingCachedData(false);
        setError(null);
      } catch (err) {
        console.error("Unable to load live shelter data.", err);

        const cache = getShelterCache();

        if (cache) {
          setShelters(cache.shelters);
          setCachedAt(cache.cachedAt);
          setUsingCachedData(true);
          setError(null);
        } else {
          setError(
            "Shelter information could not be loaded, and no saved data is available."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchShelters();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // Zipcode lookup isn't wired up yet.
  }

  return (
    <div className="page">
      <header className="banner">
        <h1>Shelter Finder</h1>
      </header>

      <OfflineBanner />

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
          {usingCachedData && cachedAt && (
            <p className="cache-message" role="status">
              Showing saved shelter information from{" "}
              {new Date(cachedAt).toLocaleString()}.
            </p>
          )}

          {loading && (
            <p className="status-message">Loading shelters…</p>
          )}

          {error && (
            <p className="status-message status-message--error">
              {error}
            </p>
          )}

          {!loading && !error && shelters.length === 0 && (
            <p className="status-message">No shelters found yet.</p>
          )}

          {shelters.map((shelter) => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))}
        </section>

        <section
          className="map-placeholder"
          aria-label="Map (coming soon)"
        >
          <span>Map view coming soon</span>
        </section>
      </main>
    </div>
  );
}