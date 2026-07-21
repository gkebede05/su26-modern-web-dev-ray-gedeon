const PENDING_UPDATES_KEY = "shelterFinder.pendingUpdates";

/**
 * Reads all shelter updates waiting to be synchronized.
 */
export function getPendingUpdates() {
  const storedUpdates = localStorage.getItem(PENDING_UPDATES_KEY);

  if (!storedUpdates) {
    return [];
  }

  try {
    const parsedUpdates = JSON.parse(storedUpdates);

    return Array.isArray(parsedUpdates) ? parsedUpdates : [];
  } catch (error) {
    console.error("Unable to read pending shelter updates.", error);
    return [];
  }
}

/**
 * Adds one new shelter update to the local pending queue.
 */
export function addPendingUpdate(updateData) {
  const currentUpdates = getPendingUpdates();

  const newUpdate = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    shelterId: updateData.shelterId,
    shelterName: updateData.shelterName,
    status: updateData.status,
    note: updateData.note.trim(),
    createdAt: new Date().toISOString(),
    syncStatus: "pending",
  };

  const updatedQueue = [newUpdate, ...currentUpdates];

  localStorage.setItem(
    PENDING_UPDATES_KEY,
    JSON.stringify(updatedQueue)
  );

  return updatedQueue;
}

/**
 * Removes a pending update from the browser.
 */
export function removePendingUpdate(updateId) {
  const updatedQueue = getPendingUpdates().filter(
    (update) => update.id !== updateId
  );

  localStorage.setItem(
    PENDING_UPDATES_KEY,
    JSON.stringify(updatedQueue)
  );

  return updatedQueue;
}