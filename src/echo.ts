import ora from 'ora'
import chalk from 'chalk'

const spinner = ora()

const echo = {
  loading(text: string) {
    spinner.start(chalk.cyan(text))
  },
  info(text: string) {
    spinner.stop()
    console.log(chalk.yellow(text))
  },
  error(text: string) {
    spinner.stop()
    console.log(chalk.red(text))
  },
  progress(name: string, rate: number, total: number) {
    const ratio = Math.min(Math.max(rate / total, 0), 1)
    const percent = Math.floor(ratio * 100)

    spinner.text = chalk.cyan(`Downloading ${name} App`) + chalk.green(` [${percent.toFixed(0)}%]`)
  },
}

export default echo
