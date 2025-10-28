export const FluxConstants = {
  receiptResourceAddress:
    'resource_rdx1ntz3kr363rnnf8rjkf7hddf8hrhuu8aqmg5g6ufwxm86anxrqhvtxp',
  fusdResourceAddress:
    'resource_rdx1t49wa75gve8ehvejr760g3pgvkawsgsgq0u3kh7vevzk0g0cnsmscq',
  logicComponentAddress:
    'component_rdx1czgv2hx5lq4v5tjm32u69s5dw8ja0d4qeau2y5vktvaxlrmsfdy08u',
  packageAddress:
    'package_rdx1p55x9av2cu7re0f2l044ednmznhj4rnm8y9cnpzstx4pemdglxu696',
  cdpManager: {
    componentAddress:
      'component_rdx1czgv2hx5lq4v5tjm32u69s5dw8ja0d4qeau2y5vktvaxlrmsfdy08u',
  },
  xrdKvsAddress:
    'internal_keyvaluestore_rdx1kpp4hem8mtfstuyff2qsamsu5frup0280txndrmhzezngeqa37yxhc',
  lsulpKvsAddress:
    'internal_keyvaluestore_rdx1kzmrvytjphqf78dvkhe4h6myg2r2ycln20qzxkee8ggmej6jf5q4ew',
  collaterals: {
    xrd: {
      collateralAddress:
        'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
      stabilityPoolAddress:
        'pool_rdx1c5nzge2kpylwrtls7ydhnd03vs5f7w8w0jhzh99x82mw660war8y77',
      stabilityPoolTokenAddress:
        'resource_rdx1tk6gnvp5tmxqdr5zppuu50p2q9uvv89q2gyz432ukrh5md7ft4xesr',
    },
    lsulp: {
      collateralAddress:
        'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf',
      stabilityPoolAddress:
        'pool_rdx1c540e9ytpktwpqrq808xz3r0a8qxm2plrt4e5u5ecllzjcavrc9h8m',
      stabilityPoolTokenAddress:
        'resource_rdx1tksgc3j8ylrjjqgtny3l4dsfnpepch32hndyk20uptplqk8zuezk0z',
    },
  },
  reservoirs: {
    xrd: {
      componentAddress:
        'pool_rdx1c5nzge2kpylwrtls7ydhnd03vs5f7w8w0jhzh99x82mw660war8y77',
    },
    lsulp: {
      componentAddress:
        'pool_rdx1c540e9ytpktwpqrq808xz3r0a8qxm2plrt4e5u5ecllzjcavrc9h8m',
    },
  },
} as const;
