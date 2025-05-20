/**
 * Test configuration with real addresses and data for testing
 */
export const TEST_CONFIG = {
  // Valid data
  validComponentAddress:
    "component_rdx1cpqcstnjnj5cpag7wc04y6t4azrfxjtr3g53jdpv4y72m0lpp8qkf4",
  validNftId:
    "{adee4a4009aa7489-87566f296958d6a9-6a17ee28c8643d4f-3263c1ff206885dc}",
  validStateVersion: 282256254,
  validNftIds: [
    "{adee4a4009aa7489-87566f296958d6a9-6a17ee28c8643d4f-3263c1ff206885dc}",
    "{dbfad827699928fc-e9df59e41ee0e356-cf2032ed90d2a32e-7ac050d112cb38f4}",
    "{08d7651c3a99f0b7-15c931044acadc57-0dd62a027cf55086-7c11c6f8a4b76438}",
  ],

  // Price bounds test data
  validPriceBounds: [0.95, 1.05] as [number, number],
  validMiddlePrice: 1.0,
  invalidPriceBounds: {
    wrongType: [0.95, "1.05"] as any,
    wrongLength: [0.95] as any,
    negativeMultiplier: [-0.95, 1.05] as [number, number],
    zeroMultiplier: [0, 1.05] as [number, number],
    reversedOrder: [1.05, 0.95] as [number, number],
    equalValues: [1.0, 1.0] as [number, number],
  },
  invalidMiddlePrice: {
    wrongType: "1.0" as any,
    negative: -1.0,
    zero: 0,
  },

  // Invalid data
  wrongTypeComponentAddress: 123 as any,
  randomStringComponentAddress: "not_a_component_address",
  realNonC9ComponentAddress:
    "component_rdx1cq8du4ag9pzcrm7gvq9pd6r5rkn4pdqw4q4lgnw9l0rz8jkz2hc9sq",
  wrongTypeNftId: 456 as any,
  randomStringNftId: "not_an_nft_id",
  nonExistentNftId:
    "{0e4db4c46ae1bbc4-00000000000000000-0000000000000000-000000000000000}",
  earlyStateVersion: 100, // Before NFT existed
  futureStateVersion: 999999999, // Far in the future

  // Mixed NFT IDs for batch testing
  mixedNftIds: {
    oneInvalid: [
      "{adee4a4009aa7489-87566f296958d6a9-6a17ee28c8643d4f-3263c1ff206885dc}",
      "not_an_nft_id",
      "{0e4db4c46ae1bbc4-00000000000000000-0000000000000000-000000000000000}",
    ],
    allInvalid: ["not_an_nft_id_1", "not_an_nft_id_2", "not_an_nft_id_3"],
  },
};
