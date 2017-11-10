import { Component } from '@angular/core';
import { DragulaService } from "ng2-dragula";


class Instr {
  args: Instr[]
  type: Type

  constructor(public name: string, t?: Type, a?: Instr[]) {
    if (a)
      this.args = a
    else
      this.args = []
    if (t)
      this.type = t
  }
}

enum Type {
  Block,
  Assignment,
  Value,
  Condition,
  If,
  While,
  Void
}

const solution = [
  new Instr("mystery", Type.Assignment, [new Instr("random", Type.Value)]),
  new Instr("guess1", Type.Assignment, [new Instr("initMystery", Type.Value)]),
  new Instr("displayGuess1", Type.Void),
  new Instr("while", Type.While, [
    new Instr("and", Type.Condition, [new Instr("alive1", Type.Condition), new Instr("guessNeMystery", Type.Condition)]),
    new Instr("whileBlock", Type.Block, [
      new Instr("letter", Type.Assignment, [new Instr("input", Type.Value)]),
      new Instr("if1", Type.If, [
        new Instr("letterGoodGuess", Type.Condition),
        new Instr("if1Block", Type.Block, [
          new Instr("guess2", Type.Assignment, [new Instr("guessRevealed", Type.Value)]),
          new Instr("displayGuess2", Type.Void)
        ]),
        new Instr("else1Block", Type.Block, [
          new Instr("addStep", Type.Void)
        ])
      ])
    ])
  ]),
  new Instr("if2", Type.If, [
    new Instr("alive2", Type.Condition),
    new Instr("if2Block", Type.Block, [new Instr("displayWon", Type.Void)]),
    new Instr("else2Block", Type.Block, [new Instr("displayLost", Type.Void)])
  ])
]

class CompileError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, CompileError.prototype);
  }
}
class RunError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, RunError.prototype);
  }
}
class InputInterruptError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, InputInterruptError.prototype);
  }
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  instrs = new Map<string, Instr[]>()
  compiled: Instr[]

  output: string[] = []
  input: string

  varMystery: string
  varGuess: string
  varLetter: string

  varLives: number
  varAlreadyTried: string[]
  stateOfExec: number[]

  running: boolean = false
  gettingInput: boolean = false


  constructor(private dragulaService: DragulaService) {
    this.instrs.set("src-instr", [])
    this.instrs.set("src-predicate", [])
    this.instrs.set("src-value", [])
    this.instrs.set("dst", [])

    this.instrs.set("mysteryValue", [])
    this.instrs.set("guess1Value", [])
    this.instrs.set("guess2Value", [])
    this.instrs.set("letterValue", [])

    this.instrs.set("whilePredicate", [])
    this.instrs.set("whileBlock", [])
    this.instrs.set("if1Predicate", [])
    this.instrs.set("if1Block", [])
    this.instrs.set("else1Block", [])
    this.instrs.set("if2Predicate", [])
    this.instrs.set("if2Block", [])
    this.instrs.set("else2Block", [])

    this.instrs.set("leftAnd", [])
    this.instrs.set("rightAnd", [])

    dragulaService.drop.subscribe((value) => {
      console.log(`----- drop: ${value[0]}, ${value[1].id}, ${value[2].id}, ${value[3].id}, ${value[4]}`)
      let bag = value[0]
      let itemId = value[1].id
      let dst = value[2].id
      let src = value[3].id
      let maybeNextItem = value[4]

      // remove from source
      let srcArray = this.instrs.get(src)
      this.instrs.set(src, srcArray.filter(e => e.name != itemId))

      // add in destination
      let dstArray = this.instrs.get(dst)
      if (maybeNextItem == null)
        dstArray.push(new Instr(itemId))
      else {
        let dstIndex = dstArray.findIndex(e => e.name == maybeNextItem.id)
        dstArray.splice(dstIndex, 0, new Instr(itemId))
      }
      //this.instrs.forEach((v, k) => console.log(k + " -> " + v.map(i => i.name).join()))
    });
    
    dragulaService.setOptions('instr', {
      removeOnSpill: false,
      accepts: function(el, target, source, sibling) {
        if (el.id === "while") {
          return target.id !== "whileBlock";
        } else if (el.id === "if1") {
          return target.id !== "if1Block" && target.id !== "else1Block";
        } else if (el.id === "if2") {
          return target.id !== "if2Block" && target.id !== "else2Block";
        }
        return true;
      },
      moves: function (el, container, target) {
          if (target.classList) {
              return !target.classList.contains('predicate') && !target.classList.contains('value');
          }
          return false;
      }
    });
    dragulaService.setOptions('predicate', {
      removeOnSpill: false,
      accepts: function(el, target, source, sibling) {
        if (el.id === "and") {
          return target.id !== "leftAnd" && target.id !== "rightAnd";
        }
        return true;
      }
    });
  }

  compileInstr(name: string): Instr {
    let ret: Instr = new Instr(name)

    let argsArr: Instr[]
    switch (name) {
      case "mystery":
        argsArr = this.instrs.get("mysteryValue")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one value assigned to the mystery word")
        ret.args.push(this.compileInstr(argsArr[0].name))
        ret.type = Type.Assignment
        break;
      case "guess1":
        argsArr = this.instrs.get("guess1Value")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one value assigned to the guess")
        ret.args.push(this.compileInstr(argsArr[0].name))
        ret.type = Type.Assignment
        break;
      case "guess2":
        argsArr = this.instrs.get("guess2Value")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one value assigned to the guess")
        ret.args.push(this.compileInstr(argsArr[0].name))
        ret.type = Type.Assignment
        break;
      case "letter":
        argsArr = this.instrs.get("letterValue")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one value assigned to new letter")
        ret.args.push(this.compileInstr(argsArr[0].name))
        ret.type = Type.Assignment
        break;

      case "random":
      case "initMystery":
      case "input":
      case "guessRevealed":
        ret.type = Type.Value
        break;

      case "and":
        argsArr = this.instrs.get("leftAnd")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one predicate on the left of the \"and\"")
        ret.args.push(this.compileInstr(argsArr[0].name))

        argsArr = this.instrs.get("rightAnd")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one predicate on the right of the \"and\"")
        ret.args.push(this.compileInstr(argsArr[0].name))
      case "alive1":
      case "alive2":
      case "guessNeMystery":
      case "letterGoodGuess":
        ret.type = Type.Condition
        break

      case "displayGuess1":
      case "displayGuess2":
      case "addStep":
      case "displayWon":
      case "displayLost":
        ret.type = Type.Void
        break

      case "while":
        argsArr = this.instrs.get("whilePredicate")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one predicate in the loop condition")
        ret.args.push(this.compileInstr(argsArr[0].name))

        argsArr = this.instrs.get("whileBlock")
        let whileBlock = new Instr("whileBlock")
        whileBlock.type = Type.Block
        for (let i of argsArr)
          whileBlock.args.push(this.compileInstr(i.name))
        ret.args.push(whileBlock)

        ret.type = Type.While
        break

      case "if1":
        argsArr = this.instrs.get("if1Predicate")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one predicate in the if condition")
        ret.args.push(this.compileInstr(argsArr[0].name))

        argsArr = this.instrs.get("if1Block")
        let if1Block = new Instr("if1Block")
        if1Block.type = Type.Block
        for (let i of argsArr)
          if1Block.args.push(this.compileInstr(i.name))
        ret.args.push(if1Block)

        argsArr = this.instrs.get("else1Block")
        let else1Block = new Instr("else1Block")
        else1Block.type = Type.Block
        for (let i of argsArr)
          else1Block.args.push(this.compileInstr(i.name))
        ret.args.push(else1Block)

        ret.type = Type.If
        break

      case "if2":
        argsArr = this.instrs.get("if2Predicate")
        if (argsArr.length != 1)
          throw new CompileError("there should be exactly one predicate in the if condition")
        ret.args.push(this.compileInstr(argsArr[0].name))

        argsArr = this.instrs.get("if2Block")
        let if2Block = new Instr("if2Block")
        if2Block.type = Type.Block
        for (let i of argsArr)
          if2Block.args.push(this.compileInstr(i.name))
        ret.args.push(if2Block)

        argsArr = this.instrs.get("else2Block")
        let else2Block = new Instr("else2Block")
        else2Block.type = Type.Block
        for (let i of argsArr)
          else2Block.args.push(this.compileInstr(i.name))
        ret.args.push(else2Block)

        ret.type = Type.If
        break
    }

    return ret
  }

  compile() {
    this.println("Checking your program...")
    try {
      let dstInstrs = this.instrs.get("dst")
      this.compiled = []

      for (let instr of dstInstrs)
        this.compiled.push(this.compileInstr(instr.name))

      this.println("Check done, everything looks fine.")
    } catch (e) {
      if (e instanceof CompileError) {
        //console.log("error: " + e.message)
        this.println("Error: " + e.message)
        this.compiled = undefined
      }
    }
  }

  dump(instrArr: Instr[], level: number) {
    for (let instr of instrArr) {
      console.log("  ".repeat(level) + instr.name + ": " + instr.type)
      if (instr.args)
        this.dump(instr.args, level + 1)
    }
  }

  initVars() {
    this.varGuess = ""
    this.varMystery = ""
    this.varLetter = ""
    this.varLives = 7
    this.stateOfExec = []
    this.varAlreadyTried = []
  }

  println(txt: string) {
    this.output.push(txt)
  }

  runValue(i: Instr): string {
    let ret = ""
    switch (i.name) {
      case "random":
        let choices = ["civiere", "pansement", "secouriste", "tension", "saturation"]
        let index = Math.floor(Math.random() * choices.length)
        return choices[index]
      case "initMystery":
        return "*".repeat(this.varMystery.length)
      case "guessRevealed":
        // check letter
        if (this.varLetter.length != 1)
          throw new RunError("the new letter should contain exactly one character")
        // check lengths of guess and mystery
        if (this.varGuess.length != this.varMystery.length)
          throw new RunError("the guess and the mystery word should have the same length")
        let i = this.varMystery.indexOf(this.varLetter)
        while (i != -1) {
          this.varGuess = this.varGuess.substr(0, i) + this.varLetter + this.varGuess.substr(i + 1, this.varGuess.length)
          i = this.varMystery.indexOf(this.varLetter, i + 1)
        }
        this.varLetter = ""
        return this.varGuess
      case "input":
        this.println("Enter a new letter: ")
        throw new InputInterruptError()
    }
    return ret
  }

  runCondition(i: Instr): boolean {
    switch (i.name) {
      case "alive1":
      case "alive2":
        return this.varLives > 0
      case "guessNeMystery":
        return this.varGuess !== this.varMystery
      case "letterGoodGuess":
        return this.varMystery.indexOf(this.varLetter) !== -1
      case "and":
        return this.runCondition(i.args[0]) && this.runCondition(i.args[1])
    }
    return false
  }

  runAssignment(i: Instr) {
    let value = this.runValue(i.args[0])

    switch (i.name) {
      case "mystery":
        this.varMystery = value
        break
      case "letter":
        this.varLetter = value
        break
      case "guess1":
      case "guess2":
        this.varGuess = value
        break
    }
  }

  runInstr(i: Instr) {
    switch (i.name) {
      case "displayGuess1":
      case "displayGuess2":
        this.println(this.varGuess)
        break
      case "addStep":
        this.varLives -= 1
        this.displayHangman()
        break
      case "displayWon":
        this.println("Well done, the word was indeed " + this.varMystery)
        break
      case "displayLost":
        this.println("You lost, the word was " + this.varMystery)
        break
      case "displayLost":
        this.println("You lost, the word was " + this.varMystery)
        break
    }
  }

  runBlock(block: Instr[], depth: number) {
    block.forEach((instr, idx) => {
      let doExec = true
      if (this.gettingInput) {
        if (this.stateOfExec.length > depth && this.stateOfExec[depth] > idx)
          doExec = false
      }
      if (doExec) {
        switch (instr.type) {
          case Type.Assignment:
            if (!this.gettingInput) {
              this.stateOfExec[depth] = idx
              this.runAssignment(instr)
            } else {
              this.gettingInput = false
            }
            break
          case Type.While:
            while (this.gettingInput || this.runCondition(instr.args[0])) {
              if (!this.gettingInput)
                this.stateOfExec[depth] = idx
              this.runBlock(instr.args[1].args, depth + 1)
              this.stateOfExec.pop()
            }
            break
          case Type.If:
            if ((this.gettingInput && this.stateOfExec[depth + 1] === 0) || this.runCondition(instr.args[0])) {
              if (!this.gettingInput) {
                this.stateOfExec[depth] = idx
                this.stateOfExec[depth + 1] = 0
              }
              this.runBlock(instr.args[1].args, depth + 2)
            } else {
              if (!this.gettingInput) {
                this.stateOfExec[depth] = idx
                this.stateOfExec[depth + 1] = 1
              }
              this.runBlock(instr.args[2].args, depth + 2)
            }
            this.stateOfExec.pop()
            break
          case Type.Void:
            if (!this.gettingInput)
              this.stateOfExec[depth] = idx
            this.runInstr(instr)
            break
        }
      }
    })
  }

  run() {
    if (!this.gettingInput) {
      this.running = true
      this.println("Running...")
      this.println("##### Hangman #####")
      //this.println("----------------------------------")
      this.initVars()
    }
    try {
      this.runBlock(this.compiled, 0)
    } catch (e) {
      if (e instanceof RunError) {
        this.println("Error: " + e.message)
      } else if (e instanceof InputInterruptError) {
        this.gettingInput = true
      }
    }
    if (!this.gettingInput) {
      //this.println("----------------------------------")
      this.println("Run done.")
      this.running = false
    }
  }

  onKey(event: KeyboardEvent) {
    let char = (<HTMLInputElement>event.target).value
    this.println(char)
    if (char.match("^[a-z]$")) {
      this.input = ""
      if(this.varAlreadyTried.indexOf(char) == -1){
        this.varAlreadyTried.push(char)
        this.gotInput(char)
      } else {
      this.println("The input has to be different from the ones already tried {" + this.varAlreadyTried.join() + "}")
      }
    } else {
      this.input = ""
      this.println("The input has to be a letter in the range [a-z]")
    }
  }

  gotInput(char: string) {
    this.varLetter = char
    this.run()
    console.log(this.stateOfExec)
  }

  clear() {
    if (this.running) {
      this.running = false
      this.gettingInput = false
      this.println("The execution has been interrupted")
    }
    else
      this.output = []
  }

  compileAndRun() {
    this.clear()
    this.clear()
    this.compile()
    if (this.compiled) {
      this.dump(this.compiled, 0)
      this.run()
    }
  }

  runSolution() {
    this.clear()
    this.dump(solution, 0)
    this.println("Solution:")
    this.compiled = solution
    this.run()
  }

  displayHangman(){
    switch(this.varLives){
      case 0:
        this.println("\xa0\xa0\xa0____")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0o")
        this.println("\xa0\xa0|\xa0\xa0\xa0/|\\")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0/\xa0\\")
        this.println("\xa0_|_")
        break
      case 1:
        this.println("\xa0\xa0\xa0____")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0o")
        this.println("\xa0\xa0|\xa0\xa0\xa0/|\\")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0/")
        this.println("\xa0_|_")
        break
      case 2:
        this.println("\xa0\xa0\xa0____")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0o")
        this.println("\xa0\xa0|\xa0\xa0\xa0/|\\")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|    ")
        this.println("\xa0_|_")
        break
      case 3:
        this.println("\xa0\xa0\xa0____")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0o")
        this.println("\xa0\xa0|\xa0\xa0\xa0/|")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|    ")
        this.println("\xa0_|_")
        break
      case 4:
        this.println("\xa0\xa0\xa0____")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0o")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|    ")
        this.println("\xa0_|_")
        break
      case 5:
        this.println("\xa0\xa0\xa0____")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0o")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0_|_")
        break
      case 6:
        this.println("\xa0\xa0\xa0____")
        this.println("\xa0\xa0|\xa0\xa0\xa0\xa0|")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0_|_")
        break
      case 7:
        this.println("\xa0\xa0\xa0____")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0_|_")
        break
      case 8:
        this.println("\xa0")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0\xa0|    ")
        this.println("\xa0_|_")
        break
      case 9:
        this.println("\xa0")
        this.println("\xa0")
        this.println("\xa0")
        this.println("\xa0")
        this.println("\xa0")
        this.println("\xa0")
        this.println("\xa0___")
        break
    }
    this.println(this.varGuess)
  }
}
