import { Layer, ManagedRuntime } from 'effect';
import { CalculateActivityPointsWorkerService } from '../../activity-points/calculateActivityPointsWorker';
import { EventWorkerService } from '../../events/eventWorker';
import { LeaderboardCacheService } from '../../leaderboard/leaderboardCache';
import { SeasonService } from '../../season/season';
import { SeasonPointsMultiplierWorkerService } from '../../season-point-multiplier/seasonPointsMultiplierWorker';
import { CalculateSeasonPointsService } from '../../season-points/calculateSeasonPoints';
import { WeekService } from '../../week/week';
import { SnapshotV2Worker } from './snapshotV2Worker';

export const workerRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    SnapshotV2Worker.Default,
    SeasonPointsMultiplierWorkerService.Default,
    CalculateActivityPointsWorkerService.Default,
    CalculateSeasonPointsService.Default,
    EventWorkerService.Default,
    LeaderboardCacheService.Default,
    SeasonService.Default,
    WeekService.Default,
  ),
);
