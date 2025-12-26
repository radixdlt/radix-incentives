import { type Amount, TransactionManifestString } from 'shared/brandedTypes';
import type { Account } from 'shared/schemas/account';

export const createFungibleTokenManifest = (input: {
  name: string;
  symbol: string;
  initialSupply: Amount;
  account: Account;
}) =>
  TransactionManifestString.make(`CREATE_FUNGIBLE_RESOURCE_WITH_INITIAL_SUPPLY
None
true
0u8
Decimal("${input.initialSupply}")
Tuple(
  Some(         
    Tuple(
      Some(Enum<AccessRule::DenyAll>()),  
      Some(Enum<AccessRule::DenyAll>())
    )
  ),
  Some(         
    Tuple(
      Some(Enum<AccessRule::DenyAll>()),  
      Some(Enum<AccessRule::DenyAll>())
    )
  ),
  Some(         
    Tuple(
      Some(Enum<AccessRule::DenyAll>()),  
      Some(Enum<AccessRule::DenyAll>())
    )
  ),
  Some(         
    Tuple(
      Some(Enum<AccessRule::DenyAll>()),  
      Some(Enum<AccessRule::DenyAll>())
    )
  ),
  Some(         
    Tuple(
      Some(Enum<AccessRule::AllowAll>()),  
      Some(Enum<AccessRule::DenyAll>())
    )
  ),
  Some(         
    Tuple(
      Some(Enum<AccessRule::AllowAll>()),  
      Some(Enum<AccessRule::DenyAll>())
    )
  )
)
Tuple(
    Map<String, Tuple>(
      "name" => Tuple(
Some(Enum<Metadata::String>("${input.name}")),                  
false                                                         
),"symbol" => Tuple(
Some(Enum<Metadata::String>("${input.symbol}")),                  
false                                                         
)
    ),
    Map<String, Enum>(
      "metadata_setter" => None,
      "metadata_setter_updater" => None,
      "metadata_locker" => None,          
      "metadata_locker_updater" => None
    )
)
None
;

CALL_METHOD
Address("${input.account.address}")
"try_deposit_batch_or_abort"
Expression("ENTIRE_WORKTOP")
Enum<0u8>()
;`);
