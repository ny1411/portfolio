type ScheduledCallback = (time: number) => void

interface ScheduledTask {
  callback: ScheduledCallback
  priority: number
}

export class RafScheduler {
  private tasks = new Set<ScheduledTask>()
  private rafId: number | null = null

  schedule(callback: ScheduledCallback, priority = 0): () => void {
    const task = { callback, priority }
    this.tasks.add(task)
    this.start()

    return () => {
      this.tasks.delete(task)
      if (this.tasks.size === 0) this.stop()
    }
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
    const tasks = [...this.tasks].sort((a, b) => b.priority - a.priority)
    tasks.forEach((task) => task.callback(time))
    this.rafId = this.tasks.size > 0 ? window.requestAnimationFrame(this.tick) : null
  }
}

export const rafScheduler = new RafScheduler()
