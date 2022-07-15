import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-show-temp-msg-dial',
  templateUrl: './show-temp-msg-dial.component.html',
  styleUrls: ['./show-temp-msg-dial.component.scss']
})
export class ShowTempMsgDialComponent implements OnInit {

  constructor(
	@Inject(MAT_DIALOG_DATA) public data: { msg: string },
	public dialogRef: MatDialogRef<ShowTempMsgDialComponent>,
	public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

}
