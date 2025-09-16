import { Effect, Schema } from 'effect';
import type { ComponentEntityDetailsOutput } from '../getComponentEntityDetails';
import { ComponentDefinition, SurgeLiteralSchema } from '../schemas';

const fromComponentEntityDetails = (
  input: ComponentEntityDetailsOutput[number],
) =>
  Effect.gen(function* () {
    return yield* MarginPoolComponent.pipe(Schema.decodeUnknown)(input);
  });

export class MarginPoolComponent extends ComponentDefinition.extend<MarginPoolComponent>(
  'MarginPoolComponent',
)({
  dappId: SurgeLiteralSchema,
  packageAddress: Schema.Literal(
    'package_rdx1p5qkwzc006ex4dph7ayuqhfdkp0aq7ljl97e96yzzyynmc86z9phf4',
  ),
  blueprintName: Schema.Literal('MarginPool'),
}) {
  static blueprintName = MarginPoolComponent.fields.blueprintName.literals[0];
  static packageAddresses = MarginPoolComponent.fields.packageAddress.literals;
  static matchPackageAddress = (input: string) =>
    input === MarginPoolComponent.fields.packageAddress.literals[0];
  static fromComponentEntityDetails = fromComponentEntityDetails;
}
