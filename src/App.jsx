import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import ShelterCard from "./Components/ShelterCard.jsx";
import OfflineBanner from "./Components/OfflineBanner.jsx";
import OfflineUpdateForm from "./Components/OfflineUpdateForm.jsx";
import useOnlineStatus from "./Hooks/useOnlineStatus.js";

import {
  getShelterCache,
  saveShelterCache,
} from "./Service/OfflineStorage.js";

import {
  addPendingUpdate,
  getPendingUpdates,
  removePendingUpdate,
} from "./Service/OfflineUpdates.js";

import {
  getShelters,
  syncShelterUpdate,
} from "./Service/ShelterService.js";

import "./App.css";

function formatServerDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  return new Date(dateValue).toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

export default function App() {
  const isOnline = useOnlineStatus();

  const [zipcode, setZipcode] = useState("");
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cachedAt, setCachedAt] =
    useState(null);

  const [
    usingCachedData,
    setUsingCachedData,
  ] = useState(false);

  const [
    pendingUpdates,
    setPendingUpdates,
  ] = useState(() => getPendingUpdates());

  const [isSyncing, setIsSyncing] =
    useState(false);

  const [syncMessage, setSyncMessage] =
    useState("");

  // Prevent React StrictMode from starting
  // two synchronization operations at once.
  const syncInProgressRef = useRef(false);

  /**
   * Loads shelter information when the application starts.
   */
  useEffect(() => {
    async function loadShelters() {
      try {
        const liveShelters =
          await getShelters();

        setShelters(liveShelters);

        saveShelterCache(liveShelters);

        const savedCache =
          getShelterCache();

        setCachedAt(
          savedCache?.cachedAt ?? null
        );

        setUsingCachedData(false);
        setError(null);
      } catch (loadError) {
        console.error(
          "Unable to load live shelter data.",
          loadError
        );

        const savedCache =
          getShelterCache();

        if (savedCache) {
          setShelters(
            savedCache.shelters
          );

          setCachedAt(
            savedCache.cachedAt
          );

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

    loadShelters();
  }, []);

  /**
   * Synchronizes pending updates when the
   * browser returns online.
   */
  useEffect(() => {
    if (!isOnline) {
      return;
    }

    if (pendingUpdates.length === 0) {
      return;
    }

    if (syncInProgressRef.current) {
      return;
    }

    async function synchronizeQueue() {
      syncInProgressRef.current = true;
      setIsSyncing(true);

      const queuedUpdates =
        getPendingUpdates();

      let successfulUpdates = 0;

      setSyncMessage(
        `Synchronizing ${queuedUpdates.length} pending update${
          queuedUpdates.length === 1
            ? ""
            : "s"
        }…`
      );

      try {
        // Process the newest queued update first.
        for (const update of queuedUpdates) {
          const result =
            await syncShelterUpdate(update);

          // Delete locally only after
          // Cloud Code confirms success.
          const remainingQueue =
            removePendingUpdate(update.id);

          setPendingUpdates(
            remainingQueue
          );

          successfulUpdates += 1;

          if (result?.shelter) {
            setShelters(
              (currentShelters) => {
                const updatedShelters =
                  currentShelters.map(
                    (shelter) => {
                      if (
                        shelter.id !==
                        result.shelter.id
                      ) {
                        return shelter;
                      }

                      return {
                        ...shelter,
                        status:
                          result.shelter
                            .status,
                        notes:
                          result.shelter
                            .notes || "",
                        updatedAt:
                          formatServerDate(
                            result.shelter
                              .updatedAt
                          ),
                      };
                    }
                  );

                saveShelterCache(
                  updatedShelters
                );

                return updatedShelters;
              }
            );
          }
        }

        const finalQueue =
          getPendingUpdates();

        const latestCache =
          getShelterCache();

        setCachedAt(
          latestCache?.cachedAt ?? null
        );

        setUsingCachedData(false);

        if (finalQueue.length === 0) {
          setSyncMessage(
            `${successfulUpdates} pending update${
              successfulUpdates === 1
                ? ""
                : "s"
            } synchronized successfully.`
          );
        } else {
          setSyncMessage(
            `${successfulUpdates} update${
              successfulUpdates === 1
                ? ""
                : "s"
            } synchronized. ${finalQueue.length} still pending.`
          );
        }
      } catch (syncError) {
        console.error(
          "Unable to synchronize pending shelter updates.",
          syncError
        );

        const remainingQueue =
          getPendingUpdates();

        setPendingUpdates(
          remainingQueue
        );

        setSyncMessage(
          `Synchronization paused. ${remainingQueue.length} update${
            remainingQueue.length === 1
              ? ""
              : "s"
          } remain pending.`
        );
      } finally {
        setIsSyncing(false);
        syncInProgressRef.current = false;
      }
    }

    synchronizeQueue();
  }, [isOnline, pendingUpdates.length]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    // ZIP-code search is not connected yet.
  }

  function handleSavePendingUpdate(
    updateData
  ) {
    const updatedQueue =
      addPendingUpdate(updateData);

    setPendingUpdates(updatedQueue);

    if (isOnline) {
      setSyncMessage(
        "Update saved locally. Synchronization will begin now."
      );
    } else {
      setSyncMessage(
        "Update saved locally and will synchronize when the connection returns."
      );
    }
  }

  function handleDeletePendingUpdate(
    updateId
  ) {
    const updatedQueue =
      removePendingUpdate(updateId);

    setPendingUpdates(updatedQueue);

    setSyncMessage(
      "The pending update was deleted."
    );
  }

  /**
   * While an update is pending, show its newer
   * status in the interface with pendingSync=true.
   */
  const displayedShelters =
    shelters.map((shelter) => {
      const newestPendingUpdate =
        pendingUpdates.find(
          (update) =>
            update.shelterId ===
            shelter.id
        );

      if (!newestPendingUpdate) {
        return shelter;
      }

      return {
        ...shelter,
        status:
          newestPendingUpdate.status,
        notes:
          newestPendingUpdate.note,
        pendingSync: true,
      };
    });

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
          onChange={(event) =>
            setZipcode(
              event.target.value
            )
          }
        />

        <button type="submit">
          Search
        </button>
      </form>

      {syncMessage && (
        <p
          className={
            isSyncing
              ? "sync-message sync-message--active"
              : "sync-message"
          }
          role="status"
          aria-live="polite"
        >
          {syncMessage}
        </p>
      )}

      <OfflineUpdateForm
        shelters={shelters}
        pendingUpdates={
          pendingUpdates
        }
        onSave={
          handleSavePendingUpdate
        }
        onDelete={
          handleDeletePendingUpdate
        }
      />

      <main className="content">
        <section
          className="shelter-list"
          aria-label="Nearby shelters"
        >
          {usingCachedData &&
            cachedAt && (
              <p
                className="cache-message"
                role="status"
              >
                Showing saved shelter
                information from{" "}
                {new Date(
                  cachedAt
                ).toLocaleString()}
                .
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

          {!loading &&
            !error &&
            displayedShelters.length ===
              0 && (
              <p className="status-message">
                No shelters found yet.
              </p>
            )}

          {displayedShelters.map(
            (shelter) => (
              <ShelterCard
                key={shelter.id}
                shelter={shelter}
              />
            )
          )}
        </section>

        <section
          className="map-placeholder"
          aria-label="Map coming soon"
        >
          <span>
            Map view coming soon
          </span>
        </section>
      </main>
    </div>
  );
}