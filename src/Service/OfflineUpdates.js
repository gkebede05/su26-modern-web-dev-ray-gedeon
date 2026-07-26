const PENDING_UPDATES_KEY = "shelterFinder.pendingUpdates";

/**
 * Reads all shelter updates waiting to be synchronized.
 *
 * @returns {Array} The pending update queue.
 */
export function getPendingUpdates() {
  const storedUpdates = localStorage.getItem(PENDING_UPDATES_KEY);

  if (!storedUpdates) {
    return [];
  }

  try {
    const parsedUpdates = JSON.parse(storedUpdates);

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
 * Saves the complete pending update queue to localStorage.
 *
 * @param {Array} updates - The pending updates to save.
 * @returns {Array} The saved update queue.
 */
export function savePendingUpdates(updates) {
  const safeUpdates = Array.isArray(updates)
    ? updates
    : [];

  localStorage.setItem(
    PENDING_UPDATES_KEY,
    JSON.stringify(safeUpdates)
  );

  return safeUpdates;
}

/**
 * Adds one shelter update to the local pending queue.
 *
 * @param {Object} updateData - Data submitted by the offline form.
 * @returns {Array} The updated pending queue.
 */
export function addPendingUpdate(updateData) {
  if (!updateData?.shelterId) {
    throw new Error(
      "A shelter ID is required to save an offline update."
    );
  }

  if (!updateData?.status) {
    throw new Error(
      "A shelter status is required to save an offline update."
    );
  }

  const currentUpdates = getPendingUpdates();
  const editTime = new Date().toISOString();

  const newUpdate = {
    id: `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`,

    shelterId: updateData.shelterId,
    shelterName:
      updateData.shelterName ?? "Unknown shelter",

    status: updateData.status,
    note:
      typeof updateData.note === "string"
        ? updateData.note.trim()
        : "",

    // Time when the user actually made the edit.
    clientUpdatedAt: editTime,

    // Kept separately for display and compatibility.
    createdAt: editTime,

    syncStatus: "pending",
  };

  const updatedQueue = [
    newUpdate,
    ...currentUpdates,
  ];

  return savePendingUpdates(updatedQueue);
}

/**
 * Removes one pending update.
 *
 * This should be called only when:
 * 1. Cloud Code confirms successful synchronization, or
 * 2. the user intentionally deletes the update.
 *
 * @param {string} updateId - The local pending update ID.
 * @returns {Array} The remaining pending updates.
 */
export function removePendingUpdate(updateId) {
  if (!updateId) {
    return getPendingUpdates();
  }

  const updatedQueue = getPendingUpdates().filter(
    (update) => update.id !== updateId
  );

  return savePendingUpdates(updatedQueue);
}

/**
 * Replaces one pending update in the queue.
 *
 * This can be used later to mark an update as failed
 * or store an error message without deleting it.
 *
 * @param {string} updateId - The local pending update ID.
 * @param {Object} changes - Fields to update.
 * @returns {Array} The updated pending queue.
 */
export function updatePendingUpdate(
  updateId,
  changes
) {
  const updatedQueue = getPendingUpdates().map(
    (update) => {
      if (update.id !== updateId) {
        return update;
      }

      return {
        ...update,
        ...changes,
      };
    }
  );

  return savePendingUpdates(updatedQueue);
}

/**
 * Removes all pending shelter updates.
 *
 * Use this only for testing or when the user
 * intentionally clears the queue.
 *
 * @returns {Array} An empty queue.
 */
export function clearPendingUpdates() {
  localStorage.removeItem(PENDING_UPDATES_KEY);

  return [];
}