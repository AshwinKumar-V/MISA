import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-title-dialog',
  templateUrl: './title-dialog.component.html',
  styleUrls: ['./title-dialog.component.css']
})
export class TitleDialogComponent {

  title:string = ""

  constructor(private dialogRef: MatDialogRef<TitleDialogComponent>) {}

  close() {
    this.dialogRef.close(this.title)
  }
}
