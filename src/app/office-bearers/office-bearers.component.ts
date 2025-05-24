import { Component, OnInit } from "@angular/core";
import { CommonService } from "../service/common.service";
import { ImageService } from "../service/image.service";
import { CryptoService } from "../service/crypto.service";

@Component({
  selector: "app-office",
  templateUrl: "./office-bearers.component.html",
  styleUrls: ["./office-bearers.component.css"],
})
export class OfficeBearersComponent implements OnInit {
  data: any = [];
  officeMembers: any = [];
  auditors: any = [];
  sextons: any = [];
  kaisthanasamithy: any = [];
  selectedOfficeList: any = [];
  years: any = [];
  selectedYear : any;
  officeBearersGroupedByYear:any;
  constructor(
    private commonService: CommonService,
    private imageService: ImageService,
    private cryptoService: CryptoService
  ) {
    this.loadAllOfficeBearers();
  }

  loadAllOfficeBearers() {
    let date = new Date();
    let isFound = true;
    this.selectedYear = this.getCurrentFinancialYear(new Date())
    this.commonService
      .doGet(`.netlify/functions/officeBearers`)
      .subscribe((officeBearers: any) => {
        let wholeMembers = this.cryptoService.decryptAndParse(
          officeBearers.data
        );
        this.officeBearersGroupedByYear = wholeMembers.reduce((acc: any, bearer: any) => {
          let year = bearer.year;
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(bearer);
          return acc;
        }, {});
        while (isFound) {
          let fyYear = this.getCurrentFinancialYear(date);
          this.data[fyYear] = [];
    
          this.commonService
            .doGet(`assets/content/officeBearers/${fyYear}.json`)
            .subscribe(
              (data: any) => {
                if (this.selectedOfficeList.length == 0) {
                  let currentFY = this.selectedYear;
                  this.selectedOfficeList = this.data[currentFY];
                }
                for (let section of data) {
                  let sectionData: any = {};
                  sectionData["title"] = section.title;
                  sectionData["officeMembers"] = this.mapOfficers(
                    section["members"]
                  );
                  this.data[fyYear].push(sectionData);
                }
              },
              (error: any) => {
                isFound = false;
                console.log("officeMembers not found for " + fyYear);
              }
            );
    
          date.setFullYear(date.getFullYear() - 1);
          if (fyYear == "1973-1974") {
            isFound = false;
          }
        }
        this.years = Object.keys(this.data);
      });

  }

  mapOfficers(officeRawData: any) {
    let rawData = officeRawData;
    if (!rawData) {
      return rawData;
    }
    let selectedYearOfficeMembers = this.officeBearersGroupedByYear[this.selectedYear] 
    rawData.map((obj: any) => {
      obj.image = this.imageService.getUserPhotoByUserId(
        obj.officeBearerUserId
      );

      obj.mobile = this.getMobileNumber(obj.officeBearerUserId,selectedYearOfficeMembers)
      if (obj.image == "assets/img/user.png") {
        obj.image = "assets/static/images/uploads/blank-profile-picture.png";
      }
    });
    return rawData;
  }

  getMobileNumber(memberId : string, officeMembers : any){
    if(!officeMembers){
      return ""
    }
    for(let member of officeMembers){
      if(member.officeBearerUserId == memberId){
       let mobileNo =  member.user.mobile;
       if(mobileNo =="undefined" || !mobileNo){
        return ""
       }else{
        return mobileNo;
       }
      }
    }
    
  }


  onYearchange(fYear: any) {
    let year = fYear.value;
    this.selectedYear = year;
    this.selectedOfficeList = this.data[year];
  }
  getCurrentFinancialYear(date: Date) {
    let fiscalyear = "";
    let today = date;
    if (today.getMonth() + 1 <= 3) {
      fiscalyear = today.getFullYear() - 1 + "-" + today.getFullYear();
    } else {
      fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1);
    }
    return fiscalyear;
  }
  getJson(ogj: any) {
    return JSON.stringify(ogj);
  }

  ngOnInit(): void {}
}
