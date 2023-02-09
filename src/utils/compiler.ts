import { COMPILED_FILE } from "../models"

export const errorsInFile = (compiledFile: COMPILED_FILE) => {
  if (!compiledFile)
    return {
      isError: false,
      isWarning: false,
      errorMessages: [],
      warningMessages: [],
    }
  const errors = compiledFile.errors
  if (!errors)
    return {
      isError: false,
      isWarning: false,
      errorMessages: [],
      warningMessages: [],
    }
  const errorMessages: string[] = []
  const warningMessages: string[] = []
  let isError = false
  let isWarning = false
  for (const error of errors) {
    if (error.severity === "error") {
      errorMessages.push(error.message)
      isError = true
    } else if (error.severity === "warning") {
      warningMessages.push(error.message)
      isWarning = true
    }
  }
  return {
    isError,
    isWarning,
    errorMessages,
    warningMessages,
  }
}
