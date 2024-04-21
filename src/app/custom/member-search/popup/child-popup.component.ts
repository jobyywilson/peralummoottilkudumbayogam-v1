import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ChildInfo } from "../../member-info/model/child-info";

@Component({
    selector: 'child-popup',
    templateUrl: 'child-popup.component.html'
  })
  export class ChildInfoPopUp {
    constructor(
      public dialogRef: MatDialogRef<ChildInfoPopUp>,
      @Inject(MAT_DIALOG_DATA) public data: ChildInfo,
    ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  }