import { useState } from "react";
import useOnlineStatus from "../Hooks/useOnlineStatus.js";

const STATUS_OPTIONS = [
  "OPEN",
  "LIMITED SPACE",
  "FULL",
  "CLOSED",
];

export default function OfflineUpdateForm({
  shelters,
  pendingUpdates,
  onSave,
  onDelete,
}) {
  const isOnline = useOnlineStatus();

  const [shelterId, setShelterId] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const selectedShelter = shelters.find(
      (shelter) => shelter.id === shelterId
    );

    if (!selectedShelter) {
      setFeedback("Please select a shelter.");
      return;
    }

    if (!status) {
      setFeedback("Please select a shelter status.");
      return;
    }

    onSave({
      shelterId: selectedShelter.id,
      shelterName: selectedShelter.name,
      status,
      note,
    });

    setFeedback(
      `Update for ${selectedShelter.name} was saved locally.`
    );

    setStatus("");
    setNote("");
  }

  return (
    <section
      className="offline-update-panel"
      aria-labelledby="offline-update-title"
    >
      <div className="offline-update-heading">
        <div>
          <h2 id="offline-update-title">
            Add Shelter Update
          </h2>

          <p>
            {isOnline
              ? "Updates entered here are saved in the local pending queue."
              : "You are offline. This update will be stored in this browser."}
          </p>
        </div>

        <span
          className={
            isOnline
              ? "connection-chip connection-chip--online"
              : "connection-chip connection-chip--offline"
          }
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      <form
        className="offline-update-form"
        onSubmit={handleSubmit}
      >
        <div className="offline-form-field">
          <label htmlFor="update-shelter">
            Shelter
          </label>

          <select
            id="update-shelter"
            value={shelterId}
            onChange={(event) => {
              setShelterId(event.target.value);
              setFeedback("");
            }}
            disabled={shelters.length === 0}
          >
            <option value="">
              Select a shelter
            </option>

            {shelters.map((shelter) => (
              <option
                key={shelter.id}
                value={shelter.id}
              >
                {shelter.name}
              </option>
            ))}
          </select>
        </div>

        <div className="offline-form-field">
          <label htmlFor="update-status">
            New status
          </label>

          <select
            id="update-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setFeedback("");
            }}
          >
            <option value="">
              Select a status
            </option>

            {STATUS_OPTIONS.map((statusOption) => (
              <option
                key={statusOption}
                value={statusOption}
              >
                {statusOption}
              </option>
            ))}
          </select>
        </div>

        <div className="offline-form-field offline-form-field--wide">
          <label htmlFor="update-note">
            Update note
          </label>

          <textarea
            id="update-note"
            rows="3"
            placeholder="Example: Twenty additional beds are now available."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="offline-form-actions">
          <button
            type="submit"
            disabled={shelters.length === 0}
          >
            Save Offline Update
          </button>
        </div>
      </form>

      {feedback && (
        <p
          className="offline-update-feedback"
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}

      <div className="pending-updates">
        <h3>
          Pending Updates ({pendingUpdates.length})
        </h3>

        {pendingUpdates.length === 0 ? (
          <p className="pending-empty">
            No updates are waiting to be synchronized.
          </p>
        ) : (
          <ul className="pending-update-list">
            {pendingUpdates.map((update) => (
              <li
                className="pending-update-item"
                key={update.id}
              >
                <div className="pending-update-content">
                  <div className="pending-update-title">
                    <strong>{update.shelterName}</strong>

                    <span className="pending-badge">
                      Pending synchronization
                    </span>
                  </div>

                  <p>
                    New status:{" "}
                    <strong>{update.status}</strong>
                  </p>

                  {update.note && (
                    <p>Note: {update.note}</p>
                  )}

                  <p className="pending-update-time">
                    Saved{" "}
                    {new Date(
                      update.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  className="pending-delete-button"
                  onClick={() => onDelete(update.id)}
                  aria-label={`Delete pending update for ${update.shelterName}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}