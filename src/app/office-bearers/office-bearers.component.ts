import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';
import { ImageService } from '../service/image.service';

@Component({
  selector: 'app-office',
  templateUrl: './office-bearers.component.html',
  styleUrls: ['./office-bearers.component.css']
})
export class OfficeBearersComponent implements OnInit {
  data : any = {}
  officeMembers : any = [];
  auditors : any = [];
  sextons : any = [];
  kaisthanasamithy: any = [];
  selectedOffice : any = null
  years : any = []
  constructor(private commonService : CommonService,private imageService: ImageService) {
    this.loadAllOfficeBearers();
   }

  loadAllOfficeBearers(){
    let date = new Date();
    let isFound = true;
    while(isFound){
      let fyYear = this.getCurrentFinancialYear(date)
      this.data[fyYear] = {}
      this.commonService.doGet(`assets/content/officeBearers/${fyYear}.json`).subscribe(
        (data:any) =>{
          if(!this.selectedOffice){
            let currentFY = this.getCurrentFinancialYear(new Date())
            this.selectedOffice = this.data[currentFY]
          }
          this.data[fyYear]['title']=  data.title;
          this.data[fyYear]['officeMembers']=  this.mapOfficers(data);
        },
          (error:any) => {
            isFound = false;
            console.log("officeMembers not found for "+fyYear);
        });
 
        date.setFullYear( date.getFullYear() - 1);
        if(fyYear == '1973-1974'){
          isFound = false;
        }

    }
    this.years = Object.keys(this.data)

  }
  mapOfficers(officeRawData:any){
    let rawData = officeRawData["members"]
    rawData.map((obj:any)=> {
      obj.image = this.imageService.getUserPhotoByUserId(obj.officeBearerUserId)
      if(obj.image=="assets/img/user.png"){
        obj.image = 'assets/static/images/uploads/blank-profile-picture.png'
      }
    })
    return rawData;
  }

  onYearchange(fYear:any){
    let year = fYear.value
    this.selectedOffice = this.data[year]
  }
  getCurrentFinancialYear(date : Date) {
    let fiscalyear = "";
    let today = date;
    if ((today.getMonth() + 1) <= 3) {
      fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
    } else {
      fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
    }
    return fiscalyear
  }

  ngOnInit(): void {
   
  }
}
