import {
  TranslationTask,
  TranslationTaskManager,
} from './translation-task-manager';

describe('translationTaskManager', () => {
  it('should return same unfinished task and undefined if it flags as finished', () => {
    const textList = ['hello'];
    const manager = new TranslationTaskManager(textList, console.log);

    const expectedTask: TranslationTask = { text: 'hello', order: 0 };
    expect(manager.getUnfinishedTask()).toEqual(expectedTask);
    expect(manager.getUnfinishedTask()).toEqual(expectedTask);

    manager.saveTaskResult(expectedTask, 'result');
    manager.saveTaskResult(expectedTask, 'result');

    expect(manager.getUnfinishedTask()).toBeUndefined();
    expect(manager.getResultList()).toEqual(['result']);
  });

  it('should normalize html escape value', () => {
    const textList = ['hello&amp;nice'];
    const manager = new TranslationTaskManager(textList, console.log);

    const expectedTask: TranslationTask = { text: 'hello&nice', order: 0 };
    expect(manager.getUnfinishedTask()).toEqual(expectedTask);
  });

  it('should return unfinished task sequentially', () => {
    const textList = ['hello', 'nice', 'to', 'meet', 'you'];
    const manager = new TranslationTaskManager(textList, console.log);

    const tasks = textList.map(() => manager.getUnfinishedTask());

    expect(new Set(tasks.map((task) => task.text))).toEqual(new Set(textList));
    expect(new Set(tasks.map((task) => task.order))).toEqual(
      new Set([0, 1, 2, 3, 4]),
    );
  });
});
