const ALLOWED_STATUSES =
  new Set([
    "OPEN",
    "LIMITED SPACE",
    "FULL",
    "CLOSED",
  ]);

/**
 * Creates a Parse validation error.
 */
function validationError(
  message
) {
  return new Parse.Error(
    Parse.Error.VALIDATION_ERROR,
    message
  );
}

/**
 * Converts a value into a valid JavaScript Date.
 */
function requireValidDate(
  value,
  fieldName
) {
  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    throw validationError(
      `${fieldName} must be a valid date.`
    );
  }

  return parsedDate;
}

/**
 * Finds the time when the current shelter information
 * was actually created or edited.
 */
function getCurrentShelterTimestamp(
  shelter
) {
  const clientUpdatedAt =
    shelter.get(
      "clientUpdatedAt"
    );

  const possibleTimestamp =
    clientUpdatedAt ??
    shelter.updatedAt ??
    shelter.createdAt ??
    new Date(0);

  const parsedTimestamp =
    new Date(
      possibleTimestamp
    );

  if (
    Number.isNaN(
      parsedTimestamp.getTime()
    )
  ) {
    return new Date(0);
  }

  return parsedTimestamp;
}

/**
 * Returns a plain object that can safely be returned
 * to the React application.
 */
function serializeShelter(
  shelter
) {
  const clientUpdatedAt =
    getCurrentShelterTimestamp(
      shelter
    );

  return {
    id: shelter.id,

    name:
      shelter.get("name") ??
      "",

    status:
      shelter.get("status") ??
      "",

    notes:
      shelter.get("notes") ??
      "",

    clientUpdatedAt:
      clientUpdatedAt.toISOString(),

    updatedAt:
      shelter.updatedAt
        ? shelter.updatedAt.toISOString()
        : null,
  };
}

/**
 * Builds a snapshot of the current Shelter record.
 */
function buildServerSnapshot(
  shelter
) {
  const timestamp =
    getCurrentShelterTimestamp(
      shelter
    );

  return {
    objectId: shelter.id,

    name:
      shelter.get("name") ??
      "",

    status:
      shelter.get("status") ??
      "",

    notes:
      shelter.get("notes") ??
      "",

    distanceMiles:
      shelter.get(
        "distanceMiles"
      ) ?? null,

    petsAllowed:
      shelter.get(
        "petsAllowed"
      ) ?? null,

    accessible:
      shelter.get(
        "accessible"
      ) ?? null,

    medicalOnSite:
      shelter.get(
        "medicalOnSite"
      ) ?? null,

    clientUpdatedAt:
      timestamp.toISOString(),

    serverUpdatedAt:
      shelter.updatedAt
        ? shelter.updatedAt.toISOString()
        : null,
  };
}

/**
 * Saves one older version in ShelterHistory.
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
  const ShelterHistory =
    Parse.Object.extend(
      "ShelterHistory"
    );

  const historyRecord =
    new ShelterHistory();

  historyRecord.set(
    "shelter",
    shelter
  );

  historyRecord.set(
    "snapshot",
    snapshot
  );

  historyRecord.set(
    "sourceTimestamp",
    sourceTimestamp
  );

  historyRecord.set(
    "replacedAt",
    new Date()
  );

  historyRecord.set(
    "reason",
    reason
  );

  historyRecord.set(
    "source",
    source
  );

  if (localId) {
    historyRecord.set(
      "localId",
      localId
    );
  }

  if (user) {
    historyRecord.set(
      "changedBy",
      user
    );
  }

  return historyRecord.save(
    null,
    {
      useMasterKey: true,
    }
  );
}

/**
 * Synchronizes one pending shelter update.
 *
 * Case 1:
 * The offline update is newer.
 * - Archive the old server version.
 * - Apply the offline version to Shelter.
 *
 * Case 2:
 * The server version is newer or equal.
 * - Keep the server version.
 * - Archive the offline version.
 */
Parse.Cloud.define(
  "syncShelterUpdate",
  async (request) => {
    const {
      localId,
      shelterId,
      status,
      note,
      clientUpdatedAt,
    } = request.params;

    /*
     * Validate shelterId.
     */
    if (
      typeof shelterId !==
        "string" ||
      shelterId.trim().length ===
        0
    ) {
      throw validationError(
        "A shelterId is required."
      );
    }

    /*
     * Validate status.
     */
    if (
      typeof status !==
        "string" ||
      !ALLOWED_STATUSES.has(
        status
      )
    ) {
      throw validationError(
        "The shelter status is not valid."
      );
    }

    /*
     * Validate and clean note.
     */
    const cleanNote =
      typeof note === "string"
        ? note.trim()
        : "";

    if (
      cleanNote.length > 500
    ) {
      throw validationError(
        "The shelter update note cannot exceed 500 characters."
      );
    }

    /*
     * Validate the time when the user made the edit.
     */
    const incomingTimestamp =
      requireValidDate(
        clientUpdatedAt,
        "clientUpdatedAt"
      );

    /*
     * Load the current Shelter record.
     */
    const Shelter =
      Parse.Object.extend(
        "Shelter"
      );

    const query =
      new Parse.Query(Shelter);

    const shelter =
      await query.get(
        shelterId.trim(),
        {
          useMasterKey: true,
        }
      );

    const serverTimestamp =
      getCurrentShelterTimestamp(
        shelter
      );

    const incomingVersionIsNewer =
      incomingTimestamp.getTime() >
      serverTimestamp.getTime();

    if (
      incomingVersionIsNewer
    ) {
      /*
       * Archive the older server version before
       * replacing it.
       */
      await createHistoryRecord(
        {
          shelter,

          snapshot:
            buildServerSnapshot(
              shelter
            ),

          sourceTimestamp:
            serverTimestamp,

          reason:
            "Replaced by newer offline update",

          source:
            "server",

          localId,

          user:
            request.user,
        }
      );

      /*
       * Apply the newer browser version.
       */
      shelter.set(
        "status",
        status
      );

      shelter.set(
        "notes",
        cleanNote
      );

      shelter.set(
        "clientUpdatedAt",
        incomingTimestamp
      );

      await shelter.save(
        null,
        {
          useMasterKey: true,
        }
      );

      return {
        success: true,

        localId,

        applied: true,

        action:
          "offline-update-applied",

        message:
          "The offline update was saved as the current shelter version.",

        shelter:
          serializeShelter(
            shelter
          ),
      };
    }

    /*
     * The server version is newer or equal.
     * Keep Shelter unchanged and archive the
     * incoming browser version.
     */
    await createHistoryRecord(
      {
        shelter,

        snapshot: {
          objectId:
            shelter.id,

          name:
            shelter.get(
              "name"
            ) ?? "",

          status,

          notes:
            cleanNote,

          clientUpdatedAt:
            incomingTimestamp.toISOString(),
        },

        sourceTimestamp:
          incomingTimestamp,

        reason:
          "Offline update was older than or equal to the current server version",

        source:
          "offline",

        localId,

        user:
          request.user,
      }
    );

    return {
      success: true,

      localId,

      applied: false,

      action:
        "server-version-kept",

      message:
        "The server already contained a newer or equal shelter version.",

      shelter:
        serializeShelter(
          shelter
        ),
    };
  }
);