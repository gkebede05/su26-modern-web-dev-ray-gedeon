import Parse from "./ParseClient.js";

/**
 * Converts a Parse date into the format used by ShelterCard.
 */
function formatShelterDate(dateValue) {
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

/**
 * Retrieves Shelter records from Back4App.
 *
 * Parse queries stay in the service layer rather than
 * inside a React component.
 */
export async function getShelters() {
  const Shelter = Parse.Object.extend("Shelter");
  const query = new Parse.Query(Shelter);

  const results = await query.find();

  return results.map((shelterObject) => ({
    id: shelterObject.id,
    name: shelterObject.get("name"),
    status: shelterObject.get("status"),
    notes: shelterObject.get("notes") || "",
    distanceMiles:
      shelterObject.get("distanceMiles"),
    petsAllowed:
      shelterObject.get("petsAllowed"),
    accessible:
      shelterObject.get("accessible"),
    medicalOnSite:
      shelterObject.get("medicalOnSite"),
    updatedAt: formatShelterDate(
      shelterObject.updatedAt
    ),
  }));
}

/**
 * Sends one locally queued update to the
 * syncShelterUpdate Cloud Function.
 */
export async function syncShelterUpdate(update) {
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

  return Parse.Cloud.run(
    "syncShelterUpdate",
    {
      localId: update.id,
      shelterId: update.shelterId,
      status: update.status,
      note: update.note || "",
      clientUpdatedAt: update.createdAt,
    }
  );
}