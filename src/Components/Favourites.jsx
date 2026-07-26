import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
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

export default function Favourites({
  favourites = [],
  onViewDetails,
  onRemoveFavourite,
}) {
  return (
    <Box
      component="section"
      aria-labelledby="favourites-title"
      sx={{
        width: "100%",
        py: {
          xs: 2,
          sm: 3,
        },
      }}
    >
      <Typography
        id="favourites-title"
        variant="h4"
        component="h2"
        sx={{
          mb: 1,
          fontSize: {
            xs: "1.6rem",
            sm: "2rem",
          },
          fontWeight: 700,
        }}
      >
        Favourite Shelters
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mb: 3,
        }}
      >
        Shelters saved here remain easy to find while you review
        available options.
      </Typography>

      {favourites.length === 0 ? (
        <Alert severity="info">
          You have not added any favourite shelters yet. Open a
          shelter’s details and select “Add to Favourites.”
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {favourites.map((shelter) => {
            const statusLabel =
              shelter?.status || "STATUS UNKNOWN";

            return (
              <Card
                key={shelter.id}
                component="article"
                variant="outlined"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minWidth: 0,
                  borderRadius: 3,
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
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
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {shelter?.name || "Unnamed Shelter"}
                      </Typography>

                      <Chip
                        label={statusLabel}
                        color={getStatusColor(statusLabel)}
                        size="small"
                        aria-label={`Shelter status: ${statusLabel}`}
                      />
                    </Stack>

                    <Typography color="text.secondary">
                      {shelter?.distanceMiles != null
                        ? `${shelter.distanceMiles} miles away`
                        : "Distance is not available"}
                    </Typography>

                    {shelter?.pendingSync && (
                      <Chip
                        label="Pending synchronization"
                        color="warning"
                        variant="outlined"
                        size="small"
                        sx={{
                          alignSelf: "flex-start",
                        }}
                      />
                    )}

                    {shelter?.notes ? (
                      <Typography
                        sx={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 3,
                          overflow: "hidden",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {shelter.notes}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">
                        No shelter note is available.
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
                    color="error"
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={() =>
                      onRemoveFavourite?.(shelter.id)
                    }
                    aria-label={`Remove ${
                      shelter?.name || "this shelter"
                    } from favourites`}
                    fullWidth
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}