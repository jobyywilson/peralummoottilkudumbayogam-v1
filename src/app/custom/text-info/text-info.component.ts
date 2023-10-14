import { Component, Input } from '@angular/core';

@Component({
  selector: 'text-info',
  templateUrl: './text-info.component.html',
  styleUrls: ['./text-info.component.css']
})
export class TextInfoComponent {
  @Input() text: any;
  hasTextMoreThanLimit : boolean = false;
  showMore: boolean = false;
  truncatedText: string = "";
  remainingText: string = "";

  
  ngOnInit() {
    if(this.text){
      this.truncateText();
    }
    

  }

  toggleText() {
    this.showMore = !this.showMore;
    this.truncateText();
  }

  truncateText() {
    if (this.showMore) {
      this.truncatedText = this.text;
      this.remainingText = '';
    } else {
      const words = this.text.split(' ');
      this.truncatedText = words.slice(0, 30).join(' ');
      this.remainingText = words.slice(30).join(' ');
      if(this.remainingText){
        this.truncatedText = this.truncatedText +'...'
        this.hasTextMoreThanLimit = true
      }
    }
  }
}
