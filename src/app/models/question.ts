import { Answer } from './answer';

export interface Question {
    label: string;
    answers: Answer[];
    isDone?: boolean;
}