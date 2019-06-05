import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  private stack: (number|string)[];
  display: string;

  constructor() { }

  ngOnInit() {
    this.display = '0';
    this.stack = ['='];
  }

  onDrawerButtonTap(): void {
      const sideDrawer = <RadSideDrawer>app.getRootView();
      sideDrawer.showDrawer();
  }

  numberPressed(val: string) {
    if (typeof this.stack[this.stack.length-1] !== 'number') {
      this.display = val;
      this.stack.push(parseInt(this.display, 10));
    }
    else {
      this.display += val;
      this.stack[this.stack.length-1] = parseInt(this.display, 10);
    }
  }

  operatorPressed(val: string) {
    const precedenceMap = {'+': 0, '-': 0, '*': 1, '/':1};
    this.ensureNumber();
    let precedence = precedenceMap[val];
    let reduce = true;
    while (reduce) {
      let i = this.stack.length-1;
      let lastPrecedence = 100;

      while (i>=0) {
        if (typeof this.stack[i] === 'string') {
          lastPrecedence = precedenceMap[this.stack[i]];
          break;
        }
        i--;
      }
      if (precedence<=lastPrecedence) {
        reduce = this.reduceLast();
      } else {
        reduce = false;
      }
    }

    this.stack.push(val);
  }

  equalPressed() {
    this.ensureNumber();
    while (this.reduceLast()) {}
    this.stack.pop();
  }

  percentPressed() {
    this.ensureNumber();
    while (this.reduceLast()) {}
    const result = this.stack.pop() as number/100;
    this.display = result.toString(10);
  }

  acPressed() {
    this.stack = ['='];
    this.display = '0';
  }

  cePressed() {
    if (typeof this.stack[this.stack.length-1] === 'number') this.stack.pop();
    this.display = '0';
  }

  private ensureNumber() {
    if (typeof this.stack[this.stack.length-1] === 'string') {
      this.stack.push(parseInt(this.display, 10));
    }
  }

  private reduceLast() {
    if (this.stack.length<4) return false;
    const num2 = this.stack.pop() as number;
    const op = this.stack.pop() as string;
    const num1 = this.stack.pop() as number;
    let result = num1;
    switch (op) {
      case '+': result = num1+num2;
        break;
      case '-': result = num1-num2;
        break;
      case '*': result = num1*num2;
        break;
      case '/': result = num1/num2;
        break;
    }
    this.stack.push(result);
    this.display = result.toString(10);
    return true;
  }
}
