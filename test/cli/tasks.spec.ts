import path from 'path'
import { Listr } from 'listr2'
import { lstat } from 'fs/promises'
import * as tasks from '../../src/bin/tasks'
import { IListrContext, IPackOpition } from '../../src/bin/typing'

const errorFilePath = path.join(process.cwd(), '/test/fixtures/test.zip')
const originFilePath = path.join(process.cwd(), '/test/fixtures/test.pack')
const cipherFilePath = path.join(process.cwd(), '/test/fixtures/crypto.pack')

describe('tasks', () => {
  test('create file format verify task', () => {
    const taskObj = tasks.createFileFormatVerifyTask(originFilePath)

    expect(taskObj.title).not.toBeNull()
    expect(() => taskObj.task()).not.toThrow()
    expect(() => {
      tasks.createFileFormatVerifyTask(errorFilePath).task()
    }).toThrow(Error)
  })

  test('create load file task', async () => {
    const ctx = <IListrContext>{ text: '' }
    const taskObj = tasks.createLoadFileTask(originFilePath)

    expect(taskObj.title).not.toBeNull()
    await taskObj.task(ctx)
    expect(ctx.text).not.toBeNull()
    expect(ctx.text).toContain('downloadUrl')

    await expect(async () => {
      await tasks.createLoadFileTask(errorFilePath).task(ctx)
    }).rejects.toThrow(Error)
  })

  test('create decrypt file task', async () => {
    const ctx = <IListrContext>{ text: '' }
    const loadTaskObj = tasks.createLoadFileTask(cipherFilePath)

    expect(loadTaskObj.title).not.toBeNull()
    await loadTaskObj.task(ctx)
    expect(ctx.text).not.toBeNull()

    expect(() => {
      tasks.createDecryptFileTask(cipherFilePath, '12345').task(ctx)
    }).toThrow(Error)

    const decryptTaskObj = tasks.createDecryptFileTask(cipherFilePath, '123456')

    expect(decryptTaskObj.title).not.toBeNull()
    expect(decryptTaskObj.skip(ctx)).toBeTruthy()

    decryptTaskObj.task(ctx)
    expect(ctx.text).toContain('downloadUrl')
  })

  test('create parse file task', async () => {
    const ctx = <IListrContext>{ text: '', tasks: [] as Array<IPackOpition> }
    const loadTaskObj = tasks.createLoadFileTask(originFilePath)

    expect(loadTaskObj.title).not.toBeNull()
    await loadTaskObj.task(ctx)
    expect(ctx.text).not.toBeNull()

    const parseTaskObj = tasks.createParseFileTask(originFilePath)

    expect(parseTaskObj.title).not.toBeNull()
    expect(ctx.tasks.length).toBe(0)
    parseTaskObj.task(ctx)
    expect(ctx.tasks.length).not.toBe(0)
    expect(ctx.tasks[0].type).not.toBeUndefined()
    expect(ctx.tasks[0].name).not.toBeUndefined()
    expect(ctx.tasks[0].action).not.toBeUndefined()

    ctx.text = ''
    parseTaskObj.task(ctx)
    expect(ctx.tasks.length).toBe(0)
  })

  test('create install app tasks', async () => {
    const ctx = <IListrContext>{ text: '', tasks: [] as Array<IPackOpition> }
    const loadTaskObj = tasks.createLoadFileTask(originFilePath)
    const parseTaskObj = tasks.createParseFileTask(originFilePath)

    await loadTaskObj.task(ctx)
    parseTaskObj.task(ctx)

    void new Listr<IListrContext>([
      {
        title: 'install apps',
        task: (_, task) => {
          const result = tasks.createInstallAppTasks(ctx)

          expect(Array.isArray(result)).toBeTruthy()
          expect(result[0].title).not.toBeNull()

          expect(result[0].task(_, task).tasks.map((item) => item.title)).toEqual(['Downloading', 'Installing'])
        }
      }
    ]).run()
  })

  test('create exec command tasks', async () => {
    const ctx = <IListrContext>{ text: '', tasks: [] as Array<IPackOpition> }
    const loadTaskObj = tasks.createLoadFileTask(originFilePath)
    const parseTaskObj = tasks.createParseFileTask(originFilePath)

    await loadTaskObj.task(ctx)
    parseTaskObj.task(ctx)

    const result = tasks.createExecCommandTasks(ctx)

    expect(Array.isArray(result)).toBeTruthy()
    expect(result[0].title).not.toBeNull()

    expect(() => {
      result[0].task()
    }).not.toThrow()
  })

  test('create generate tmp directory task', async () => {
    const ctx = <IListrContext>{ tmpdir: '' }
    const task = tasks.createGenerateTmpDirectoryTask()

    await task(ctx)

    expect(ctx.tmpdir).not.toBe('')
    expect(ctx.tmpdir).not.toBeNull()
    expect((await lstat(ctx.tmpdir)).isDirectory()).toBeTruthy()
  })
  test('create remove tmp directory task', async () => {
    const ctx = <IListrContext>{ tmpdir: '' }
    const generateTask = tasks.createGenerateTmpDirectoryTask()

    await generateTask(ctx)

    expect(ctx.tmpdir).not.toBe('')
    expect(ctx.tmpdir).not.toBeNull()
    expect((await lstat(ctx.tmpdir)).isDirectory()).toBeTruthy()

    const removeTask = tasks.createRemoveTmpDirectoryTask()

    await removeTask(ctx)
    await expect(async () => {
      await lstat(ctx.tmpdir)
    }).rejects.toThrow()
  })
})
