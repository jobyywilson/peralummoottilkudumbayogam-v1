export class ChildInfo{

    public name: string ='' ;

    public primaryParentMemberId: string ='' ;

    public secondaryParentMemberId: string ='' ;


    isNotEmpty(value:any){
        return value && value.trim() != '';
    }

    isValid():boolean{
        return this.isNotEmpty(this.name) && this.isNotEmpty(this.primaryParentMemberId)&& this.isNotEmpty(this.secondaryParentMemberId)
        
    }
  
    public constructor()
    {

    }

}
