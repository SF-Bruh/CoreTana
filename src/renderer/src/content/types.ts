export interface LessonSection {
  heading: string
  body: string
  code?: string
}

export interface McqQuestion {
  id: string
  type: 'mcq'
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
}

export interface CodeQuestion {
  id: string
  type: 'code'
  prompt: string
  starterCode: string
}

export type PracticeQuestion = McqQuestion | CodeQuestion

export interface Lesson {
  id: string
  title: string
  sections: LessonSection[]
  questions: PracticeQuestion[]
}
