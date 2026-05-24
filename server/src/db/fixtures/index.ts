/**
 * Fixtures — ponto de entrada único para o módulo de snapshot/fixture.
 */

export { serializeEntity, serializeEntities, assertSerializable } from './serializer';
export type { FixtureData, LoaderOptions } from './loader';

export {
  snapshotRegistry,
  restoreRegistry,
  snapshotRegistryJSON,
  parseRegistryShot,
} from './registry-shots';
export type { RegistryShot, RepoSnapshot } from './registry-shots';

export { readFixtureFile, writeSnapshotFile, loadFixture, loadDefaultFixture } from './loader';
