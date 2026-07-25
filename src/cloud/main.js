const ALLOWED_STATUSES = new Set([
  "OPEN",
  "LIMITED SPACE",
  "FULL",
  "CLOSED",
]);

/**
 * Converts a value into a valid JavaScript Date.
 */
function requireValidDate(value, fieldName) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return parsedDate;
}

/**
 * Finds the time when the current shelter information
 * was actually created or changed.
 */
function getCurrentShelterTimestamp(shelter) {
  const clientUpdatedAt = shelter.get("clientUpdatedAt");

  const possibleTimestamp =
    clientUpdatedAt ||
    shelter.updatedAt ||
    shelter.createdAt ||
    new Date(0);

  const parsedTimestamp = new Date(possibleTimestamp);

  if (Number.isNaN(parsedTimestamp.getTime())) {
    return new Date(0);
  }

  return parsedTimestamp;
}

/**
 * Returns shelter information in a simple object
 * that can be sent safely to the React application.
 */
function serializeShelter(shelter) {
  const clientUpdatedAt = getCurrentShelterTimestamp(shelter);

  return {
    id: shelter.id,
    name: shelter.get("name") || "",
    status: shelter.get("status") || "",
    notes: shelter.get("notes") || "",
    clientUpdatedAt: clientUpdatedAt.toISOString(),
    updatedAt: shelter.updatedAt
      ? shelter.updatedAt.toISOString()
      : null,
  };
}

/**
 * Saves one older shelter version in ShelterHistory.
 */
async function createHistoryRecord({
  shelter,
  snapshot,
  sourceTimestamp,
  reason,
  source,
  localId,
  user,
}) {
  const ShelterHistory = Parse.Object.extend("ShelterHistory");
  const historyRecord = new ShelterHistory();

  historyRecord.set("shelter", shelter);
  historyRecord.set("snapshot", snapshot);
  historyRecord.set("sourceTimestamp", sourceTimestamp);
  historyRecord.set("replacedAt", new Date());
  historyRecord.set("reason", reason);
  historyRecord.set("source", source);

  if (localId) {
    historyRecord.set("localId", localId);
  }

  if (user) {
    historyRecord.set("changedBy", user);
  }

  return historyRecord.save(null, {
    useMasterKey: true,
  });
}

/**
 * Receives one pending browser update.
 *
 * If the browser version is newer:
 *   - archives the current server version;
 *   - applies the browser version to Shelter.
 *
 * If the server version is newer or equal:
 *   - keeps the server version;
 *   - archives the older browser version.
 */
Parse.Cloud.define("syncShelterUpdate", async (request) => {
  const {
    localId,
    shelterId,
    status,
    note,
    clientUpdatedAt,
  } = request.params;

  // Validate the request.
  if (
    typeof shelterId !== "string" ||
    shelterId.trim().length === 0
  ) {
    throw new Error("A shelterId is required.");
  }

  if (
    typeof status !== "string" ||
    !ALLOWED_STATUSES.has(status)
  ) {
    throw new Error("The shelter status is not valid.");
  }

  const cleanNote =
    typeof note === "string" ? note.trim() : "";

  if (cleanNote.length > 500) {
    throw new Error(
      "The shelter update note cannot exceed 500 characters."
    );
  }

  const incomingTimestamp = requireValidDate(
    clientUpdatedAt,
    "clientUpdatedAt"
  );

  // Load the current Shelter record.
  const Shelter = Parse.Object.extend("Shelter");
  const query = new Parse.Query(Shelter);

  const shelter = await query.get(shelterId, {
    useMasterKey: true,
  });

  const serverTimestamp =
    getCurrentShelterTimestamp(shelter);

  const incomingVersionIsNewer =
    incomingTimestamp.getTime() >
    serverTimestamp.getTime();

  if (incomingVersionIsNewer) {
    // Archive the older server version.
    await createHistoryRecord({
      shelter,
      snapshot: {
        name: shelter.get("name") || "",
        status: shelter.get("status") || "",
        notes: shelter.get("notes") || "",
        clientUpdatedAt: serverTimestamp.toISOString(),
      },
      sourceTimestamp: serverTimestamp,
      reason: "Replaced by newer offline update",
      source: "server",
      localId,
      user: request.user,
    });

    // Apply the newer offline update.
    shelter.set("status", status);
    shelter.set("notes", cleanNote);
    shelter.set(
      "clientUpdatedAt",
      incomingTimestamp
    );

    await shelter.save(null, {
      useMasterKey: true,
    });

    return {
      localId,
      applied: true,
      action: "offline-update-applied",
      message:
        "The offline update was saved as the current shelter version.",
      shelter: serializeShelter(shelter),
    };
  }

  // The server version is newer or has the same timestamp.
  // Preserve the offline version as history.
  await createHistoryRecord({
    shelter,
    snapshot: {
      name: shelter.get("name") || "",
      status,
      notes: cleanNote,
      clientUpdatedAt:
        incomingTimestamp.toISOString(),
    },
    sourceTimestamp: incomingTimestamp,
    reason:
      "Offline update was older than the current server version",
    source: "offline",
    localId,
    user: request.user,
  });

  return {
    localId,
    applied: false,
    action: "server-version-kept",
    message:
      "The server already contained a newer shelter version.",
    shelter: serializeShelter(shelter),
  };
});