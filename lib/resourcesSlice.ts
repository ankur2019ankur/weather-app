import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { handleUnauthorizedResponse } from "@/lib/clientAuth";

export type ResourceItem = {
  id: string;
  name: string;
  type: string;
  resource_profile_name?: string;
  credentials?: number;
  enable_discovery?: number;
};

type ResourcesApiResponse = {
  status: number;
  message: string;
  Vault: ResourceItem[];
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
    if (typeof data?.error === "string" && data.error.trim()) return data.error;
    if (Array.isArray(data?.errors) && data.errors.length) return String(data.errors[0]);
  } catch {
    // ignore JSON parse errors
  }
  return `Request failed (${res.status})`;
}

export const fetchResources = createAsyncThunk(
  "resources/fetch",
  async (_, { rejectWithValue }) => {
    const cookie = "pum_rest_auth=" + (localStorage.getItem("cookie") ?? "");

    const res = await fetch("/api/resources", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cookie }),
    });

    if (!res.ok) {
      handleUnauthorizedResponse(res);
      return rejectWithValue(await readErrorMessage(res));
    }

    const result = (await res.json()) as ResourcesApiResponse;
    return Array.isArray(result.Vault) ? result.Vault : [];
  },
);

type ResourcesState = {
  items: ResourceItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ResourcesState = {
  items: [],
  status: "idle",
  error: null,
};

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.error.message ?? "Unable to fetch resources.");
      });
  },
});

export const resourcesReducer = resourcesSlice.reducer;
