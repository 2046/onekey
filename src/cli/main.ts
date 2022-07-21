#!/usr/bin/env node

import crypto from './crypto'
import { Listr } from 'listr2'
import * as tasks from './tasks'
import { IListrContext } from './typing'
import { isAppType, isCommandType } from './utils'

const [filePath = '', password = '', op = ''] = process.argv.slice(2)

;(async function main() {
  if (filePath && password && op === '-e') {
    return console.log(await crypto.encrypt(filePath, password))
  } else if (filePath && password && op === '-d') {
    return console.log(await crypto.decrypt(filePath, password))
  }

  const listr = new Listr<IListrContext>(
    [
      {
        title: 'Load Config File',
        task: (_, task) => {
          return task.newListr([
            tasks.createFileFormatVerifyTask(filePath),
            tasks.createLoadFileTask(filePath),
            tasks.createDecryptFileTask(filePath, password),
            tasks.createParseFileTask(filePath)
          ])
        }
      },
      {
        title: 'Create Temporary Download Directory',
        task: tasks.createGenerateTmpDirectoryTask()
      },
      {
        title: 'Install Apps',
        skip: (ctx) => !ctx.tasks.filter((task) => isAppType(task))[0],
        task: (ctx, task) =>
          task.newListr(tasks.createInstallAppTasks(ctx), {
            rendererOptions: { collapse: false }
          })
      },
      {
        title: 'Change Default Settings',
        skip: (ctx) => !ctx.tasks.filter((task) => isCommandType(task))[0],
        task: (ctx, task) =>
          task.newListr(tasks.createExecCommandTasks(ctx), {
            rendererOptions: { collapse: false }
          })
      },
      {
        title: 'Remove Temporary Download Directory',
        task: tasks.createRemoveTmpDirectoryTask()
      }
    ],
    {
      concurrent: false,
      exitOnError: true,
      registerSignalListeners: false,
      rendererOptions: { collapse: true, collapseErrors: false }
    }
  )

  try {
    await listr.run({
      text: '',
      tasks: [],
      tmpdir: '',
      filePaths: new Map()
    })
  } catch (error) {
    error
  }
})()
