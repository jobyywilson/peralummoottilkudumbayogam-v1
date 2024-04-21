export class SpouseInfo{

    public name: string ='' ;


    public isCurrentlyInRelationShip : boolean = false;

    public relationShipStartDate : any;

    public relationShipEndDate : any;

    isNotEmpty(value:any){
        return value && value.trim() != '';
    }

    isValid():boolean{
        return this.isNotEmpty(this.name) && this.isValidRelationShip()
        
    }
  
    public constructor()
    {

    }

    isValidRelationShip():boolean{
        return this.relationShipStartDate != undefined && ( this.isCurrentlyInRelationShip
        ||(this.relationShipEndDate != undefined && !this.isCurrentlyInRelationShip))

    }


}
