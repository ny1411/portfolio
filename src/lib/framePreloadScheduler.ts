import type { SequenceConfig } from '../types/sequence'
import { getConcurrencyPolicy, getDeviceProfile, type PriorityConcurrencyLimits } from './performance'
import {
  getFrameSrc,
  isFrameDecoded,
  isFramePending,
  loadFrame,
} from './sequenceLoader'

export type FramePreloadPriority = 'critical' | 'hot' | 'warm' | 'background'
export type FramePreloadDirection = 'up' | 'down'

interface FramePreloadJob {
  abortParent?: () => void
  controller: AbortController
  index: number
  key: string
  phaseConcurrency?: number
  priority: FramePreloadPriority
  promise: Promise<void>
  reject: (reason?: unknown) => void
  resolve: () => void
  sceneId: string
  sequence: SequenceConfig
  sequenceOrder: number
  signal?: AbortSignal
}

interface PreloadFrameRangeOptions {
  concurrency?: number
  endIndex?: number
  frameLimit?: number
  priority: FramePreloadPriority
  sceneId: string
  sequence: SequenceConfig
  signal?: AbortSignal
  startIndex?: number
}

interface PreloadFrameWindowOptions {
  centerIndex: number
  direction?: FramePreloadDirection
  maxFrames?: number
  priority?: FramePreloadPriority
  radius?: number
  sceneId: string
  sequence: SequenceConfig
}

interface AdaptiveRadiusOptions {
  isActiveScene?: boolean
  sequence: SequenceConfig
}

interface PreloadStartupHeroFramesOptions {
  concurrency: number
  frameLimit: number
  sceneId: string
  sequence: SequenceConfig
  signal?: AbortSignal
}

interface PreloadHeroRemainderOptions {
  concurrency: number
  skippedFrameCount: number
  sceneId: string
  sequence: SequenceConfig
  signal?: AbortSignal
}

interface PreloadContactBackgroundOptions {
  concurrency: number
  sceneId: string
  sequence: SequenceConfig
  signal?: AbortSignal
}

const priorityRank: Record<FramePreloadPriority, number> = {
  critical: 0,
  hot: 1,
  warm: 2,
  background: 3,
}

export class FramePreloadScheduler {
  private inFlightJobs = new Map<string, FramePreloadJob>()
  private isScrolling = false
  private nextSequenceOrder = 0
  private queuedJobs = new Map<string, FramePreloadJob>()
  private queue: FramePreloadJob[] = []

  setScrolling(isScrolling: boolean): void {
    if (this.isScrolling === isScrolling) return

    this.isScrolling = isScrolling
    this.pump()
  }

  preloadFrameRange(options: PreloadFrameRangeOptions): Promise<void> {
    const indexes = getRangeIndexes(options)

    return Promise.all(
      indexes.map((index) =>
        this.enqueueFrame({
          concurrency: options.concurrency,
          index,
          priority: options.priority,
          sceneId: options.sceneId,
          sequence: options.sequence,
          signal: options.signal,
        }).catch((error) => {
          if (isAbortError(error)) return
          throw error
        }),
      ),
    ).then(() => undefined)
  }

  preloadStartupHeroFrames(options: PreloadStartupHeroFramesOptions): Promise<void> {
    return this.preloadFrameRange({
      concurrency: options.concurrency,
      frameLimit: options.frameLimit,
      priority: 'critical',
      sceneId: options.sceneId,
      sequence: options.sequence,
      signal: options.signal,
    })
  }

  preloadHeroRemainder(options: PreloadHeroRemainderOptions): Promise<void> {
    return this.preloadFrameRange({
      concurrency: options.concurrency,
      priority: 'background',
      sceneId: options.sceneId,
      sequence: options.sequence,
      signal: options.signal,
      startIndex: options.sequence.startIndex + options.skippedFrameCount,
    })
  }

  preloadContactBackground(options: PreloadContactBackgroundOptions): Promise<void> {
    return this.preloadFrameRange({
      concurrency: options.concurrency,
      priority: 'background',
      sceneId: options.sceneId,
      sequence: options.sequence,
      signal: options.signal,
    })
  }

  preloadFrameWindow(options: PreloadFrameWindowOptions): void {
    const adaptiveRadius = getAdaptiveRadius({
      isActiveScene: options.priority === 'hot',
      sequence: options.sequence,
    })
    const radius = options.radius ?? adaptiveRadius
    const maxFrames = options.maxFrames ?? getAdaptiveMaxFrames(options.priority === 'hot')
    const indexes = getDirectionAwareWindowIndexes({
      centerIndex: options.centerIndex,
      direction: options.direction ?? 'down',
      endIndex: options.sequence.endIndex,
      maxFrames,
      radius,
      startIndex: options.sequence.startIndex,
    })

    indexes.forEach((index) => {
      void this.enqueueFrame({
        index,
        priority: options.priority ?? 'hot',
        sceneId: options.sceneId,
        sequence: options.sequence,
      }).catch(() => undefined)
    })
  }

  abortAll(): void {
    const abortError = createAbortError()

    this.queue.forEach((job) => {
      job.abortParent?.()
      job.controller.abort()
      job.reject(abortError)
    })
    this.queue = []
    this.queuedJobs.clear()

    this.inFlightJobs.forEach((job) => {
      job.abortParent?.()
      job.controller.abort()
    })
  }

  private enqueueFrame({
    concurrency,
    index,
    priority,
    sceneId,
    sequence,
    signal,
  }: {
    concurrency?: number
    index: number
    priority: FramePreloadPriority
    sceneId: string
    sequence: SequenceConfig
    signal?: AbortSignal
  }): Promise<void> {
    if (index < sequence.startIndex || index > sequence.endIndex) return Promise.resolve()
    if (isFrameDecoded(sequence, index) || isFramePending(sequence, index)) return Promise.resolve()
    if (signal?.aborted) return Promise.reject(createAbortError())

    const key = getFrameSrc(sequence, index)
    const existingJob = this.queuedJobs.get(key) ?? this.inFlightJobs.get(key)

    if (existingJob) {
      if (priorityRank[priority] < priorityRank[existingJob.priority]) {
        existingJob.priority = priority
        this.sortQueue()
        this.pump()
      }

      return existingJob.promise
    }

    let resolveJob: () => void = () => undefined
    let rejectJob: (reason?: unknown) => void = () => undefined
    const promise = new Promise<void>((resolve, reject) => {
      resolveJob = resolve
      rejectJob = reject
    })
    const controller = new AbortController()
    const job: FramePreloadJob = {
      controller,
      index,
      key,
      phaseConcurrency: getPhaseConcurrency(concurrency),
      priority,
      promise,
      reject: rejectJob,
      resolve: resolveJob,
      sceneId,
      sequence,
      sequenceOrder: this.nextSequenceOrder,
      signal,
    }

    this.nextSequenceOrder += 1
    if (signal) {
      job.abortParent = () => {
        this.removeQueuedJob(job)
        controller.abort()
        rejectJob(createAbortError())
      }
      signal.addEventListener('abort', job.abortParent, { once: true })
    }

    this.queue.push(job)
    this.queuedJobs.set(key, job)
    this.sortQueue()
    this.pump()

    return promise
  }

  private pump(): void {
    const policy = getConcurrencyPolicy()
    const totalLimit = this.isScrolling
      ? Math.min(policy.totalLimit, policy.scrollingLimits.critical + policy.scrollingLimits.hot)
      : policy.totalLimit

    while (this.inFlightJobs.size < totalLimit) {
      const nextIndex = this.findNextRunnableJobIndex()
      if (nextIndex === -1) return

      const [job] = this.queue.splice(nextIndex, 1)
      this.queuedJobs.delete(job.key)
      this.inFlightJobs.set(job.key, job)
      void this.runJob(job)
    }
  }

  private findNextRunnableJobIndex(): number {
    for (let index = 0; index < this.queue.length; index += 1) {
      const job = this.queue[index]
      const limit = this.getJobLimit(job)

      if (this.getInFlightCount(job.priority) < limit) return index
    }

    return -1
  }

  private getJobLimit(job: FramePreloadJob): number {
    const policy = getConcurrencyPolicy()
    const limits: PriorityConcurrencyLimits = this.isScrolling ? policy.scrollingLimits : policy.idleLimits
    const priorityLimit = limits[job.priority]

    return Math.min(priorityLimit, job.phaseConcurrency ?? priorityLimit)
  }

  private getInFlightCount(priority: FramePreloadPriority): number {
    let count = 0

    this.inFlightJobs.forEach((job) => {
      if (job.priority === priority) count += 1
    })

    return count
  }

  private async runJob(job: FramePreloadJob): Promise<void> {
    try {
      if (!isFrameDecoded(job.sequence, job.index)) {
        await loadFrame(job.sceneId, job.sequence, job.index, job.controller.signal)
      }

      job.resolve()
    } catch (error) {
      job.reject(error)
    } finally {
      if (job.signal && job.abortParent) {
        job.signal.removeEventListener('abort', job.abortParent)
      }

      this.inFlightJobs.delete(job.key)

      // Yield between background batches to avoid starving the main thread.
      // Critical and hot jobs resume immediately; background/warm jobs yield
      // for a brief interval that varies by device tier.
      const yieldMs = getYieldMs(job.priority)
      if (yieldMs > 0) {
        window.setTimeout(() => this.pump(), yieldMs)
      } else {
        window.setTimeout(() => this.pump(), 0)
      }
    }
  }

  private removeQueuedJob(job: FramePreloadJob): void {
    if (!this.queuedJobs.has(job.key)) return

    this.queuedJobs.delete(job.key)
    this.queue = this.queue.filter((queuedJob) => queuedJob !== job)
  }

  private sortQueue(): void {
    this.queue.sort((left, right) => {
      const priorityDiff = priorityRank[left.priority] - priorityRank[right.priority]
      if (priorityDiff !== 0) return priorityDiff

      return left.sequenceOrder - right.sequenceOrder
    })
  }
}

export const framePreloadScheduler = new FramePreloadScheduler()

function getRangeIndexes({
  endIndex,
  frameLimit,
  sequence,
  startIndex,
}: PreloadFrameRangeOptions): number[] {
  const start = Math.max(sequence.startIndex, startIndex ?? sequence.startIndex)
  const end = Math.min(sequence.endIndex, endIndex ?? sequence.endIndex)
  const limit = getFrameLimit(sequence, frameLimit)
  const indexes: number[] = []

  for (let index = start; index <= end && indexes.length < limit; index += 1) {
    indexes.push(index)
  }

  return indexes
}

function getFrameLimit(sequence: SequenceConfig, frameLimit?: number): number {
  const sequenceFrameCount = sequence.endIndex - sequence.startIndex + 1
  if (frameLimit === undefined || !Number.isFinite(frameLimit)) return sequenceFrameCount

  return Math.min(sequenceFrameCount, Math.max(0, Math.floor(frameLimit)))
}

function getPhaseConcurrency(concurrency?: number): number | undefined {
  if (concurrency === undefined || !Number.isFinite(concurrency)) return undefined

  return Math.max(1, Math.floor(concurrency))
}

/**
 * Returns the yield delay (ms) after completing a job, based on priority
 * and device tier. Critical/hot jobs never yield; background/warm jobs
 * yield briefly to let the browser breathe.
 */
function getYieldMs(priority: FramePreloadPriority): number {
  if (priority === 'critical' || priority === 'hot') return 0

  return getConcurrencyPolicy().backgroundYieldMs
}

/**
 * Builds direction-aware frame indexes using a 2:1 asymmetric ratio.
 *
 * When scrolling downward, two forward frames are queued for every one
 * backward frame. This keeps the look-ahead buffer deeper while still
 * warming a few frames behind for small scroll reversals.
 *
 * The ratio flips when scrolling upward.
 */
function getDirectionAwareWindowIndexes({
  centerIndex,
  direction,
  endIndex,
  maxFrames,
  radius,
  startIndex,
}: {
  centerIndex: number
  direction: FramePreloadDirection
  endIndex: number
  maxFrames: number
  radius: number
  startIndex: number
}): number[] {
  const indexes: number[] = []
  const primarySign = direction === 'up' ? -1 : 1
  const secondarySign = primarySign * -1

  // Asymmetric split: ~2/3 primary direction, ~1/3 secondary direction
  let primaryOffset = 0
  let secondaryOffset = 0

  for (let step = 0; indexes.length < maxFrames && (primaryOffset < radius || secondaryOffset < radius); step += 1) {
    // Add two primary-direction frames per one secondary-direction frame
    if (primaryOffset < radius) {
      primaryOffset += 1
      addBoundedIndex(indexes, centerIndex + primaryOffset * primarySign, startIndex, endIndex, maxFrames)
    }
    if (primaryOffset < radius && indexes.length < maxFrames) {
      primaryOffset += 1
      addBoundedIndex(indexes, centerIndex + primaryOffset * primarySign, startIndex, endIndex, maxFrames)
    }
    if (secondaryOffset < radius && indexes.length < maxFrames) {
      secondaryOffset += 1
      addBoundedIndex(indexes, centerIndex + secondaryOffset * secondarySign, startIndex, endIndex, maxFrames)
    }
  }

  return indexes
}

function addBoundedIndex(
  indexes: number[],
  index: number,
  startIndex: number,
  endIndex: number,
  maxFrames: number,
): void {
  if (indexes.length >= maxFrames) return
  if (index < startIndex || index > endIndex) return
  if (indexes.includes(index)) return

  indexes.push(index)
}

/**
 * Returns an adaptive preload radius based on device tier and sequence config.
 * High-end devices get a larger look-ahead; low-end devices get a smaller one.
 */
export function getAdaptiveRadius({ isActiveScene, sequence }: AdaptiveRadiusOptions): number {
  const configRadius = sequence.preloadRadius
  if (configRadius !== undefined) return configRadius

  const profile = getDeviceProfile()

  if (isActiveScene) {
    switch (profile.tier) {
      case 'high': return 20
      case 'mid': return 14
      case 'low': return 8
    }
  }

  // Warm (non-active) scenes use a smaller radius
  switch (profile.tier) {
    case 'high': return 12
    case 'mid': return 8
    case 'low': return 5
  }
}

/**
 * Returns adaptive max frame count for the preload window.
 */
function getAdaptiveMaxFrames(isActiveScene: boolean): number {
  const profile = getDeviceProfile()

  if (isActiveScene) {
    switch (profile.tier) {
      case 'high': return 16
      case 'mid': return 12
      case 'low': return 8
    }
  }

  switch (profile.tier) {
    case 'high': return 10
    case 'mid': return 8
    case 'low': return 5
  }
}

function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

function createAbortError(): Error | DOMException {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('Frame preload aborted', 'AbortError')
  }

  const error = new Error('Frame preload aborted')
  error.name = 'AbortError'
  return error
}
