import { createSlice } from "@reduxjs/toolkit";

export const rootSlice = createSlice({
  name: "root",
  initialState: {
    fundsToBridge: {},
    stats: {},
    unsyncedIds: [],
  },
  reducers: {
    addFundsToBridge: (state, action) => {
      state.fundsToBridge[action.payload.id] = action.payload.value;
    },
    addUnsyncedId: (state, action) => {
      let arr = [...state.unsyncedIds, ...action.payload.ids];
      state.unsyncedIds = [...new Set(arr)];
    },
    setStats: (state, action) => {
      state.stats[action.payload.id] = action.payload.value;
    },
  },
});

// Action creators are generated for each case reducer function
export const { addFundsToBridge, setStats, addUnsyncedId } = rootSlice.actions;

export default rootSlice.reducer;
