export interface StepFormHandle<T = boolean> {
  /** Commit the current draft and return the updated section value. */
  commitDraft: () => T
}
