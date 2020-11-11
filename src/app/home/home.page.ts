import { Component } from '@angular/core';
import { Answer } from '../models/answer';
import { Question } from '../models/question';
import { annotate } from 'rough-notation';
import { Observable, timer } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  questions: Question[];
  min: number;
  max: number;
  score: number;
  date: number;
  timer: any;
  timerObs: any;

  constructor(public alertController: AlertController) {
    this.startGame();
  }

  startGame() {
    this.exitTimer();
    this.min = 1;
    this.max = 15;
    this.score = 0;
    this.timer = { current: 40, max: 40 };
    this.questions = [];
    this.addQuestion();

    const everySecond: Observable<number> = timer(0, 1000);
    this.timerObs = everySecond.subscribe((seconds) => {
      this.timer.current--;
      if (this.timer.current === 0) {
        this.exitTimer();
        this.gameFinished();
      }
    });

  }

  addQuestion() {
    this.date = Date.now();
    let ans1, ans2;
    const a = Math.floor(Math.random() * this.max) + this.min;
    const b = Math.floor(Math.random() * this.max) + this.min;
    let q: Question = { label: '', answers: [] };
    q.label = a + ' + ' + b;
    const result = eval(q.label);
    q.answers.push({ value: result, isCorrect: true });
    //if little value => +/-1
    if (result < 13) {
      ans1 = ans2 = 1;
    } else {
      ans1 = Math.floor(Math.random() * this.max / 3) + 1;
      ans2 = ans1 + Math.floor(Math.random() * this.max / 3) + 1;
      if (Math.round(Math.random()) % 2 === 0) {
        ans1 = -ans1;
      }
      if (Math.round(Math.random()) % 2 === 0) {
        ans2 = -ans2;
      }
    }
    q.answers.push({ value: result + ans1, isCorrect: false });
    q.answers.push({ value: result - ans2, isCorrect: false });
    this.shuffle(q.answers);
    this.questions.unshift(q);
  }

  shuffle(arr) {
    arr.sort(() => Math.random() - 0.5);
  }

  clickAnswer(idxQ, idxA, answer: Answer, question: Question) {
    let annotation, annotationCorrect;
    if (!question.isDone) {
      const e = document.getElementById('id' + idxQ + idxA);
      if (answer.isCorrect) {
        annotation = annotate(e, { type: 'circle', color: '#0D47A1' });
        let add = Math.ceil(answer.value / 10) * (10 - Math.round((Date.now() - this.date) / 1000));
        if (add > 0) {
          this.score += add;
        }
      } else {
        annotation = annotate(e, { type: 'crossed-off', color: '#F57F17' });
        for (let a in question.answers) {
          if (question.answers[a].isCorrect) {
            const f = document.getElementById('id' + idxQ + a);
            annotationCorrect = annotate(f, { type: 'underline', color: '#1B5E1F' });
            annotationCorrect.show();
            break;
          }
        }
      }
      annotation.show();
      //increase diff
      this.max += 2;
      this.min += 1;
      setTimeout(() => {
        this.addQuestion();
      }, 1200);
    }
    question.isDone = true;

  }

  exitTimer() {
    this.timerObs?.unsubscribe();
  }

  async gameFinished() {
    const alert = await this.alertController.create({
      header: 'Finished!',
      message: '<ion-icon class="smiley" name="happy-outline"></ion-icon><br><div class="score">Score : ' + this.score+'</div>',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Play Again',
          handler: () => {
            this.startGame();
          }
        }
      ]
    });
    await alert.present();
  }

}
