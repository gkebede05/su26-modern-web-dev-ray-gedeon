import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Box,
  Container,
  Tab,
  Tabs,
} from "@mui/material";

import ShelterCard from "./Components/ShelterCard.jsx";
import OfflineBanner from "./Components/OfflineBanner.jsx";
import OfflineUpdateForm from "./Components/OfflineUpdateForm.jsx";
import ShelterDetails from "./Components/ShelterDetails.jsx";
import Favourites from "./Components/Favourites.jsx";

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

const FAVOURITES_STORAGE_KEY =
  "shelterFinder.favouriteIds";

/**
 * Converts a server date into the format
 * displayed in the shelter interface.
 */
function formatServerDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsedDate =
    new Date(dateValue);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

/**
 * Reads saved favourite shelter IDs
 * from localStorage.
 */
function getStoredFavouriteIds() {
  const storedFavouriteIds =
    localStorage.getItem(
      FAVOURITES_STORAGE_KEY
    );

  if (!storedFavouriteIds) {
    return [];
  }

  try {
    const parsedFavouriteIds =
      JSON.parse(storedFavouriteIds);

    return Array.isArray(
      parsedFavouriteIds
    )
      ? parsedFavouriteIds
      : [];
  } catch (storageError) {
    console.error(
      "Unable to read favourite shelters.",
      storageError
    );

    return [];
  }
}

export default function App() {
  const isOnline =
    useOnlineStatus();

  const [
    zipcode,
    setZipcode,
  ] = useState("");

  const [
    shelters,
    setShelters,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    cachedAt,
    setCachedAt,
  ] = useState(null);

  const [
    usingCachedData,
    setUsingCachedData,
  ] = useState(false);

  const [
    pendingUpdates,
    setPendingUpdates,
  ] = useState(
    () => getPendingUpdates()
  );

  const [
    isSyncing,
    setIsSyncing,
  ] = useState(false);

  const [
    syncMessage,
    setSyncMessage,
  ] = useState("");

  /*
   * Material UI module state.
   */
  const [
    activeModule,
    setActiveModule,
  ] = useState("shelters");

  const [
    selectedShelter,
    setSelectedShelter,
  ] = useState(null);

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    favouriteIds,
    setFavouriteIds,
  ] = useState(
    () => getStoredFavouriteIds()
  );

  /*
   * Prevents React StrictMode from starting
   * multiple synchronization operations.
   */
  const syncInProgressRef =
    useRef(false);

  /**
   * Loads live shelter data when possible.
   *
   * If the live request fails, the application
   * displays the most recently cached shelter data.
   */
  useEffect(() => {
    let componentIsActive = true;

    async function loadShelters() {
      setLoading(true);

      try {
        const liveShelters =
          await getShelters();

        if (!componentIsActive) {
          return;
        }

        setShelters(
          liveShelters
        );

        saveShelterCache(
          liveShelters
        );

        const savedCache =
          getShelterCache();

        setCachedAt(
          savedCache?.cachedAt ??
            null
        );

        setUsingCachedData(
          false
        );

        setError(null);
      } catch (loadError) {
        console.error(
          "Unable to load live shelter data.",
          loadError
        );

        if (!componentIsActive) {
          return;
        }

        const savedCache =
          getShelterCache();

        if (savedCache) {
          setShelters(
            savedCache.shelters
          );

          setCachedAt(
            savedCache.cachedAt
          );

          setUsingCachedData(
            true
          );

          setError(null);
        } else {
          setShelters([]);

          setError(
            "Shelter information could not be loaded, and no saved data is available."
          );
        }
      } finally {
        if (componentIsActive) {
          setLoading(false);
        }
      }
    }

    loadShelters();

    return () => {
      componentIsActive = false;
    };
  }, []);

  /**
   * Synchronizes pending shelter updates when
   * the browser returns online.
   *
   * A pending update is deleted from localStorage
   * only after Cloud Code confirms success.
   */
  useEffect(() => {
    if (!isOnline) {
      return;
    }

    if (
      pendingUpdates.length === 0
    ) {
      return;
    }

    if (
      syncInProgressRef.current
    ) {
      return;
    }

    let effectIsActive = true;

    async function synchronizeQueue() {
      syncInProgressRef.current =
        true;

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
        /*
         * Process older updates first so that
         * changes for the same shelter stay in order.
         *
         * Pending updates are stored newest first.
         */
        const updatesInTimeOrder = [
          ...queuedUpdates,
        ].reverse();

        for (
          const update of
          updatesInTimeOrder
        ) {
          const result =
            await syncShelterUpdate(
              update
            );

          /*
           * Remove locally only after the server
           * confirms successful processing.
           */
          const remainingQueue =
            removePendingUpdate(
              update.id
            );

          if (effectIsActive) {
            setPendingUpdates(
              remainingQueue
            );
          }

          successfulUpdates += 1;

          /*
           * Update the visible shelter immediately
           * when Cloud Code returns a Shelter object.
           */
          if (result?.shelter) {
            setShelters(
              (
                currentShelters
              ) => {
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
                            .notes ?? "",

                        updatedAt:
                          formatServerDate(
                            result.shelter
                              .updatedAt
                          ),

                        pendingSync:
                          false,
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

        if (effectIsActive) {
          setPendingUpdates(
            finalQueue
          );

          setCachedAt(
            latestCache?.cachedAt ??
              null
          );

          setUsingCachedData(
            false
          );

          if (
            finalQueue.length === 0
          ) {
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
        }
      } catch (syncError) {
        console.error(
          "Unable to synchronize pending shelter updates.",
          syncError
        );

        const remainingQueue =
          getPendingUpdates();

        if (effectIsActive) {
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
        }
      } finally {
        if (effectIsActive) {
          setIsSyncing(false);
        }

        syncInProgressRef.current =
          false;
      }
    }

    synchronizeQueue();

    return () => {
      effectIsActive = false;
    };
  }, [
    isOnline,
    pendingUpdates.length,
  ]);

  function handleSearchSubmit(
    event
  ) {
    event.preventDefault();

    /*
     * ZIP-code searching belongs to another
     * feature and is not connected here.
     */
  }

  function handleSavePendingUpdate(
    updateData
  ) {
    try {
      const updatedQueue =
        addPendingUpdate(
          updateData
        );

      setPendingUpdates(
        updatedQueue
      );

      if (isOnline) {
        setSyncMessage(
          "Update saved locally. Synchronization will begin now."
        );
      } else {
        setSyncMessage(
          "Update saved locally and will synchronize when the connection returns."
        );
      }
    } catch (saveError) {
      console.error(
        "Unable to save the shelter update.",
        saveError
      );

      setSyncMessage(
        saveError.message
      );
    }
  }

  function handleDeletePendingUpdate(
    updateId
  ) {
    const updatedQueue =
      removePendingUpdate(
        updateId
      );

    setPendingUpdates(
      updatedQueue
    );

    setSyncMessage(
      "The pending update was deleted."
    );
  }

  /**
   * Saves favourite IDs in state and localStorage.
   */
  function saveFavouriteIds(
    nextFavouriteIds
  ) {
    setFavouriteIds(
      nextFavouriteIds
    );

    localStorage.setItem(
      FAVOURITES_STORAGE_KEY,
      JSON.stringify(
        nextFavouriteIds
      )
    );
  }

  function handleViewDetails(
    shelter
  ) {
    setSelectedShelter(
      shelter
    );

    setDetailsOpen(true);
  }

  function handleCloseDetails() {
    setDetailsOpen(false);
  }

  function handleToggleFavourite(
    shelter
  ) {
    if (!shelter?.id) {
      return;
    }

    const alreadyFavourite =
      favouriteIds.includes(
        shelter.id
      );

    const nextFavouriteIds =
      alreadyFavourite
        ? favouriteIds.filter(
            (shelterId) =>
              shelterId !==
              shelter.id
          )
        : [
            ...favouriteIds,
            shelter.id,
          ];

    saveFavouriteIds(
      nextFavouriteIds
    );
  }

  function handleRemoveFavourite(
    shelterId
  ) {
    const nextFavouriteIds =
      favouriteIds.filter(
        (favouriteId) =>
          favouriteId !==
          shelterId
      );

    saveFavouriteIds(
      nextFavouriteIds
    );
  }

  /**
   * Displays the newest local pending version
   * while synchronization is still waiting.
   */
  const displayedShelters =
    shelters.map(
      (shelter) => {
        const newestPendingUpdate =
          pendingUpdates.find(
            (update) =>
              update.shelterId ===
              shelter.id
          );

        if (
          !newestPendingUpdate
        ) {
          return {
            ...shelter,
            pendingSync: false,
          };
        }

        return {
          ...shelter,

          status:
            newestPendingUpdate
              .status,

          notes:
            newestPendingUpdate
              .note,

          pendingSync: true,
        };
      }
    );

  const favouriteShelters =
    displayedShelters.filter(
      (shelter) =>
        favouriteIds.includes(
          shelter.id
        )
    );

  /*
   * Keep the open details dialog updated when
   * shelter data changes after synchronization.
   */
  const currentSelectedShelter =
    selectedShelter
      ? displayedShelters.find(
          (shelter) =>
            shelter.id ===
            selectedShelter.id
        ) ?? selectedShelter
      : null;

  return (
    <div className="page">
      <header className="banner">
        <h1>
          Shelter Finder
        </h1>
      </header>

      <OfflineBanner />

      <form
        className="search-form"
        onSubmit={
          handleSearchSubmit
        }
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

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          py: {
            xs: 3,
            sm: 4,
          },
        }}
      >
        <Tabs
          value={activeModule}
          onChange={(
            event,
            nextModule
          ) => {
            setActiveModule(
              nextModule
            );
          }}
          aria-label="Shelter Finder modules"
          variant="fullWidth"
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor:
              "divider",
          }}
        >
          <Tab
            value="shelters"
            label="Shelters"
            id="shelters-tab"
            aria-controls="shelters-panel"
          />

          <Tab
            value="favourites"
            label={`Favourites (${favouriteShelters.length})`}
            id="favourites-tab"
            aria-controls="favourites-panel"
          />
        </Tabs>

        {activeModule ===
          "shelters" && (
          <Box
            id="shelters-panel"
            role="tabpanel"
            aria-labelledby="shelters-tab"
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",

                lg: "minmax(0, 1fr) minmax(320px, 0.75fr)",
              },

              gap: {
                xs: 3,
                lg: 4,
              },
            }}
          >
            <Box
              component="section"
              aria-label="Nearby shelters"
              sx={{
                display: "grid",
                gap: 2,
                alignContent:
                  "start",
                minWidth: 0,
              }}
            >
              {usingCachedData &&
                cachedAt && (
                  <p
                    className="cache-message"
                    role="status"
                  >
                    Showing saved
                    shelter information
                    from{" "}
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
                    No shelters
                    found yet.
                  </p>
                )}

              {displayedShelters.map(
                (shelter) => (
                  <ShelterCard
                    key={
                      shelter.id
                    }
                    shelter={
                      shelter
                    }
                    isFavourite={favouriteIds.includes(
                      shelter.id
                    )}
                    onViewDetails={
                      handleViewDetails
                    }
                    onToggleFavourite={
                      handleToggleFavourite
                    }
                  />
                )
              )}
            </Box>

            <Box
              component="section"
              aria-label="Map coming soon"
              sx={{
                minHeight: {
                  xs: 240,
                  lg: 500,
                },

                border: 1,
                borderColor:
                  "divider",
                borderRadius: 3,

                display: "grid",
                placeItems:
                  "center",

                bgcolor:
                  "grey.50",
                color:
                  "text.secondary",

                px: 2,
                textAlign:
                  "center",
              }}
            >
              Map view coming soon
            </Box>
          </Box>
        )}

        {activeModule ===
          "favourites" && (
          <Box
            id="favourites-panel"
            role="tabpanel"
            aria-labelledby="favourites-tab"
          >
            <Favourites
              favourites={
                favouriteShelters
              }
              onViewDetails={
                handleViewDetails
              }
              onRemoveFavourite={
                handleRemoveFavourite
              }
            />
          </Box>
        )}

        <ShelterDetails
          shelter={
            currentSelectedShelter
          }
          open={detailsOpen}
          onClose={
            handleCloseDetails
          }
          isFavourite={
            currentSelectedShelter
              ? favouriteIds.includes(
                  currentSelectedShelter.id
                )
              : false
          }
          onToggleFavourite={
            handleToggleFavourite
          }
        />
      </Container>
    </div>
  );
}