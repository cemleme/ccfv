import { createSlice } from "@reduxjs/toolkit";

export const rootSlice = createSlice({
  name: "root",
  initialState: {
    fundsToBridge: {},
    stats: {},
  },
  reducers: {
    addFundsToBridge: (state, action) => {
      state.fundsToBridge[action.payload.id] = action.payload.value;
    },
    setStats: (state, action) => {
      state.stats[action.payload.id] = action.payload.value;
    },
  },
});

// Action creators are generated for each case reducer function
export const { addFundsToBridge, setStats } = rootSlice.actions;

export default rootSlice.reducer;
