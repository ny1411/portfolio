type ScheduledCallback = (time: number) => void

interface ScheduledTask {
  callback: ScheduledCallback
  priority: number
  dead: boolean
}

export class RafScheduler {
  private sortedTasks: ScheduledTask[] = []
  private rafId: number | null = null
  private ticking = false
  private pendingRemovals: ScheduledTask[] = []

  schedule(callback: ScheduledCallback, priority = 0): () => void {
    const task: ScheduledTask = { callback, priority, dead: false }
    
    // Insert in sorted order (highest priority first)
    let idx = 0
    while (idx < this.sortedTasks.length && this.sortedTasks[idx].priority >= priority) {
      idx++
    }
    this.sortedTasks.splice(idx, 0, task)
    
    this.start()

    return () => {
      task.dead = true
      if (this.ticking) {
        this.pendingRemovals.push(task)
      } else {
        this.removeTask(task)
      }
    }
  }

  private removeTask(task: ScheduledTask): void {
    const idx = this.sortedTasks.indexOf(task)
    if (idx !== -1) {
      this.sortedTasks.splice(idx, 1)
    }
    if (this.sortedTasks.length === 0) this.stop()
  }

  private start(): void {
    if (this.rafId !== null) return
    this.rafId = window.requestAnimationFrame(this.tick)
  }

  private stop(): void {
    if (this.rafId === null) return
    window.cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  private tick = (time: number): void => {
    this.ticking = true
    const tasks = this.sortedTasks
    for (let i = 0; i < tasks.length; i++) {
      if (!tasks[i].dead) tasks[i].callback(time)
    }
    this.ticking = false

    if (this.pendingRemovals.length > 0) {
      for (const task of this.pendingRemovals) {
        this.removeTask(task)
      }
      this.pendingRemovals.length = 0
    }

    this.rafId = this.sortedTasks.length > 0 ? window.requestAnimationFrame(this.tick) : null
  }
}

export const rafScheduler = new RafScheduler()
