import Parse from "./ParseClient.js";

/**
 * Converts a Parse date into a readable date.
 *
 * @param {Date|string|null} dateValue
 * @returns {string|null}
 */
function formatShelterDate(dateValue) {
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
 * Retrieves Shelter records from Back4App.
 *
 * Database queries remain in the service layer
 * instead of inside the React component.
 *
 * @returns {Promise<Array>}
 */
export async function getShelters() {
  const Shelter =
    Parse.Object.extend("Shelter");

  const query =
    new Parse.Query(Shelter);

  query.ascending("name");

  const results =
    await query.find();

  return results.map(
    (shelterObject) => {
      const clientUpdatedAt =
        shelterObject.get(
          "clientUpdatedAt"
        );

      return {
        id: shelterObject.id,

        name:
          shelterObject.get("name") ??
          "Unnamed shelter",

        status:
          shelterObject.get("status") ??
          "OPEN",

        notes:
          shelterObject.get("notes") ??
          "",

        distanceMiles:
          shelterObject.get(
            "distanceMiles"
          ),

        petsAllowed:
          shelterObject.get(
            "petsAllowed"
          ),

        accessible:
          shelterObject.get(
            "accessible"
          ),

        medicalOnSite:
          shelterObject.get(
            "medicalOnSite"
          ),

        clientUpdatedAt:
          clientUpdatedAt
            ? new Date(
                clientUpdatedAt
              ).toISOString()
            : null,

        updatedAt:
          formatShelterDate(
            shelterObject.updatedAt
          ),
      };
    }
  );
}

/**
 * Sends one locally queued update to the
 * syncShelterUpdate Parse Cloud Function.
 *
 * @param {Object} update
 * @returns {Promise<Object>}
 */
export async function syncShelterUpdate(
  update
) {
  if (!update?.id) {
    throw new Error(
      "The pending update does not have a local ID."
    );
  }

  if (!update?.shelterId) {
    throw new Error(
      "The pending update does not have a shelter ID."
    );
  }

  if (!update?.status) {
    throw new Error(
      "The pending update does not have a shelter status."
    );
  }

  const clientUpdatedAt =
    update.clientUpdatedAt ??
    update.createdAt;

  if (!clientUpdatedAt) {
    throw new Error(
      "The pending update does not have a client timestamp."
    );
  }

  const result =
    await Parse.Cloud.run(
      "syncShelterUpdate",
      {
        localId: update.id,
        shelterId:
          update.shelterId,
        status:
          update.status,
        note:
          update.note ?? "",
        clientUpdatedAt,
      }
    );

  if (!result?.success) {
    throw new Error(
      result?.message ??
        "Cloud Code did not confirm synchronization."
    );
  }

  return result;
}