import { configureStore } from "@reduxjs/toolkit";
import { resourcesReducer } from "@/lib/resourcesSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      resources: resourcesReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
