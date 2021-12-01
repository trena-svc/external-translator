import ceil from 'lodash/ceil';
import toInteger from 'lodash/toInteger';

export type TranslationTask = { text: string; order: number };

export class TranslationTaskManager {
  private readonly taskList: TranslationTask[];
  private readonly resultList: string[];
  private finishedSet: Set<number>;
  private progressReportedSet: Set<number>;
  private curIdx: number;

  constructor(
    textList: string[],
    private onProgressUpdate: (progress: number) => Promise<void>,
  ) {
    this.taskList = textList.map((text, order) => ({
      text: TranslationTaskManager.normalizeText(text),
      order,
    }));

    this.resultList = [...textList];
    this.finishedSet = new Set();
    this.progressReportedSet = new Set();
    this.curIdx = 0;
  }

  isFinishedAll(): boolean {
    return this.finishedSet.size === this.taskList.length;
  }

  getUnfinishedTask(): TranslationTask | undefined {
    let nextIdx = (this.curIdx + 1) % this.taskList.length;
    const start = nextIdx;
    let noListInQueue = false;

    while (
      !noListInQueue &&
      this.finishedSet.has(this.taskList[nextIdx].order)
    ) {
      nextIdx = (nextIdx + 1) % this.taskList.length;
      if (nextIdx === start) noListInQueue = true;
    }

    if (noListInQueue) {
      return undefined;
    }

    this.curIdx = nextIdx;

    return this.taskList[this.curIdx];
  }

  isFinished(task: TranslationTask) {
    return this.finishedSet.has(task.order);
  }

  getResultList(): string[] {
    return this.resultList;
  }

  async saveTaskResult(task: TranslationTask, result: string): Promise<void> {
    if (this.finishedSet.has(task.order)) {
      return;
    }
    this.finishedSet.add(task.order);
    this.resultList[task.order] = result;

    const progress = toInteger(
      ceil((this.finishedSet.size / this.taskList.length) * 100),
    );

    if (!this.progressReportedSet.has(progress)) {
      this.progressReportedSet.add(progress);
      await this.onProgressUpdate(progress);
    }
  }

  private static normalizeText(text: string): string {
    return text.replace(/&amp;/g, '&');
  }
}
