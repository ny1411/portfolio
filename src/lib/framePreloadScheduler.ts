import type { SequenceConfig } from '../types/sequence'
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

const idlePriorityLimits: Record<FramePreloadPriority, number> = {
  critical: 6,
  hot: 4,
  warm: 2,
  background: 5,
}

const scrollingPriorityLimits: Record<FramePreloadPriority, number> = {
  critical: 6,
  hot: 4,
  warm: 1,
  background: 1,
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
    const radius = options.radius ?? options.sequence.preloadRadius ?? 12
    const maxFrames = options.maxFrames ?? (options.sequence.preloadStrategy === 'cinematic' ? 8 : 12)
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
    const totalLimit = this.isScrolling ? 4 : 6

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
    const priorityLimit = (this.isScrolling ? scrollingPriorityLimits : idlePriorityLimits)[job.priority]

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
      window.setTimeout(() => this.pump(), 0)
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

  for (let offset = 1; offset <= radius && indexes.length < maxFrames; offset += 1) {
    addBoundedIndex(indexes, centerIndex + offset * primarySign, startIndex, endIndex, maxFrames)
    addBoundedIndex(indexes, centerIndex + offset * secondarySign, startIndex, endIndex, maxFrames)
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
