const PENDING_UPDATES_KEY =
  "shelterFinder.pendingUpdates";

/**Reads all updates waiting for synchronization.
 */
export function getPendingUpdates() {
  const storedUpdates = localStorage.getItem(
    PENDING_UPDATES_KEY
  );

  if (!storedUpdates) {
    return [];
  }

  try {
    const parsedUpdates =
      JSON.parse(storedUpdates);

    return Array.isArray(parsedUpdates)
      ? parsedUpdates
      : [];
  } catch (error) {
    console.error(
      "Unable to read pending shelter updates.",
      error
    );

    return [];
  }
}

/**
 * Adds a shelter update to the local queue.
 */
export function addPendingUpdate(updateData) {
  const currentUpdates =
    getPendingUpdates();

  const newUpdate = {
    id: `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`,

    shelterId: updateData.shelterId,
    shelterName: updateData.shelterName,
    status: updateData.status,
    note: updateData.note.trim(),

    // This is the real time of the user's edit.
    createdAt: new Date().toISOString(),

    syncStatus: "pending",
  };

  // Newest updates are placed first.
  const updatedQueue = [
    newUpdate,
    ...currentUpdates,
  ];

  localStorage.setItem(
    PENDING_UPDATES_KEY,
    JSON.stringify(updatedQueue)
  );

  return updatedQueue;
}

/**
 * Removes an update only after the server
 * confirms that it was handled.
 */
export function removePendingUpdate(updateId) {
  const updatedQueue =
    getPendingUpdates().filter(
      (update) => update.id !== updateId
    );

  localStorage.setItem(
    PENDING_UPDATES_KEY,
    JSON.stringify(updatedQueue)
  );

  return updatedQueue;
}