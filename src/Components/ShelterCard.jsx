import React from "react";

// Maps a shelter's status to the visual language used across the app.
// Kept in one place so the meaning of each color stays consistent.
const STATUS_STYLES = {
  open: { label: "OPEN", color: "var(--status-open)" },
  limited: { label: "LIMITED SPACE", color: "var(--status-limited)" },
  full: { label: "FULL", color: "var(--status-full)" },
  unknown: { label: "STATUS UNKNOWN", color: "var(--status-unknown)" },
};

export default function ShelterCard({ shelter }) {
  const status = STATUS_STYLES[shelter.status] || STATUS_STYLES.unknown;

  return (
    <article className="shelter-card" style={{ "--accent": status.color }}>
      <div className="shelter-card__bar" />
      <div className="shelter-card__body">
        <div className="shelter-card__top">
          <h3 className="shelter-card__name">{shelter.name}</h3>
          <span className="shelter-card__status">{status.label}</span>
        </div>

        <div className="shelter-card__meta">
          <span className="shelter-card__distance">
            {shelter.distanceMiles != null ? `${shelter.distanceMiles} mi away` : "Distance unknown"}
          </span>
          {shelter.updatedAt && (
            <span className="shelter-card__updated">Updated {shelter.updatedAt}</span>
          )}
        </div>

        <div className="shelter-card__tags">
          {shelter.petsAllowed && <span className="tag">Pets OK</span>}
          {shelter.accessible && <span className="tag">Wheelchair accessible</span>}
          {shelter.medicalOnSite && <span className="tag">Medical staff on site</span>}
        </div>
      </div>
    </article>
  );
}