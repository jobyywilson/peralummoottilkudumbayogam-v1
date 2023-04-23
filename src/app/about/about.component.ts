import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private titleService: Title,private metaService: Meta) { }

  ngOnInit(): void {
    this.titleService.setTitle('My Page Title');
    this.metaService.addTag({ name: 'description', content: 'Our first family meeting was held in A.D.1907 (M.E 1082) at Thuruthipallil house, Madathumbhagom Vadakkekara and the Second meeting held in A.D.1912 (M.E 1087) at Parumannil house Kavumgumprayar and the Third one in A.D. 1917 (M.E 1092) at Kunnumpurathu house in Kalloorkara, (as per the Diary of GeeVarghese Chandy, Kottackal- Page No.194 of 1917 but that was discontinued for some years due to some reasons.' });

  }

}
