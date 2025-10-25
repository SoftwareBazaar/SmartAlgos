import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
} from "react";

import apiClient from "../lib/apiClient";

const UtilitiesContext = createContext();

const utilitiesReducer = (state, action) => {
  switch (action.type) {
    case "SET_UTILITIES":
      return action.payload;

    case "ADD_UTILITY":
      return [...state, action.payload];

    case "UPDATE_UTILITY":
      return state.map((utility) =>
        utility.id === action.payload.id ? action.payload : utility,
      );

    case "DELETE_UTILITY":
      return state.filter((utility) => utility.id !== action.payload);

    default:
      return state;
  }
};

const sanitizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value

    .map((item) => (typeof item === "string" ? item.trim() : ""))

    .filter((item) => item);
};

const normalizeGuide = (guide) => {
  if (!guide || typeof guide !== "object") {
    return { title: "", steps: [] };
  }

  return {
    title: typeof guide.title === "string" ? guide.title : "",

    steps: sanitizeStringArray(guide.steps),
  };
};

const transformUtilityFromApi = (utility) => {
  if (!utility) {
    return null;
  }

  const {
    download_url,

    image_timestamp,

    created_at,

    updated_at,

    is_active,

    guide,

    features,

    previews,

    ...rest
  } = utility;

  const {
    downloadUrl: camelDownloadUrl,

    imageTimestamp: camelImageTimestamp,

    createdAt: camelCreatedAt,

    updatedAt: camelUpdatedAt,

    isActive: camelIsActive,

    guide: camelGuide,

    features: camelFeatures,

    previews: camelPreviews,

    ...remaining
  } = rest;

  const resolvedFeatures = Array.isArray(features) ? features : camelFeatures;

  const resolvedPreviews = Array.isArray(previews) ? previews : camelPreviews;

  const resolvedGuide = guide ?? camelGuide;

  return {
    ...remaining,

    downloadUrl: download_url ?? camelDownloadUrl ?? "",

    imageTimestamp: image_timestamp ?? camelImageTimestamp ?? null,

    createdAt: created_at ?? camelCreatedAt ?? null,

    updatedAt: updated_at ?? camelUpdatedAt ?? null,

    isActive:
      typeof is_active === "boolean"
        ? is_active
        : typeof camelIsActive === "boolean"
          ? camelIsActive
          : true,

    features: sanitizeStringArray(resolvedFeatures),

    previews: sanitizeStringArray(resolvedPreviews),

    guide: normalizeGuide(resolvedGuide),

    downloads:
      typeof utility.downloads === "number"
        ? utility.downloads
        : typeof remaining.downloads === "number"
          ? remaining.downloads
          : 0,
  };
};

const transformUtilitiesFromApi = (utilities) => {
  if (!Array.isArray(utilities)) {
    return [];
  }

  return utilities.map(transformUtilityFromApi).filter((utility) => utility);
};

const prepareUtilityPayload = (utility) => {
  if (!utility) {
    return {};
  }

  const sanitizeOptionalString = (value) => {
    if (typeof value !== "string") {
      return value ?? null;
    }

    const trimmed = value.trim();

    return trimmed.length ? trimmed : null;
  };

  const sanitizeRequiredString = (value) => {
    if (typeof value !== "string") {
      return typeof value === "number" ? String(value) : "";
    }

    return value.trim();
  };

  const payload = {
    name: sanitizeRequiredString(utility.name),
    description: sanitizeRequiredString(utility.description),
    category: sanitizeRequiredString(utility.category),
    features: sanitizeStringArray(utility.features),
    download_url: sanitizeOptionalString(
      utility.downloadUrl ?? utility.download_url,
    ),
    version: sanitizeRequiredString(utility.version),
    size: sanitizeOptionalString(utility.size),
    image: utility.image ?? null,
    image_timestamp: utility.imageTimestamp ?? utility.image_timestamp ?? null,
    previews: sanitizeStringArray(utility.previews),
    guide: normalizeGuide(utility.guide),
  };

  const isActive = utility.isActive ?? utility.is_active;

  if (typeof isActive === "boolean") {
    payload.is_active = isActive;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => value !== undefined),
  );
};

const isNetworkError = (error) =>
  error?.message === "Network Error" || error?.code === "ERR_NETWORK";

const generateTempId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `temp-${crypto.randomUUID()}`;
  }

  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const persistUtilitiesToStorage = (items) => {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem("smart-algos-utilities", JSON.stringify(items));
  } catch (storageError) {
    console.error("Error persisting utilities to localStorage:", storageError);
  }
};

const createFallbackUtilityRecord = (
  existingUtility,
  utilityId,
  utilityData,
) => {
  const payload = prepareUtilityPayload(utilityData);

  const base = existingUtility ? { ...existingUtility } : {};
  const nowIso = new Date().toISOString();

  const simulatedApiPayload = {
    id: utilityId ?? base.id ?? generateTempId(),
    name: payload.name ?? base.name ?? "",
    description: payload.description ?? base.description ?? "",
    category: payload.category ?? base.category ?? "",
    features: payload.features ?? base.features ?? [],
    download_url:
      payload.download_url ?? base.downloadUrl ?? base.download_url ?? "",
    version: payload.version ?? base.version ?? "",
    size: payload.size ?? base.size ?? "",
    image: payload.image ?? base.image ?? null,
    image_timestamp:
      payload.image_timestamp ??
      base.imageTimestamp ??
      base.image_timestamp ??
      Date.now(),
    previews: payload.previews ?? base.previews ?? [],
    guide: payload.guide ?? base.guide ?? { title: "", steps: [] },
    is_active:
      typeof payload.is_active === "boolean"
        ? payload.is_active
        : (base.isActive ?? base.is_active ?? true),
    downloads: typeof base.downloads === "number" ? base.downloads : 0,
    created_at: base.createdAt ?? base.created_at ?? nowIso,
    updated_at: nowIso,
  };

  return transformUtilityFromApi(simulatedApiPayload);
};

export const UtilitiesProvider = ({ children }) => {
  const [utilities, dispatch] = useReducer(utilitiesReducer, []);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const syncIntervalRef = useRef(null);

  // Fetch utilities from API

  const fetchUtilities = async () => {
    try {
      setLoading(true);

      setError(null);

      const response = await apiClient.get("/api/utilities", {
        validateStatus: (status) => status < 500,
      });

      if (response.data && response.data.success) {
        const normalizedUtilities = transformUtilitiesFromApi(
          response.data.data,
        );

        dispatch({ type: "SET_UTILITIES", payload: normalizedUtilities });

        console.log("Utilities loaded from API:", normalizedUtilities.length);
      } else if (response.status === 401) {
        console.log("Authentication issue, retrying without auth...");

        const publicResponse = await fetch(
          "http://localhost:5000/api/utilities",
        );

        const data = await publicResponse.json();

        if (data.success) {
          const normalizedUtilities = transformUtilitiesFromApi(data.data);

          dispatch({ type: "SET_UTILITIES", payload: normalizedUtilities });

          console.log(
            "Utilities loaded via fetch:",

            normalizedUtilities.length,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching utilities:", error);

      const message = isNetworkError(error)
        ? "Unable to reach utilities API. Showing cached utilities."
        : error.message;

      setError(message);

      try {
        const savedUtilities = localStorage.getItem("smart-algos-utilities");

        if (savedUtilities) {
          const parsedUtilities = transformUtilitiesFromApi(
            JSON.parse(savedUtilities),
          );

          dispatch({ type: "SET_UTILITIES", payload: parsedUtilities });

          console.log(
            "Loaded utilities from localStorage (offline mode):",

            parsedUtilities.length,
          );
        }
      } catch (localError) {
        console.error("Error loading utilities from localStorage:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load utilities on mount

  useEffect(() => {
    fetchUtilities();

    // Set up polling for real-time sync (every 2 minutes)
    // Utilities don't change frequently, so reduce polling to save server resources
    syncIntervalRef.current = setInterval(() => {
      fetchUtilities();
    }, 120000); // 2 minutes

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Save to localStorage as backup (for offline access)

  useEffect(() => {
    persistUtilitiesToStorage(utilities);
  }, [utilities]);

  // Listen for localStorage changes from other tabs/windows

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "smart-algos-utilities" && e.newValue) {
        try {
          const parsedUtilities = transformUtilitiesFromApi(
            JSON.parse(e.newValue),
          );

          dispatch({ type: "SET_UTILITIES", payload: parsedUtilities });
        } catch (error) {
          console.error("Error parsing utilities from storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const addUtility = async (utilityData) => {
    try {
      console.log("Adding new utility:", utilityData);

      // Check if there's an uploaded file
      if (utilityData.uploadedFile) {
        console.log("📤 Uploading file with utility:", utilityData.uploadedFile.name);
        
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add the file
        formData.append('uploadedFile', utilityData.uploadedFile);
        
        // Add other utility data
        const payload = prepareUtilityPayload(utilityData);
        Object.keys(payload).forEach(key => {
          if (key !== 'uploadedFile') {
            if (Array.isArray(payload[key])) {
              payload[key].forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
              });
            } else if (typeof payload[key] === 'object' && payload[key] !== null) {
              formData.append(key, JSON.stringify(payload[key]));
            } else {
              formData.append(key, payload[key]);
            }
          }
        });
        
        // Add previews if they exist
        if (utilityData.previews && utilityData.previews.length > 0) {
          utilityData.previews.forEach((preview, index) => {
            formData.append(`previews[${index}]`, preview);
          });
        }
        
        const response = await apiClient.post("/api/utilities", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data?.success) {
          const normalizedUtility = transformUtilityFromApi(response.data.data);
          
          if (normalizedUtility) {
            dispatch({ type: "ADD_UTILITY", payload: normalizedUtility });
            console.log("Utility added successfully with file:", normalizedUtility);
          }
          
          await fetchUtilities();
          setError(null);
          return normalizedUtility;
        }
        
        throw new Error(response.data?.message || "Failed to add utility");
      } else {
        // No file upload, use regular payload
        const payload = prepareUtilityPayload(utilityData);
        const response = await apiClient.post("/api/utilities", payload);

        if (response.data?.success) {
          const normalizedUtility = transformUtilityFromApi(response.data.data);

          if (normalizedUtility) {
            dispatch({ type: "ADD_UTILITY", payload: normalizedUtility });

            console.log("Utility added successfully:", normalizedUtility);
          }

          await fetchUtilities();

          setError(null);

          return normalizedUtility;
        }

        throw new Error(response.data?.message || "Failed to add utility");
      }
    } catch (error) {
      console.error("Error adding utility:", error);

      setError(error.message);

      if (isNetworkError(error)) {
        const offlineMessage =
          "Utilities API is unreachable. Changes were saved locally and will sync once the API is available.";

        const fallbackUtility = createFallbackUtilityRecord(
          null,

          generateTempId(),

          utilityData,
        );

        const nextUtilities = [...utilities, fallbackUtility];

        dispatch({ type: "SET_UTILITIES", payload: nextUtilities });

        persistUtilitiesToStorage(nextUtilities);

        setError(offlineMessage);

        console.warn(
          "Utilities API unreachable. Stored utility locally; it will sync when the API is available.",
        );

        return fallbackUtility;
      }

      throw error;
    }
  };

  const updateUtility = async (utilityId, utilityData) => {
    try {
      console.log("UtilitiesContext - Updating utility:", utilityId);

      console.log("New utility data:", utilityData);

      console.log("Image timestamp:", utilityData.imageTimestamp);

      // Check if there's an uploaded file
      if (utilityData.uploadedFile) {
        console.log("📤 Updating utility with new file:", utilityData.uploadedFile.name);
        
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add the file
        formData.append('uploadedFile', utilityData.uploadedFile);
        
        // Add other utility data
        const payload = prepareUtilityPayload(utilityData);
        Object.keys(payload).forEach(key => {
          if (key !== 'uploadedFile') {
            if (Array.isArray(payload[key])) {
              payload[key].forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
              });
            } else if (typeof payload[key] === 'object' && payload[key] !== null) {
              formData.append(key, JSON.stringify(payload[key]));
            } else {
              formData.append(key, payload[key]);
            }
          }
        });
        
        // Add previews if they exist
        if (utilityData.previews && utilityData.previews.length > 0) {
          utilityData.previews.forEach((preview, index) => {
            formData.append(`previews[${index}]`, preview);
          });
        }
        
        const response = await apiClient.put(`/api/utilities/${utilityId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data?.success) {
          const normalizedUtility = transformUtilityFromApi(response.data.data);
          
          if (normalizedUtility) {
            dispatch({ type: "UPDATE_UTILITY", payload: normalizedUtility });
            console.log("Utility updated successfully with file:", normalizedUtility);
          }
          
          await fetchUtilities();
          setError(null);
          return normalizedUtility;
        }
        
        throw new Error(response.data?.message || "Failed to update utility");
      } else {
        // No file upload, use regular payload
        const payload = prepareUtilityPayload(utilityData);

        const response = await apiClient.put(
          `/api/utilities/${utilityId}`,
          payload,
        );

        if (response.data?.success) {
          const normalizedUtility = transformUtilityFromApi(response.data.data);

          if (normalizedUtility) {
            dispatch({ type: "UPDATE_UTILITY", payload: normalizedUtility });

            console.log("Utility updated successfully:", normalizedUtility);
          }

          await fetchUtilities();

          setError(null);

          return normalizedUtility;
        }

        throw new Error(response.data?.message || "Failed to update utility");
      }
    } catch (error) {
      console.error("Error updating utility:", error);

      setError(error.message);

      if (isNetworkError(error)) {
        const offlineMessage =
          "Utilities API is unreachable. Changes were saved locally and will sync once the API is available.";

        const existingUtility = utilities.find(
          (utility) => utility.id === utilityId,
        );

        const fallbackUtility = createFallbackUtilityRecord(
          existingUtility,

          utilityId,

          utilityData,
        );

        const nextUtilities = utilities.map((utility) =>
          utility.id === utilityId ? fallbackUtility : utility,
        );

        dispatch({ type: "SET_UTILITIES", payload: nextUtilities });

        persistUtilitiesToStorage(nextUtilities);

        setError(offlineMessage);

        console.warn(
          "Utilities API unreachable. Applied update locally; it will sync when the API is available.",
        );

        return fallbackUtility;
      }

      throw error;
    }
  };

  const deleteUtility = async (utilityId) => {
    try {
      console.log("Deleting utility:", utilityId);

      const response = await apiClient.delete(`/api/utilities/${utilityId}`);

      if (response.data.success) {
        dispatch({ type: "DELETE_UTILITY", payload: utilityId });

        console.log("Utility deleted successfully");

        await fetchUtilities();

        setError(null);
      }
    } catch (error) {
      console.error("Error deleting utility:", error);

      setError(error.message);

      if (isNetworkError(error)) {
        const offlineMessage =
          "Utilities API is unreachable. Changes were saved locally and will sync once the API is available.";

        const nextUtilities = utilities.filter(
          (utility) => utility.id !== utilityId,
        );

        dispatch({ type: "SET_UTILITIES", payload: nextUtilities });

        persistUtilitiesToStorage(nextUtilities);

        setError(offlineMessage);

        console.warn(
          "Utilities API unreachable. Removed utility locally; it will sync when the API is available.",
        );

        return true;
      }

      throw error;
    }
  };

  const refreshUtilities = async () => {
    await fetchUtilities();
  };

  const value = {
    utilities,

    loading,

    error,

    addUtility,

    updateUtility,

    deleteUtility,

    refreshUtilities,
  };

  return (
    <UtilitiesContext.Provider value={value}>
      {children}
    </UtilitiesContext.Provider>
  );
};

export const useUtilities = () => {
  const context = useContext(UtilitiesContext);

  if (!context) {
    throw new Error("useUtilities must be used within a UtilitiesProvider");
  }

  return context;
};
