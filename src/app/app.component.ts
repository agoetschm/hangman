import { Component } from '@angular/core';
import { DragulaService } from "ng2-dragula";


class Instr {
  args: Instr[]

  constructor(public name: string) { }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  instrs = new Map<string, Instr[]>()


  constructor(private dragulaService: DragulaService) {
    this.instrs.set("src", [])
    this.instrs.set("dst", [])
    this.instrs.set("mysteryValue", [])
    this.instrs.set("guess1Value", [])
    this.instrs.set("guess2Value", [])
    this.instrs.set("whilePredicate", [])
    this.instrs.set("whileBlock", [])
    this.instrs.set("leftAnd", [])
    this.instrs.set("rightAnd", [])

    dragulaService.drop.subscribe((value) => {
      console.log(`drop: ${value[0]}, ${value[1].id}, ${value[2].id}, ${value[3].id}, ${value[4]}`)
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

      this.instrs.forEach((v, k) => console.log(k + " -> " + v.map(i => i.name).join()))
    });
  }
}
