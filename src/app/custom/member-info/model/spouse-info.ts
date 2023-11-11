export class SpouseInfo{

    public firstName: string ='' ;

    public lastName: string ='' ;

    public isCurrentlyInRelationShip : boolean = false;

    public relationShipStartDate : any;

    public relationShipEndDate : any;

    isNotEmpty(value:any){
        return value && value.trim() != '';
    }

    isValid():boolean{
        return this.isNotEmpty(this.firstName) && this.isNotEmpty(this.lastName) && this.isValidRelationShip()
        
    }
  
    public constructor()
    {

    }

    isValidRelationShip():boolean{
        return this.relationShipStartDate != undefined && ((this.relationShipEndDate == undefined && this.isCurrentlyInRelationShip)
        ||(this.relationShipEndDate != undefined && !this.isCurrentlyInRelationShip))

    }


}
