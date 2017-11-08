import { Component } from '@angular/core';
import { DragulaService } from "ng2-dragula";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private dragulaService: DragulaService){
    dragulaService.drop.subscribe((value) => {
      console.log(`drop: ${value[0]}, ${value[1].id}, ${value[2].id}, ${value[3].id}, ${value[4]}`);
      //this.onDrop(value.slice(1));
    });
  }
}
