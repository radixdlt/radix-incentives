export const ActivityId = {
  "caviarnine_hold_floop-xrd": "caviarnine_hold_floop-xrd",
  "caviarnine_hold_lsulp-reddicks": "caviarnine_hold_lsulp-reddicks",
  "caviarnine_hold_lsulp-xrd": "caviarnine_hold_lsulp-xrd",
  "caviarnine_hold_xeth-xrd": "caviarnine_hold_xeth-xrd",
  "caviarnine_hold_xrd-xusdc": "caviarnine_hold_xrd-xusdc",
  "caviarnine_hold_xrd-xusdt": "caviarnine_hold_xrd-xusdt",
  "caviarnine_hold_xrd-xwbtc": "caviarnine_hold_xrd-xwbtc",
  "caviarnine_lp_bluechip_xeth-xrd": "caviarnine_lp_bluechip_xeth-xrd",
  "caviarnine_lp_bluechip_xrd-xwbtc": "caviarnine_lp_bluechip_xrd-xwbtc",
  "caviarnine_lp_native_floop-xrd": "caviarnine_lp_native_floop-xrd",
  "caviarnine_lp_native_lsulp-reddicks": "caviarnine_lp_native_lsulp-reddicks",
  "caviarnine_lp_stable_xrd-xusdc": "caviarnine_lp_stable_xrd-xusdc",
  "caviarnine_lp_stable_xrd-xusdt": "caviarnine_lp_stable_xrd-xusdt",
  "caviarnine_lp_xrdDerivative_floop-xrd": "caviarnine_lp_xrdDerivative_floop-xrd",
  "caviarnine_lp_xrdDerivative_lsulp-reddicks": "caviarnine_lp_xrdDerivative_lsulp-reddicks",
  "caviarnine_lp_xrdDerivative_lsulp-xrd": "caviarnine_lp_xrdDerivative_lsulp-xrd",
  "caviarnine_lp_xrdDerivative_xeth-xrd": "caviarnine_lp_xrdDerivative_xeth-xrd",
  "caviarnine_lp_xrdDerivative_xrd-xusdc": "caviarnine_lp_xrdDerivative_xrd-xusdc",
  "caviarnine_lp_xrdDerivative_xrd-xusdt": "caviarnine_lp_xrdDerivative_xrd-xusdt",
  "caviarnine_lp_xrdDerivative_xrd-xwbtc": "caviarnine_lp_xrdDerivative_xrd-xwbtc"
} as const

export type ActivityId = (typeof ActivityId)[keyof typeof ActivityId];

export const matchActivityId = (input: string) =>
    !!ActivityId[input as keyof typeof ActivityId];