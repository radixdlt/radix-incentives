import { Assets } from '../../assets';

export const RootFinanceConstants = {
  receiptResourceAddress:
    'resource_rdx1ngekvyag42r0xkhy2ds08fcl7f2ncgc0g74yg6wpeeyc4vtj03sa9f',
  poolStateKvs:
    'internal_keyvaluestore_rdx1kr9pe655r6gvkemdnwd2588pkfs8nz0ds0depfzpr65grz4e77hnju',
  packageAddress:
    'package_rdx1phwak2lr7nczzl6rxzvtnjwszmvxqycp9h8pckcmy6uwdcucnjeu0p',
  componentAddress:
    'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
  supportedAssets: {
    xUSDC: {
      type: 'fungible',
      componentAddress:
        'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
      resourceAddress: Assets.Fungible.xUSDC,
    },
    xUSDT: {
      type: 'fungible',
      componentAddress:
        'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
      resourceAddress: Assets.Fungible.xUSDT,
    },
    wxBTC: {
      type: 'fungible',
      componentAddress:
        'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
      resourceAddress: Assets.Fungible.wxBTC,
    },
    xETH: {
      type: 'fungible',
      componentAddress:
        'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
      resourceAddress: Assets.Fungible.xETH,
    },
    XRD: {
      type: 'fungible',
      componentAddress:
        'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
      resourceAddress: Assets.Fungible.XRD,
    },
    lsulp: {
      type: 'fungible',
      componentAddress:
        'component_rdx1crwusgp2uy9qkzje9cqj6pdpx84y94ss8pe7vehge3dg54evu29wtq',
      resourceAddress: Assets.Fungible.LSULP,
    },
  },
};
