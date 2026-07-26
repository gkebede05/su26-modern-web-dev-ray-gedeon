import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

function getStatusColor(status) {
  const normalizedStatus =
    typeof status === "string"
      ? status.toUpperCase()
      : "";

  if (normalizedStatus === "OPEN") {
    return "success";
  }

  if (normalizedStatus === "LIMITED SPACE") {
    return "warning";
  }

  if (
    normalizedStatus === "FULL" ||
    normalizedStatus === "CLOSED"
  ) {
    return "error";
  }

  return "default";
}

export default function ShelterDetails({
  shelter,
  open,
  onClose,
  isFavourite = false,
  onToggleFavourite,
}) {
  if (!shelter) {
    return null;
  }

  const statusLabel =
    shelter.status || "STATUS UNKNOWN";

  const hasServices =
    shelter.petsAllowed ||
    shelter.accessible ||
    shelter.medicalOnSite;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="shelter-details-title"
      aria-describedby="shelter-details-description"
      PaperProps={{
        sx: {
          width: {
            xs: "calc(100% - 24px)",
            sm: "100%",
          },
          m: {
            xs: 1.5,
            sm: 4,
          },
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        id="shelter-details-title"
        sx={{
          pr: 7,
          fontWeight: 700,
        }}
      >
        {shelter.name || "Unnamed Shelter"}
      </DialogTitle>

      <IconButton
        type="button"
        onClick={onClose}
        aria-label="Close shelter details"
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            sx={{
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
            }}
          >
            <Chip
              label={statusLabel}
              color={getStatusColor(statusLabel)}
              aria-label={`Shelter status: ${statusLabel}`}
            />

            {shelter.pendingSync && (
              <Chip
                label="Pending synchronization"
                color="warning"
                variant="outlined"
              />
            )}
          </Stack>

          <Box>
            <Typography
              variant="overline"
              component="p"
              color="text.secondary"
            >
              Distance
            </Typography>

            <Typography variant="body1">
              {shelter.distanceMiles != null
                ? `${shelter.distanceMiles} miles away`
                : "Distance is not available"}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
            >
              Available services
            </Typography>

            {hasServices ? (
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{
                  flexWrap: "wrap",
                }}
              >
                {shelter.petsAllowed && (
                  <Chip
                    label="Pets allowed"
                    variant="outlined"
                  />
                )}

                {shelter.accessible && (
                  <Chip
                    label="Wheelchair accessible"
                    variant="outlined"
                  />
                )}

                {shelter.medicalOnSite && (
                  <Chip
                    label="Medical staff on site"
                    variant="outlined"
                  />
                )}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No additional services are listed.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box id="shelter-details-description">
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
            >
              Latest shelter note
            </Typography>

            <Typography
              sx={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {shelter.notes ||
                "No shelter note is available."}
            </Typography>
          </Box>

          {shelter.updatedAt && (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Last updated {shelter.updatedAt}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: "stretch",
          gap: 1,
          px: 3,
          py: 2,
        }}
      >
        <Button
          type="button"
          variant={
            isFavourite
              ? "outlined"
              : "contained"
          }
          color={
            isFavourite
              ? "error"
              : "primary"
          }
          startIcon={
            isFavourite ? (
              <FavoriteIcon />
            ) : (
              <FavoriteBorderIcon />
            )
          }
          onClick={() =>
            onToggleFavourite?.(shelter)
          }
          aria-pressed={isFavourite}
          aria-label={
            isFavourite
              ? `Remove ${
                  shelter.name || "this shelter"
                } from favourites`
              : `Add ${
                  shelter.name || "this shelter"
                } to favourites`
          }
          fullWidth
        >
          {isFavourite
            ? "Remove from Favourites"
            : "Add to Favourites"}
        </Button>

        <Button
          type="button"
          variant="text"
          onClick={onClose}
          fullWidth
        >
          Return to Shelter List
        </Button>
      </DialogActions>
    </Dialog>
  );
}