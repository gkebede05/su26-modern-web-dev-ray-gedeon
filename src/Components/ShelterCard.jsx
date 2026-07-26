import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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

export default function ShelterCard({
  shelter,
  isFavourite = false,
  onViewDetails,
  onToggleFavourite,
}) {
  const statusLabel =
    shelter?.status || "STATUS UNKNOWN";

  return (
    <Card
      component="article"
      variant="outlined"
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
            }}
          >
            <Typography
              variant="h5"
              component="h3"
              sx={{
                fontSize: {
                  xs: "1.25rem",
                  sm: "1.5rem",
                },
                fontWeight: 700,
                overflowWrap: "anywhere",
              }}
            >
              {shelter?.name || "Unnamed Shelter"}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                flexWrap: "wrap",
              }}
            >
              <Chip
                label={statusLabel}
                color={getStatusColor(statusLabel)}
                size="small"
                aria-label={`Shelter status: ${statusLabel}`}
              />

              {shelter?.pendingSync && (
                <Chip
                  label="Pending sync"
                  color="warning"
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Stack>

          <Typography color="text.secondary">
            {shelter?.distanceMiles != null
              ? `${shelter.distanceMiles} miles away`
              : "Distance is not available"}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              flexWrap: "wrap",
            }}
          >
            {shelter?.petsAllowed && (
              <Chip
                label="Pets allowed"
                variant="outlined"
                size="small"
              />
            )}

            {shelter?.accessible && (
              <Chip
                label="Wheelchair accessible"
                variant="outlined"
                size="small"
              />
            )}

            {shelter?.medicalOnSite && (
              <Chip
                label="Medical staff"
                variant="outlined"
                size="small"
              />
            )}
          </Stack>

          {shelter?.notes && (
            <Typography
              sx={{
                overflowWrap: "anywhere",
              }}
            >
              {shelter.notes}
            </Typography>
          )}

          {shelter?.updatedAt && (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Updated {shelter.updatedAt}
            </Typography>
          )}
        </Stack>
      </CardContent>

      <CardActions
        sx={{
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: "stretch",
          gap: 1,
          px: {
            xs: 2,
            sm: 3,
          },
          pb: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Button
          type="button"
          variant="contained"
          startIcon={<InfoOutlinedIcon />}
          onClick={() =>
            onViewDetails?.(shelter)
          }
          aria-label={`View details for ${
            shelter?.name || "this shelter"
          }`}
          fullWidth
        >
          View Details
        </Button>

        <Button
          type="button"
          variant="outlined"
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
                  shelter?.name || "this shelter"
                } from favourites`
              : `Add ${
                  shelter?.name || "this shelter"
                } to favourites`
          }
          fullWidth
        >
          {isFavourite
            ? "Remove Favourite"
            : "Add Favourite"}
        </Button>
      </CardActions>
    </Card>
  );
}