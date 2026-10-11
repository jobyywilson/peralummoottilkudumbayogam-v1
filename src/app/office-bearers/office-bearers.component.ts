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

  loading = true;
  loadError = false;

  loadAllOfficeBearers() {
    this.commonService.doGet('assets/data/office-bearers.json').subscribe(
      (lists: any) => {
        this.data = lists;
        this.years = Object.keys(lists).sort().reverse();
        const currentYear = this.getCurrentFinancialYear(new Date());
        this.selectedYear = this.years.includes(currentYear) ? currentYear : this.years[0];
        this.updateSelectedOfficeList();
        this.loading = false;
        this.loadContactDetails();
      },
      () => {
        this.loading = false;
        this.loadError = true;
      }
    );
  }

  loadContactDetails() {
    this.commonService.doGet('.netlify/functions/officeBearers').subscribe(
      (response: any) => {
        try {
          const members = this.cryptoService.decryptAndParse(response.data);
          this.officeBearersGroupedByYear = members.reduce((groups: any, member: any) => {
            (groups[member.year] = groups[member.year] || []).push(member);
            return groups;
          }, {});
          this.updateSelectedOfficeList();
        } catch {
          // The saved office bearer lists remain available without contact details.
        }
      },
      () => { /* Contact details are optional. */ }
    );
  }

  updateSelectedOfficeList() {
    this.selectedOfficeList = (this.data[this.selectedYear] || []).map((section: any) => ({
      title: section.title,
      officeMembers: this.mapOfficers(section.members)
    }));
  }

  mapOfficers(officeRawData: any) {
    let rawData = officeRawData;
    if (!rawData) {
      return rawData;
    }
    let selectedYearOfficeMembers = this.officeBearersGroupedByYear?.[this.selectedYear];
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
       let mobileNo =  member.user?.mobile;
       if(mobileNo =="undefined" || !mobileNo){
        return ""
       }else{
        return mobileNo;
       }
      }
    }
    return "";
  }


  onYearchange(fYear: any) {
    let year = fYear.value;
    this.selectedYear = year;
    this.updateSelectedOfficeList();
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
