import React, { useEffect, useState } from "react";
import Parse from "./Service/ParseClient.js";
import ShelterCard from "./Components/ShelterCard.jsx";
import OfflineBanner from "./Components/OfflineBanner.jsx";
import OfflineUpdateForm from "./Components/OfflineUpdateForm.jsx";

import {
  getShelterCache,
  saveShelterCache,
} from "./Service/OfflineStorage.js";

import {
  addPendingUpdate,
  getPendingUpdates,
  removePendingUpdate,
} from "./Service/OfflineUpdates.js";

import "./App.css";

export default function App() {
  const [zipcode, setZipcode] = useState("");
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cachedAt, setCachedAt] = useState(null);
  const [usingCachedData, setUsingCachedData] = useState(false);

  const [pendingUpdates, setPendingUpdates] = useState(
    () => getPendingUpdates()
  );

  useEffect(() => {
    async function fetchShelters() {
      try {
        const Shelter = Parse.Object.extend("Shelter");
        const query = new Parse.Query(Shelter);

        const results = await query.find();

        const mappedShelters = results.map((shelterObject) => ({
          id: shelterObject.id,
          name: shelterObject.get("name"),
          status: shelterObject.get("status"),
          distanceMiles: shelterObject.get("distanceMiles"),
          petsAllowed: shelterObject.get("petsAllowed"),
          accessible: shelterObject.get("accessible"),
          medicalOnSite: shelterObject.get("medicalOnSite"),
          updatedAt: shelterObject.updatedAt
            ? new Date(shelterObject.updatedAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : null,
        }));

        setShelters(mappedShelters);

        // Save the newest successful Back4App response locally.
        saveShelterCache(mappedShelters);

        // Read the saved cache so the exact stored timestamp is available.
        const savedCache = getShelterCache();

        setCachedAt(savedCache?.cachedAt ?? null);
        setUsingCachedData(false);
        setError(null);
      } catch (err) {
        console.error("Unable to load live shelter data.", err);

        // Use the most recently saved shelter records when Back4App
        // or the internet connection is unavailable.
        const savedCache = getShelterCache();

        if (savedCache) {
          setShelters(savedCache.shelters);
          setCachedAt(savedCache.cachedAt);
          setUsingCachedData(true);
          setError(null);
        } else {
          setShelters([]);
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

  function handleSearchSubmit(event) {
    event.preventDefault();

    // ZIP-code search is not connected yet.
  }

  function handleSavePendingUpdate(updateData) {
    const updatedQueue = addPendingUpdate(updateData);

    setPendingUpdates(updatedQueue);
  }

  function handleDeletePendingUpdate(updateId) {
    const updatedQueue = removePendingUpdate(updateId);

    setPendingUpdates(updatedQueue);
  }

  return (
    <div className="page">
      <header className="banner">
        <h1>Shelter Finder</h1>
      </header>

      <OfflineBanner />

      <form
        className="search-form"
        onSubmit={handleSearchSubmit}
      >
        <label
          htmlFor="zipcode"
          className="sr-only"
        >
          Enter ZIP code
        </label>

        <input
          id="zipcode"
          type="text"
          inputMode="numeric"
          placeholder="Enter zipcode"
          value={zipcode}
          onChange={(event) => setZipcode(event.target.value)}
        />

        <button type="submit">
          Search
        </button>
      </form>

      <OfflineUpdateForm
        shelters={shelters}
        pendingUpdates={pendingUpdates}
        onSave={handleSavePendingUpdate}
        onDelete={handleDeletePendingUpdate}
      />

      <main className="content">
        <section
          className="shelter-list"
          aria-label="Nearby shelters"
        >
          {usingCachedData && cachedAt && (
            <p
              className="cache-message"
              role="status"
            >
              Showing saved shelter information from{" "}
              {new Date(cachedAt).toLocaleString()}.
            </p>
          )}

          {loading && (
            <p className="status-message">
              Loading shelters…
            </p>
          )}

          {error && (
            <p className="status-message status-message--error">
              {error}
            </p>
          )}

          {!loading && !error && shelters.length === 0 && (
            <p className="status-message">
              No shelters found yet.
            </p>
          )}

          {shelters.map((shelter) => (
            <ShelterCard
              key={shelter.id}
              shelter={shelter}
            />
          ))}
        </section>

        <section
          className="map-placeholder"
          aria-label="Map coming soon"
        >
          <span>Map view coming soon</span>
        </section>
      </main>
    </div>
  );
}